import { useNavigate } from "@remix-run/react"
import SubmenuItem from "./SubmenuItem"
import { SubmenuItem as SubmenuItemType, SubmenuProps } from "./type"
import { useCloseSidebar } from "@/store/layout"

const Submenu = ({ items }: SubmenuProps) => {
  const navigate = useNavigate()
  const close = useCloseSidebar((state) => state.close)

  return (
    <div
      className={`grid grid-cols-${items.length / 2} ${
        close
          ? "md:grid-cols-" + items.length + " md:max-w-[800px]"
          : "md:grid-cols-" + items.length / 2 + " md:max-w-[450px]"
      } lg:grid-cols-${
        items.length
      } md:gap-x-8 gap-x-8 w-full max-w-[450px] lg:max-w-[850px] mx-auto px-10`}
    >
      {items.map((item: SubmenuItemType) => {
        return (
          <SubmenuItem
            key={item.id}
            onClick={() => navigate(item.path)}
            title={item.title}
            icon={item.icon}
            description={item.description}
          ></SubmenuItem>
        )
      })}
    </div>
  )
}

export default Submenu
