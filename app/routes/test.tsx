import ChunkSource from "@/components/Shared/ChunkSource/ChunkSource"
import { Button } from "@/components/ui/Button/Button"

export default function test() {
  return (
    <div className="h-screen flex items-center justify-center">
      <Button>Test</Button>
      <ChunkSource />
    </div>
  )
}
