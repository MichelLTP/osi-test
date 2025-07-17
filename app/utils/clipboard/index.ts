import html2canvas from "html2canvas"
import { MessageObject } from "../../components/ChatSi/ChatSiResponse/type"
import ReactDOMServer from "react-dom/server"
import ReactMarkdown from "react-markdown"
import React from "react"
import { AccordionItem, CopyOptions, SourcesItem } from "./types"

const layoutHtmlTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      th, td {
        border: 1px solid #000000;
      }
    </style>
  </head>
  <body>
    ${content}
  </body>
</html>
`

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const layoutImageTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body, p, table, tr {
        margin: 0;
        padding: 0;
      }
      p {
        margin-bottom: 15px;
      }
      table {
        margin-bottom: 15px;
      }
      th, td {
        padding-bottom: 15px;
        border: 1px solid #000000;
      }
      td {
        padding-left: 15px;
        border: 1px solid #000000;
      }
    </style>
  </head>
  <body>
    ${content}
  </body>
</html>
`

const textHtmlTemplate = (text: string) => `
<p>${text}</p>
`

const codeHtmlTemplate = (code: string) => `
<table cellpadding="0" cellspacing="0" width="100%" style="background-color: #0d0d0d; color: #ffffff">
  <tbody>
    <tr>
      <td>
        <pre><code>${code}</code></pre>
      </td>
    </tr>
  </tbody>
</table>
`

const imageHtmlTemplate = (src: string) => `
<p><img src="${src}" /></p>
`

const tableHtmlTemplate = (data: { header: string[]; values: string[][] }) => `
<table cellpadding="0" cellspacing="0" width="100%">
  <thead>
    <tr>
      <th></th>
      ${data.header.map((header: string) => `<th>${header}</th>`).join("\n")}
    </tr>
  </thead>
  <tbody>
    ${data.values
      .map(
        (_, key: number) => `<tr>
      ${data.values.map((value) => `<td>${value[key]}</td>`).join("\n")}
    </tr>`
      )
      .join("\n")}
  </tbody>
</table>
`

const tableTextTemplate = (data: { header: string[]; values: string[][] }) => `
,${data.header.map((header: string) => header).join(",")}
${data.values
  .map(
    (_, key: number) => `${data.values.map((value) => value[key]).join(",")}`
  )
  .join("\n")}
`

export async function addAllMessageObjectsToClipboard(
  messageObjects: MessageObject[]
): Promise<void> {
  try {
    const textContent: string[] = []
    const htmlContent: string[] = []
    const images: string[] = [] // Store image data URLs

    let previousObjectType = ""
    let textBuilder = []
    let imagePlotly: HTMLElement | null = null

    for (const index in messageObjects) {
      if (
        previousObjectType === "text" &&
        previousObjectType !== messageObjects[index].type
      ) {
        textContent.push(textBuilder.join(" "))
        htmlContent.push(textHtmlTemplate(textBuilder.join(" ")))
        textBuilder = []
      }

      switch (messageObjects[index].type) {
        case "document_sources":
          break
        case "text":
          textBuilder.push(messageObjects[index].body)
          break
        case "code":
          textContent.push(messageObjects[index].body)
          htmlContent.push(codeHtmlTemplate(messageObjects[index].body))
          break
        case "related_questions":
          break
        case "end":
          break
        case "id_metadata":
          break
        case "plotly":
          textContent.push(
            JSON.stringify(messageObjects[index].body)
              .replace(/^"/, "")
              .replace(/"$/, "")
              .replace(/\\"/g, '"')
          )

          imagePlotly = document.getElementById(`plotly-${index}`)
          if (imagePlotly) {
            const imageCanvas = await html2canvas(imagePlotly)
            const imageDataUrl = imageCanvas.toDataURL("image/png")
            htmlContent.push(imageHtmlTemplate(imageDataUrl))
            images.push(imageDataUrl) // Add the image to the images array
          }
          break
        case "table":
          textContent.push(
            tableTextTemplate(JSON.parse(messageObjects[index].body))
          )
          htmlContent.push(
            tableHtmlTemplate(JSON.parse(messageObjects[index].body))
          )
          break
        default:
          break
      }

      previousObjectType = messageObjects[index].type
    }

    const clipboardItems: ClipboardItem[] = [
      new ClipboardItem({
        "text/html": new Blob([layoutHtmlTemplate(htmlContent.join(""))], {
          type: "text/html",
        }),
        "text/plain": new Blob([textContent.join("\n")], {
          type: "text/plain",
        }),
      }),
    ]

    if (images.length > 0) {
      for (const image of images) {
        clipboardItems.push(
          new ClipboardItem({
            "image/png": await (await fetch(image)).blob(), // Convert data URL to Blob
          })
        )
      }
    }

    // Write to the clipboard
    await navigator.clipboard.write(clipboardItems)
  } catch (error) {
    return Promise.reject(error)
  }
}

export const shouldSkipNode = (node: Node): boolean => {
  if (node instanceof HTMLElement) {
    return (
      node.id?.startsWith("plotly-") ||
      node.classList.contains("js-plotly-plot") ||
      node.closest('[id^="plotly-"]') !== null ||
      node.closest(".js-plotly-plot") !== null
    )
  }
  return false
}

export const createTableMarkdown = (table: HTMLTableElement): string => {
  if (shouldSkipNode(table)) return ""

  const rows = Array.from(table.querySelectorAll("tr"))
  if (rows.length === 0) return ""

  let markdownTable = "\n"
  const headerCells = Array.from(rows[0].querySelectorAll("th, td"))
  const columnWidths = headerCells.map((cell) =>
    Math.max(cell.textContent?.trim().length || 0, 3)
  )

  markdownTable +=
    "| " +
    headerCells
      .map((cell, i) =>
        (cell.textContent?.trim() || "").padEnd(columnWidths[i])
      )
      .join(" | ") +
    " |\n"

  markdownTable +=
    "|" + columnWidths.map((width) => "-".repeat(width + 2)).join("|") + "|\n"

  for (let i = 1; i < rows.length; i++) {
    const cells = Array.from(rows[i].querySelectorAll("td, th"))
    markdownTable +=
      "| " +
      cells
        .map((cell, j) =>
          (cell.textContent?.trim() || "").padEnd(columnWidths[j])
        )
        .join(" | ") +
      " |\n"
  }

  return markdownTable + "\n"
}

export const processNode = (node: Node): string => {
  if (shouldSkipNode(node)) return ""

  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent?.trim() || ""
  }

  if (!(node instanceof HTMLElement)) return ""

  if (node.tagName === "TABLE") {
    return createTableMarkdown(node as HTMLTableElement)
  }

  const tagHandlers: Record<string, (node: HTMLElement) => string> = {
    br: () => "\n",
    p: (node) =>
      "\n" + Array.from(node.childNodes).map(processNode).join("") + "\n",
    div: (node) => {
      if (
        node.classList.contains("min-h-[300px]") ||
        node.classList.contains("overflow-x-auto") ||
        node.classList.contains("plot-container")
      ) {
        return ""
      }
      return Array.from(node.childNodes).map(processNode).join("") + "\n"
    },
    li: (node) =>
      "- " + Array.from(node.childNodes).map(processNode).join("") + "\n",
    ul: (node) => "\n" + Array.from(node.childNodes).map(processNode).join(""),
    ol: (node) => "\n" + Array.from(node.childNodes).map(processNode).join(""),
  }

  const handler = tagHandlers[node.tagName.toLowerCase()]
  return handler
    ? handler(node)
    : Array.from(node.childNodes).map(processNode).join("")
}

// clipboardUtils.ts
export const copyToClipboard = async (
  contentID: string,
  onClick?: () => void,
  sourcesData?: SourcesItem[]
): Promise<string | null> => {
  const content = document.getElementById(contentID)
  if (!content) return null

  const tempDiv = document.createElement("div")
  tempDiv.innerHTML = content.innerHTML

  // Collect and transform source triggers into brackets
  const usedSourceRefs = new Set<number>()
  tempDiv.querySelectorAll(".source-trigger").forEach((element) => {
    // Extract numbers from the element's text content
    const text = element.textContent || ""
    const numbers = text.match(/\d+/g)
    if (numbers) {
      numbers.forEach((num) => {
        const refNum = parseInt(num)
        usedSourceRefs.add(refNum)
      })
    }

    // Replace the source trigger with brackets containing the number
    if (numbers && numbers.length > 0) {
      element.outerHTML = `[${numbers.join(", ")}]`
    }
  })

  // Remove Plotly elements
  tempDiv
    .querySelectorAll(
      '[id^="plotly-"], .js-plotly-plot, .plot-container, .plotly'
    )
    .forEach((element) => element.remove())

  // Remove Plotly containers
  Array.from(tempDiv.querySelectorAll("div"))
    .filter(
      (div) =>
        div.className.includes("min-h-[300px]") ||
        div.className.includes("overflow-x-auto")
    )
    .forEach((container) => {
      if (container.querySelector(".js-plotly-plot")) {
        container.remove()
      }
    })

  let formattedText = processNode(tempDiv)
    .replace(/\n\s*\n\s*\n/g, "\n\n")
    .trim()

  // Create references section from sourcesData
  if (usedSourceRefs.size > 0) {
    const referencesList = Array.from(usedSourceRefs)
      .sort((a, b) => a - b)
      .map((refNum) => {
        const sourceItem = sourcesData.find((item) => item.ref === refNum)
        if (sourceItem) {
          // Format date from YYYY/MM/DD to DD MMM YYYY
          const formatDate = (dateStr: string) => {
            const date = new Date(dateStr)
            return date.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          }
          const formattedDate = formatDate(sourceItem.date)
          return `[${refNum}] ${sourceItem.title}, ${sourceItem.author}, ${formattedDate}, Pages: ${sourceItem.pages}`
        }
        return `[${refNum}] Reference not found`
      })
      .join("\n")

    formattedText += `\n\nReferences:\n${referencesList}`
  }

  // Also add references to HTML content
  let htmlContent = tempDiv.innerHTML
  if (usedSourceRefs.size > 0) {
    const referencesList = Array.from(usedSourceRefs)
      .sort((a, b) => a - b)
      .map((refNum) => {
        const sourceItem = sourcesData.find((item) => item.ref === refNum)
        if (sourceItem) {
          // Format date from YYYY/MM/DD to DD MMM YYYY
          const formatDate = (dateStr: string) => {
            const date = new Date(dateStr)
            return date.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          }
          const formattedDate = formatDate(sourceItem.date)
          return `[${refNum}] ${sourceItem.title}, ${sourceItem.author}, ${formattedDate}, Pages: ${sourceItem.pages}`
        }
        return `[${refNum}] Reference not found`
      })
      .join("<br>")

    htmlContent += `<p><br><strong>References:</strong><br>${referencesList}</p>`
  }

  const htmlBlob = new Blob(
    [
      `
            <html>
              <head>
                <style>
                  table { border-collapse: collapse; width: 100%; margin: 1em 0; }
                  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                  th { background-color: #f8f9fa; }
                </style>
              </head>
              <body>
                <!--StartFragment-->${htmlContent}<!--EndFragment-->
              </body>
            </html>
          `,
    ],
    { type: "text/html" }
  )

  try {
    const clipboardItem = new ClipboardItem({
      "text/html": htmlBlob,
      "text/plain": new Blob([formattedText], { type: "text/plain" }),
    })
    await navigator.clipboard.write([clipboardItem])
    onClick?.()
    return "Copied to clipboard!"
  } catch (err) {
    try {
      await navigator.clipboard.writeText(formattedText)
      onClick?.()
      return "Copied to clipboard!"
    } catch (fallbackErr) {
      console.error("Failed to copy!", fallbackErr)
      return "Failed to copy!"
    }
  }
}
// Function to copy accordion items to clipboard
export const copyAccordionToClipboard = async (
  items: AccordionItem[],
  options: CopyOptions = {}
): Promise<string> => {
  const {
    includeDescription = true,
    titleTag = "h3",
    renderMarkdown = true,
  } = options

  if (!items || items.length === 0) {
    console.warn("No items to copy.")
    return "Failed to copy!"
  }

  const container = document.createElement("div")

  items.forEach((item) => {
    const title = document.createElement(titleTag)
    title.innerText = item.title

    const contentDiv = document.createElement("div")

    // Add description if provided and enabled
    if (includeDescription && item.description) {
      contentDiv.innerHTML += `${item.description}\n\n`
    }

    if (renderMarkdown) {
      // Render markdown to HTML
      const markdownHTML = ReactDOMServer.renderToStaticMarkup(
        React.createElement(ReactMarkdown, null, item.content)
      )
      contentDiv.innerHTML += markdownHTML
    } else {
      contentDiv.innerHTML += item.content
    }

    container.appendChild(title)
    container.appendChild(contentDiv)
  })

  return copyHtmlToClipboard(container.innerHTML)
}

// Helper function to handle the actual clipboard writing
const copyHtmlToClipboard = async (html: string): Promise<string> => {
  const blob = new Blob([html], { type: "text/html" })

  try {
    const clipboardItem = new ClipboardItem({ "text/html": blob })
    await navigator.clipboard.write([clipboardItem])
    return "Copied to clipboard!"
  } catch (err) {
    try {
      await navigator.clipboard.writeText(html)
      return "Copied to clipboard!"
    } catch (fallbackErr) {
      console.error("Failed to copy!", fallbackErr)
      return "Failed to copy!"
    }
  }
}
