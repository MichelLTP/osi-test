import { InfoSectionProps } from "./types"

const InfoSection: React.FC<InfoSectionProps> = ({
  sections = [],
}: InfoSectionProps) => {
  return (
    <div className="flex flex-col gap-y-6">
      {sections.map((section, index) => (
        <div key={index}>
          <h3 className="text-xl font-bold">{section.title}</h3>
          <p>{section.content}</p>
        </div>
      ))}
    </div>
  )
}

export default InfoSection
