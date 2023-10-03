import { useState, ChangeEvent, useEffect } from "react";
import { DocumentData } from "firebase/firestore";
import { DateProps } from "./DateChecker";
import TimeInput from "./TimeInput";


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

  useEffect(() => {
    setStartTime(undefined)
    setEndtTime(undefined)
    setPersonalTime(undefined)
    setProject(data?.project ?? "")
  },[isOpen])
  
  useEffect(() => {
    if (data) {
      setStartTime(data?.start_time ?? undefined)
      setEndtTime(data?.end_time ?? undefined)
      setPersonalTime(data?.personal_time ?? undefined)
      setProject(data?.project ?? "")
    }
  },[data])

  return (
    <div className="flex flex-col gap-y-5 bg-slate-400 h-full w-full p-4 justify-center items-center">
      <ul className="flex flex-col gap-y-3 md:gap-y-4">
        <li>
          <p>Start Time</p>
          <TimeInput value={startTime} onChange={(e) => setStartTime(e)} />
          {/* <input className="p-2 rounded-lg text-black" value={startTime} onChange={(e) => setStartTime(Number(e.target.value) || 0)} type="text" inputMode="numeric"/> */}
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