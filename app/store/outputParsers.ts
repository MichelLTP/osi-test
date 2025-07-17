import { Field } from "@/components/DocTools/OutputParsers/types"
import { create } from "zustand"

const initialValue: Field[] = [
  {
    name: {
      label: "Field Name",
      value: "",
      placeholder: "Occupation",
      type: "input",
    },
    type: {
      label: "Field Type",
      value: "str",
      placeholder: "str",
      options: [],
      type: "dropdown",
    },
    description: {
      label: "Field Description",
      value: "",
      placeholder: "What does the interviewee do for a living?",
      type: "textarea",
    },
  },
]

type FieldsState = {
  fields: Field[]
  docID: string[]
  setDocID: (newDocID: string[]) => void
  addField: () => void
  removeField: (index: number) => void
  setFieldValue: (index: number, key: keyof Field, value: string) => void
  resetFields: () => void
}

export const useOutputParsersStore = create<FieldsState>((set) => ({
  fields: initialValue,
  docID: [],
  setDocID: (newDocID) => set({ docID: newDocID }),
  addField: () =>
    set((state) => ({
      fields: [
        ...state.fields,
        {
          ...initialValue[0],
        },
      ],
    })),
  removeField: (index) =>
    set((state) => ({
      fields: state.fields.filter((_, i) => i !== index),
    })),
  setFieldValue: (index, key, value) =>
    set((state) => ({
      fields: state.fields.map((field, i) =>
        i === index ? { ...field, [key]: { ...field[key], value } } : field
      ),
    })),
  resetFields: () =>
    set(() => ({
      fields: initialValue,
    })),
}))
