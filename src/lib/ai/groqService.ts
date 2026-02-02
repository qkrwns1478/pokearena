import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
  dangerouslyAllowBrowser: true 
});

interface IAiResponse {
  command: string;
  reasoning: string;
}

// [Optimization] 데이터 압축 함수 (토큰 절약의 핵심)
function minifyGameState(request: any, battle: any, side: 'p1' | 'p2') {
  // 1. 내 활성 포켓몬 처리
  const myActive = request.active ? request.active[0] : null;
  let me = null;

  if (myActive) {
    // [FIX] moves가 객체 배열일 수도 있고(JSON), 문자열 배열일 수도 있음(Internal)
    const moves = Array.isArray(myActive.moves) 
      ? myActive.moves.map((m: any) => (typeof m === 'string' ? m : m.move || m.id))
      : [];

    // [FIX] details가 없으면 name이나 species 사용
    const name = myActive.details 
      ? myActive.details.split(',')[0] 
      : (myActive.name || myActive.speciesName || myActive.species);

    me = {
      n: name,
      hp: myActive.condition || `${myActive.hp}/${myActive.maxhp}`, // condition이 없으면 hp/maxhp 조합
      a: myActive.ability,
      i: myActive.item,
      m: moves,
      b: myActive.boosts
    };
  }

  // 2. 내 벤치 멤버 처리
  const team = request.side.pokemon.map((p: any, idx: number) => {
    // [FIX] Protocol JSON vs Internal Pokemon Instance 호환성 처리
    const name = p.details 
      ? p.details.split(',')[0] 
      : (p.name || p.speciesName || p.species);
      
    const condition = p.condition || `${p.hp}/${p.maxhp}`; 
    
    // 에러 발생 지점 수정: condition이 있으면 includes 체크, 없으면 fainted 속성 확인
    const isDead = p.condition ? p.condition.includes('fnt') : p.fainted;
    
    return {
        i: idx + 1,
        n: name,
        hp: condition,
        s: p.status,
        dead: !!isDead // boolean 강제 변환
    };
  });

  // 3. 상대 포켓몬 (공개된 정보만)
  const oppSide = side === 'p1' ? battle.p2 : battle.p1;
  const oppActive = oppSide.active[0];
  const opp = oppActive ? {
    n: oppActive.species,
    // [FIX] maxhp가 0이거나 없을 경우 방어
    hp: oppActive.maxhp ? Math.floor((oppActive.hp / oppActive.maxhp) * 100) + '%' : '100%',
    s: oppActive.status,
    b: oppActive.boosts
  } : null;

  // 4. 필드 상태
  const field = battle.field ? {
    w: battle.field.weather || undefined,
    t: battle.field.terrain || undefined
  } : undefined;

  return {
    t: battle.turn,
    me,
    team,
    opp,
    field,
    forceSwitch: !!request.forceSwitch 
  };
}

// [Optimization] 시스템 프롬프트 극단적 축소
const SYSTEM_PROMPT = `
Role: Pokemon Battle AI.
Goal: Win.
Format: JSON.
Response Keys:
- "why": Short reasoning (<20 words).
- "act": "move" or "switch".
- "idx": 1-4 (move) or 1-6 (team index).
Constraint: Input keys are abbreviated (n=name, m=moves, a=ability, etc). Use existing knowledge for move effects.
`;

export async function getBestMoveFromAI(
  request: any, 
  side: 'p1' | 'p2', 
  battle: any, 
  model: string
): Promise<IAiResponse> {
  try {
    // ---------------------------------------------------------
    // [CASE 1] Team Preview (선출 정하기)
    // ---------------------------------------------------------
    if (request.teamPreview) {
      // 팀 프리뷰 데이터도 이름만 보냅니다.
      const myTeam = request.side.pokemon.map((p: any, i: number) => 
        `${i+1}:${p.details.split(',')[0]}` // "1:Garchomp"
      );
      const oppSide = side === 'p1' ? battle.p2 : battle.p1;
      const oppTeam = oppSide.pokemon.map((p: any) => 
        p.species // "Flutter Mane"
      );

      const content = {
        task: "Pick Lead Order",
        me: myTeam,
        opp: oppTeam,
        note: `Return "order" string (e.g. "12" if team size 2, "312456" if 6).`
      };

      const completion = await client.chat.completions.create({
        messages: [
          { role: 'system', content: "Output JSON: { \"why\": string, \"order\": string }" },
          { role: 'user', content: JSON.stringify(content) }
        ],
        model: model,
        temperature: 0.5,
        response_format: { type: 'json_object' },
        max_tokens: 150
      });

      const result = JSON.parse(completion.choices[0].message.content || '{}');
      
      const teamSize = myTeam.length;
      const rangeString = Array.from({length: teamSize}, (_, i) => i + 1).join('');
      let order = result.order ? String(result.order) : rangeString;
      
      order = order.replace(/[^0-9]/g, '');
      if (order.length !== teamSize) order = rangeString;

      return { 
        command: `team ${order}`, 
        reasoning: result.why || "Team selection"
      };
    }

    // ---------------------------------------------------------
    // [CASE 2] Battle Turn (전투)
    // ---------------------------------------------------------
    
    // 1. 데이터 압축 (이제 forceSwitch가 자동으로 포함됨)
    const minifiedState = minifyGameState(request, battle, side);

    // [FIX] 수동 할당 로직 제거 (minifyGameState 내부에서 처리됨)
    // if (request.forceSwitch) { minifiedState['forceSwitch'] = true; } 

    // 2. API 호출
    const completion = await client.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: JSON.stringify(minifiedState) }
      ],
      model: model,
      temperature: 0.4,
      response_format: { type: 'json_object' },
      max_tokens: 200, 
    });

    const content = completion.choices[0].message.content;
    const result = JSON.parse(content || '{}');
    
    const action = result.act || "move";
    const index = result.idx || 1;
    
    const safeIndex = (action === 'move' && (index < 1 || index > 4)) ? 1 : index;

    return { 
        command: `${action} ${safeIndex}`, 
        reasoning: result.why || "Auto" 
    };

  } catch (e: any) {
    if (e?.status === 429) {
        console.warn("TPM Limit hit. Fallback to random.");
        return { command: "default", reasoning: "TPM Limit (Skipped)" };
    }
    console.error("AI Error:", e);
    return { command: "default", reasoning: "Error" };
  }
}