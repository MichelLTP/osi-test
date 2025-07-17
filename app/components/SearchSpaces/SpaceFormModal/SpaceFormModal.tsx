import React from "react"
import Modal from "@/components/Shared/Modal/Modal"
import { Label } from "@/components/ui/Label/Label"
import { Input } from "@/components/ui/Input/Input"
import Textarea from "@/components/ui/TextArea/TextArea"
import DocumentSelectionV2 from "@/components/Shared/DocumentSelection/DocumentSelectionV2"
import { Button } from "@/components/ui/Button/Button"
import { XIcon } from "lucide-react"
import { SpaceFormModalProps } from "@/components/SearchSpaces/SpaceFormModal/types"

export function SpaceFormModal({
  form,
  isSubmitting,
  isButtonDisabled,
  actionIcon,
  actionText,
  title,
  action,
}: SpaceFormModalProps) {
  return (
    <Modal
      title={title ?? actionText}
      icon={actionIcon}
      size={"default"}
      handleClose={form.closeModal}
    >
      <fieldset className="grid grid-cols-1 gap-y-4 gap-x-8 md:grid-cols-2 mb-8 dark:text-white">
        <section className="space-y-1 md:col-span-2">
          <Label htmlFor={"title"}>Title</Label>
          <Input
            required
            id="title"
            name="title"
            placeholder="Define a title for your space"
            className=" dark:bg-secondary-dark dark:text-white input-focus"
            value={form.title}
            onChange={(e) => form.setTitle(e.target.value)}
          />
        </section>
        <section className="space-y-1">
          <Label htmlFor={"tags"}>Space Instructions</Label>
          <Textarea
            required
            rows={2}
            id="writingStyle"
            name="writingStyle"
            placeholder="Write in a free flow manner without being too verbose"
            className=" dark:bg-secondary-dark dark:text-white border-none"
            value={form.writingStyle}
            onChange={(e) => form.setWritingStyle(e.target.value)}
          />
        </section>
        <section className="space-y-1">
          <Label htmlFor={"description"}>Description</Label>
          <Textarea
            required
            id="description"
            name="description"
            rows={2}
            placeholder="Describe what your space is about"
            className=" dark:bg-secondary-dark dark:text-white border-none"
            value={form.description}
            onChange={(e) => form.setDescription(e.target.value)}
          />
        </section>
      </fieldset>
      <header
        className={
          "flex items-center gap-2 border-b-2 mb-8 dark:border-third-dark pb-3"
        }
      >
        Document Selection
      </header>
      <input
        type="hidden"
        name="files"
        value={JSON.stringify(form.selectedDBFiles)}
        className={"hidden"}
      />
      <div className="sm:min-h-32 w-full ">
        <DocumentSelectionV2
          openSiDocs={form.filteredDBFiles}
          selectedOpenSiDocs={form.selectedDBFiles}
          fileTypes={"openSi"}
          onFileUpload={form.handleFileUpload}
          handleShowFilters={() => {}}
          onCancelUpload={form.handleCancelUpload}
          filters={form.updatedFilterData}
          hasCheckboxes={false}
          isDocUploadEnabled={false}
          filterSelectedDocs={false}
          isSelectedDocsScrollable
        />
      </div>
      <section className="md:col-span-2 flex flex-col xs:flex-row mt-10 justify-end gap-4">
        <Button
          variant={"borderGhost"}
          className={"!p-6 !font-normal"}
          onClick={form.closeModal}
          type="button"
        >
          <XIcon className="w-4 h-4 mr-2 mt-.5" />
          Cancel
        </Button>
        <Button
          variant="default"
          icon={actionIcon}
          className={"!p-6 !font-normal"}
          type="submit"
          name={"intent"}
          value={action}
          isLoading={isSubmitting}
          disabled={isButtonDisabled}
        >
          {actionText}
        </Button>
      </section>
    </Modal>
  )
}
