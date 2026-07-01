import { NextRequest, NextResponse } from 'next/server';
import { getJsonModel, cleanJsonResponse } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { projectId, project, tasks } = await req.json();

    const now = new Date();
    const overdueTasks = (tasks || []).filter(
      (t: any) => new Date(t.deadline) < now && !t.isCompleted
    );

    if (overdueTasks.length === 0) {
      return NextResponse.json({
        adjusted: false,
        message:
          'You are fully on track! Keep up the good work. No adjustments needed.',
      });
    }

    const incompleteTasks = (tasks || [])
      .filter((t: any) => !t.isCompleted)
      .sort(
        (a: any, b: any) =>
          new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      );

    const model = getJsonModel();

    const tasksSummary = incompleteTasks.map((t: any) => ({
      id: t.id,
      title: t.title,
      currentDeadline: t.deadline,
    }));

    const startDateStr = now.toISOString().split('T')[0];

    const prompt = `
      You are an AI Mentor adjusting a user's study/project plan.
      The user is falling behind. They have ${overdueTasks.length} overdue tasks out of ${incompleteTasks.length} remaining tasks.
      Project: "${project?.title || 'Unknown'}"
      Available Hours: ${project?.availableDailyTime || 2} hours/day
      Final Project Deadline: ${project?.deadline || 'N/A'}

      Here are the remaining tasks:
      ${JSON.stringify(tasksSummary, null, 2)}

      Please redistribute the deadlines of these remaining tasks starting from today (${startDateStr}) up to the project deadline.
      Return ONLY a JSON object containing:
      - "message": A polite explanation from the AI Mentor explaining why and how the plan was adjusted.
      - "adjustments": A list of tasks with updated deadlines:
        [
          { "id": "task_id_string", "newDeadline": "YYYY-MM-DD" }
        ]
    `;

    const result = await model.generateContent(prompt);
    let aiResponseText = result.response.text();
    aiResponseText = cleanJsonResponse(aiResponseText);

    const parsedAdjustments = JSON.parse(aiResponseText);

    return NextResponse.json({
      adjusted: true,
      message: parsedAdjustments.message,
      adjustments: parsedAdjustments.adjustments || [],
    });
  } catch (error: any) {
    console.error('Error adjusting progress:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to adjust progress plan' },
      { status: 500 }
    );
  }
}
