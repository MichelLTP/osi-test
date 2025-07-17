import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Check, Loader2 } from "lucide-react"
import type { ProposalLoadingAnimationProps } from "./types"

const ProposalLoadingAnimation: React.FC<ProposalLoadingAnimationProps> = ({
  isAnimating,
  setIsAnimating,
  isLoading,
  setIsLoading,
  lengthCondition,
  updateOption,
  setVisibleSections,
  defaultSections,
}) => {
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false)
  const [shouldAnimate, setShouldAnimate] = useState(true)

  useEffect(() => {
    if (!shouldAnimate) return
    if (lengthCondition === 0) {
      updateOption("proposal", defaultSections)
      return
    }
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false)
      setIsAnimating(true)
      setVisibleSections(1) // Show the first section immediately
      let index = 1
      const interval = setInterval(() => {
        setVisibleSections((prev) => prev + 1)
        index++
        if (index >= lengthCondition) {
          //Animate each section, at least the data on the dummy file
          clearInterval(interval)
          setIsAnimating(false)
          setIsGeneratingTitle(true)
        }
      }, 4500)
      setTimeout(() => setIsGeneratingTitle(false), 19000)
      setShouldAnimate(false)
    }, 8000)

    return () => {
      clearTimeout(loadingTimeout)
    }
  }, [lengthCondition, shouldAnimate])

  return (
    <motion.div
      key={
        isLoading
          ? "loading"
          : isGeneratingTitle
            ? "generatingTitle"
            : isAnimating
              ? "animating"
              : "done"
      }
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.4 }}
      className={"flex gap-2 items-center"}
    >
      {isLoading ? (
        <>
          <Loader2 className={"text-primary animate-spin"} />
          Gathering data...
        </>
      ) : isGeneratingTitle ? (
        <>
          <Check className={"text-success"} />
          Your Proposal is ready!
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1 }}
          >
            Now to the final touches...
          </motion.div>
        </>
      ) : isAnimating ? (
        <>
          <Loader2 className={"text-success animate-spin"} />
          We’re generating a proposal...
        </>
      ) : (
        <span>
          <span className={"text-primary mb-2"}>Title: </span>
          Sweden Nicotine Pouch Deep Dive
        </span>
      )}
    </motion.div>
  )
}

export default ProposalLoadingAnimation
