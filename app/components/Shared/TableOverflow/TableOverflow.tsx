import { TableOverflowProps } from "./types"

export const TableOverflow = ({ children, ...props }: TableOverflowProps) => {
  return (
    <section className="!@container">
      <div className="!w-full !overflow-x-auto custom-scrollbar scrollbar-gray dark-scrollbar scrollbar-thin">
        <table {...props}>{children}</table>
      </div>
    </section>
  )
}
