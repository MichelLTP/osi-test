import { Button } from "@/components/ui/Button/Button"
import DynamicDataTable from "@/components/ui/DynamicDataTable/DynamicDataTable"
import { TableData } from "@/components/ui/DynamicDataTable/types"
import { faPaperPlane } from "@fortawesome/free-regular-svg-icons"

export default function Approve() {
  const data = {
    type: "table",
    body: '{"values": [["Document Preview", "Metadata Input", "Summary Preview", "Top Insights Preview", "Nodes"],["Completed", "Incomplete", "Completed", "Completed", "Completed"]], "header": ["Tab", "Status"]}',
  }

  function adjustHeader(
    header: string[],
    values: (string | number)[][]
  ): string[] {
    if (header.length < values.length) {
      const diff = values.length - header.length
      const emptyFields = new Array(diff).fill("")

      return [...emptyFields, ...header]
    }

    return header
  }

  const parsedBody = JSON.parse(data.body)

  const tableData: TableData = {
    type: data.type,
    header: adjustHeader(parsedBody.header, parsedBody.values),
    values: parsedBody.values,
  }

  return (
    <div>
      <p className="text-sm mb-[5px]">
        <DynamicDataTable tableData={tableData || data} />
      </p>
      <div className="flex justify-end">
        <Button className="mt-5 px-6" icon={faPaperPlane} type="submit">
          Approve
        </Button>
      </div>
    </div>
  )
}
