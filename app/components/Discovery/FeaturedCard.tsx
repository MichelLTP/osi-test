import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faClock, faEye, faHeadphones } from "@fortawesome/free-solid-svg-icons"
import { Badge } from "../ui/Badge/Badge"
import { FeaturedCardProps } from "./types"
import { Link } from "@remix-run/react"

export default function FeaturedCard({
  content,
}: {
  content: FeaturedCardProps
}) {
  return (
    <div
      className={`flex flex-col sm:flex-row min-h-[235px] max-w-full ${content.color} shadow-sm text-white m-auto rounded-xs overflow-hidden hover:opacity-90 transition-all mb-8 sm:mb-4`}
    >
      <aside className="relative flex min-w-[32%] h-auto w-full md:max-w-[32%] overflow-hidden bg-third">
        <Badge
          variant="default"
          className="absolute !text-sm rounded-[8px] bg-third text-black top-6 left-6"
        >
          Featured
        </Badge>
        <Link
          to={"/discovery/" + content.id}
          prefetch={"render"}
          className={"max-h-72 w-full object-cover shadow-lg"}
        >
          <img
            alt={content.title}
            src={content.image}
            className={"h-full w-full object-cover"}
          />
        </Link>
      </aside>
      <Link
        to={"/discovery/" + content.id}
        prefetch={"render"}
        className="w-full p-6 flex flex-col gap-4"
      >
        <h1 className="text-3xlbold">{content.title}</h1>
        <p>{content.description}</p>
        <section className="mt-auto flex gap-2 flex-col">
          <div className="text-xs">
            <FontAwesomeIcon icon={faEye} size="lg" className="mr-2" />
            {content.views}
            <FontAwesomeIcon
              icon={faClock}
              size="lg"
              className="mr-1 ml-4"
            />{" "}
            {content.duration_min} minutes
          </div>
          <section className="flex gap-2 justify-between items-start mt-2">
            <div className={"flex gap-1.5 flex-wrap"}>
              {content?.tags?.map((tag) => (
                <Badge
                  key={tag + crypto.randomUUID()}
                  variant="default"
                  className="!text-xxs rounded-[8px] bg-white/80 text-black"
                >
                  {tag}
                </Badge>
              ))}
            </div>
            {content?.has_podcast && (
              <FontAwesomeIcon
                icon={faHeadphones}
                size="lg"
                className="mr-0 ml-1.5"
              />
            )}
          </section>
        </section>
      </Link>
    </div>
  )
}
