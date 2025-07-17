import DetailSidebar from "@/components/Discovery/DetailSidebar"
import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  faBook,
  faCheck,
  faCopy,
  faFileDownload,
  faHeart,
  faInfoCircle,
  faShareAlt,
} from "@fortawesome/free-solid-svg-icons"
import { faHeart as faHeartRegular } from "@fortawesome/free-regular-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  ContentBlockProps,
  DiscoverMoreProps,
} from "@/components/Discovery/types"
import clsx from "clsx"
import DiscoverySectionHeading from "@/components/Discovery/DiscoverySectionHeading"

import DiscoverMoreCard from "@/components/Discovery/DiscoverMoreCard"
import { StoryDetailProps } from "./type"
import SectionRenderer from "../SectionRender/SectionRender"
import KeyQuestionsRenderer from "../KeyQuestionsRender/KeyQuestionsRender"
import { useAdminPanelDiscoveryStore } from "@/store/AdminPanel/discovery"
import { useCloseSidebar } from "@/store/layout"
import { findMatchingImage } from "@/utils/documentTools/adminPanel/discovery"

const StoryDetail: React.FC<StoryDetailProps> = ({ data }) => {
  const [favoriteStatus, setFavoriteStatus] = useState<boolean>(
    data?.is_favorite ?? false
  )
  const close = useCloseSidebar((state) => state.close)
  const [headerImage, setHeaderImage] = useState<string>("")
  const [isCopied, setIsCopied] = useState<boolean>(false)
  const { uploadImages } = useAdminPanelDiscoveryStore()
  const audio = data?.audios?.length ? data.audios[0] : null

  const handleCopy = () => {
    try {
      navigator.clipboard
        .writeText(
          data?.sections
            .map((story: ContentBlockProps) => story.text)
            .join("\n")
        )
        .then()
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy: ", error)
    }
  }

  useEffect(() => {
    if (data?.image?.url) {
      setHeaderImage(data.image.url)
    } else if (uploadImages.length > 0 && data?.image?.title) {
      const matchedImage = findMatchingImage(uploadImages, data.image.title)
      if (matchedImage) {
        setHeaderImage(matchedImage)
      }
    }
  }, [data?.image, uploadImages, data?.image?.title])

  return (
    <div className="w-full">
      <div className="mx-auto flex flex-col gap-6 p-6 w-full bg-gray-100 dark:bg-gray-800">
        <img
          src={headerImage || "/img/discovery/default_image.jpg"}
          alt={data?.title}
          className="h-96 object-cover mx-auto w-full lg:max-w-[1150px] rounded-xs"
        />
      </div>
      <div className="w-full mt-4 md:mx-auto flex gap-8 lg:max-w-[1150px] transition-all">
        <motion.aside
          className={clsx(
            "hidden sm:flex flex-col pl-6 xl:pl-0 gap-4 sticky top-6 self-start max-w-[220px] lg:min-w-[260px]",
            !close &&
              "!hidden !min-w-[210px] xl:!min-w-[260px] lg:!flex md:pl-6"
          )}
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "100%", opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        >
          <DetailSidebar
            tags={data?.tags}
            sources={data?.sources}
            documents={data?.documents}
            podcast={data?.audios?.[0]?.title}
            key={data?.title}
            audioUrl={audio?.url ?? ""}
          />
        </motion.aside>
        <motion.section
          transition={{ ease: "easeInOut" }}
          className={clsx(
            "w-full mb-16 px-6 sm:pl-0 xl:pr-0 flex flex-col gap-14 text-justify toc-elements text-black dark:text-white transition-none",
            !close && "!basis-full !px-6"
          )}
        >
          <div className="text-left leading-relaxed flex justify-between items-center gap-6">
            <div>
              <h1 className="text-2xlbold">{data?.title}</h1>
              <h2 className="text-xl">{data?.description}</h2>
            </div>
            <div className="flex gap-6">
              <FontAwesomeIcon
                icon={favoriteStatus ? faHeart : faHeartRegular}
                size="lg"
                className={"text-error cursor-pointer"}
                onClick={() => setFavoriteStatus((prevStatus) => !prevStatus)}
              />
              <FontAwesomeIcon
                icon={faFileDownload}
                size="lg"
                className="text-secondary dark:text-white"
              />
              <FontAwesomeIcon
                icon={faShareAlt}
                size="lg"
                className="text-secondary dark:text-white"
              />
              <button onClick={handleCopy} className={"relative"}>
                <FontAwesomeIcon
                  icon={faCopy}
                  size="lg"
                  className={clsx(
                    "text-secondary dark:text-white hover:text-primary",
                    isCopied && "!text-success hover:text-success"
                  )}
                />
                {isCopied && (
                  <span className="absolute flex gap-1 items-center bottom-8 -right-2 lg:-right-7 px-2 py-1 text-xs rounded-xxs border bg-third dark:bg-gray-800 text-secondary dark:text-third antialiased">
                    <FontAwesomeIcon icon={faCheck} className="text-primary" />{" "}
                    Copied!
                  </span>
                )}
              </button>
            </div>
          </div>

          <SectionRenderer
            sections={data?.sections}
            uploadImages={uploadImages}
          />
          <KeyQuestionsRenderer
            questions={data?.key_questions}
            uploadImages={uploadImages}
          />

          <section className="sm:mb-0">
            <DiscoverySectionHeading title="Discover More" icon={faBook} />
            <div
              className={clsx(
                "flex gap-6 mt-6",
                (data?.related_stories?.length ?? 0) > 2
                  ? "justify-between"
                  : "start"
              )}
            >
              {data?.related_stories &&
                data?.related_stories.map((story: DiscoverMoreProps) => (
                  <DiscoverMoreCard key={story.uuid} {...story} />
                ))}
            </div>
          </section>
          <section
            className={clsx(
              "mb-16 flex sm:hidden flex-col",
              !close && "!flex lg:!hidden"
            )}
          >
            <DiscoverySectionHeading title="References" icon={faInfoCircle} />
            <DetailSidebar
              tags={data?.tags}
              sources={JSON.stringify(data?.sources)}
              documents={data?.documents}
              podcast={data?.audio_files?.[0] ?? audio?.url}
              audioUrl={audio?.url ?? ""}
            />
          </section>
        </motion.section>
      </div>
    </div>
  )
}

export default StoryDetail
