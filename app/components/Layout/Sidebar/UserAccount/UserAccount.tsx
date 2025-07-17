import { useCloseSidebar } from "@/store/layout"
import { AnimatePresence, motion } from "framer-motion"
import { AnimationVariant } from "./type"
import ProfileImage from "@/components/ui/ProfileImage/ProfileImage"
import { useAuthUserName } from "@/store/auth"
import DropdownContent from "@/components/ui/DropdownContent/DropdownContent"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUser } from "@fortawesome/free-regular-svg-icons"
import {
  faArrowRightFromBracket,
  faEllipsis,
} from "@fortawesome/free-solid-svg-icons"
import { useNavigate } from "@remix-run/react"

const UserAccount = () => {
  const close = useCloseSidebar((state) => state.close)
  const navigate = useNavigate()
  const { userName } = useAuthUserName()

  const initialVariant: AnimationVariant = {
    opacity: 0,
    width: 0,
    marginLeft: 0,
  }

  const openVariant: AnimationVariant = {
    opacity: 1,
    width: "auto",
    marginLeft: 14,
  }

  const menuItems = [
    {
      text: "Settings",
      action: () => navigate("/settings"),
      disabled: true,
    },
    {
      text: "Logout",
      action: () => navigate("/logout"),
      danger: true,
      icon: faArrowRightFromBracket,
    },
  ]

  return (
    <>
      <div className="sm:hidden">
        <DropdownContent
          items={menuItems}
          align={"center"}
          customTrigger={
            <>
              <div className={"flex sm:hidden w-full flex-col gap-1"}>
                <FontAwesomeIcon
                  icon={faUser}
                  className="w-[65px] !text-2xl"
                  size="lg"
                />
              </div>
              <div className={"hidden sm:flex"}>
                <FontAwesomeIcon icon={faEllipsis} size="lg" />
              </div>
            </>
          }
        />
      </div>

      <div className="hidden sm:flex">
        <motion.div
          initial={{ flexDirection: "column" }}
          animate={{
            flexDirection: close ? "column" : "row",
          }}
          className={`text-white mt-10 bg-slate-50 absolute bottom-[1.25rem] left-[1.25rem] right-[1.25rem] bg-opacity-5 flex p-4 rounded-md justify-between`}
        >
          <div
            className={`${
              close ? "order-2" : ""
            } flex items-center justify-center`}
          >
            <ProfileImage
              twClasses={`${close ? "order-2" : ""}`}
              name={
                userName
                  ? userName?.firstName + " " + userName?.lastName
                  : "S I"
              }
            />
            <AnimatePresence initial={false}>
              <motion.div
                initial={{ ...initialVariant }}
                exit={{ ...initialVariant }}
                animate={close ? initialVariant : openVariant}
                className={`${close && "hidden"} whitespace-nowrap`}
              >
                <p className="text-xs">welcome</p>
                <p className="text-basebold">
                  {userName
                    ? userName?.firstName + " " + userName?.lastName
                    : "User"}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
          <div
            className={`${
              close ? "order-1 pb-4" : "ml-auto items-center"
            }  flex justify-center cursor-pointer`}
          >
            <DropdownContent align={"start"} items={menuItems} />
          </div>
        </motion.div>
      </div>
    </>
  )
}

export default UserAccount
