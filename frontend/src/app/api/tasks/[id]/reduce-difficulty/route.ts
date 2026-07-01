import { NextRequest, NextResponse } from 'next/server';
import { getJsonModel, cleanJsonResponse } from '@/lib/gemini';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;
    const { task, project } = await req.json();

    if (!task) {
      return NextResponse.json(
        { error: 'Task data is required' },
        { status: 400 }
      );
    }

    const model = getJsonModel();

    const prompt = `
      You are an AI Mentor helping a user who finds this task too difficult:
      Project: "${project?.title || 'Unknown'}"
      Task Title: "${task.title}"
      Task Description: "${task.description || 'No description'}"
      Current Estimated Hours: ${task.estimatedHours}
      Current Difficulty: ${task.difficultyLevel}

      Simplify this task. Rewrite it to make it more achievable and less intimidating.
      You can break it down, reduce scope, or recommend a simpler approach.
      Make sure to reduce the estimated hours if appropriate.

      Return ONLY a valid JSON object matching the following structure:
      {
        "title": "Simplified task title",
        "description": "Simplified explanation of what to do, listing small steps.",
        "estimatedHours": 1.0,
        "difficultyLevel": "easy"
      }
    `;

    const result = await model.generateContent(prompt);
    let aiResponseText = result.response.text();
    aiResponseText = cleanJsonResponse(aiResponseText);

    const parsedTask = JSON.parse(aiResponseText);

    return NextResponse.json({
      title: parsedTask.title || task.title,
      description: parsedTask.description || task.description,
      estimatedHours: parsedTask.estimatedHours || task.estimatedHours,
      difficultyLevel: parsedTask.difficultyLevel || 'easy',
    });
  } catch (error: any) {
    console.error('Error reducing difficulty:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reduce task difficulty' },
      { status: 500 }
    );
  }
}
