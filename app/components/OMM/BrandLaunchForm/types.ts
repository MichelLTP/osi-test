import { BrandLaunchOptions, ProductMirrorMarket } from "@/components/OMM/types"
import { Option } from "@/components/ui/VirtualizedCombobox/types"

export interface BrandLaunchFormProps {
  productData: ProductMirrorMarket[]
  companyOptions: Option[]
  currentOptions: BrandLaunchOptions
  currentDate: { year: string; month: string }
  onUpdate: {
    onProductChange: (value: string) => void
    onCompanyChange: (value: string) => void
    onMirrorMarketChange: (value: string) => void
    onDateChange: (date: { year: string; month: string }) => void
  }
  loading: {
    loadingCompanies: boolean
  }
  yearLimit?: number
  disabled?: boolean
}
