import {
  Config,
  Data,
  Layout,
  PlotlyHTMLElement,
  Root,
} from "plotly.js-dist-min"
import { useEffect, useRef, useState } from "react"

export type PlotlyProps = {
  newPlot?: (
    root: Root,
    data: Data[],
    layout?: Partial<Layout>,
    config?: Partial<Config>
  ) => Promise<PlotlyHTMLElement>
  purge?: (root: Root) => void
  body?: string
  type?: string
}

const PlotlyWrapper = ({
  index,
  content,
}: {
  index: number
  content: { data: []; layout: object; frames?: [] }
}) => {
  const plotContainerRef = useRef(null)
  const [isClient, setIsClient] = useState(false)
  const [Plotly, setPlotly] = useState<PlotlyProps>()

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    const currentRef = plotContainerRef.current

    const zoomOutLayout = {
      ...content.layout,
      width: currentRef?.offsetWidth * 1,
    }

    if (isClient) {
      import("plotly.js-dist-min")
        .then((module) => {
          setPlotly(module)
          if (currentRef) {
            module.newPlot(currentRef, content?.data, zoomOutLayout)
          }
        })
        .catch((err) => console.error("Erro ao carregar plotly.js", err))
    }

    return () => {
      if (currentRef && Plotly && Plotly.purge) {
        Plotly.purge(currentRef)
      }
    }
  }, [isClient, content])

  if (!isClient) {
    return null
  }

  return <div id={`plotly-${index}`} ref={plotContainerRef} />
}

export default PlotlyWrapper
