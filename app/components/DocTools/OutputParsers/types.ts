export interface Name {
  label: string
  value: string
  placeholder: string
  type: string
}

export interface Type {
  label: string
  value: string
  placeholder: string
  options: Option[]
  type: string
}

export interface Option {
  value: string
  label: string
}

export interface Description {
  label: string
  value: string
  placeholder: string
  type: string
}

export interface Field {
  name: Name
  type: Type
  description: Description
}
