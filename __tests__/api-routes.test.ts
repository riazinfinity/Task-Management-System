import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { execSync } from "child_process";
import { existsSync, unlinkSync } from "fs";
import { join } from "path";

const DB_PATH = join(process.cwd(), "db", "test.db");
const TEST_DB_URL = `file:${DB_PATH}`;

// Helper to make API requests to the running dev server
async function apiRequest(
  method: string,
  path: string,
  body?: unknown
): Promise<{ status: number; data: unknown }> {
  const url = `http://localhost:3000${path}`;
  const options: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  const response = await fetch(url, options);
  const data = await response.json();
  return { status: response.status, data };
}

describe("Task API Routes", () => {
  let createdTaskId: string;

  describe("GET /api/tasks", () => {
    it("should return an empty array initially", async () => {
      const { status, data } = await apiRequest("GET", "/api/tasks");
      expect(status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });

    it("should filter by status", async () => {
      const { status, data } = await apiRequest(
        "GET",
        "/api/tasks?status=pending"
      );
      expect(status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      data.forEach((task: { status: string }) => {
        expect(task.status).toBe("pending");
      });
    });

    it("should filter by priority", async () => {
      const { status, data } = await apiRequest(
        "GET",
        "/api/tasks?priority=high"
      );
      expect(status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });

    it("should search tasks by title", async () => {
      // First create a task to search for
      await apiRequest("POST", "/api/tasks", {
        title: "Unique Search Test Task",
        priority: "medium",
      });

      const { status, data } = await apiRequest(
        "GET",
        "/api/tasks?search=Unique+Search"
      );
      expect(status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("POST /api/tasks", () => {
    it("should create a new task with required fields", async () => {
      const { status, data } = await apiRequest("POST", "/api/tasks", {
        title: "Test Task One",
        priority: "high",
      });
      expect(status).toBe(201);
      expect(data).toHaveProperty("id");
      expect(data.title).toBe("Test Task One");
      expect(data.status).toBe("pending");
      expect(data.priority).toBe("high");
      createdTaskId = data.id;
    });

    it("should create a task with all fields", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const dueDateStr = futureDate.toISOString().split("T")[0];

      const { status, data } = await apiRequest("POST", "/api/tasks", {
        title: "Complete Task Two",
        description: "This is a detailed description",
        priority: "low",
        dueDate: dueDateStr,
      });
      expect(status).toBe(201);
      expect(data.title).toBe("Complete Task Two");
      expect(data.description).toBe("This is a detailed description");
      expect(data.priority).toBe("low");
      expect(data.dueDate).toBeTruthy();
    });

    it("should reject task without title", async () => {
      const { status, data } = await apiRequest("POST", "/api/tasks", {
        priority: "medium",
      });
      expect(status).toBe(400);
      expect(data.error).toMatch(/title/i);
    });

    it("should reject task with empty title", async () => {
      const { status, data } = await apiRequest("POST", "/api/tasks", {
        title: "   ",
      });
      expect(status).toBe(400);
      expect(data.error).toMatch(/title/i);
    });

    it("should reject task with title exceeding 255 chars", async () => {
      const longTitle = "a".repeat(256);
      const { status, data } = await apiRequest("POST", "/api/tasks", {
        title: longTitle,
      });
      expect(status).toBe(400);
      expect(data.error).toMatch(/255/i);
    });

    it("should reject task with invalid priority", async () => {
      const { status, data } = await apiRequest("POST", "/api/tasks", {
        title: "Invalid Priority Task",
        priority: "urgent",
      });
      expect(status).toBe(400);
      expect(data.error).toMatch(/priority/i);
    });

    it("should default status to pending", async () => {
      const { status, data } = await apiRequest("POST", "/api/tasks", {
        title: "Default Status Test",
      });
      expect(status).toBe(201);
      expect(data.status).toBe("pending");
    });

    it("should trim whitespace from title", async () => {
      const { status, data } = await apiRequest("POST", "/api/tasks", {
        title: "  Trimmed Title  ",
      });
      expect(status).toBe(201);
      expect(data.title).toBe("Trimmed Title");
    });
  });

  describe("GET /api/tasks/[id]", () => {
    it("should return a task by ID", async () => {
      // Create a task first
      const { data: created } = await apiRequest("POST", "/api/tasks", {
        title: "Get By ID Test",
      });
      const taskId = (created as { id: string }).id;

      const { status, data } = await apiRequest(
        "GET",
        `/api/tasks/${taskId}`
      );
      expect(status).toBe(200);
      expect((data as { id: string }).id).toBe(taskId);
      expect((data as { title: string }).title).toBe("Get By ID Test");
    });

    it("should return 404 for non-existent task", async () => {
      const { status, data } = await apiRequest(
        "GET",
        "/api/tasks/nonexistent_id"
      );
      expect(status).toBe(404);
      expect((data as { error: string }).error).toMatch(/not found/i);
    });
  });

  describe("PUT /api/tasks/[id]", () => {
    it("should update task title", async () => {
      const { data: created } = await apiRequest("POST", "/api/tasks", {
        title: "Original Title",
      });
      const taskId = (created as { id: string }).id;

      const { status, data } = await apiRequest(
        "PUT",
        `/api/tasks/${taskId}`,
        { title: "Updated Title" }
      );
      expect(status).toBe(200);
      expect((data as { title: string }).title).toBe("Updated Title");
    });

    it("should update task priority", async () => {
      const { data: created } = await apiRequest("POST", "/api/tasks", {
        title: "Priority Update Test",
        priority: "low",
      });
      const taskId = (created as { id: string }).id;

      const { status, data } = await apiRequest(
        "PUT",
        `/api/tasks/${taskId}`,
        { priority: "high" }
      );
      expect(status).toBe(200);
      expect((data as { priority: string }).priority).toBe("high");
    });

    it("should clear description when set to empty", async () => {
      const { data: created } = await apiRequest("POST", "/api/tasks", {
        title: "Desc Clear Test",
        description: "Original description",
      });
      const taskId = (created as { id: string }).id;

      const { status, data } = await apiRequest(
        "PUT",
        `/api/tasks/${taskId}`,
        { description: "" }
      );
      expect(status).toBe(200);
      expect((data as { description: string | null }).description).toBeNull();
    });

    it("should return 404 for non-existent task", async () => {
      const { status } = await apiRequest(
        "PUT",
        "/api/tasks/nonexistent_id",
        { title: "Should Fail" }
      );
      expect(status).toBe(404);
    });
  });

  describe("PATCH /api/tasks/[id]/status", () => {
    it("should update task status to in_progress", async () => {
      const { data: created } = await apiRequest("POST", "/api/tasks", {
        title: "Status Update Test",
      });
      const taskId = (created as { id: string }).id;

      const { status, data } = await apiRequest(
        "PATCH",
        `/api/tasks/${taskId}/status`,
        { status: "in_progress" }
      );
      expect(status).toBe(200);
      expect((data as { status: string }).status).toBe("in_progress");
    });

    it("should update task status to completed", async () => {
      const { data: created } = await apiRequest("POST", "/api/tasks", {
        title: "Complete Status Test",
      });
      const taskId = (created as { id: string }).id;

      // First move to in_progress
      await apiRequest("PATCH", `/api/tasks/${taskId}/status`, {
        status: "in_progress",
      });

      // Then to completed
      const { status, data } = await apiRequest(
        "PATCH",
        `/api/tasks/${taskId}/status`,
        { status: "completed" }
      );
      expect(status).toBe(200);
      expect((data as { status: string }).status).toBe("completed");
    });

    it("should reject invalid status value", async () => {
      const { data: created } = await apiRequest("POST", "/api/tasks", {
        title: "Invalid Status Test",
      });
      const taskId = (created as { id: string }).id;

      const { status, data } = await apiRequest(
        "PATCH",
        `/api/tasks/${taskId}/status`,
        { status: "cancelled" }
      );
      expect(status).toBe(400);
      expect((data as { error: string }).error).toMatch(/status/i);
    });

    it("should return 404 for non-existent task", async () => {
      const { status } = await apiRequest(
        "PATCH",
        "/api/tasks/nonexistent_id/status",
        { status: "completed" }
      );
      expect(status).toBe(404);
    });
  });

  describe("DELETE /api/tasks/[id]", () => {
    it("should delete a task", async () => {
      const { data: created } = await apiRequest("POST", "/api/tasks", {
        title: "Delete Me",
      });
      const taskId = (created as { id: string }).id;

      const { status, data } = await apiRequest(
        "DELETE",
        `/api/tasks/${taskId}`
      );
      expect(status).toBe(200);

      // Verify it's gone
      const { status: getStatus } = await apiRequest(
        "GET",
        `/api/tasks/${taskId}`
      );
      expect(getStatus).toBe(404);
    });

    it("should return 404 for non-existent task", async () => {
      const { status } = await apiRequest(
        "DELETE",
        "/api/tasks/nonexistent_id"
      );
      expect(status).toBe(404);
    });
  });

  describe("Workflow test: Complete task lifecycle", () => {
    it("should support full task lifecycle: create → update → change status → delete", async () => {
      // 1. Create
      const { status: createStatus, data: created } = await apiRequest(
        "POST",
        "/api/tasks",
        {
          title: "Lifecycle Test Task",
          description: "Testing the full workflow",
          priority: "medium",
        }
      );
      expect(createStatus).toBe(201);
      const taskId = (created as { id: string }).id;

      // 2. Verify it starts as pending
      const { data: fetched } = await apiRequest(
        "GET",
        `/api/tasks/${taskId}`
      );
      expect((fetched as { status: string }).status).toBe("pending");

      // 3. Move to in_progress
      const { data: inProgress } = await apiRequest(
        "PATCH",
        `/api/tasks/${taskId}/status`,
        { status: "in_progress" }
      );
      expect((inProgress as { status: string }).status).toBe("in_progress");

      // 4. Update title and priority
      const { data: updated } = await apiRequest(
        "PUT",
        `/api/tasks/${taskId}`,
        { title: "Updated Lifecycle Task", priority: "high" }
      );
      expect((updated as { title: string }).title).toBe(
        "Updated Lifecycle Task"
      );
      expect((updated as { priority: string }).priority).toBe("high");

      // 5. Move to completed
      const { data: completed } = await apiRequest(
        "PATCH",
        `/api/tasks/${taskId}/status`,
        { status: "completed" }
      );
      expect((completed as { status: string }).status).toBe("completed");

      // 6. Delete
      const { status: deleteStatus } = await apiRequest(
        "DELETE",
        `/api/tasks/${taskId}`
      );
      expect(deleteStatus).toBe(200);

      // 7. Verify deleted
      const { status: finalStatus } = await apiRequest(
        "GET",
        `/api/tasks/${taskId}`
      );
      expect(finalStatus).toBe(404);
    });
  });
});
