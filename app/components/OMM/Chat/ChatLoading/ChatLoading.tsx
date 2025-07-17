import React from "react"

const ChatLoading = () => {
  return (
    <>
      <div className="h-2 w-2 bg-secondary/90 dark:bg-third rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="h-2 w-2 bg-secondary/90 dark:bg-third rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="h-2 w-2 bg-secondary/90 dark:bg-third rounded-full animate-bounce"></div>
      <p className="px-1.5 text-base text-secondary/90 dark:text-third">
        Generating your response...
      </p>
    </>
  )
}

export default ChatLoading
