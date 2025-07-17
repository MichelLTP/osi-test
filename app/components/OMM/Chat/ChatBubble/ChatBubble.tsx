import React from "react"
import { ChatBubbleProps } from "@/components/OMM/Chat/ChatBubble/types"
import clsx from "clsx"
import { format } from "date-fns"
import TableOutput from "@/components/LitePaper/OutputHandler/TableOutput/TableOutput"
import { MarkdownRenderer } from "@/components/Shared/MarkdownRender/MarkdownRender"

export const TableRender = ({ children }: { children: React.ReactNode }) => {
  return (
    <section className="!w-full !overflow-x-auto custom-scrollbar scrollbar-gray dark-scrollbar scrollbar-thin">
      <table>{children}</table>
    </section>
  )
}

const ChatBubble = ({
  variant,
  message,
  timestamp,
  type,
  initialMessage = false,
  table_data,
}: ChatBubbleProps) => {
  if (!message || type === "code") return <></>

  const time = !initialMessage
    ? new Date(
        Date.UTC(
          timestamp.getFullYear(),
          timestamp.getMonth(),
          timestamp.getDate(),
          timestamp.getHours(),
          timestamp.getMinutes(),
          timestamp.getSeconds(),
          timestamp.getMilliseconds()
        )
      )
    : timestamp

  return (
    <section
      className={clsx(
        "flex flex-col w-full ",
        variant === "ai" ? "items-start" : "items-end"
      )}
    >
      <p className="text-xs text-secondary/80 dark:text-third/80">
        {variant === "ai" && <span className="mr-3">OMM Simulator</span>}
        <time dateTime={time.toISOString()}>{format(time, "h:mm a")}</time>
      </p>

      <div
        className={clsx(
          "p-4 my-2 rounded-sm text-sm text-secondary dark:text-white max-w-full",
          variant === "user" &&
            "bg-primary/15 dark:bg-primary/20 rounded-br-none",
          variant === "ai" &&
            "bg-secondary/5 dark:bg-third/10 rounded-bl-none min-w-[35%]"
        )}
      >
        {type === "table" && table_data ? (
          <>
            <p className="px-4 pt-2 text-xlbold">{message}</p>
            <TableOutput tableData={table_data} variant="omm-custom" />
          </>
        ) : (
          <MarkdownRenderer value={message} />
        )}
      </div>
    </section>
  )
}

export default ChatBubble
