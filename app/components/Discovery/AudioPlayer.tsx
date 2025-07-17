import { useEffect, useRef } from "react"

const AudioPlayer = ({ url }: { url: string }) => {
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load()
    }
  }, [url])

  // Only return null if url is explicitly null or undefined
  if (url == null) return null
  return (
    // eslint-disable-next-line jsx-a11y/media-has-caption
    <audio
      ref={audioRef}
      controls
      className="max-w-full"
      onError={(e) => console.error("Audio error:", e)}
    >
      <source src={url} type="audio/mp3" />
      Your browser does not support the audio element.
    </audio>
  )
}

export default AudioPlayer
