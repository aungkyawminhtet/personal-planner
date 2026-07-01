import { NextRequest, NextResponse } from 'next/server';
import { getTextModel } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { projectId, message, project, tasks, chatHistory } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const model = getTextModel();

    const completedTasks = (tasks || []).filter((t: any) => t.isCompleted);
    const incompleteTasks = (tasks || []).filter((t: any) => !t.isCompleted);

    const historyContext = (chatHistory || [])
      .map((chat: any) => `${chat.role === 'user' ? 'User' : 'Mentor'}: ${chat.message}`)
      .join('\n');

    const prompt = `
      You are an encouraging and highly skilled personal mentor.
      The user is working on the project: "${project?.title || 'Unknown Project'}"
      Roadmap: "${project?.roadmap || 'No roadmap available'}"
      Current Skill Level: ${project?.currentSkillLevel || 'beginner'}
      Available Daily Hours: ${project?.availableDailyTime || 2} hours/day
      Pacing / Learning Speed: ${project?.preferredLearningSpeed || 'medium'}

      Progress report:
      - Completed Missions: ${completedTasks.length}/${(tasks || []).length}
      - Remaining Missions: ${incompleteTasks.length}

      Here is the dialogue history:
      ${historyContext}

      User's new message: "${message}"

      Provide a helpful, motivational, and technical response. Guide them step-by-step or solve their concerns inline. Do not use markdown syntax in JSON fields, keep it direct.
    `;

    const result = await model.generateContent(prompt);
    const mentorReply = result.response.text().trim();

    return NextResponse.json({ reply: mentorReply });
  } catch (error: any) {
    console.error('Error asking mentor:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get advice from mentor' },
      { status: 500 }
    );
  }
}
