export type DeadlineStatus = "overdue" | "today" | "none";

export function getDeadlineStatus(deadline?: string | null): DeadlineStatus {
  if (!deadline) return "none";

  const taskDate = new Date(deadline);
  if (isNaN(taskDate.getTime())) return "none";

  const today = new Date();

  today.setHours(0, 0, 0, 0);
  taskDate.setHours(0, 0, 0, 0);

  if (taskDate < today) return "overdue";
  if (taskDate.getTime() === today.getTime()) return "today";

  return "none";
}

export function formatDate(date: string) {
  const taskDate = new Date(date);
  const today = new Date();

  today.setHours(0, 0, 0, 0);
  taskDate.setHours(0, 0, 0, 0);

  const diff = (taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";

  return taskDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}
