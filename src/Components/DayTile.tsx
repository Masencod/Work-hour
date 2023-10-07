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
    "done": `${isLoading && modalDay.day === date.day ? "greeneLoad" : "greene"}`,
    "holiday": `${isLoading && modalDay.day === date.day ? "redeLoad" : "rede"}`,
    "notTouched": `${isLoading && modalDay.day === date.day ? "slateeLoad" : "slatee"}`,
    "halflyDone": `${isLoading && modalDay.day === date.day ? "yelloweLoad" : "yellowe"}`,
  };


  return (
    <>
      <div
        className={`daytile border-[0.4rem] rounded-[20%] hover:rounded-[30%] w-12 h-12 md:w-20 md:h-20 flex items-center justify-center cursor-pointer transition-all ${isLoading && modalDay.day === date.day ? 'fullroundi animate-spin' : ''} ${className} ${checkDayInUser(date, user)}`}
        id={id}
        onClick={onClick}
      >
        <h3 className={`text-md md:text-xl font-bold ${isLoading && modalDay.day === date.day ? 'animate-spin-reverse' : ''}`}>{date.day}</h3>
      </div>
    </>
  );
}
