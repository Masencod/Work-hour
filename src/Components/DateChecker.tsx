import { useState, ChangeEvent, useEffect } from "react";
import * as jalaali from "jalaali-js";
import { DocumentData } from "firebase/firestore";
import DayTile from "./DayTile";
import Modal from "./Modal";
import { DateObject } from "./DayTile";
import AddOrEditDateTimes from "./AddOrEditDateTimes";


type weekDayType = {
  Saturday: string,
  Sunday: string,
  Monday: string,
  Tuesday: string,
  Wednesday: string,
  Thursday: string,
  Friday: string,
} | any

export type DateProps = {
  start_time?: number,
  end_time?: number,
  personal_time?: number,
  project?: string,
}

export default function DateChecker({
  user,
  setUser,
  userName,
  addTime,
}: {
  user: DocumentData | null;
  setUser: React.Dispatch<React.SetStateAction<DocumentData | null>>;
  userName: string | undefined;
  addTime: (userName: string, userData: DocumentData | null) => Promise<void>;
}) {

  const [vacDays, setVacDays] = useState<number>(2);
  const [baseWorkhours, setbaseWorkHours] = useState<number>(7.33);

  const [year, setYear] = useState<number>(1402);
  const [month, setMonth] = useState<number>(1);
  const [workDays, setWorkDays] = useState<number>(30);
  const [workedHours, setWorkedHours] = useState<number>(0);
  const [baseHours, setBaseHours] = useState<number>(0);
  const [vacHours, setVacHours] = useState<number>(0);
  const [hourDiff, setHourDiff] = useState<number>(0);
  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalDate, setModalDate] = useState<DateProps>({})
  const [modalDay, setModalDay] = useState<DateObject>({day: 1, month: 1, year: 1402,dayOfWeek: ""})

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
  const handleMonthAdd = () => {
      setMonth((prev => prev >= 1 && prev <= 11 ? prev + 1 : prev));
  };
  const handleMonthMinus = () => {
    setMonth((prev => prev >= 2 && prev <= 12 ? prev - 1 : prev));
  };

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
            isHoliday: !newData?.isHoliday,
          }
        }
      }
    }
    setUser(newSendData);
  }

  function convertTimeToHours(time:number) {
    const hours = Math.floor(time / 100);
    const minutes = time % 100;
    const timeInHours = hours + minutes / 60;
  
    return timeInHours;
  }

  function calculateTimeDifference(time1:number, time2:number) {
    const hours1 = Math.floor(time1 / 100);
    const minutes1 = time1 % 100;
    const hours2 = Math.floor(time2 / 100);
    const minutes2 = time2 % 100;
    const totalMinutes1 = hours1 * 60 + minutes1;
    const totalMinutes2 = hours2 * 60 + minutes2;
    const timeDiffInMinutes = totalMinutes2 - totalMinutes1;
    const timeDiffInHours = timeDiffInMinutes / 60;
  
    return timeDiffInHours;
  }

  useEffect(() => {
    setBaseHours((prev) => Number((workDays * baseWorkhours).toFixed(2)));
    setVacHours((prev) => Number(((workDays - vacDays) * baseWorkhours).toFixed(2)));
  },[workDays , workedHours])

  useEffect(() => {
    setHourDiff(prev => Number((vacHours - workedHours).toFixed(2)))
  },[workedHours,vacHours])

  useEffect(() => {
    const calculateParams = () => {
      const monthData = user?.[year]?.[month];
      let holidays = 0;
      let workedHours = 0;
      if (monthData) {
        //@ts-ignore
        holidays = Object.values(monthData).filter((item) => item?.isHoliday === true).length;
        workedHours = Number(
          //@ts-ignore
          Object.values(monthData).filter((item) => item?.start_time && item?.end_time).reduce((acc:any, cur:any) => {
            const time = calculateTimeDifference(cur.start_time, cur.end_time);
            acc += time - convertTimeToHours(cur.personal_time);
            return acc;
          }, 0).toFixed(2)
        );
      }
      setWorkDays((prev) => days.length - holidays);
      setWorkedHours((prev) => workedHours)
    };
    
    calculateParams();
  }, [user, year, month, days.length, vacDays, baseWorkhours]);
  
  

  const handleSelection = () => {
    if (isSelecting) {
      if (userName) addTime(userName, user);
      setIsSelecting(prev => !prev)
    } else {
      setIsSelecting(prev =>!prev)
    }
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
    <>
      {user ? (<>
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
              className={`${isSelecting ? `bg-green-500 hover:bg-green-700` : `bg-red-500 hover:bg-red-700` } text-white text-sm font-bold py-1 px-2 rounded-full aspect-square`}
              onClick={handleSelection}
            >
              {isSelecting ? "Make Changes" : "Select Holidays"}
            </button>
            <div className="flex justify-center gap-x-5 items-center !ml-8">
                <div className="text-2xl md:text-5xl cursor-pointer" onClick={handleMonthAdd}>
                  +
                </div>
                <div className="text-2xl md:text-5xl cursor-pointer" onClick={handleMonthMinus}>
                  -
                </div>
              </div>
            <div className="flex items-center gap-x-4 md:gap-x-10 justify-end w-full">
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
          </div>
          <div className="grid grid-cols-7 gap-4 md:gap-8">
            <p className="text-center text-xs">Saturday</p>
            <p className="text-center text-xs">Sunday</p>
            <p className="text-center text-xs">Monday</p>
            <p className="text-center text-xs">Tuesday</p>
            <p className="text-center text-xs">Wednesday</p>
            <p className="text-center text-xs">Thursday</p>
            <p className="text-center text-xs">Friday</p>
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
                  } else {
                    setModalDate(user?.[date?.year]?.[date?.month]?.[date?.day])
                    setModalDay(date)
                    setIsModalOpen(true)
                  }
                }
                }
              />
            ))}
          </div>
          <div className="py-2 md:px-[7%] lg:px-[35%] flex w-full h-full justify-between gap-x-8">
            <div className="flex flex-col w-full justify-around items-center gap-y-8">
              <div className="flex flex-col items-center justify-center">
                <p>
                  Working Days
                </p>
                <p>
                  {workDays}
                </p>
              </div>
              <div className="flex flex-col items-center justify-center">
                <p>
                  Month Work Hours
                </p>
                <p>
                  {baseHours}
                </p>
              </div>
            </div>
            <div className="flex flex-col w-full justify-around items-center gap-y-8">
              <div className="flex flex-col items-center justify-center">
                <p>
                  Vac Work Hours
                </p>
                <p>
                  {vacHours}
                </p>
              </div>
              <div className="flex flex-col items-center justify-center">
                <p>
                  Needed Hours
                </p>
                <p>
                  {hourDiff}
                </p>
              </div>
            </div>
          </div>
        </div>
        <Modal
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
        >
          <AddOrEditDateTimes
            userName={userName}
            user={user}
            date={modalDay}
            data={modalDate}
            addTime={addTime}
            isOpen={isModalOpen}
            setIsOpen={setIsModalOpen}
          />
        </Modal>
      </>) : 
        (<>
          <p className="h-full w-full flex justify-center items-center text-center text-4xl text-white font-extrabold">
            Loading  
          </p>
        </>)}
    </>
    
  );
}
