import { BrandLaunchFormProps } from "@/components/OMM/BrandLaunchForm/types"
import SingleSelection from "@/components/Shared/SingleSelection/SingleSelection"
import { Skeleton } from "@/components/ui/Skeleton/Skeleton"
import { VirtualizedCombobox } from "@/components/ui/VirtualizedCombobox/VirtualizedCombobox"
import { Label } from "@/components/ui/Label/Label"
import YearMonthSelector from "@/components/OMM/YearMonthSelector/YearMonthSelector"
import { useMemo } from "react"
import { getYear } from "date-fns"
import { generateYearRange } from "@/hooks/useGraphData"

const BrandLaunchForm = ({
  productData,
  companyOptions,
  currentOptions,
  currentDate,
  onUpdate,
  loading,
  disabled = false,
  yearLimit = 2036,
}: BrandLaunchFormProps) => {
  const yearOptions = useMemo(
    () => generateYearRange(getYear(new Date()), yearLimit),
    []
  )

  const productOptions = useMemo(
    () =>
      productData?.map((product) => ({
        value: String(product.product_id),
        label: product.product_name,
      })),
    [productData]
  )

  const mirrorMarketOptions = useMemo(
    () =>
      productData
        .filter(
          (product) => String(product.product_id) === currentOptions.product
        )[0]
        .mirror_markets?.map((market) => ({
          value: String(market.mirror_market_id),
          label: market.mirror_market_name,
        })),
    [productData, currentOptions.product]
  )

  return (
    <>
      <fieldset className="grid grid-cols-2 gap-8">
        <div className="flex flex-col gap-4">
          <Label>Select the product:</Label>
          <SingleSelection
            placeholder="Product"
            defaultValue={productOptions[0].value}
            handleValueChange={onUpdate.onProductChange}
            options={productOptions}
            disabled={disabled}
          />
        </div>
        <div className="flex flex-col gap-4">
          <Label>Select the company:</Label>
          {loading.loadingCompanies ? (
            <Skeleton className="h-[45px] !rounded-xs w-full" />
          ) : (
            <VirtualizedCombobox
              options={companyOptions.map((option) => ({
                value: String(option.value),
                label: option.label,
              }))}
              searchPlaceholder="Search a company..."
              selectedOption={
                currentOptions.company ?? String(companyOptions[0].value)
              }
              onSelectOption={onUpdate.onCompanyChange}
              disabled={disabled}
            />
          )}
        </div>
      </fieldset>
      <fieldset className={"grid grid-cols-2 gap-8 mt-2 -mb-2"}>
        <div className="flex flex-col justify-between h-full">
          <Label>
            Define the year and month for the new brand family launch:
          </Label>
          <YearMonthSelector
            showConfirmationPopover
            currentDate={currentDate}
            setCurrentDate={onUpdate.onDateChange}
            years={yearOptions}
            disabled={disabled}
          />
        </div>
        <div className="flex flex-col gap-4 justify-between">
          <Label>
            Select the mirror market fot the brand family share evolution the
            launch period:
          </Label>
          <SingleSelection
            key={currentOptions.product + currentOptions.mirror_market}
            placeholder="Product"
            defaultValue={
              currentOptions?.mirror_market ||
              String(
                productOptions.find(
                  (product) => product.value === currentOptions.product
                )?.value
              )
            }
            handleValueChange={onUpdate.onMirrorMarketChange}
            options={mirrorMarketOptions}
            disabled={disabled}
          />
        </div>
      </fieldset>
    </>
  )
}

export default BrandLaunchForm
