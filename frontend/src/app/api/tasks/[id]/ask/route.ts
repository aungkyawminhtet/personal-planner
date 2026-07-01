import { NextRequest, NextResponse } from 'next/server';
import { getTextModel } from '@/lib/gemini';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;
    const { message, task, project, chatHistory } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const model = getTextModel();

    const historyContext = (chatHistory || [])
      .map(
        (chat: any) =>
          `${chat.role === 'user' ? 'User' : 'Assistant'}: ${chat.message}`
      )
      .join('\n');

    const prompt = `
      You are an expert AI Study Assistant. Your role is to help the user complete their specific task: "${task?.title || 'Unknown Task'}".
      This task is part of the project: "${project?.title || 'Unknown Project'}".

      Task Context:
      - Description: ${task?.description || 'No description provided.'}
      - Difficulty Level: ${task?.difficultyLevel || 'medium'}
      - Estimated Duration: ${task?.estimatedHours || 1} hours
      - Notes from User: ${task?.notes || 'None'}
      - Status: ${task?.isCompleted ? 'Completed' : 'In Progress'}

      Here is the dialogue history for this task:
      ${historyContext}

      User's new message/question about this task: "${message}"

      Provide highly specific, practical advice, step-by-step guidance, code skeletons, or conceptual explanations to help the user master and complete this exact task. Be direct, technical, encouraging, and clear. Do not use markdown syntax in JSON fields.
    `;

    const result = await model.generateContent(prompt);
    const assistantReply = result.response.text().trim();

    return NextResponse.json({ reply: assistantReply });
  } catch (error: any) {
    console.error('Error in task assistant:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get advice from task assistant' },
      { status: 500 }
    );
  }
}
