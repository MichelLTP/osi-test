export interface ISelectField {
  value: string
  label: string
  path?: string
  selectField?: ISelectField[]
}

export interface Selections {
  selectOne: string
  selectTwo: string
  selectThree: string
}
