export type ScenarioChangesBubbleProps = {
  countryCode: string
  text: string
  navigateTo: string
  navigationState?: { product?: string; company?: string }
  removeChange: () => void
}
