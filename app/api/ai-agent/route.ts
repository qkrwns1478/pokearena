import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

// Fallback parser for when JSON parsing fails
function parseFallback(text: string): { reasoning: string; action: string; index: number } {
  const indexMatch = text.match(/"?index"?\s*:\s*(\d+)/i);
  const index = indexMatch ? parseInt(indexMatch[1], 10) : 1;
  
  const reasoningMatch = text.match(/"?reasoning"?\s*:\s*"([^"]*)"/i);
  const reasoning = reasoningMatch ? reasoningMatch[1] : 'Strategic move';
  
  return {
    reasoning,
    action: 'move',
    index,
  };
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, model, maxMoves } = await req.json();

    const systemPrompt = `You are a competitive Pokemon battle AI.
You MUST respond with ONLY a valid JSON object in this exact format:
{
  "reasoning": "one sentence explanation",
  "action": "move",
  "index": <number>
}

Do not include any text before or after the JSON. Do not use markdown code blocks.`;

    const completion = await client.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      model: model || 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 200,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    
    console.log('AI Raw Response:', responseText);

    let decision;
    try {
      decision = JSON.parse(responseText);
      
      // Validation
      if (typeof decision.index !== 'number') {
        throw new Error('Invalid index');
      }
      
      // Bounds check
      if (maxMoves && (decision.index < 1 || decision.index > maxMoves)) {
        console.warn(`Index ${decision.index} out of bounds (max: ${maxMoves}), clamping...`);
        decision.index = Math.max(1, Math.min(maxMoves, decision.index));
      }
      
      if (!decision.action) decision.action = 'move';
      if (!decision.reasoning) decision.reasoning = 'Strategic move';
      
    } catch (parseError) {
      console.error('JSON parse failed, using fallback:', parseError);
      decision = parseFallback(responseText);
      
      // Apply bounds to fallback
      if (maxMoves && decision.index > maxMoves) {
        decision.index = maxMoves;
      }
    }

    console.log('Parsed Decision:', decision);

    return NextResponse.json({ decision });
  } catch (error) {
    console.error('AI Agent API Error:', error);
    return NextResponse.json(
      { error: 'Failed to get AI response', details: String(error) },
      { status: 500 }
    );
  }
}
