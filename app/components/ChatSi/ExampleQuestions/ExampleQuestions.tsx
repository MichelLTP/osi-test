import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  ExampleQuestionsProps,
  QuestionProps,
  QuestionWithRouter,
} from "./type"
import { faArrowsRotate, faComments } from "@fortawesome/free-solid-svg-icons"
import { Button } from "@/components/ui/Button/Button"
import { useFetcher } from "@remix-run/react"
import { useEffect, useState } from "react"
import { loader } from "@/routes/chatSi"
import { motion, useAnimation } from "framer-motion"
import useIsMobile from "@/hooks/useIsMobile"
import { useCloseSidebar } from "@/store/layout"
import { useRouterID } from "@/store/chatsi"
import { routeFiltersItems } from "@/utils/routers/routeFiltersItems"

const ExampleQuestions = ({
  questions,
  handlePromptSubmit,
  hasRefresh = false,
  hasLineClamp = false,
  hasLimit = false,
  className = "",
}: ExampleQuestionsProps) => {
  const fetcher = useFetcher<typeof loader>()
  const [newQuestions, setNewQuestions] = useState(questions)
  const close = useCloseSidebar((state) => state.close)
  const { setRouterID } = useRouterID()

  const isMobile = useIsMobile(640)

  useEffect(() => {
    fetcher.data && setNewQuestions(fetcher.data.chatsi_ExampleQuestions)
  }, [fetcher.data])

  const controls = useAnimation()

  useEffect(() => {
    if (fetcher.state === "loading") {
      controls.start({
        rotate: 360,
        transition: {
          repeat: Infinity,
          duration: 1,
          ease: "linear",
        },
      })
    } else {
      controls.stop()
      controls.set({ rotate: 0 })
    }
  }, [fetcher.state, controls])

  const routers = routeFiltersItems
    .flatMap((category) => category.options)
    .filter((option) => !option.disabled)
    .map((option) => ({
      router: option.id,
      icon: option.icon,
    }))

  const displayQuestions =
    isMobile && hasLimit ? newQuestions.slice(0, 2) : newQuestions

  const questionsWithRouters: QuestionWithRouter[] = displayQuestions.map(
    (prompt: QuestionProps) => {
      const routerItem = routers.find(
        (item) => item.router === prompt.router
      ) || { router: "fail", icon: faComments }
      if (routerItem.router === "fail") {
        console.warn(`Router not found for prompt: ${prompt.prompt}`)
      }
      return { ...prompt, routerItem: routerItem }
    }
  )

  return (
    <>
      <div className="w-full max-w-[620px] flex flex-col sm:items-end items-center gap-4 sm:gap-5">
        <div
          className={`grid grid-cols-1 gap-4 sm:grid-cols-2 sm:grid-rows-2 sm:gap-7 w-full ${
            !close && "md:grid-cols-1 lg:grid-cols-2"
          } ${className}`}
        >
          {questionsWithRouters.map(
            (prompt: QuestionWithRouter, index: number) => (
              <div key={index} className="min-h-[100px] flex justify-center">
                <Button
                  variant="outline"
                  className="text-secondary w-full h-full text-wrap font-normal dark:text-white text-sm max-w-[320px] p-5 border border-primary rounded-[20px] shadow-lg mx-auto cursor-pointer hover:bg-primary hover:border-primary dark:hover:border-primary dark:hover:bg-white hover:bg-opacity-5 dark:hover:bg-opacity-5 transition-border text-left overflow-hidden"
                  onClick={() => {
                    handlePromptSubmit &&
                      handlePromptSubmit(
                        prompt.prompt,
                        prompt.routerItem?.router
                      )
                    setRouterID(prompt.routerItem?.router || "docs")
                  }}
                >
                  <div className="flex gap-x-5 items-start h-full w-full">
                    <FontAwesomeIcon
                      icon={prompt.routerItem.icon}
                      size="lg"
                      className="text-primary pt-1 flex-shrink-0"
                    />
                    <div className="overflow-hidden">
                      <p
                        className={
                          hasLineClamp ? "line-clamp-3" : "line-clamp-[10]"
                        }
                      >
                        {prompt.prompt}
                      </p>
                    </div>
                  </div>
                </Button>
              </div>
            )
          )}
        </div>
        {hasRefresh && (
          <motion.div animate={controls} style={{ display: "inline-block" }}>
            <Button
              variant="ghost"
              icon={faArrowsRotate}
              className="text-primary p-0 -mr-2"
              disabled={fetcher.state === "loading"}
              onClick={() => fetcher.load(`/chatSi?intent=example_questions`)}
            />
          </motion.div>
        )}
      </div>
    </>
  )
}

export default ExampleQuestions
