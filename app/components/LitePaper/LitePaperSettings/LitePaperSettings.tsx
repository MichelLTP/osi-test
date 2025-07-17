import { ReactNode } from "react"
import { Input } from "@/components/ui/Input/Input"
import UploadFile from "@/components/Shared/UploadFile/UploadFile"
import FileUploadProgress from "@/components/Shared/FileUploadProgress/FileUploadProgress"
import { FileUploadState } from "@/components/Shared/UploadFile/types"
import TextArea from "@/components/ui/TextArea/TextArea"
import { NewPaperProps } from "@/components/LitePaper/LitePaperSettings/types"
import { faPaperPlane } from "@fortawesome/free-regular-svg-icons"
import { Button } from "@/components/ui/Button/Button"
import { useNavigate } from "@remix-run/react"
import { useLitePaper } from "@/store/litepaper"

const LitePaperSettings = ({
  uploadState,
  privateFiles,
  onPrivateFileUpload,
  onCancelPrivateFile,
  handleSubmit,
}: NewPaperProps): ReactNode => {
  const {
    paperName,
    setPaperName,
    description,
    setDescription,
    subtitle,
    setSubtitle,
    authors,
    setAuthors,
    writingStyle,
    setWritingStyle,
  } = useLitePaper()

  const navigate = useNavigate()

  const handleCancelClick = (): void => {
    navigate(-1)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-[20px] gap-x-8 text-secondary dark:text-white">
      <section className="md:col-span-2 space-y-1">
        <header className="">Title</header>
        <Input
          className="dark:bg-secondary-dark outline-none text-base"
          type="text"
          name="storyName"
          id="storyName"
          placeholder="Your paper name here..."
          value={paperName ? paperName : ""}
          onChange={(e) => setPaperName(e.target.value)}
        />
      </section>

      <section className="md:col-span-2 space-y-1">
        <header className="">Subtitle</header>
        <Input
          className="dark:bg-secondary-dark outline-none text-base"
          type="text"
          name="storyName"
          id="storyName"
          placeholder="Your subtitle..."
          value={subtitle ? subtitle : ""}
          onChange={(e) => setSubtitle(e.target.value)}
        />
      </section>

      <section className="space-y-1 dark:text-white">
        <p>Description or Purpose (Optional)</p>
        <TextArea
          id="description"
          name="description"
          rows="2"
          placeholder="Outline the main purpose succinctly "
          className=" dark:bg-secondary-dark dark:text-white border-none"
          value={description ? description : ""}
          onChange={(e) => setDescription(e.target.value as string)}
        />
      </section>

      <section className="space-y-1">
        <p>Authors</p>
        <TextArea
          id="description"
          name="description"
          rows="2"
          placeholder="Written by..."
          value={authors ? authors : ""}
          className="dark:bg-secondary-dark dark:text-white border-none"
          onChange={(e) => setAuthors(e.target.value as string)}
        />
      </section>

      <section className="space-y-1">
        <p>Custom Documents</p>
        <UploadFile
          onUpload={onPrivateFileUpload}
          state={uploadState}
          acceptedFileTypes="documents"
        />
        <FileUploadProgress
          acceptedFiles={privateFiles}
          onCancelUpload={onCancelPrivateFile}
          loading={uploadState === FileUploadState.UPLOADING}
        />
        <span className="text-xsbold text-black dark:text-white ">
          Documents will be saved on your private library
        </span>
      </section>

      <section className="space-y-1">
        <p>Writing style (Optional)</p>
        <TextArea
          id="description"
          name="description"
          rows="3"
          placeholder="Extract information in a concise and comprehensive manner"
          value={writingStyle ? writingStyle : ""}
          className="dark:bg-secondary-dark dark:text-white border-none"
          onChange={(e) => setWritingStyle(e.target.value as string)}
        />
      </section>

      <section className="md:col-span-2 flex flex-col xs:flex-row md:justify-end gap-4">
        <Button
          variant="delete"
          className="grow md:grow-0 md:w-[210px]"
          onClick={handleCancelClick}
        >
          Cancel
        </Button>
        <Button
          variant="default"
          icon={faPaperPlane}
          className="grow md:grow-0 md:w-[210px]"
          onClick={handleSubmit}
          disabled={
            paperName === "" ||
            subtitle === "" ||
            authors === "" ||
            uploadState === FileUploadState.UPLOADING
          }
        >
          Submit
        </Button>
      </section>
    </div>
  )
}
export default LitePaperSettings
