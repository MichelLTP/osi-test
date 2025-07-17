import React, { useCallback, useEffect, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ExternalComponents/DropdownMenu/dropdown-menu"
import { Button } from "@/components/ui/Button/Button"
import { faDownload, faPlus } from "@fortawesome/free-solid-svg-icons"
import { AnimatePresence, motion } from "framer-motion"
import { faHeadset } from "@fortawesome/free-solid-svg-icons/faHeadset"
import { useFetcher, useNavigate } from "@remix-run/react"
import { action } from "@/routes/omm.scenarios.explorer"
import { Loader2 } from "lucide-react"

const ExploreFurther = ({
  dataToExport,
  period,
  year,
}: {
  dataToExport: {
    markets?: string[]
    companies?: string[]
    products?: string[]
  }
  period?: string
  year?: string
}) => {
  const navigate = useNavigate()
  const [key, setKey] = useState<string>(Date.now().toString())
  const fetcher = useFetcher<typeof action>({ key })
  const [isExportRequest, setIsExportRequest] = useState<boolean>(false)
  const [dataChanged, setDataChanged] = useState(false)

  const handleExport = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsExportRequest(true)
    fetcher.submit(
      {
        intent: "export",
        marketId: dataToExport.markets?.join(",") ?? "1",
        companies: dataToExport.companies?.join(",") ?? "",
        products: dataToExport.products?.join(",") ?? "",
        period: period ?? "yearly",
        year: period === "monthly" ? (year ?? "") : "",
      },
      { method: "post", action: "/omm/scenarios/explorer" }
    )
  }

  const triggerDownload = useCallback(() => {
    if (
      !fetcher.data?.file ||
      !fetcher.data?.fileType ||
      !fetcher.data?.fileName
    )
      return

    const byteCharacters = atob(fetcher.data.file)
    const byteNumbers = Array.from(byteCharacters, (char) => char.charCodeAt(0))
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: fetcher.data.fileType })

    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = fetcher.data.fileName

    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }, [fetcher.data])

  useEffect(() => {
    if (isExportRequest && fetcher.data) {
      triggerDownload()
      setIsExportRequest(false)
    }
  }, [fetcher.data, isExportRequest, triggerDownload])

  useEffect(() => {
    if (
      fetcher.state === "idle" &&
      fetcher.data?.file &&
      !dataChanged &&
      !isExportRequest
    ) {
      setDataChanged(true)
    }
  }, [dataChanged, fetcher])

  useEffect(() => {
    if (dataChanged && !isExportRequest) {
      setKey(Date.now().toString())
    }
  }, [dataChanged, isExportRequest])

  useEffect(() => {
    setDataChanged(false)
  }, [key])

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild className={"self-end cursor-pointer"}>
        <Button
          variant={"icon"}
          icon={faPlus}
          className={`fixed right-[22.5rem] bottom-6 p-0 transition-all duration-200 
									bg-secondary !border-transparent dark:bg-secondary-dark
									hover:bg-primary-dark`}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={`border-none shadow-none mb-4 sm:mb-0}`}
        align="end"
        alignOffset={-6}
        side={"top"}
        sideOffset={-8}
      >
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-[#f4f4f5] border dark:bg-secondary-dark shadow-xs rounded-xs"
          >
            <DropdownMenuItem className="hover:brightness-50 dark:hover:brightness-150 transition-colors duration-300 py-0">
              <Button
                onClick={() =>
                  navigate("/omm/scenarios/explorer?market-id=" + marketId)
                }
                variant={"ghost"}
                icon={faHeadset}
                disabled
                className={"cursor-pointer !font-normal !text-sm"}
              >
                I want to explore further
              </Button>
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:brightness-50 dark:hover:brightness-150 transition-colors duration-300 -mt-3 py-0">
              <Button
                onClick={(e) => handleExport(e)}
                variant={"ghost"}
                icon={
                  fetcher.state === "idle" && !isExportRequest
                    ? faDownload
                    : undefined
                }
                name="intent"
                value={"export"}
                type="submit"
                className={"cursor-pointer !font-normal !text-sm"}
                disabled={
                  fetcher.state === "loading" ||
                  fetcher.state === "submitting" ||
                  isExportRequest
                }
              >
                {(fetcher.state === "loading" ||
                  fetcher.state === "submitting") && (
                  <Loader2 className="animate-spin text-primary inline mr-2 w-4 h-4" />
                )}
                Export Full Values
              </Button>
            </DropdownMenuItem>
          </motion.div>
        </AnimatePresence>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ExploreFurther
