import Modal from "./Modal";


export interface DateObject {
  day: number;
  month: number;
  year: number;
  dayOfWeek: string;
}

const squareCLasses: any = {
  "done": "border-green-500",
  "holiday": "border-red-500",
  "notTouched": "border-slate-500",
  "halflyDone": "border-yellow-500",
};

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


  return (
    <>
      <div
        className={`border-[0.4rem] rounded-[20%] w-12 h-12 md:w-20 md:h-20 flex items-center justify-center ${className} ${checkDayInUser(date, user)}`}
        id={id}
        onClick={onClick}
      >
        <h3>{date.day}</h3>
      </div>
    </>
  );
}
