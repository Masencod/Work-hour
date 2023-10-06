import { useState, ChangeEvent, useEffect } from "react";
import { DocumentData } from "firebase/firestore";
import { DateProps } from "./DateChecker";
import TimeInput from "./TimeInput";

const persianMonths = [ "فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور","مهر","آبان","آذر","دی","بهمن","اسفند"]

export default function AddOrEditDateTimes ({
  userName ,
  user ,
  date ,
  isOpen , 
  data ,
  setIsOpen ,
  addTime,
}: {
  userName: string | undefined
  user: DocumentData | null;
  date: any
  isOpen: boolean;
  data: DateProps
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  addTime: (userName: string, userData: DocumentData | null) => Promise<void>;
}) {

  const [startTime, setStartTime ] = useState<number | undefined>()
  const [endtTime, setEndtTime ] = useState<number | undefined>()
  const [personalTime, setPersonalTime ] = useState<number | undefined>()
  const [project, setProject ] = useState<string | undefined>("")
  
  const handleAdd = () => {
    const dayData = user?.[date.year]?.[date.month]?.[date.day] 
    const newSendData = {
      ...user,
      [date.year]: {
        ...user?.[date.year],
        [date.month]: {
          ...user?.[date.year]?.[date.month],
          [date.day]: {
            ...(dayData && Object.keys(user?.[date.year]?.[date.month]?.[date.day]).length > 0 && {...dayData}),
            ...(startTime !== undefined && {start_time: startTime}),
            ...(endtTime !== undefined && {end_time: endtTime}),
            ...(personalTime !== undefined && {personal_time: personalTime}),
            ...(project && {project: project}),
          }
        }
      }
    }
    if(userName) addTime(userName, newSendData);
    setIsOpen(false)
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
      console.log(data)
      console.log(date)
      setStartTime(data ? data?.start_time ? data.start_time : undefined : undefined)
      setEndtTime(data ? data?.end_time ? data.end_time : undefined : undefined)
      setPersonalTime(data ? data?.personal_time ? data.personal_time : undefined : undefined)
      setProject(data ? data?.project ? data.project : "" : "")
    
  },[data,date])

  return (
    <div className="flex flex-col gap-y-5 bg-slate-400 h-full w-full p-4 justify-center items-center">
      <div className="flex flex-row-reverse items-center gap-x-2">
        <div className="flex flex-row-reverse gap-x-2">
          <p className="text-xl">
            {date.day}
          </p>
          <p className="text-xl">
            {persianMonths[date.month - 1]}
          </p>
        </div>
        {startTime && endtTime && <p className="text-teal-200 flex flex-row-reverse gap-x-2">
          <span className="mt-[2px] text-white">
            |
          </span>
          {personalTime
            ? (calculateTimeDifference(startTime, endtTime) - convertTimeToHours(personalTime)).toFixed(2) + "  Hours"
            : calculateTimeDifference(startTime, endtTime).toFixed(2) + "  Hours"
          }
        </p>}
      </div>
      <ul className="flex flex-col gap-y-3 md:gap-y-4">
        <li>
          <p>Start Time</p>
          <TimeInput value={startTime} onChange={(e) => setStartTime(e)} />
        </li>
        <li>
          <p>End Time</p>
          <TimeInput value={endtTime} onChange={(e) => setEndtTime(e)} />
        </li>
        <li>
          <p>Personal Time</p>
          <TimeInput value={personalTime} onChange={(e) => setPersonalTime(e)} />
        </li>
        <li>
          <p>Project Names</p>
          <input className="p-2 rounded-lg text-black" value={project} onChange={(e) => setProject(e.target.value)} type="text"/>
        </li>
      </ul>
      <button className="bg-slate-700 mt-4 w-fit p-2 md:p-5 rounded-md" onClick={handleAdd}>
        ADD CHANGES
      </button>
    </div>
  )
}