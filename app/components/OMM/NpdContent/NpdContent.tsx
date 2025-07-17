import SingleSelection from "@/components/Shared/SingleSelection/SingleSelection"
import { Label } from "@/components/ui/Label/Label"
import { Button } from "@/components/ui/Button/Button"
import BarChart from "@/components/ui/BarChart/BarChart"
import { NpdContentProps, NpdTabTypes } from "@/components/OMM/NpdContent/types"
import React from "react"
import ChartSkeleton from "@/components/Shared/ChartSkeleton/ChartSkeleton"
import TableSkeleton from "@/components/Shared/TableSkeleton/TableSkeleton"
import NpdTableHandler from "@/components/OMM/EditableTable/Handlers/NpdTableHandler"
import ConfirmationPopover from "@/components/Shared/ConfirmationPopover/ConfirmationPopover"

export function NpdContent({
  variant,
  currentSelection,
  mirrorMarkets,
  handleMirrorMarket,
  chartData,
  tableData,
  syncChart,
  isStacked = false,
  loading = false,
  isDisabled = false,
  addRowList = [],
}: NpdContentProps) {
  const isPrice = variant === "price"
  const labelText = isPrice
    ? "Current Mirror Market:"
    : `Select the mirror market for the ${variant.replace("-", " ")} evolution:`
  const tableTitle = variant
    .replace("-", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())

  return (
    <>
      <fieldset className="grid md:grid-cols-3 gap-8">
        <div className="flex flex-col gap-4 justify-between">
          <Label>{labelText}</Label>
          <SingleSelection
            placeholder="Mirror Market"
            key={
              variant === "volume"
                ? currentSelection?.volume_mirror_market
                : currentSelection?.market_share_mirror_market
            }
            defaultValue={
              variant === "volume"
                ? currentSelection?.volume_mirror_market
                : currentSelection?.market_share_mirror_market
            }
            handleValueChange={(value) =>
              handleMirrorMarket?.(value, variant as "volume" | "market-share")
            }
            options={mirrorMarkets?.map((market) => ({
              value: market,
              label: market,
            }))}
            disabled={isPrice || isDisabled}
          />
        </div>
      </fieldset>
      <div className="flex w-full justify-end mb-12">
        <ConfirmationPopover
          onConfirm={() =>
            handleMirrorMarket(
              variant === "volume"
                ? currentSelection.volume_mirror_market
                : currentSelection.market_share_mirror_market,
              variant as NpdTabTypes
            )
          }
          confirmationHeader={"Reset the table data?"}
          confirmationMessage={"All changes will be lost."}
          buttonAction={"Reset"}
        >
          <Button variant="underline">
            Reset {variant === "volume" ? "Volume" : "Market Share and Price"}{" "}
            to mirror market values
          </Button>
        </ConfirmationPopover>
      </div>
      {!isPrice && (
        <>
          {loading ? (
            <ChartSkeleton variant={"chart-only"} />
          ) : (
            <BarChart
              chartData={chartData}
              chartConfig={{}}
              xAxisKey={"year"}
              isStacked={isStacked}
              isBrandLaunch
              key={currentSelection?.year}
            />
          )}
        </>
      )}
      <div className="my-4">
        {loading ? (
          <TableSkeleton rows={3} />
        ) : (
          <NpdTableHandler
            tableData={tableData}
            tableTitle={tableTitle}
            startingYear={currentSelection.year}
            syncChart={syncChart}
            addRowList={addRowList}
          />
        )}
      </div>
    </>
  )
}
