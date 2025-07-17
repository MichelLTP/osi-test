import { cva } from "class-variance-authority"
import { ContentBlockProps } from "@/components/Discovery/types"
import { MarkdownRenderer } from "../Shared/MarkdownRender/MarkdownRender"

const contentBlockStyles = cva(
  "flex gap-2 items-stretch flex-wrap text-left lg:flex-nowrap",
  {
    variants: {
      layout: {
        default: "flex-col",
        BOTTOM: "flex-col",
        TOP: "flex-col-reverse",
        RIGHT: "flex-row gap-6",
        LEFT: "flex-row gap-6",
      },
    },
    defaultVariants: {
      layout: "default",
    },
  }
)

const imageStyles = cva("object-contain dark:bg-third rounded-xs mx-auto", {
  variants: {
    layout: {
      default: "w-full h-[225px] md:h-[125px] lg:object-cover",
      TOP: "w-full h-auto max-h-[320px] mb-2",
      BOTTOM: "w-full h-auto max-h-[320px]",
      LEFT: "w-full h-[220px] lg:w-[220px] max-h-[220px] lg:aspect-square lg:object-cover",
      RIGHT:
        "w-full h-[220px] lg:w-[220px] max-h-[220px] lg:aspect-square lg:object-cover",
    },
  },
  defaultVariants: {
    layout: "LEFT",
  },
})

export const slugify = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

const ContentBlock = ({
  title,
  text,
  image_url,
  imageAlt,
  image_pos = "TOP",
  ...props
}: ContentBlockProps) => {
  return (
    <section className={contentBlockStyles({ layout: image_pos })} {...props}>
      {image_pos === "LEFT" && (
        <img
          src={image_url}
          alt={imageAlt}
          className={`${imageStyles({ layout: image_pos })} ${
            image_pos === "LEFT" && "!w-auto"
          }`}
        />
      )}

      <div id={title && slugify(title)} className="prose content-block">
        {image_pos === "TOP" && (
          <img
            src={image_url}
            alt={imageAlt}
            className={`${imageStyles({ layout: image_pos })}`}
          />
        )}

        <h2 className="text-2xlbold mb-4 mt-0">{title}</h2>
        <MarkdownRenderer className="prose content-block" value={text} />
      </div>
      {image_pos !== "TOP" && image_pos !== "LEFT" && (
        <img
          src={image_url}
          alt={imageAlt}
          className={`${imageStyles({ layout: image_pos })} ${
            image_pos === "RIGHT" && "!w-auto"
          }`}
        />
      )}
    </section>
  )
}

export default ContentBlock
