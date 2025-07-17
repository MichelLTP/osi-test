import { cn } from "@/utils/shadcn/utils"
import { SvgIconProps } from "./types"

export const SVGIcon = ({
  className,
  width,
  height,
  variant,
}: SvgIconProps) => {
  switch (variant) {
    case "ChatGPT":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width={width}
          height={height}
          fill="none"
        >
          <path
            className={cn("stroke-secondary dark:stroke-white", className)}
            d="M11.7453 14.85L6.90436 12V7C6.90436 4.79086 8.72949 3 10.9809 3C12.3782 3 13.6113 3.6898 14.3458 4.74128"
          ></path>
          <path
            className={cn("stroke-secondary dark:stroke-white", className)}
            d="M9.59961 19.1791C10.3266 20.2757 11.5866 21.0008 13.0192 21.0008C15.2707 21.0008 17.0958 19.21 17.0958 17.0008V12.0008L12.1612 9.0957"
          ></path>
          <path
            className={cn("stroke-secondary dark:stroke-white", className)}
            d="M9.45166 13.5L9.45123 7.66938L13.8642 5.16938C15.814 4.06481 18.3072 4.72031 19.4329 6.63348C20.1593 7.86806 20.1388 9.32466 19.5089 10.4995"
          ></path>
          <path
            className={cn("stroke-secondary dark:stroke-white", className)}
            d="M4.48963 13.4993C3.8595 14.6742 3.83887 16.131 4.56539 17.3657C5.6911 19.2789 8.18428 19.9344 10.1341 18.8298L14.5471 16.3298L14.643 10.7344"
          ></path>
          <path
            className={cn("stroke-secondary dark:stroke-white", className)}
            d="M17.0959 17.6309C18.4415 17.5734 19.7295 16.8634 20.4529 15.634C21.5786 13.7209 20.9106 11.2745 18.9608 10.1699L14.5478 7.66992L9.48907 10.4255"
          ></path>
          <path
            className={cn("stroke-secondary dark:stroke-white", className)}
            d="M6.90454 6.36938C5.55865 6.42662 4.27032 7.13672 3.54684 8.3663C2.42113 10.2795 3.08917 12.7258 5.03896 13.8304L9.45196 16.3304L14.5 13.5807"
          ></path>
        </svg>
      )
    case "Copy":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width={width}
          height={height}
          fill="none"
        >
          <path
            className={cn("stroke-secondary dark:stroke-white", className)}
            strokeWidth={2.5}
            d="M17.0235 3.03358L16.0689 2.77924C13.369 2.05986 12.019 1.70018 10.9555 2.31074C9.89196 2.9213 9.53023 4.26367 8.80678 6.94841L7.78366 10.7452C7.0602 13.4299 6.69848 14.7723 7.3125 15.8298C7.92652 16.8874 9.27651 17.247 11.9765 17.9664L12.9311 18.2208C15.631 18.9401 16.981 19.2998 18.0445 18.6893C19.108 18.0787 19.4698 16.7363 20.1932 14.0516L21.2163 10.2548C21.9398 7.57005 22.3015 6.22768 21.6875 5.17016C21.0735 4.11264 19.7235 3.75295 17.0235 3.03358Z"
          ></path>
          <path
            className={cn("stroke-secondary dark:stroke-white", className)}
            d="M16.8538 7.43306C16.8538 8.24714 16.1901 8.90709 15.3714 8.90709C14.5527 8.90709 13.889 8.24714 13.889 7.43306C13.889 6.61898 14.5527 5.95904 15.3714 5.95904C16.1901 5.95904 16.8538 6.61898 16.8538 7.43306Z"
            strokeWidth={2.5}
          ></path>
          <path
            className={cn("stroke-secondary dark:stroke-white", className)}
            d="M12 20.9463L11.0477 21.2056C8.35403 21.9391 7.00722 22.3059 5.94619 21.6833C4.88517 21.0608 4.52429 19.6921 3.80253 16.9547L2.78182 13.0834C2.06006 10.346 1.69918 8.97731 2.31177 7.89904C2.84167 6.96631 4 7.00027 5.5 7.00015"
            strokeWidth={2.5}
          ></path>
        </svg>
      )
    default:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width={width}
          height={height}
          fill="none"
        >
          <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="2"
            className={cn("stroke-secondary dark:stroke-white", className)}
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          <circle
            cx="12"
            cy="12"
            r="3"
            className={cn("stroke-secondary dark:stroke-white", className)}
            strokeWidth="2"
          />
        </svg>
      )
  }
}
