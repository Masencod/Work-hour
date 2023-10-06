import {atom , selector} from "recoil";

export const loadStateAtom: any = atom({
  key: "loadStateAtom",
  default: false,
})

export const modalDayState: any = atom({
  key: "modalDayState",
  default: {day: 1, month: 1, year: 1402,dayOfWeek: ""},
})