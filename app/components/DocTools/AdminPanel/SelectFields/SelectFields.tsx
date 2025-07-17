import { SelectField } from "@/components/ui/Select/Select"
import { ISelectField, Selections } from "./types"
import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "@remix-run/react"
import { useAdminPanelDiscoveryStore } from "@/store/AdminPanel/discovery"

export default function SelectFields() {
  const navigate = useNavigate()
  const location = useLocation()

  const initialSelections: Selections = {
    selectOne: "Documents",
    selectTwo: "Add",
    selectThree: "RADRS",
  }

  const [selections, setSelections] = useState<Selections>(initialSelections)
  const { resetStore } = useAdminPanelDiscoveryStore()

  const selectFields: ISelectField[] = [
    {
      value: "Documents",
      label: "Documents",
      selectField: [
        { value: "Add", label: "Add", path: "./addDocument" },
        { value: "Modify", label: "Modify", path: "./modifyDocument" },
      ],
    },
    {
      value: "Data",
      label: "Data",
      selectField: [
        {
          value: "Add",
          label: "Add",
          selectField: [
            { value: "RADRS", label: "RADRS", path: "./addRADRS" },
            { value: "TRACKER", label: "TRACKER", path: "./addTRACKER" },
            { value: "OMM", label: "OMM", path: "./addOMM" },
          ],
        },
        {
          value: "Modify",
          label: "Modify",
          selectField: [
            { value: "RADRS", label: "RADRS", path: "./modifyRADRS" },
            { value: "TRACKER", label: "TRACKER", path: "./modifyTRACKER" },
            { value: "OMM", label: "OMM", path: "./modifyOMM" },
          ],
        },
      ],
    },
    { value: "Feedback", label: "Feedback", path: "./feedback" },
    {
      value: "Small text",
      label: "Small text",
      selectField: [
        { value: "Add", label: "Add", path: "./addSmallText" },
        { value: "Modify", label: "Modify", path: "./modifySmallText" },
      ],
    },
    {
      value: "discovery",
      label: "Discovery",
      selectField: [
        { value: "Add", label: "Add", path: "./addDiscovery" },
        { value: "Modify", label: "Modify", path: "./modifyDiscovery" },
      ],
    },
  ]

  useEffect(() => {
    if (
      selections.selectOne === "discovery" &&
      (selections.selectTwo === "Add" || selections.selectTwo === "Modify")
    ) {
      resetStore()
    }
  }, [selections])

  const findRouteInFields = (fields: ISelectField[], path: string) => {
    for (const field of fields) {
      if (field.path && path.includes(field.path.replace(/[./]/g, ""))) {
        setSelections((prev: Selections) => ({
          ...prev,
          selectOne: field.value,
        }))
        return
      }

      if (field.selectField) {
        for (const subField of field.selectField) {
          if (
            subField.path &&
            path.includes(subField.path.replace(/[./]/g, ""))
          ) {
            setSelections((prev: Selections) => ({
              ...prev,
              selectOne: field.value,
              selectTwo: subField.value,
            }))
            return
          }

          if (subField.selectField) {
            for (const nestedField of subField.selectField) {
              if (
                nestedField.path &&
                path.includes(nestedField.path.replace(/[./]/g, ""))
              ) {
                setSelections((prev: Selections) => ({
                  ...prev,
                  selectOne: field.value,
                  selectTwo: subField.value,
                  selectThree: nestedField.value,
                }))
                return
              }
            }
          }
        }
      }
    }
  }

  useEffect(() => {
    findRouteInFields(selectFields, location.pathname)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  // Find the path based on selections
  const findPath = (
    fields: ISelectField[],
    selections: Selections
  ): string | undefined => {
    const firstField = fields.find((sf) => sf.value === selections.selectOne)
    const secondField = firstField?.selectField?.find(
      (sf) => sf.value === selections.selectTwo
    )
    const thirdField = secondField?.selectField?.find(
      (sf) => sf.value === selections.selectThree
    )
    return thirdField?.path || secondField?.path || firstField?.path
  }

  const handleSelectionChange = (field: string) => (value: string) => {
    setSelections((prev: Selections) => ({ ...prev, [field]: value }))

    const updatedSelections = { ...selections, [field]: value }
    const path = findPath(selectFields, updatedSelections)

    if (path) navigate(path)
  }

  return (
    <div className="grid grid-cols-2 gap-8 border-b dark:border-third-dark pb-8">
      <SelectField
        value={selections.selectOne}
        onChange={handleSelectionChange("selectOne")}
        options={selectFields}
      />
      <div className="flex flex-col gap-8">
        {selectFields.find((field) => field.value === selections.selectOne)
          ?.selectField && (
          <SelectField
            value={selections.selectTwo}
            onChange={handleSelectionChange("selectTwo")}
            options={
              selectFields.find((field) => field.value === selections.selectOne)
                ?.selectField || []
            }
          />
        )}
        {selectFields
          .find((field) => field.value === selections.selectOne)
          ?.selectField?.find((field) => field.value === selections.selectTwo)
          ?.selectField && (
          <SelectField
            value={selections.selectThree}
            onChange={handleSelectionChange("selectThree")}
            options={
              selectFields
                .find((field) => field.value === selections.selectOne)
                ?.selectField?.find(
                  (field) => field.value === selections.selectTwo
                )?.selectField || []
            }
          />
        )}
      </div>
    </div>
  )
}
