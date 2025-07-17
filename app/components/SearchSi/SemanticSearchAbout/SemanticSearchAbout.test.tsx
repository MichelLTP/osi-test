import React from "react"
import { render, screen } from "@testing-library/react"
import { describe, test, expect, beforeEach, vi } from "vitest"
import "@testing-library/jest-dom"
import SemanticSearchAbout from "./SemanticSearchAbout"

// Mock data for testing
const mockResponse = {
  score: 0.85,
  doc_id: "doc-123",
  metadata: {
    filtered_metadata: {
      publication_date: "2024-01-15T10:30:00Z",
      entity_name: "Test Entity",
      publisher_name: "Test Publisher",
      document_title: "Test Document Title",
      short_desc: "This is a test document description",
      document_type: "Report",
      regions: ["North America", "Europe"],
      knowledge_area: ["Technology", "Finance"],
      hq_or_market: ["US", "UK"],
      markets: ["B2B", "B2C"],
      key_market: ["Enterprise", "Consumer"],
      primary_categories: ["Software", "Services"],
      primary_brands: ["Brand A", "Brand B"],
      summary_id: "summary-456",
      top_insights_id: "insights-789",
    },
  },
}

const mockSetClipboardText = vi.fn()

describe("SemanticSearchAbout", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test("renders component with all required props", () => {
    render(
      <SemanticSearchAbout
        scoreRender={true}
        response={mockResponse}
        setClipboardText={mockSetClipboardText}
      />
    )

    expect(
      screen.getByText("Score of this document versus your search:")
    ).toBeInTheDocument()
    expect(screen.getByText("0.85")).toBeInTheDocument()
    expect(screen.getByText("Doc Id:")).toBeInTheDocument()
    expect(screen.getByText("doc-123")).toBeInTheDocument()
  })

  test("renders without score when scoreRender is false", () => {
    render(
      <SemanticSearchAbout
        scoreRender={false}
        response={mockResponse}
        setClipboardText={mockSetClipboardText}
      />
    )

    expect(
      screen.queryByText("Score of this document versus your search:")
    ).not.toBeInTheDocument()
    expect(screen.queryByText("0.85")).not.toBeInTheDocument()
    expect(screen.getByText("Doc Id:")).toBeInTheDocument()
    expect(screen.getByText("doc-123")).toBeInTheDocument()
  })

  test("renders without score when scoreRender is undefined", () => {
    render(
      <SemanticSearchAbout
        response={mockResponse}
        setClipboardText={mockSetClipboardText}
      />
    )

    expect(
      screen.queryByText("Score of this document versus your search:")
    ).not.toBeInTheDocument()
    expect(screen.getByText("Doc Id:")).toBeInTheDocument()
  })

  test("displays all metadata fields correctly", () => {
    render(
      <SemanticSearchAbout
        scoreRender={true}
        response={mockResponse}
        setClipboardText={mockSetClipboardText}
      />
    )

    // Check individual metadata fields
    expect(screen.getByText("Publication Date:")).toBeInTheDocument()
    expect(screen.getByText("2024-01-15")).toBeInTheDocument()
    expect(screen.getByText("Entity Name:")).toBeInTheDocument()
    expect(screen.getByText("Test Entity")).toBeInTheDocument()
    expect(screen.getByText("Publisher name:")).toBeInTheDocument()
    expect(screen.getByText("Test Publisher")).toBeInTheDocument()
    expect(screen.getByText("Document title:")).toBeInTheDocument()
    expect(screen.getByText("Test Document Title")).toBeInTheDocument()
    expect(screen.getByText("Short desc:")).toBeInTheDocument()
    expect(
      screen.getByText("This is a test document description")
    ).toBeInTheDocument()
    expect(screen.getByText("Document type:")).toBeInTheDocument()
    expect(screen.getByText("Report")).toBeInTheDocument()
  })

  test("displays array fields as comma-separated strings", () => {
    render(
      <SemanticSearchAbout
        scoreRender={true}
        response={mockResponse}
        setClipboardText={mockSetClipboardText}
      />
    )

    expect(screen.getByText("Regions:")).toBeInTheDocument()
    expect(screen.getByText("North America, Europe")).toBeInTheDocument()
    expect(screen.getByText("Knowledge area:")).toBeInTheDocument()
    expect(screen.getByText("Technology, Finance")).toBeInTheDocument()
    expect(screen.getByText("Primary brands:")).toBeInTheDocument()
    expect(screen.getByText("Brand A, Brand B")).toBeInTheDocument()
  })

  test("calls setClipboardText with formatted content on mount", () => {
    render(
      <SemanticSearchAbout
        scoreRender={true}
        response={mockResponse}
        setClipboardText={mockSetClipboardText}
      />
    )

    expect(mockSetClipboardText).toHaveBeenCalledTimes(1)

    const expectedContent = [
      "Publication Date: 2024-01-15",
      "Entity Name: Test Entity",
      "Publisher name: Test Publisher",
      "Document title: Test Document Title",
      "Short desc: This is a test document description",
      "Document type: Report",
      "Regions: North America, Europe",
      "Knowledge area: Technology, Finance",
      "Hq or market: US, UK",
      "Markets: B2B, B2C",
      "Key market: Enterprise, Consumer",
      "Primary categories: Software, Services",
      "Primary brands: Brand A, Brand B",
      "Summary id: summary-456",
      "Top insights id: insights-789",
    ].join("\n")

    expect(mockSetClipboardText).toHaveBeenCalledWith(expectedContent)
  })

  test("does not call setClipboardText when it is undefined", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

    render(<SemanticSearchAbout scoreRender={true} response={mockResponse} />)

    // Should not throw any errors
    expect(consoleSpy).not.toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  test("handles empty arrays in metadata", () => {
    const responseWithEmptyArrays = {
      ...mockResponse,
      metadata: {
        filtered_metadata: {
          ...mockResponse.metadata.filtered_metadata,
          regions: [],
          knowledge_area: [],
          primary_brands: [],
        },
      },
    }

    render(
      <SemanticSearchAbout
        scoreRender={true}
        response={responseWithEmptyArrays}
        setClipboardText={mockSetClipboardText}
      />
    )

    expect(screen.getByText("Regions:")).toBeInTheDocument()
    expect(screen.getByText("Knowledge area:")).toBeInTheDocument()
    expect(screen.getByText("Primary brands:")).toBeInTheDocument()

    // The empty arrays should render as empty strings
    const regionsElement = screen.getByText("Regions:").nextSibling
    expect(regionsElement?.textContent?.trim() || "").toBe("")
  })

  test("handles publication date formatting correctly", () => {
    const responseWithDifferentDate = {
      ...mockResponse,
      metadata: {
        filtered_metadata: {
          ...mockResponse.metadata.filtered_metadata,
          publication_date: "2023-12-25T14:45:30.123Z",
        },
      },
    }

    render(
      <SemanticSearchAbout
        scoreRender={true}
        response={responseWithDifferentDate}
        setClipboardText={mockSetClipboardText}
      />
    )

    expect(screen.getByText("2023-12-25")).toBeInTheDocument()
  })

  test("renders with different score values", () => {
    const responseWithDifferentScore = {
      ...mockResponse,
      score: 0.92,
    }

    render(
      <SemanticSearchAbout
        scoreRender={true}
        response={responseWithDifferentScore}
        setClipboardText={mockSetClipboardText}
      />
    )

    expect(screen.getByText("0.92")).toBeInTheDocument()
  })

  test("setClipboardText is called when prop changes", () => {
    const { rerender } = render(
      <SemanticSearchAbout
        scoreRender={true}
        response={mockResponse}
        setClipboardText={mockSetClipboardText}
      />
    )

    expect(mockSetClipboardText).toHaveBeenCalledTimes(1)

    const newSetClipboardText = vi.fn()
    rerender(
      <SemanticSearchAbout
        scoreRender={true}
        response={mockResponse}
        setClipboardText={newSetClipboardText}
      />
    )

    expect(newSetClipboardText).toHaveBeenCalledTimes(1)
  })
})
