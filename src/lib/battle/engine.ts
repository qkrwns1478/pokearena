import { Battle, ID } from '@pkmn/sim';
import { Dex } from '@pkmn/dex';
import { Team } from '@pkmn/sets';
import { getBestMoveFromAI } from '../ai/groqService';
import { useBattleStore } from '../../store/useBattleStore';

export class BattleManager {
  battle: Battle;
  p1Model: string;
  p2Model: string;

  private lastLogIndex = 0;
  
  // [New] 고착 상태 감지용 변수
  private lastTurnProcessed = -1;
  private turnRetryCount = 0;

  constructor(p1Team: string, p2Team: string, config: any) {
    const format = `gen${config.generation}${config.battleFormat}` as ID;
    
    // 난수 생성
    const seed = [
        Math.floor(Math.random() * 0x10000),
        Math.floor(Math.random() * 0x10000),
        Math.floor(Math.random() * 0x10000),
        Math.floor(Math.random() * 0x10000)
    ] as [number, number, number, number];

    this.battle = new Battle({ 
        formatid: format,
        seed: seed as any 
    });

    const p1Set = Team.unpack(p1Team, Dex)?.team;
    const p2Set = Team.unpack(p2Team, Dex)?.team;

    if (!p1Set || !p2Set) throw new Error("Invalid Team Format");

    this.battle.setPlayer('p1', { team: p1Set });
    this.battle.setPlayer('p2', { team: p2Set });
    
    this.p1Model = config.p1Model;
    this.p2Model = config.p2Model;
  }

  // 로그 처리
  private flushLogs() {
    const store = useBattleStore.getState();
    const newLogs = this.battle.log.slice(this.lastLogIndex);
    this.lastLogIndex = this.battle.log.length;

    newLogs.forEach(line => {
      if (line.startsWith('|move|')) {
          const parts = line.split('|');
          store.addLog(`👊 ${parts[2].replace('p1a: ', '').replace('p2a: ', '')} used ${parts[3]}!`);
      } else if (line.startsWith('|switch|')) {
          const parts = line.split('|');
          store.addLog(`🔄 ${parts[2].replace('p1a: ', '').replace('p2a: ', '')} switched in!`);
      } else if (line.startsWith('|faint|')) {
          const parts = line.split('|');
          store.addLog(`💀 ${parts[2].replace('p1a: ', '').replace('p2a: ', '')} fainted!`);
      } else if (line.startsWith('|win|')) {
          store.addLog(`🏆 Winner: ${line.split('|')[2]}`);
      } else if (line.startsWith('|turn|')) {
          const turnNum = parseInt(line.split('|')[2]);
          store.addLog(`--- Turn ${turnNum} ---`);
          store.setCurrentTurn(turnNum);
          this.logSpeedOrder();
      }
    });
  }

  private logSpeedOrder() {
    const store = useBattleStore.getState();
    const p1Active = this.battle.p1.active[0];
    const p2Active = this.battle.p2.active[0];

    if (p1Active && p2Active && !p1Active.fainted && !p2Active.fainted) {
        const p1Speed = p1Active.getStat('spe');
        const p2Speed = p2Active.getStat('spe');
        
        let msg = `[Speed Check] P1(${p1Speed}) vs P2(${p2Speed})`;
        if (p1Speed > p2Speed) msg += " -> P1 acts first";
        else if (p2Speed > p1Speed) msg += " -> P2 acts first";
        else msg += " -> Speed Tie (50/50 RNG)";
        
        store.addLog(msg);
    }
  }

  private createFallbackRequest(side: any) {
    if (this.battle.ended) return null;
    const active = side.active[0];
    if (!active) return null;

    const isFainted = active.hp === 0 || active.fainted;
    return {
        requestType: isFainted ? 'switch' : 'move',
        active: [active],
        side: side,
        isFallback: true,
        rqid: -1,
        forceSwitch: isFainted ? [true] : undefined
    };
  }

  public start() {
    const store = useBattleStore.getState();
    store.resetBattle();
    
    if (!this.battle.started) {
      this.battle.start();
    }
    this.flushLogs();
    
    // 초기화
    this.lastTurnProcessed = 0;
    this.turnRetryCount = 0;
  }

  public async nextTurn() {
    const store = useBattleStore.getState();
    if (this.battle.ended) return;

    store.setProcessing(true);

    // [New] 고착 상태 감지 로직
    // 현재 턴 번호가 이전 처리 턴과 같다면 -> 진행이 안 된 것임
    // (Turn 0인 Team Preview 단계는 예외)
    if (this.battle.turn > 0 && this.battle.turn === this.lastTurnProcessed) {
        this.turnRetryCount++;
    } else {
        this.turnRetryCount = 0;
        this.lastTurnProcessed = this.battle.turn;
    }

    // [Fix] 2번 이상 시도했는데도 턴이 안 넘어가면 'default' 강제 실행
    if (this.turnRetryCount > 0) {
        console.warn(`Turn ${this.battle.turn} stuck. Forcing default move.`);
        store.addLog(`⚠️ AI stuck or invalid move. Forcing default action.`);
        
        this.battle.choose('p1', 'default');
        this.battle.choose('p2', 'default');
        
        this.flushLogs();
        if (this.battle.winner) {
            store.setWinner(this.battle.winner as 'p1' | 'p2' || 'draw');
        }
        store.setProcessing(false);
        return;
    }

    // 1. Team Preview 처리
    const lastLog = this.battle.log[this.battle.log.length - 1];
    if (lastLog && lastLog.includes('|teampreview')) {
        await this.handleTeamPreview();
        store.setProcessing(false);
        return;
    }

    // 2. 일반 턴 AI 처리
    const p1 = this.battle.p1 as any;
    const p2 = this.battle.p2 as any;
    
    const p1Req = p1.request || this.createFallbackRequest(p1);
    const p2Req = p2.request || this.createFallbackRequest(p2);

    const aiPromises = [];
    
    const p1Task = (async () => {
        if (!p1Req || (p1Req.wait && !p1Req.isFallback)) return null;
        try {
            const res = await getBestMoveFromAI(p1Req, 'p1', this.battle, this.p1Model);
            return { action: res.command, reason: res.reasoning };
        } catch (e) {
            return { action: 'default', reason: 'Error' };
        }
    })();
    aiPromises.push(p1Task);

    const p2Task = (async () => {
        if (!p2Req || (p2Req.wait && !p2Req.isFallback)) return null;
        try {
            const res = await getBestMoveFromAI(p2Req, 'p2', this.battle, this.p2Model);
            return { action: res.command, reason: res.reasoning };
        } catch (e) {
            return { action: 'default', reason: 'Error' };
        }
    })();
    aiPromises.push(p2Task);

    const [p1Result, p2Result] = await Promise.all(aiPromises);

    if (p1Result || p2Result) {
        store.addReasoning({
            turn: this.battle.turn,
            p1Reason: p1Result?.reason || "Waiting / No Action",
            p2Reason: p2Result?.reason || "Waiting / No Action"
        });
    }

    // 엔진에 명령 전달
    if (p1Result && p1Req) {
        this.battle.choose('p1', p1Result.action);
    }
    
    if (p2Result && p2Req) {
        this.battle.choose('p2', p2Result.action);
    }

    this.flushLogs();
    
    if (this.battle.winner) {
        store.setWinner(this.battle.winner as 'p1' | 'p2' || 'draw');
    }

    store.setProcessing(false);
  }

  private async handleTeamPreview() {
    const store = useBattleStore.getState();
    const p1 = this.battle.p1 as any;
    const p2 = this.battle.p2 as any;

    store.addLog("Team Preview: AI is selecting leads...");

    const aiPromises = [
        getBestMoveFromAI({ teamPreview: true, side: p1 }, 'p1', this.battle, this.p1Model).then(res => ({ side: 'p1', ...res })),
        getBestMoveFromAI({ teamPreview: true, side: p2 }, 'p2', this.battle, this.p2Model).then(res => ({ side: 'p2', ...res }))
    ];

    const results = await Promise.all(aiPromises);
    results.forEach(res => {
        store.addReasoning({ turn: 0, [res.side === 'p1' ? 'p1Reason' : 'p2Reason']: res.reasoning });
        this.battle.choose(res.side as any, res.command);
    });

    const logDump = this.battle.log.slice(-5).join('');
    if (!logDump.includes('|start')) {
        this.battle.choose('p1', 'default');
        this.battle.choose('p2', 'default');
    }
    
    this.flushLogs();
  }
}