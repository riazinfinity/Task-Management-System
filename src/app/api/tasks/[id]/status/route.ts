import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// PATCH /api/tasks/[id]/status - Update task status only
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const validStatuses = ["pending", "in_progress", "completed"];

    // Validate status
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Status must be pending, in_progress, or completed" },
        { status: 400 }
      );
    }

    // Check if task exists
    const existingTask = await db.task.findUnique({ where: { id } });
    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const task = await db.task.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error updating task status:", error);
    return NextResponse.json(
      { error: "Failed to update task status" },
      { status: 500 }
    );
  }
}
