import { ProfileImageProps } from "./type"

const ProfileImage = ({ twClasses, name }: ProfileImageProps) => {
  const nameParts = (name ?? "").split(" ")
  const firstNameInitial = nameParts[0] ? nameParts[0][0] : ""
  const lastNameInitial = nameParts[1] ? nameParts[1][0] : ""

  return (
    <div
      className={`${twClasses} bg-primary !w-[38px] !h-[38px] flex justify-center items-center rounded-sm text-base font-medium`}
    >
      {firstNameInitial}
      {lastNameInitial}
    </div>
  )
}

export default ProfileImage
