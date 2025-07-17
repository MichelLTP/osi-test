import React, { useMemo } from "react"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { VirtualizedCombobox } from "@/components/ui/VirtualizedCombobox/VirtualizedCombobox"
import ConfirmationPopover from "@/components/Shared/ConfirmationPopover/ConfirmationPopover"
import { Button } from "@/components/ui/Button/Button"
import { faX } from "@fortawesome/free-solid-svg-icons"
import { Input } from "@/components/ui/Input/Input"
import { TableRow } from "@/components/OMM/EditableTable/types"
import {
  BrandLaunchTableProps,
  NpdTableProps,
} from "@/components/OMM/EditableTable/EditableTableCell/types"
// @ts-ignore
import { PrimeReactProvider } from "primereact/api"

type EditableGraphTableProps =
  | ({ variant: "brandLaunch" } & BrandLaunchTableProps)
  | ({ variant: "npd" } & NpdTableProps)

const EditableGraphTable = ({
  data,
  startingYear,
  handleChartSync,
  variant,
  ...props
}: EditableGraphTableProps) => {
  const isNPD = variant === "npd"
  const npdType = isNPD ? (props as NpdTableProps).npdType : undefined
  const handleValueChange = isNPD
    ? (props as NpdTableProps).handleValueChange
    : undefined
  const handleOptionChange = isNPD
    ? (props as NpdTableProps).handleOptionChange
    : undefined
  const handleRemoveRow = isNPD
    ? (props as NpdTableProps).handleRemoveRow
    : undefined
  const allAvailableOptions = isNPD
    ? (props as NpdTableProps).allAvailableOptions
    : undefined

  const calculateMaxWidths = useMemo(() => {
    const widths: Record<string, number> = {}
    data.table.forEach((row) => {
      Object.entries(row).forEach(([key, value]) => {
        if (key === "scenario-type" || key === "remove-row") return

        const stringValue =
          value != null && !isNaN(Number(value)) ? String(value) : ""
        widths[key] = Math.max(widths[key] || 0, stringValue.length)
      })
    })
    return widths
  }, [data.table])

  const onChange = useMemo(
    () =>
      (
        e: React.ChangeEvent<HTMLInputElement>,
        options: TableRow,
        accessorKey: string
      ) => {
        handleChartSync({ ...options, field: accessorKey }, e.target.value)
      },
    [handleChartSync]
  )

  const onBlur = useMemo(
    () =>
      handleValueChange
        ? (
            e: React.FocusEvent<HTMLInputElement>,
            options: TableRow,
            accessorKey: string
          ) => {
            handleValueChange(
              { ...options, field: accessorKey },
              e.target.value
            )
          }
        : undefined,
    [handleValueChange]
  )

  return (
    <PrimeReactProvider value={{ unstyled: true }}>
      <DataTable
        value={data.table}
        editMode="cell"
        showGridlines={true}
        tableClassName="w-full min-w-md"
      >
        {data.headers.map(({ accessorKey, header }) => (
          <Column
            key={accessorKey}
            align={accessorKey === "scenario-type" ? "left" : "center"}
            headerClassName={
              accessorKey === "scenario-type"
                ? npdType === "volume_shares_data"
                  ? "py-4 min-w-52 !text-left"
                  : "py-4 min-w-64 !text-left"
                : "py-4 !text-center"
            }
            bodyClassName="whitespace-nowrap my-6 border-t border-t-secondary/10 dark:border-t-third/10"
            hidden={
              accessorKey !== "scenario-type" &&
              accessorKey !== "remove-row" &&
              Number(accessorKey) < Number(startingYear)
            }
            field={accessorKey}
            header={header}
            body={(options) => {
              if (accessorKey === "scenario-type") {
                if (
                  isNPD &&
                  handleOptionChange &&
                  options[accessorKey]?.includes("new_")
                ) {
                  return (
                    <div className="py-4 pr-4">
                      <VirtualizedCombobox
                        sortAlphabetically
                        customHeight={
                          npdType === "volume_shares_data" ? "150px" : ""
                        }
                        options={[
                          ...(allAvailableOptions ?? []),
                          {
                            value: options[accessorKey],
                            label: options[accessorKey].replace(/^new_/, ""),
                          },
                        ]}
                        selectedOption={options[accessorKey]}
                        onSelectOption={(value) =>
                          handleOptionChange(value, options)
                        }
                      />
                    </div>
                  )
                }
                return options[accessorKey]
              }

              if (accessorKey === "remove-row" && handleRemoveRow) {
                return data.table.length > 1 ? (
                  <ConfirmationPopover
                    onConfirm={() => handleRemoveRow(options["scenario-type"])}
                    confirmationHeader="Remove row?"
                  >
                    <Button
                      icon={faX}
                      variant="ghostIcon"
                      className="text-error p-2 w-1 max-w-fit"
                    />
                  </ConfirmationPopover>
                ) : null
              }

              return (
                <div className="w-full flex justify-center">
                  <Input
                    value={options[accessorKey] ?? "0"}
                    onChange={(e) => onChange(e, options, accessorKey)}
                    onBlur={
                      onBlur
                        ? (e) => onBlur(e, options, accessorKey)
                        : undefined
                    }
                    inputMode="decimal"
                    type="number"
                    style={{
                      width: `${
                        Math.max(calculateMaxWidths[accessorKey] || 0, 2) * 8 +
                        16
                      }px`,
                    }}
                    className="w-11 h-auto mx-auto input-focus text-center m-2 py-2 !px-0 bg-transparent border-b border-b-primary rounded-none transition-colors duration-300 focus:border-x-0 focus:border-t-0 focus:border-b-secondary dark:focus:border-b-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              )
            }}
          />
        ))}
      </DataTable>
    </PrimeReactProvider>
  )
}

export default React.memo(EditableGraphTable)
