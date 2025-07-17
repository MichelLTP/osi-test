import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardImage,
  CardTitle,
} from "../ui/Card/Card"
import {
  faClock,
  faEye,
  faHeadphones,
  faHeart,
} from "@fortawesome/free-solid-svg-icons"
import { faHeart as faHeartRegular } from "@fortawesome/free-regular-svg-icons"
import { Link } from "@remix-run/react"
import { Badge } from "../ui/Badge/Badge"
import clsx from "clsx"
import { useState } from "react"
import { StoryCardProps } from "@/components/Discovery/types"

const StoryCard = ({
  image,
  title,
  description,
  tags,
  id,
  is_favorite,
  color,
  duration_min,
  views,
  has_podcast,
}: StoryCardProps) => {
  const [favoriteStatus, setFavoriteStatus] = useState<boolean>(
    is_favorite ?? false
  )

  return (
    <div
      className={
        "flex min-w-[210px] sm:max-w-lg w-full [&:not(:first-of-type)]:pt-8 sm:pt-8"
      }
    >
      <Card
        className={clsx(
          "rounded-xs bg-indigo-400 text-white transition-all relative w-full duration-200 mt-2 sm:mt-0",
          color
        )}
      >
        <button
          onClick={() => setFavoriteStatus((prevStatus) => !prevStatus)}
          className="absolute top-0 right-0 z-10 p-3 group"
        >
          {favoriteStatus ? (
            <FontAwesomeIcon
              icon={faHeart}
              size="xl"
              className={`opacity-80 text-error group-hover:opacity-100`}
            />
          ) : (
            <FontAwesomeIcon
              icon={faHeartRegular}
              size="xl"
              className={`opacity-80 text-error group-hover:opacity-100`}
            />
          )}
        </button>
        <Link to={"/discovery/" + id} prefetch={"render"}>
          <CardImage
            src={
              image?.url === null
                ? "/img/discovery/default_image.jpg"
                : image?.url
            }
            className="rounded-t-xs shadow-lg max-h-[300px] sm:h-[200px] object-cover overflow-hidden bg-third"
          />
        </Link>
        <Link to={"/discovery/" + id} prefetch={"render"}>
          <CardHeader className={"px-6 sm:px-4 sm:-mt-2"}>
            <CardTitle className="text-2xlbold tracking-normal leading-snug line-clamp-2 sm:h-16">
              {title}
            </CardTitle>
            <CardDescription className="text-base tracking-normal line-clamp-2 sm:line-clamp-3 sm:h-[62px]">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs px-6 sm:px-4">
            <FontAwesomeIcon icon={faEye} size="lg" className="mr-1" /> {views}
            <FontAwesomeIcon
              icon={faClock}
              size="lg"
              className="mr-1 ml-4"
            />{" "}
            {duration_min} min
          </CardContent>
          <CardFooter className="flex gap-2 items-start self-end justify-between px-6 sm:px-4 -mt-2">
            <div className={"flex gap-1.5 flex-wrap"}>
              {tags &&
                tags?.map((tag) => {
                  return (
                    <Badge
                      key={tag.id + crypto.randomUUID()}
                      variant="default"
                      className="!text-xxs rounded-[8px] bg-white/80 text-black"
                    >
                      {tag.tag}
                    </Badge>
                  )
                })}
            </div>
            {has_podcast && (
              <FontAwesomeIcon
                icon={faHeadphones}
                size="lg"
                className="mr-0 ml-1.5"
              />
            )}
          </CardFooter>
        </Link>
      </Card>
    </div>
  )
}

export default StoryCard
