import { useState, ChangeEvent, useEffect } from 'react';
import * as jalaali from 'jalaali-js';
import { DocumentData, Firestore } from 'firebase/firestore';
import DayTile from './DayTile';
import Modal from './Modal';
import { DateObject } from './DayTile';
import AddOrEditDateTimes from './AddOrEditDateTimes';
import { CSVDownload } from 'react-csv';
import { useRecoilState, useRecoilValue } from 'recoil';
import { loadStateAtom, modalDayState } from '@/recoil/stateRecoils';
import { hourToText } from '@/Utils/common';

type weekDayType =
    | {
          Saturday: string;
          Sunday: string;
          Monday: string;
          Tuesday: string;
          Wednesday: string;
          Thursday: string;
          Friday: string;
      }
    | any;

export type DateProps = {
    start_time?: number;
    end_time?: number;
    personal_time?: number;
    project?: string;
};

const headers = [' ', 'ساعت ورود', 'ساعت خروج', 'تایم در اختیار', 'نام پروژه'];

const weekDaysToGridColumns: weekDayType = {
    Saturday: 'col-start-1',
    Sunday: 'col-start-2',
    Monday: 'col-start-3',
    Tuesday: 'col-start-4',
    Wednesday: 'col-start-5',
    Thursday: 'col-start-6',
    Friday: 'col-start-7',
};

export default function DateChecker({
    user,
    setUser,
    userName,
    addTime,
    db,
    fetch,
}: {
    user: DocumentData | null;
    setUser: React.Dispatch<React.SetStateAction<DocumentData | null>>;
    userName: string | undefined;
    addTime: (userName: string, userData: DocumentData | null) => Promise<void>;
    db: Firestore;
    fetch: any;
}) {
    const [vacDays, setVacDays] = useState<number>(2);
    const [baseWorkhours, setbaseWorkHours] = useState<number>(7.33);

    const currentDate = new Date();
    const jalaliDate = jalaali.toJalaali(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1, // Note: JavaScript months are 0-based, so we add 1
        currentDate.getDate()
    );

    const [year, setYear] = useState<number>(jalaliDate.jy);
    const [month, setMonth] = useState<number>(jalaliDate.jm);
    const [workDays, setWorkDays] = useState<number>(30);
    const [workedHours, setWorkedHours] = useState<number>(0);
    const [baseHours, setBaseHours] = useState<number>(0);
    const [vacHours, setVacHours] = useState<number>(0);
    const [hourDiff, setHourDiff] = useState<number>(0);
    const [isSelecting, setIsSelecting] = useState<boolean>(false);
    const [modalDate, setModalDate] = useState<DateProps>({});
    const [modalDay, setModalDay] = useRecoilState<DateObject>(modalDayState);
    const [dataForCSV, setDataForCSV] = useState<any>([]);
    const [isDownloadReady, setIsDownloadReady] = useState(0);
    const [workedDays, setWorkedDays] = useState(0);
    const [isVPN, setIsVPN] = useState(false);
    const isLoading = useRecoilValue(loadStateAtom);

    const daysInMonth = jalaali.jalaaliMonthLength(year, month);
    const days = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const gregorianDate = jalaali.toGregorian(year, month, day);
        const date = new Date(
            gregorianDate.gy,
            gregorianDate.gm - 1,
            gregorianDate.gd
        );
        const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
        return {
            day,
            month,
            year,
            dayOfWeek,
        };
    });

    const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        if (value >= 0 && value < 10000) {
            setYear(value);
        }
    };

    const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        if (value >= 1 && value <= 12) {
            setMonth(value);
        } else if (value > 12) {
            setMonth(12);
        } else if (value < 1) {
            setMonth(1);
        }
    };
    const handleMonthAdd = () => {
        setMonth((prev) => (prev >= 1 && prev <= 11 ? prev + 1 : prev));
    };
    const handleMonthMinus = () => {
        setMonth((prev) => (prev >= 2 && prev <= 12 ? prev - 1 : prev));
    };

    const handleOnClick = (date: any) => {
        const newData = user?.[date.year]?.[date.month]?.[date.day];
        const newSendData = {
            ...user,
            [date.year]: {
                ...user?.[date.year],
                [date.month]: {
                    ...user?.[date.year]?.[date.month],
                    [date.day]:
                        newData?.isHoliday && Object.keys(newData).length === 1
                            ? {}
                            : {
                                  ...user?.[date.year]?.[date.month]?.[
                                      date.day
                                  ],
                                  isHoliday: !newData?.isHoliday,
                              },
                },
            },
        };
        setUser(newSendData);
    };

    function convertTimeToHours(time: number) {
        const hours = Math.floor(time / 100);
        const minutes = time % 100;
        const timeInHours = hours + minutes / 60;

        return timeInHours;
    }

    function calculateTimeDifference(time1: number, time2: number) {
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

    function formatNumberToTime(number: any) {
        if (typeof number !== 'number') {
            return '';
        }
        const hours = Math.floor(number / 100);
        const minutes = number % 100;
        const formattedHours = String(hours).padStart(2, '0');
        const formattedMinutes = String(minutes).padStart(2, '0');

        return `${formattedHours}:${formattedMinutes}`;
    }

    function calculateCSV() {
        const monthData = user?.[year]?.[month];
        //@ts-ignore
        const monthValues: any = Object.values(monthData).filter(
            (item: any) =>
                item?.start_time && item?.end_time && item?.personal_time
        );
        //@ts-ignore
        const monthKeys = Object.keys(monthData).filter(
            (item) =>
                monthData[item]?.start_time &&
                monthData[item]?.end_time &&
                monthData[item]?.personal_time
        );
        const data: any = [];
        monthKeys.forEach((item, index) => {
            data.push([
                `${year}/${month}/${item}`,
                formatNumberToTime(monthValues[index]['start_time']),
                formatNumberToTime(monthValues[index]['end_time']),
                formatNumberToTime(monthValues[index]['personal_time']),
                ...(monthValues[index]['project']
                    ? [monthValues[index]['project']]
                    : []),
            ]);
        });
        setDataForCSV(data);
    }

    useEffect(() => {
        if (!user) {
            setTimeout(() => {
                setIsVPN(true);
            }, 4000);
        }
    }, [user]);

    useEffect(() => {
        setBaseHours((prev) => Number((workDays * baseWorkhours).toFixed(2)));
        setVacHours((prev) =>
            Number(((workDays - vacDays) * baseWorkhours).toFixed(2))
        );
    }, [workDays, workedHours]);

    useEffect(() => {
        setHourDiff((prev) => Number((vacHours - workedHours).toFixed(2)));
    }, [workedHours, vacHours]);

    useEffect(() => {
        const calculateParams = () => {
            const monthData = user?.[year]?.[month];
            let holidays = 0;
            let workedHours = 0;
            if (monthData) {
                //@ts-ignore
                holidays = Object.values(monthData).filter(
                    (item: any) => item?.isHoliday === true
                ).length;
                workedHours = Number(
                    //@ts-ignore
                    Object.values(monthData)
                        .filter(
                            (item: any) =>
                                item?.start_time &&
                                item?.end_time &&
                                item?.personal_time
                        )
                        .reduce((acc: any, cur: any) => {
                            const time = calculateTimeDifference(
                                cur.start_time,
                                cur.end_time
                            );
                            acc += time - convertTimeToHours(cur.personal_time);
                            return acc;
                        }, 0)
                        .toFixed(2)
                );
                console.log(
                    Object?.values(monthData)?.filter(
                        (item: any) =>
                            !item?.start_time ||
                            !item?.end_time ||
                            !item?.personal_time
                    )?.length ?? 0
                );
                setWorkedDays(
                    Object?.values(monthData)?.filter(
                        (item: any) =>
                            item?.start_time &&
                            item?.end_time &&
                            item?.personal_time
                    )?.length ?? 0
                );
            }
            setWorkDays((prev) => days.length - holidays);
            setWorkedHours((prev) => workedHours);
        };

        calculateParams();
    }, [user, year, month, days.length, vacDays, baseWorkhours]);

    const handleSelection = async () => {
        try {
            if (isSelecting) {
                if (userName) await addTime(userName, user);
                setIsSelecting((prev) => !prev);
            } else {
                setIsSelecting((prev) => !prev);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const firstDayOfWeek: any = days[0].dayOfWeek;

    return (
        <>
            {user ? (
                <>
                    <div className="flex flex-col items-center justify-center space-y-4 w-full">
                        <div className="flex space-x-4 w-full">
                            <label className="flex justify-end items-center mr-2 gap-x-4 w-full">
                                <span className="mb-2 font-bold hidden md:inline-block">
                                    Year:
                                </span>
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    value={year}
                                    onChange={handleYearChange}
                                    className="p-2 outline-none border-4 bg-slate-500 rounded-full text-center font-bold w-16 h-16 md:w-20 md:h-20"
                                />
                            </label>
                            <button
                                className={`${
                                    isSelecting
                                        ? `bg-green-500 hover:bg-green-700 motion-safe:animate-bounce`
                                        : `bg-red-500 hover:bg-red-700`
                                } w-20 h-20 transition-all text-white text-sm font-bold py-1 px-2 rounded-full aspect-square ${
                                    isLoading &&
                                    modalDay.year === 0 &&
                                    modalDay.month === 0 &&
                                    modalDay.dayOfWeek === '' &&
                                    'w-[88px] h-[88px] border-8 border-slate-500 border-t-slate-200 animate-spin'
                                }`}
                                onClick={handleSelection}
                            >
                                <div
                                    className={`${
                                        isLoading &&
                                        modalDay.year === 0 &&
                                        modalDay.month === 0 &&
                                        modalDay.dayOfWeek === '' &&
                                        'animate-spin-reverse'
                                    }`}
                                >
                                    {isSelecting
                                        ? 'Make Changes'
                                        : 'Select Holidays'}
                                </div>
                            </button>
                            <div className="flex justify-center gap-x-5 items-center !ml-6 md:!ml-8">
                                <div
                                    className="text-3xl pb-2 md:text-5xl cursor-pointer"
                                    onClick={handleMonthAdd}
                                >
                                    +
                                </div>
                                <div
                                    className="text-3xl pb-2 md:text-5xl cursor-pointer"
                                    onClick={handleMonthMinus}
                                >
                                    -
                                </div>
                            </div>
                            <div className="flex items-center gap-x-4 md:gap-x-10 justify-end w-full">
                                <label className="flex justify-start items-center ml-2 gap-x-4 w-full">
                                    <span className="mb-2 font-bold hidden md:inline-block">
                                        Month:
                                    </span>
                                    <input
                                        type="number"
                                        inputMode="numeric"
                                        value={month}
                                        onChange={handleMonthChange}
                                        className="p-2 outline-none bg-slate-500 border-4 rounded-full text-center font-bold w-12 h-12 md:w-20 md:h-20"
                                    />
                                </label>
                            </div>
                        </div>
                        <div className="grid grid-cols-7 gap-4 md:gap-8">
                            <p className="text-center ml-1 text-[0.6rem] md:ml-0 md:text-base">
                                Saturday
                            </p>
                            <p className="text-center ml-1 text-[0.6rem] md:ml-0 md:text-base">
                                Sunday
                            </p>
                            <p className="text-center ml-1 text-[0.6rem] md:ml-0 md:text-base">
                                Monday
                            </p>
                            <p className="text-center ml-1 text-[0.6rem] md:ml-0 md:text-base">
                                Tuesday
                            </p>
                            <p className="text-center ml-1 text-[0.6rem] md:ml-0 md:text-base">
                                Wednesday
                            </p>
                            <p className="text-center ml-1 text-[0.6rem] md:ml-0 md:text-base">
                                Thursday
                            </p>
                            <p className="text-center ml-1 text-[0.6rem] md:ml-0 md:text-base">
                                Friday
                            </p>
                            {days.map((date, index) => (
                                <DayTile
                                    id={`${year}-${month}-${index + 1}`}
                                    key={index}
                                    date={date}
                                    userName={userName}
                                    db={db}
                                    fetch={fetch}
                                    user={user}
                                    className={`justify-self-center ${
                                        index === 0
                                            ? weekDaysToGridColumns[
                                                  firstDayOfWeek
                                              ]
                                            : ''
                                    }`}
                                    isSelecting={isSelecting}
                                    onClick={() => {
                                        if (isSelecting) {
                                            handleOnClick(date);
                                        }
                                    }}
                                />
                            ))}
                        </div>
                        <div className="py-2 md:px-[7%] lg:px-[22%] xl:px-[32%] flex w-full h-full justify-between gap-x-8">
                            <div className="flex flex-col w-full justify-around items-center gap-y-2 md:gap-y-8">
                                <div className="flex flex-col items-center justify-center gap-y-1 divide-y-2 divide-dotted divide-slate-700">
                                    <p>Working Days</p>
                                    <p className="pt-1 w-full text-center">
                                        {workDays}
                                    </p>
                                </div>
                                <div className="flex flex-col items-center justify-center gap-y-1 divide-y-2 divide-dotted divide-slate-700">
                                    <p>Needed hours per Day</p>
                                    <p className="pt-1 w-full text-center">
                                        {(hourDiff / (workDays - workedDays)).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                            <div className="self-center hidden sm:inline-block">
                                <button
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl transition-all"
                                    onClick={() => {
                                        //@ts-ignore
                                        setDataForCSV((prev) => []);
                                        setIsDownloadReady((prev) => prev + 1);
                                        calculateCSV();
                                    }}
                                >
                                    Download CSV
                                </button>
                                {dataForCSV.length > 0 && (
                                    <CSVDownload
                                        key={isDownloadReady}
                                        data={dataForCSV}
                                        headers={headers}
                                    />
                                )}
                            </div>
                            <div className="flex flex-col w-full justify-around items-center gap-y-2 md:gap-y-8">
                                <div className="flex flex-col items-center justify-center gap-y-1 divide-y-2 divide-dotted divide-slate-700">
                                    <p>Vac Work Hours</p>
                                    <p className="pt-1 w-full text-center">
                                        {vacHours}
                                    </p>
                                </div>
                                <div className="flex flex-col items-center justify-center gap-y-1 divide-y-2 divide-dotted divide-slate-700">
                                    <p>
                                        {hourDiff > 0
                                            ? 'Needed Hours'
                                            : 'Overtime Hours'}
                                    </p>
                                    <p
                                        className={`pt-1 w-full text-center ${
                                            hourDiff > 0
                                                ? 'text-red-300'
                                                : 'text-green-300'
                                        }`}
                                    >
                                        {hourDiff > 0
                                            ? hourToText(hourDiff)
                                            : hourToText(-hourDiff)}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="self-center sm:hidden">
                            <button
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl transition-all"
                                onClick={() => {
                                    //@ts-ignore
                                    setDataForCSV((prev) => []);
                                    setIsDownloadReady((prev) => prev + 1);
                                    calculateCSV();
                                }}
                            >
                                Download CSV
                            </button>
                            {dataForCSV.length > 0 && (
                                <CSVDownload
                                    key={isDownloadReady}
                                    data={dataForCSV}
                                    headers={headers}
                                />
                            )}
                        </div>
                    </div>
                </>
            ) : (
                <div className="w-full h-full flex flex-col justify-center items-center gap-y-4 transition-all">
                    <div className="flex justify-center items-center gap-x-4">
                        <div className="animate-spin h-8 w-8 rounded-full border-4 border-slate-400 border-t-teal-300"></div>
                        <p className="flex justify-center items-center text-center text-4xl text-white font-extrabold">
                            Loading
                        </p>
                    </div>
                    <p
                        className={`transition-all ${
                            isVPN ? 'opacity-100 mt-0' : 'opacity-0 mt-8'
                        }`}
                    >
                        PSA: you need a vpn for the app to work
                    </p>
                </div>
            )}
        </>
    );
}
