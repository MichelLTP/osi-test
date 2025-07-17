import { Button } from "@/components/ui/Button/Button"
import DatePicker from "@/components/ui/DatePicker/DatePicker"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
} from "@/components/ui/Dialog/Dialog"

import { Label } from "@/components/ui/Label/Label"
import MultipleSelector from "@/components/ui/MultipleSelector/MultipleSelector"
import {
  useCloseSidebar,
  useLoadingFilters,
  useLoadingState,
} from "@/store/layout"
import {
  refactorObjectValuesToArrays,
  transformOptions,
} from "@/utils/metadataFilters"
import {
  faClose,
  faPaperPlane,
  faSliders,
  faTrash,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Control, Controller, useForm, useWatch } from "react-hook-form"
import { useSubmit, useFetcher, useLocation } from "@remix-run/react"
import { loader } from "@/routes/searchSi.metadataSearch"
import { FilterData, FiltersProps } from "./types"
import { DialogTitle } from "@radix-ui/react-dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { countSelectedFields } from "@/utils/filters"
import { useFiltersStore } from "@/store/filters"
import { LoadingComponent } from "@/components/Layout/LoadingComponent/LoadingComponent"
import { useSearchMethod } from "@/store/searchsi"
import { useLitePaper } from "@/store/litepaper"
import { toast } from "@/hooks/useToast"
import { Skeleton } from "@/components/ui/Skeleton/Skeleton"
import { cn } from "@/utils/shadcn/utils"

export function Filters({
  filterData,
  setShowFilters,
  litePaperUuids,
}: FiltersProps) {
  const { handleSubmit, control, reset } = useForm<FilterData>()
  const timeoutId = useRef<NodeJS.Timeout | null>(null)
  const filtersContainerRef = useRef<HTMLDivElement>(null)
  const submit = useSubmit()
  const fetcher = useFetcher<typeof loader>()
  const [key, setKey] = useState<number>(0)
  const initialRender = useRef(true)
  const location = useLocation()
  const { setLoadingSearchSI } = useSearchMethod()

  const previousFormValues = useRef<Record<string, unknown>>({})
  const useTransformedWatch = (control: Control<FilterData>) => {
    const formValues = useWatch({ control })

    return useMemo(() => refactorObjectValuesToArrays(formValues), [formValues])
  }
  const formValues = useTransformedWatch(control)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const close = useCloseSidebar((state) => state.close)
  const { loadingFilters, setLoadingFilters } = useLoadingFilters()
  const { loadingState, setLoadingState } = useLoadingState()
  const {
    filters,
    setFilters,
    setIsFiltersSelected,
    setUpdatedFilterData,
    updatedFilterData,
    initialFiltersData,
  } = useFiltersStore()
  const litePaper = useLitePaper()
  const isFiltersReady =
    !loadingState &&
    updatedFilterData !== undefined &&
    updatedFilterData !== null

  useEffect(() => {
    if (litePaperUuids) {
      const { childUuid, parentUuid } = litePaperUuids

      let filters
      if (parentUuid !== "") {
        const parentSection = litePaper.sections.find(
          (s) => s.uuid === parentUuid
        )
        const subsection = parentSection?.subsections?.find(
          (sub) => sub.uuid === childUuid
        )

        if (subsection?.metadata_filters) {
          filters = subsection.metadata_filters
        }
      } else {
        const section = litePaper.sections.find((s) => s.uuid === childUuid)

        if (section?.metadata_filters) {
          filters = section.metadata_filters
        }
      }

      if (filters) {
        setFilters(filters)
        setUpdatedFilterData(filterData)
      } else {
        reset()
        setFilters({})
        setIsFiltersSelected(false)
        if (litePaperUuids) {
          setUpdatedFilterData(filterData)
        }
      }
    }
  }, [litePaperUuids, litePaper.sections])

  const onSubmit = (data: FilterData) => {
    setLoadingFilters(false)
    setLoadingState(true)
    setShowFilters(false)
    displayFiltersToast()
    if (location.pathname.includes("metadataSearch")) {
      submit(refactorObjectValuesToArrays(data), {
        method: "post",
        action: "/searchSi/metadataSearch",
      })
      setLoadingSearchSI(true)
    }
  }

  const handleChangeWithTimeout = useCallback(
    (onChange: (value: unknown) => void) => (value: unknown) => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current)
      }
      timeoutId.current = setTimeout(() => {
        onChange(value)
      }, 50)
    },
    []
  )

  const handleResetFilters = () => {
    reset()
    setFilters({})

    setIsFiltersSelected(false)
    setUpdatedFilterData(initialFiltersData)
    setKey((prevKey) => prevKey + 1)
    if (litePaperUuids) {
      let layoutMeta
      if (litePaperUuids.parentUuid !== "") {
        const parentSection = litePaper.sections.find(
          (s) => s.uuid === litePaperUuids.parentUuid
        )
        layoutMeta = parentSection?.subsections?.find(
          (sub) => sub.uuid === litePaperUuids.childUuid
        ).layout_metadata
      } else {
        layoutMeta = litePaper.sections.find(
          (s) => s.uuid === litePaperUuids.childUuid
        )?.layout_metadata
      }
      litePaper.updateSectionOrSubsectionField(
        litePaperUuids.childUuid,
        {
          metadata_filters: {},
          layout_metadata: {
            ...layoutMeta,
            metadata_options: layoutMeta.metadata_firstOptions,
          },
        },
        litePaperUuids.parentUuid !== "" ? litePaperUuids.parentUuid : undefined
      )
      setUpdatedFilterData(layoutMeta.metadata_firstOptions as FilterData)
    }
  }

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false
    } else {
      // Compare current formValues with previous ones
      if (
        JSON.stringify(formValues) !==
        JSON.stringify(previousFormValues.current)
      ) {
        if (Object.keys(formValues).length > 0) {
          setLoadingFilters(true)
        }
        // Update the previous values reference
        previousFormValues.current = formValues

        // Clear the existing timeout, if any
        if (timeoutId.current) {
          clearTimeout(timeoutId.current)
        }

        // Set a new timeout for debouncing
        timeoutId.current = setTimeout(() => {
          // Check if there are any form values to submit
          if (Object.keys(formValues).length > 0) {
            setFilters(formValues)
            if (location.pathname.includes("/searchSi")) {
              const tab = location.pathname.includes("metadataSearch")
                ? "metadata"
                : "hybrid"
              fetcher.submit(formValues, {
                method: "post",
                action: `/searchSi/${tab}Search?intent=filter`,
              })
            } else if (
              location.pathname.includes("/litePaper") &&
              litePaperUuids
            ) {
              litePaper.updateSectionOrSubsectionField(
                litePaperUuids.childUuid,
                { metadata_filters: formValues },
                litePaperUuids.parentUuid !== ""
                  ? litePaperUuids.parentUuid
                  : undefined
              )
              fetcher.submit(refactorObjectValuesToArrays(formValues), {
                method: "post",
                action: `/litePaper/slides?intent=filter`,
              })
            } else {
              fetcher.submit(formValues, {
                method: "post",
                action: "?intent=filter",
              })
            }
          }
        }, 500)
      }
    }
  }, [formValues, fetcher, setFilters])

  useEffect(() => {
    if (fetcher.data) {
      setUpdatedFilterData(fetcher.data.newFilters)
      if (litePaperUuids) {
        let layoutMeta
        if (litePaperUuids.parentUuid !== "") {
          const parentSection = litePaper.sections.find(
            (s) => s.uuid === litePaperUuids.parentUuid
          )
          layoutMeta = parentSection?.subsections?.find(
            (sub) => sub.uuid === litePaperUuids.childUuid
          ).layout_metadata
        } else {
          layoutMeta = litePaper.sections.find(
            (s) => s.uuid === litePaperUuids.childUuid
          )?.layout_metadata
        }
        litePaper.updateSectionOrSubsectionField(
          litePaperUuids.childUuid,
          {
            layout_metadata: {
              ...layoutMeta,
              metadata_options: fetcher.data.newFilters,
            },
          },
          litePaperUuids.parentUuid !== ""
            ? litePaperUuids.parentUuid
            : undefined
        )
      }

      setLoadingFilters(false)
    }
  }, [fetcher.data])

  useEffect(() => {
    setIsPopoverOpen(true)
  }, [])

  const displayFiltersToast = () => {
    // Get all non-empty filter arrays
    const selectedFilters = Object.entries(filters)
      .filter(([_, value]) => Array.isArray(value) && value.length > 0)
      .map(([key, value]) => {
        // Convert key from snake_case to readable format
        const readableKey = key
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase())
        return `${readableKey}: ${value.join(", ")}`
      })

    // Determine toast message based on selected filters
    const hasSelectedFilters = selectedFilters.length > 0

    if (!hasSelectedFilters) {
      return
    } else {
      toast({
        title: `Filters applied`,
        description: (
          <div className="flex flex-col gap-1 mt-2">
            {selectedFilters.map((filter, index) => (
              <span key={index}>
                <span className="text-secondary dark:text-white font-bold">
                  {filter.split(": ")[0]}:
                </span>
                {" " + filter.split(": ")[1]}
              </span>
            ))}
          </div>
        ),
        variant: "success",
      })
    }
  }

  const handlePopoverClose = () => {
    setLoadingFilters(false)
    setIsPopoverOpen(false)
    setShowFilters(false)
    displayFiltersToast()
  }

  useEffect(() => {
    countSelectedFields(filters, setIsFiltersSelected)
  }, [filters, setIsFiltersSelected])

  useEffect(() => {
    if (filterData !== null && Object.keys(updatedFilterData).length === 0) {
      setUpdatedFilterData(filterData)
    }
  }, [filterData])

  return (
    <div>
      <Dialog open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <DialogContent
          onInteractOutside={(event) => {
            if (!loadingFilters) {
              handlePopoverClose()
            } else {
              event.preventDefault()
            }
          }}
          className="outline-third dark:outline-third-dark w-full bg-white border dark:bg-primary-dark border-primary shadow-lg rounded-lg p-8 pr-1 text-xs sm:text-sm md:text-md sm:mt-3 max-w-[90%] 2xl:max-w-[1521px]"
        >
          <form
            key={key}
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col max-h-[85vh] overflow-y-auto styled-scrollbar pr-8"
            ref={filtersContainerRef}
          >
            <div className="flex flex-row gap-4 items-start w-full justify-between">
              <DialogTitle className="flex flex-row gap-x-4 items-baseline sm:items-center text-secondary dark:text-white">
                {isFiltersReady ? (
                  <>
                    <FontAwesomeIcon
                      icon={faSliders}
                      size="lg"
                      className={"translate-y-0.5 sm:translate-y-0"}
                    />
                    <span className="text-basebold">
                      {updatedFilterData?.description}
                    </span>
                  </>
                ) : (
                  <Skeleton className="rounded-xs h-7 w-[280px]" />
                )}
              </DialogTitle>
              <DialogClose
                onClick={(event) => {
                  if (!loadingFilters) {
                    handlePopoverClose()
                  } else {
                    event.preventDefault()
                  }
                }}
                className="text-primary hover:text-secondary dark:hover:text-white transition-all duration-300 translate-y-1 sm:translate-y-0"
              >
                <FontAwesomeIcon
                  icon={faClose}
                  className="text-primary hover:text-secondary dark:hover:text-white transition-all duration-300"
                  size="xl"
                />
              </DialogClose>
            </div>
            <VisuallyHidden asChild>
              <DialogDescription>
                {updatedFilterData?.description}
              </DialogDescription>
            </VisuallyHidden>

            {isFiltersReady ? (
              <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 mt-8 text-secondary dark:text-white">
                {updatedFilterData?.groups?.map((group: any, index: number) => {
                  return (
                    <div key={index} className="flex flex-col gap-y-8">
                      <h3 className="text-xlbold">{group.title}</h3>
                      {group.fields.map((field: any, fieldIndex: number) => {
                        return (
                          <div
                            key={fieldIndex}
                            className="flex flex-col gap-y-1"
                          >
                            <Label className="text-sm">{field.label}</Label>
                            {field.type === "MultiSelectField" ? (
                              <Controller
                                name={field.key}
                                key={field.key}
                                control={control}
                                defaultValue={
                                  Object.keys(filters).length > 0
                                    ? transformOptions(filters[field?.key])
                                    : []
                                }
                                render={({ field: controllerField }) => {
                                  return (
                                    <MultipleSelector
                                      filtersModalRef={filtersContainerRef}
                                      options={transformOptions(field.options)}
                                      key={field.key}
                                      hidePlaceholderWhenSelected
                                      value={controllerField.value}
                                      onBlur={(value) => {
                                        handleChangeWithTimeout(
                                          controllerField.onChange
                                        )(value)
                                        controllerField.onBlur()
                                      }}
                                      disabled={loadingFilters}
                                      className={
                                        "bg-third dark:bg-secondary-dark dark:text-white focus-within:border-primary transition-[border-color] duration-300 focus-within:border-opacity-15 focus-within:border border border-transparent"
                                      }
                                      badgeClassName={
                                        "hover:shadow-md transition-colors cursor-pointer rounded-xs"
                                      }
                                    />
                                  )
                                }}
                              />
                            ) : (
                              <>
                                <Controller
                                  name={field.key}
                                  control={control}
                                  defaultValue={field.value || ""}
                                  render={({ field }) => (
                                    <>
                                      <DatePicker
                                        value={field.value}
                                        onChange={field.onChange}
                                        variantPicker="monthpicker"
                                      />
                                    </>
                                  )}
                                />
                              </>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            ) : (
              <LoadingComponent variant="full-filters-loading" />
            )}
            <div
              className={cn(
                "grid gap-4 grid-cols-1 sm:grid-cols-2 gap-y-0 mt-5 gap-x-4 lg:flex lg:flex-row lg:items-center lg:justify-end",
                close && "sm:flex sm:flex-row sm:items-center sm:justify-end",
                !isFiltersReady && "pointer-events-none opacity-40"
              )}
            >
              <Button
                className="w-full sm:w-auto mt-5 border-error text-error"
                variant="outline"
                icon={faTrash}
                type="button"
                onClick={handleResetFilters}
              >
                reset filters
              </Button>

              {location.pathname.includes("/searchSi/metadataSearch") && (
                <Button
                  className="mt-5 w-full sm:w-auto"
                  variant="outline"
                  icon={faPaperPlane}
                  type="submit"
                  disabled={loadingFilters}
                >
                  run search
                </Button>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
