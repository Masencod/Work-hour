import Modal from "./Modal";
import { useRecoilState} from "recoil";
import { loadStateAtom ,modalDayState } from "@/recoil/stateRecoils";
import { useEffect, useState } from "react";

export interface DateObject {
  day: number;
  month: number;
  year: number;
  dayOfWeek: string;
}

type DateTileProps<T extends DateObject> = {
  date: T;
  className?: string;
  dayState?: any;
  user?: any;
  id?: string;
  onClick?: (e: any) => void;
};


export default function DayTile<T extends DateObject>({
  date,
  className,
  dayState,
  user,
  id,
  onClick
}: DateTileProps<T>) {

  const [isLoading , setIsLoading] = useRecoilState(loadStateAtom)
  const [modalDay, setModalDay] = useRecoilState<DateObject>(modalDayState)
  
  const checkDayInUser = (date: any , user: any) => {
    if (user?.[date.year]?.[date.month]?.[date.day]) {
      if (user?.[date.year]?.[date.month]?.[date.day]?.isHoliday) {
        return squareCLasses["holiday"]
      } else if (
        Object.keys(user?.[date.year]?.[date.month]?.[date.day]).filter(item => item !== "isHoliday").length === 4 &&
        user?.[date.year]?.[date.month]?.[date.day]?.start_time !== 0 &&
        user?.[date.year]?.[date.month]?.[date.day]?.end_time !== 0
      ) { 
        return squareCLasses["done"]
      } else if (Object.keys(user?.[date.year]?.[date.month]?.[date.day]).length === 0) {
        return squareCLasses["notTouched"]
      } else if (Object.keys(user?.[date.year]?.[date.month]?.[date.day]).length !== 5) {
        return squareCLasses["halflyDone"]
      }
    } else {
      return squareCLasses["notTouched"]
    }
  }

  useEffect(() => {
    if (modalDay == date) {
      console.log(isLoading && modalDay === date)
    }
  },[modalDay,date])

  
  const squareCLasses: any = {
    "done": `${isLoading && modalDay.day === date.day ? "border-green-500 border-t-green-300" : "border-green-500"}`,
    "holiday": `${isLoading && modalDay.day === date.day ? "border-red-500 border-t-red-300" : "border-red-500"}`,
    "notTouched": `${isLoading && modalDay.day === date.day ? "border-slate-500 border-t-slate-300" : "border-slate-500"}`,
    "halflyDone": `${isLoading && modalDay.day === date.day ? "border-yellow-500 border-t-yellow-300" : "border-yellow-500"}`,
  };


  return (
    <>
      <div
        className={`border-[0.4rem] rounded-[20%] w-12 h-12 md:w-20 md:h-20 flex items-center justify-center cursor-pointer transition-all ${isLoading && modalDay.day === date.day ? 'rounded-full animate-spin' : ''} ${className} ${checkDayInUser(date, user)}`}
        id={id}
        onClick={onClick}
      >
        <h3>{date.day}</h3>
      </div>
    </>
  );
}
