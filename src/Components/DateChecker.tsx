import { useState, ChangeEvent, useEffect } from "react";
import * as jalaali from "jalaali-js";
import { DocumentData } from "firebase/firestore";
import DayTile from "./DayTile";


type weekDayType = {
  Saturday: string,
  Sunday: string,
  Monday: string,
  Tuesday: string,
  Wednesday: string,
  Thursday: string,
  Friday: string,
} | any

export default function DateChecker({
  user,
  userName,
  addTime,
}: {
  user: DocumentData | null;
  userName: string | undefined;
  addTime: (userName: string, userData: {}) => Promise<void>;
}) {

  const [year, setYear] = useState<number>(1402);
  const [month, setMonth] = useState<number>(1);
  const [isSelecting, setIsSelecting] = useState<boolean>(false);

  const daysInMonth = jalaali.jalaaliMonthLength(year, month);
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const gregorianDate = jalaali.toGregorian(year, month, day);
    const date = new Date(
      gregorianDate.gy,
      gregorianDate.gm - 1,
      gregorianDate.gd
    );
    const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" });
    return {
      day,
      month,
      year,
      dayOfWeek,
    };
  });

  useEffect(() => {
    console.log(user)
  },[user])

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value >= 0) {
      setYear(value);
    }
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value >= 1 && value <= 12) {
      setMonth(value);
    }
  };

  useEffect(() => {
    console.log(user)
  },[])

  const handleOnClick = (date: any) => {
    const newData = user?.[date.year]?.[date.month]?.[date.day]
    const newSendData = {
      ...user,
      [date.year]: {
        ...user?.[date.year],
        [date.month]: {
          ...user?.[date.year]?.[date.month],
          [date.day]: newData?.isHoliday && Object.keys(newData).length === 1 ? {} : {
            ...user?.[date.year]?.[date.month]?.[date.day],
            isHoliday: true,
          }
        }
      }
    }
    // if (userName) {
    //   if (newData?.isHoliday) {
    //     addTime(userName, {...newData, isHoliday: !newData.isHoliday});
    //   } else {
    //     addTime(userName, {...newData, isHoliday: true});
    //   }
    // }
    if (userName) addTime(userName, newSendData);
  }

  const firstDayOfWeek: any = days[0].dayOfWeek;
  const weekDaysToGridColumns: weekDayType  = {
    Saturday: "col-start-1",
    Sunday: "col-start-2",
    Monday: "col-start-3",
    Tuesday: "col-start-4",
    Wednesday: "col-start-5",
    Thursday: "col-start-6",
    Friday: "col-start-7",
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 w-full">
      <div className="flex space-x-4 w-full">
        <label className="flex flex-col items-center w-full">
          <span className="mb-2">Year:</span>
          <input
            type="number"
            inputMode="numeric"
            value={year}
            onChange={handleYearChange}
            className="p-2 bg-slate-500 border rounded-md w-1/2"
          />
        </label>
        <button
          className={`${isSelecting ? `bg-green-500 hover:bg-green-700` : `bg-red-500 hover:bg-red-700` } text-white font-bold py-2 px-4 rounded-full`}
          onClick={() => setIsSelecting(!isSelecting)}
        >
          Select Holidays
        </button>
        <label className="flex flex-col items-center w-full">
          <span className="mb-2">Month:</span>
          <input
            type="number"
            inputMode="numeric"
            value={month}
            onChange={handleMonthChange}
            className="p-2 bg-slate-500 border rounded-md w-1/2"
          />
        </label>
      </div>
      <div className="grid grid-cols-7 gap-4 md:gap-8">
        <p className="text-center text-sm">Saturday</p>
        <p className="text-center text-sm">Sunday</p>
        <p className="text-center text-sm">Monday</p>
        <p className="text-center text-sm">Tuesday</p>
        <p className="text-center text-sm">Wednesday</p>
        <p className="text-center text-sm">Thursday</p>
        <p className="text-center text-sm">Friday</p>
        {days.map((date, index) => (
          <DayTile
            id={`${year}-${month}-${index + 1}`}
            key={index}
            date={date}
            className={index === 0 ? weekDaysToGridColumns[firstDayOfWeek] : ""}
            user={user}
            onClick={() => {
              if (isSelecting) {
                handleOnClick(date)
              }
            }
            }
          />
        ))}
      </div>
    </div>
  );
}
