import FileUploadProgress from "@/components/Shared/FileUploadProgress/FileUploadProgress"
import { AcceptedFile } from "@/components/Shared/UploadFile/types"
import UploadFile from "@/components/Shared/UploadFile/UploadFile"

import { Input } from "@/components/ui/Input/Input"
import { Label } from "@/components/ui/Label/Label"
import { useAdminPanelDiscoveryStore } from "@/store/AdminPanel/discovery"
import { useEffect, useState } from "react"

const Podcast = () => {
  const [currentFile, setCurrentFile] = useState<File | AcceptedFile | null>(
    null
  )
  const [audioTitle, setAudioTitle] = useState<string>("")
  const {
    setAudios,
    addUploadAudio,
    audios,
    updateAudioTitle,
    removeUploadAudio,
  } = useAdminPanelDiscoveryStore()

  const onUpload = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const newFile = acceptedFiles[0]
      setCurrentFile(newFile)
      setAudios([
        {
          title: audioTitle === "" ? newFile.name : audioTitle,
          matching_filename: newFile.name,
        },
      ])
      addUploadAudio(newFile as File)
    }
  }

  useEffect(() => {
    //update do title do audio
    if (audioTitle !== "") {
      updateAudioTitle(0, audioTitle)
    }
  }, [currentFile, audioTitle])

  const onCancelUpload = () => {
    setAudios([])
    if (currentFile?.name) removeUploadAudio(currentFile.name)
    setCurrentFile(null)
  }

  const getAcceptedFiles = () => {
    if (currentFile !== null) {
      return [currentFile]
    }

    if (audios.length !== 0) {
      if (audios[0]?.audio_name) {
        return [{ label: audios[0].audio_name }]
      }

      if (audios[0]?.matching_filename) {
        return [{ label: audios[0].matching_filename }]
      }
    }

    return []
  }

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className=" w-full md:w-1/2 gap-2 flex flex-col">
        <Label>Audio file</Label>
        <UploadFile onUpload={onUpload} acceptedFileTypes="audio" />
        {(currentFile !== null || audios.length !== 0) && (
          <FileUploadProgress
            acceptedFiles={getAcceptedFiles()}
            onCancelUpload={onCancelUpload}
          />
        )}
      </div>
      <div className=" w-full md:w-1/2 gap-2 flex flex-col">
        <Label>Audio title</Label>
        <Input
          className="dark:bg-secondary-dark"
          value={audioTitle.length !== 0 ? audioTitle : audios[0]?.title}
          onChange={(e) => setAudioTitle(e.target.value)}
        />
      </div>
    </div>
  )
}

export default Podcast
