import React from "react"
import { TaskItem, TaskSectionProps } from "./type"

const TaskSection: React.FC<TaskSectionProps> = ({ parsedMessages }) => {
  // Find the last status message
  const lastStatusMessage = [...parsedMessages]
    .reverse()
    .find((message) => message.type === "status")

  // Extract tasks from the last status message, or use an empty array if none found
  const tasks = (lastStatusMessage?.body as TaskItem[]) || []

  const getSpanStyle = (state: string) => {
    const baseClasses =
      "absolute flex items-center justify-center w-[21px] h-[21px] rounded-full -start-[0.75rem] dark:bg-gray-700"

    switch (state) {
      case "done":
        return `${baseClasses} bg-transparent`
      case "current":
        return `${baseClasses} bg-primary bg-opacity-30 animate-size-pulse`
      case "waiting":
      default:
        return `${baseClasses} bg-transparent`
    }
  }

  const getDotStyle = (state: string) => {
    const baseClasses = "w-[11px] h-[11px] rounded-full dark:text-gray-400"

    switch (state) {
      case "done":
        return `${baseClasses} bg-primary`
      case "current":
        return `${baseClasses} bg-primary`
      case "waiting":
      default:
        return `${baseClasses} border border-secondary bg-white`
    }
  }

  return (
    <div className="w-full pl-4">
      <ol className="relative border-s border-secondary border-opacity-10 dark:border-white dark:text-white">
        {tasks.map((task, index) => (
          <li key={index} className="mb-10 ms-6 ">
            <span className={getSpanStyle(task.state)}>
              <div className={getDotStyle(task.state)}></div>
            </span>
            <h3 className="text-smbold">{task.major}</h3>
            {task.detail && (
              <p className="text-base fadeIn whitespace-pre-wrap">
                {task.detail}
              </p>
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}

export default TaskSection
