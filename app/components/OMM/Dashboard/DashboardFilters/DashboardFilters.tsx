import { DashboardFiltersProps } from "./type"
import { Label } from "@/components/ui/Label/Label"
import React from "react"
import SearchDashboardFilters from "../../FilterSelect/SearchDashboardFilters"

const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  markets,
  activeMarkets,
  products,
  activeProducts,
  companies,
  activeCompanies,
  handleValueChange,
  context = 1,
}) => {
  const contextSuffix = context === 2 ? "_2" : ""

  return (
    <section>
      <Label className="!text-xlbold">Context {context}</Label>
      <div className="grid grid-cols-3 gap-6 mt-4 mb-5">
        <SearchDashboardFilters
          title="Markets"
          options={markets}
          groupColumn="region"
          valueColumn="market_id"
          labelColumn="market"
          defaultValues={activeMarkets}
          handleValueChange={(selectedValue) =>
            handleValueChange(`markets${contextSuffix}`, selectedValue)
          }
        />
        <SearchDashboardFilters
          title="Products"
          options={products}
          groupColumn="category"
          valueColumn="product_hier_id"
          labelColumn="product_hier_desc"
          subgroupColumn="subcategory"
          defaultValues={activeProducts}
          handleValueChange={(selectedValue) =>
            handleValueChange(`products${contextSuffix}`, selectedValue)
          }
        />
        <SearchDashboardFilters
          title="Companies"
          options={companies}
          groupColumn="company"
          valueColumn="company_hier_id"
          labelColumn="brand_family"
          defaultValues={activeCompanies}
          handleValueChange={(selectedValue) =>
            handleValueChange(`companies${contextSuffix}`, selectedValue)
          }
        />
      </div>
    </section>
  )
}

export default DashboardFilters
