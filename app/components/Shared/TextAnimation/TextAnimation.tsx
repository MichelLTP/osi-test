import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export default function TextAnimation({ text }: { text: string }) {
  const [visibleCount, setVisibleCount] = useState(0)

  useEffect(() => {
    if (visibleCount < text.length) {
      const timeout = setTimeout(() => {
        setVisibleCount((prev) => prev + 1)
      }, 20) // Adjust typing speed
      return () => clearTimeout(timeout)
    }
  }, [visibleCount])

  return (
    <div className="flex text-5xl">
      {text.split("").map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 40 }}
          animate={index < visibleCount ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </div>
  )
}
