import { Link, useLocation } from "@remix-run/react"
import clsx from "clsx"
import { motion } from "framer-motion"
import React, { useEffect, useState } from "react"
import { ToC } from "@/components/Discovery/types"

const TableOfContents = ({
  items,
  variant = "discovery",
}: {
  items: ToC[]
  variant?: "discovery" | "litepaper"
}) => {
  const location = useLocation()
  const [currentId, setCurrentId] = useState(items.length ? items[0].id : null)
  const [disableScrollEvent, setDisableScrollEvent] = useState(false)

  useEffect(() => {
    setCurrentId(items.length ? items[0].id : null)
  }, [location.pathname])

  useEffect(() => {
    const handleScroll = () => {
      if (disableScrollEvent) return
      let newCurrentId = currentId

      items.forEach((item) => {
        const element = document.getElementById(item.id)
        if (element) {
          const rect = element.getBoundingClientRect()
          const offset = 100

          if (rect.top <= offset && rect.bottom >= offset) {
            newCurrentId = item.id
          }
        }
      })

      if (newCurrentId !== currentId) {
        setCurrentId(newCurrentId)
      }
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll()

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [items, currentId, disableScrollEvent])

  const handleLinkClick = (id: string) => {
    setDisableScrollEvent(true)
    setCurrentId(id)
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
    setTimeout(() => {
      setDisableScrollEvent(false)
    }, 500)
  }

  if (!items.length) return null

  return (
    <motion.ul
      className="flex flex-col gap-4"
      initial={{ opacity: 0, y: -10, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      {items.map((item) => (
        <li
          key={crypto.randomUUID()}
          className={clsx(
            "border-l-[#97A6BB] pl-2 border-l-2 hover:opacity-75",
            variant === "litepaper"
              ? item?.isSubsection
                ? "ml-6 text-sm"
                : "ml-2"
              : "ml-7",
            item.id === currentId
              ? "text-[#97A6BB] border-opacity-100 text-xl font-bold"
              : "text-black dark:text-white border-opacity-0"
          )}
        >
          <Link
            to={`#${item.id}`}
            onClick={(e) => {
              e.preventDefault()
              handleLinkClick(item.id)
            }}
          >
            {item.text}
          </Link>
        </li>
      ))}
      {variant === "litepaper" && (
        <div className="mt-4 border-b-2  dark:border-third-dark"></div>
      )}
    </motion.ul>
  )
}

export default React.memo(TableOfContents)
