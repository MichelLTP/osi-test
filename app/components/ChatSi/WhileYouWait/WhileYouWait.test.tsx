import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import WhileYouWait from "./WhileYouWait"

// Mock FontAwesome component
vi.mock("@fortawesome/react-fontawesome", () => ({
  FontAwesomeIcon: ({ icon, size }: { icon: any; size: string }) => (
    <span
      data-testid="fontawesome-icon"
      data-icon={icon.iconName}
      data-size={size}
    >
      💡
    </span>
  ),
}))

// Mock the Skeleton component
vi.mock("@/components/ui/Skeleton/Skeleton", () => ({
  Skeleton: ({ className }: { className: string }) => (
    <div data-testid="skeleton" className={className}>
      Loading...
    </div>
  ),
}))

describe("WhileYouWait", () => {
  describe("Component Structure", () => {
    it('renders the "Did you know?" header with lightbulb icon', () => {
      render(<WhileYouWait inputText="Test text" />)

      // Check for the lightbulb icon
      const icon = screen.getByTestId("fontawesome-icon")
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveAttribute("data-icon", "lightbulb")
      expect(icon).toHaveAttribute("data-size", "lg")

      // Check for the "Did you know?" text
      expect(screen.getByText("Did you know?")).toBeInTheDocument()
    })

    it("applies correct CSS classes to the main container", () => {
      const { container } = render(<WhileYouWait inputText="Test text" />)
      const mainDiv = container.firstChild as HTMLElement

      expect(mainDiv).toHaveClass("flex", "flex-col", "my-6", "md:my-0")
    })

    it("applies correct styling to header elements", () => {
      render(<WhileYouWait inputText="Test text" />)

      const headerContainer = screen.getByText("Did you know?").closest("div")
      expect(headerContainer).toHaveClass(
        "flex",
        "items-center",
        "space-x-2",
        "md:mb-2"
      )

      const titleSpan = screen.getByText("Did you know?")
      expect(titleSpan).toHaveClass(
        "text-secondary",
        "dark:text-white",
        "text-xl",
        "font-bold"
      )
    })
  })

  describe("Content Display Logic", () => {
    it("displays input text when provided", () => {
      const testText = "This is a test tip about something interesting!"
      render(<WhileYouWait inputText={testText} />)

      expect(screen.getByText(testText)).toBeInTheDocument()
      expect(screen.queryByTestId("skeleton")).not.toBeInTheDocument()
    })

    it("displays skeletons when inputText is empty string", () => {
      render(<WhileYouWait inputText="" />)

      const skeletons = screen.getAllByTestId("skeleton")
      expect(skeletons).toHaveLength(3)
      expect(skeletons[0]).toHaveClass("h-[23px]", "w-full", "mb-2")
    })

    it("displays skeletons when inputText is undefined", () => {
      render(<WhileYouWait inputText={undefined} />)

      const skeletons = screen.getAllByTestId("skeleton")
      expect(skeletons).toHaveLength(3)
    })

    it("displays skeletons when inputText is null", () => {
      render(<WhileYouWait inputText={null as any} />)

      const skeletons = screen.getAllByTestId("skeleton")
      expect(skeletons).toHaveLength(3)
    })
  })

  describe("Conditional Styling", () => {
    it("applies correct classes to content container when text is provided", () => {
      render(<WhileYouWait inputText="Test content" />)

      const contentDiv = screen.getByText("Test content").closest("div")
      expect(contentDiv).toHaveClass("lg:mb-5", "sm:mb-auto")

      const textSpan = screen.getByText("Test content")
      expect(textSpan).toHaveClass(
        "text-secondary",
        "dark:text-white",
        "text-base"
      )
    })
  })

  describe("Edge Cases", () => {
    it("handles very long input text", () => {
      const longText = "A".repeat(1000)
      render(<WhileYouWait inputText={longText} />)

      expect(screen.getByText(longText)).toBeInTheDocument()
      expect(screen.queryByTestId("skeleton")).not.toBeInTheDocument()
    })

    it("handles special characters in input text", () => {
      const specialText = "Did you know? 🚀 Special chars: @#$%^&*()!"
      render(<WhileYouWait inputText={specialText} />)

      expect(screen.getByText(specialText)).toBeInTheDocument()
    })

    it("renders exactly 3 skeleton elements", () => {
      render(<WhileYouWait inputText="" />)

      const skeletons = screen.getAllByTestId("skeleton")
      expect(skeletons).toHaveLength(3)

      // Verify each skeleton has the correct props
      skeletons.forEach((skeleton) => {
        expect(skeleton).toHaveClass("h-[23px]", "w-full", "mb-2")
      })
    })
  })
})
