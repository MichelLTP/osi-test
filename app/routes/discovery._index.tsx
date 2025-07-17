import RecommendedSelect from "@/components/Discovery/RecommendedSelect"
import CarouselStoryCards from "@/components/Discovery/CarouselStoryCards"
import { motion } from "framer-motion"
import PopularTags from "@/components/Discovery/PopularTags"
import { useEffect, useState } from "react"
import Sidebar from "@/components/Layout/Sidebar/Sidebar"
import MobileMenu from "@/components/Layout/MobileMenu/MobileMenu"
import { clsx } from "clsx"
import Header from "@/components/Layout/Header/Header"
import { useCloseSidebar } from "@/store/layout"
import FeaturedCard from "@/components/Discovery/FeaturedCard"
import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node"
import {
  fetchAllDiscoveryStories,
  fetchDiscoveryTags,
} from "@/data/discovery/discovery.server"
import { useFetcher, useLoaderData } from "@remix-run/react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion/Accordion"
import DiscoverySectionHeading from "@/components/Discovery/DiscoverySectionHeading"
import { faTags } from "@fortawesome/free-solid-svg-icons"
import { Option } from "@/components/ui/MultipleSelector/types"
import { requiredUserSession } from "@/data/auth/session.server"
import CarouselStoryCardsVertical from "@/components/Discovery/CarouselStoryCardsVertical"
import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"
import { ContentState } from "@/store/AdminPanel/discovery"
import { Skeleton } from "@/components/ui/Skeleton/Skeleton"
import { getMenuVariables } from "@/data/menuvariables/menuvariables.server"

export const colors = [
  "bg-[#aec3b0]", // slate
  "bg-[#bac6cc]", // amber
  "bg-[#cca9b7]", // green
  "bg-[#8ea6b8]", //sky
  "bg-[#c7ab9d]", // rose
  "bg-[#a6acb5]", // pink ou rose
  "bg-[#c293a1]", //teal
  "bg-[#9a7cbf]", //violet
]

interface StoryDataProps {
  portraits: ContentState[]
  favourite: string[]
  relevancate: string[]
}

interface Tag {
  id: string | number
  tag: string
}

interface MultiselectTags {
  label: string
  value: string
}

const DiscoveryIndex = () => {
  const [selectedTags, setSelectedTags] = useState<Option[]>([])
  const [featuredCard, setFeaturedCard] = useState({})
  const [reorderedStories, setReorderedStories] = useState([])
  const close = useCloseSidebar((state) => state.close)
  const { tags } = useLoaderData<typeof loader>()
  const fetcher = useFetcher<{
    storiesData?: StoryDataProps
  }>()

  // Initial fetch + Fetch based on Tags
  useEffect(() => {
    const timeout = setTimeout(() => {
      const formData = new FormData()
      const tagIds: Tag[] = selectedTags.map((tag: MultiselectTags) => ({
        tag: tag.label,
        id: tag.value,
      }))
      formData.append("tags", JSON.stringify(tagIds))
      fetcher.submit(formData, { method: "POST" })
    }, 500)
    setFeaturedCard({})
    return () => clearTimeout(timeout)
  }, [selectedTags])

  // Process fetcher data
  useEffect(() => {
    if (!fetcher.data?.storiesData?.portraits?.length) return
    const [firstStory, ...restStories] = fetcher.data.storiesData.portraits

    setFeaturedCard({
      title: firstStory?.title,
      description: firstStory?.description,
      tags: firstStory?.tags?.map((tag) => tag.tag) ?? [],
      image: firstStory?.image
        ? firstStory.image.url
        : "/img/discovery/default_image.jpg",
      id: firstStory?.id,
      views: firstStory?.views,
      duration_min: firstStory?.duration_min,
      color: "bg-[#9c9abf]",
      has_podcast: firstStory?.has_podcast,
    })

    setReorderedStories([restStories[0], firstStory, ...restStories.slice(1)])
  }, [fetcher.data])

  return (
    <>
      <Sidebar />
      <MobileMenu />
      <motion.div
        className={clsx(
          "transition-all duration-300 min-h-screen p-0 !m-0 flex flex-col h-[90vh]",
          close ? "md:pl-sidebarClosed" : "md:pl-sidebarOpen"
        )}
      >
        <Header />

        <main className="flex flex-col grow mt-3">
          <Accordion type="single" collapsible className={""}>
            <AccordionItem value="item-1" className={"border-0"}>
              <AccordionTrigger
                iconStyle={"arrow"}
                className={
                  "mx-auto md:max-w-[90vw] xl:max-w-[1150px] px-6 sm:px-8 xl:px-2"
                }
              >
                <DiscoverySectionHeading
                  title="Popular Tags"
                  icon={faTags}
                  textClasses={"text-xl font-bold"}
                />
              </AccordionTrigger>
              <AccordionContent
                className={
                  "px-6 w-full md:max-w-[90vw] xl:max-w-[1150px] sm:px-8 xl:px-2 mx-auto !overflow-visible"
                }
              >
                <PopularTags
                  setSelectedTags={setSelectedTags}
                  selectedTags={selectedTags}
                  options={tags?.map((tag: Tag) => ({
                    label: tag.tag,
                    value: tag.id,
                  }))}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <section className="w-full bg-white dark:bg-primary-dark sm:bg-gray-100 sm:dark:bg-[#262d3a] flex flex-col pb-8 pt-2 sm:pb-14 sm:pt-8 -mt-2">
            <motion.div
              className={clsx(
                "lg:mx-auto px-6 sm:px-8 xl:px-2 space-y-8",
                !close
                  ? "duration-300 transition-all mx-auto md:w-[calc(98vw-290px)] lg:max-w-[1150px] xl:!px-4"
                  : "duration-300 transition-all lg:max-w-[1150px]"
              )}
              transition={{ duration: 0.3 }}
              initial={{ width: close ? "100%" : "calc(98vw-290px)" }}
              animate={{ width: "100%" }}
            >
              <div className="flex flex-col gap-4 lg:gap-2 items-center overflow-hidden md:max-w-[90vw] m-auto">
                <h1 className="text-3xlbold text-black dark:text-white self-start mb-4">
                  Featured Story
                </h1>
                {Object.keys(featuredCard).length > 0 ? (
                  <FeaturedCard content={featuredCard} />
                ) : (
                  <Skeleton className="w-full h-[235px] rounded-lg mb-4" />
                )}

                <div className="flex w-full gap-4 items-center justify-between flex-wrap">
                  <h1 className="text-3xlbold text-black dark:text-white block">
                    Discover Stories
                  </h1>
                  <RecommendedSelect />
                </div>
                <section className="flex gap-2 items-start flex-wrap justify-center w-full min-h-[75dvh] sm:min-h-fit">
                  <div className="-mx-6 sm:hidden flex w-full overflow-x-hidden mb-10">
                    <CarouselStoryCardsVertical
                      storiesLength={reorderedStories.length}
                      stories={reorderedStories}
                    />
                  </div>
                  <motion.div
                    className="hidden sm:flex items-center w-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                  >
                    {Object.keys(reorderedStories).length > 0 ? (
                      <CarouselStoryCards stories={reorderedStories} />
                    ) : (
                      <div className="flex justify-center items-center gap-[25px] w-full overflow-x-hidden mt-4">
                        <Skeleton className="w-[330px] h-[440px] rounded-lg " />
                        <Skeleton className="w-[365px] h-[486px] rounded-lg " />
                        <Skeleton className="w-[330px] h-[440px] rounded-lg " />
                      </div>
                    )}
                  </motion.div>
                </section>
              </div>
            </motion.div>
          </section>
        </main>
      </motion.div>
    </>
  )
}

export default DiscoveryIndex

export async function loader({ request }: LoaderFunctionArgs) {
  const token = await requiredUserSession(request)
  const envVar = await getMenuVariables()
  const tags = await fetchDiscoveryTags(token)

  if (!tags.ok) {
    throw new Error("Failed to fetch discovery tags")
  }
  return json({
    tags: await tags.json(),
    envVar,
  })
}

export async function action({ request }: ActionFunctionArgs) {
  const token = await requiredUserSession(request)
  const formData = await request.formData()
  const stories = await fetchAllDiscoveryStories(token, formData)

  return json({
    storiesData: await stories,
  })
}

export function ErrorBoundary() {
  return <ErrorBoundaryComponent isMainRoute={true} />
}
