import { NextRequest, NextResponse } from 'next/server';
import { getJsonModel, cleanJsonResponse } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      goal,
      description,
      deadline,
      availableDailyTime,
      currentSkillLevel,
      preferredLearningSpeed,
    } = body;

    const mainGoal = goal || title;
    if (!mainGoal || !deadline) {
      return NextResponse.json(
        { error: 'Goal title and deadline are required' },
        { status: 400 }
      );
    }

    const model = getJsonModel();
    const now = new Date();
    const startDateStr = now.toISOString().split('T')[0];

    const prompt = `
      You are an expert personal mentor and project planner.
      The user wants to achieve this goal: "${mainGoal}".
      Context/Description: "${description || 'No additional details provided.'}"
      Project timeline starts today: ${startDateStr}.
      The final deadline is: ${deadline}.

      User configurations:
      - Available daily time: ${availableDailyTime || 2} hours
      - Current skill level: ${currentSkillLevel || 'beginner'}
      - Preferred learning speed: ${preferredLearningSpeed || 'medium'}

      Break this goal down into a logical sequence of step-by-step daily missions.
      Make sure to distribute the deadlines of these tasks chronologically from ${startDateStr} to ${deadline}.
      Acknowledge that they can spend at most ${availableDailyTime || 2} hours per day on it, so each day's estimated hours should not exceed this constraint.

      Return ONLY a valid JSON object matching the following structure:
      {
        "roadmap": "A high-level explanation of the plan milestones and learning strategy.",
        "estimatedDurationDays": 15,
        "overallDifficulty": "easy",
        "tasks": [
          {
            "title": "Task title",
            "description": "Step-by-step task checklist and specific outcomes.",
            "estimatedHours": 1.5,
            "difficultyLevel": "easy",
            "deadline": "YYYY-MM-DD"
          }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    let aiResponseText = result.response.text();
    aiResponseText = cleanJsonResponse(aiResponseText);

    const parsedPlan = JSON.parse(aiResponseText);

    const projectId = crypto.randomUUID();
    const project = {
      id: projectId,
      title: mainGoal,
      goal: mainGoal,
      description: description || '',
      status: 'active' as const,
      deadline,
      availableDailyTime: availableDailyTime || 2,
      currentSkillLevel: currentSkillLevel || 'beginner',
      preferredLearningSpeed: preferredLearningSpeed || 'medium',
      roadmap: parsedPlan.roadmap || '',
      estimatedDurationDays: parsedPlan.estimatedDurationDays || 10,
      overallDifficulty: parsedPlan.overallDifficulty || 'medium',
      createdAt: new Date().toISOString(),
    };

    const tasks = (parsedPlan.tasks || []).map((task: any) => ({
      id: crypto.randomUUID(),
      projectId,
      title: task.title,
      description: task.description || '',
      estimatedHours: task.estimatedHours || 1,
      difficultyLevel: task.difficultyLevel || 'medium',
      deadline: task.deadline,
      isCompleted: false,
      notes: '',
      statusHistory: [{ action: 'created', timestamp: new Date().toISOString() }],
      notified: false,
      createdAt: new Date().toISOString(),
    }));

    return NextResponse.json({ project, tasks });
  } catch (error: any) {
    console.error('Error generating plan:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate plan' },
      { status: 500 }
    );
  }
}
