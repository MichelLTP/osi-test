import { create } from "zustand"

type UserName = {
  firstName: string
  lastName: string
}

interface AuthStore {
  userName: UserName
  setUserName: (name: UserName) => void
}

export const useAuthUserName = create<AuthStore>((set) => ({
  userName: {
    firstName: "",
    lastName: "",
  },
  setUserName: (name: UserName) => set({ userName: name }),
}))
