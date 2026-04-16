import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import type { TaskItem } from "../services/tasksService";
import { TASK_STATUS } from "../services/tasksService";
import "../styles/calendar.css";

type Props = {
  tasks: TaskItem[];
};

export default function TaskCalendar({ tasks }: Props) {
  const events = tasks
    .filter((t): t is TaskItem & { deadline: string } => !!t.deadline)
    .map((task) => ({
      id: task.id,
      title: task.title,
      date: task.deadline,
      classNames: [
        task.status === TASK_STATUS.Todo
          ? "todo"
          : task.status === TASK_STATUS.InProgress
            ? "inProgress"
            : "done",
      ],
    }));

  return (
    <FullCalendar
      plugins={[dayGridPlugin]}
      initialView="dayGridMonth"
      events={events}
      height="auto"
      dayMaxEvents={2}
      fixedWeekCount={false}
      headerToolbar={{
        left: "title",
        right: "today prev,next",
      }}
      eventContent={(arg) => (
        <div className="calendarMiniCard" title={arg.event.title}>
          {arg.event.title}
        </div>
      )}
    />
  );
}
