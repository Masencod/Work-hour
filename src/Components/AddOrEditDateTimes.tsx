import { useState, ChangeEvent, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { loadStateAtom, modalDayState } from '@/recoil/stateRecoils';
import { DocumentData } from 'firebase/firestore';
import { DateProps } from './DateChecker';
import { hourToText } from '@/Utils/common';
import localFont from 'next/font/local';
import TimeInput from './TimeInput';

type Date = {
    day: number;
    month: number;
    year: number;
    dayOfWeek:
        | 'Saturday'
        | 'Sunday'
        | 'Monday'
        | 'Tuesday'
        | 'Wednesday'
        | 'Thursday'
        | ''
        | string;
};

const me = localFont({
    src: [
        {
            path: '../fonts/Estedad-Thin.woff2',
            weight: '100',
        },
        {
            path: '../fonts/Estedad-ExtraLight.woff2',
            weight: '200',
        },
        {
            path: '../fonts/Estedad-Light.woff2',
            weight: '300',
        },
        {
            path: '../fonts/Estedad-Regular.woff2',
            weight: '400',
        },
        {
            path: '../fonts/Estedad-Medium.woff2',
            weight: '500',
        },
        {
            path: '../fonts/Estedad-SemiBold.woff2',
            weight: '600',
        },
        {
            path: '../fonts/Estedad-Bold.woff2',
            weight: '700',
        },
        {
            path: '../fonts/Estedad-ExtraBold.woff2',
            weight: '800',
        },
        {
            path: '../fonts/Estedad-Black.woff2',
            weight: '900',
        },
    ],
    variable: '--font-mers',
});

const persianMonths = [
    'فروردین',
    'اردیبهشت',
    'خرداد',
    'تیر',
    'مرداد',
    'شهریور',
    'مهر',
    'آبان',
    'آذر',
    'دی',
    'بهمن',
    'اسفند',
];
const daysMap = {
    Saturday: 'شنبه',
    Sunday: 'یکشنبه',
    Monday: 'دوشنبه',
    Tuesday: 'سه‌شنبه',
    Wednesday: 'چهارشنبه',
    Thursday: 'پنجشنبه',
    Friday: 'جمعه',
};
export default function AddOrEditDateTimes({
    userName,
    user,
    date,
    setIsOpen,
    addTime,
}: {
    userName: string | undefined;
    user: DocumentData | null;
    date: Date;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    addTime: (userName: string, userData: DocumentData | null) => Promise<void>;
}) {
    const [startTime, setStartTime] = useState<number | undefined>();
    const [endtTime, setEndtTime] = useState<number | undefined>();
    const [personalTime, setPersonalTime] = useState<number | undefined>();
    const [selectedDate, setSelectedDate] = useState<Date>(date);
    const [project, setProject] = useState<string | undefined>('');
    const [modalDay, setModalDay] = useRecoilState(modalDayState);
    const [dateData, setDateData] = useState(
        user?.[date?.year]?.[date?.month]?.[date?.day]
    );

    const resetStats = () => {
        setStartTime(undefined);
        setEndtTime(undefined);
        setPersonalTime(undefined);
        setProject(undefined);
    };

    const handleNextDay = () => {
        const nextDay = new Date(
            selectedDate.year,
            selectedDate.month - 1,
            selectedDate.day + 1
        );
        const dateOBJ: Date = {
            day: nextDay.getDate(),
            month: nextDay.getMonth() + 1,
            year: nextDay.getFullYear(),
            dayOfWeek: nextDay.toLocaleDateString('en-US', {
                weekday: 'long',
            }),
        };
        console.log(dateOBJ);
        setSelectedDate(dateOBJ);
        setDateData(user?.[dateOBJ?.year]?.[dateOBJ?.month]?.[dateOBJ?.day]);
        resetStats();
    };

    const handlePrevDay = () => {
        const prevDay = new Date(
            selectedDate.year,
            selectedDate.month - 1,
            selectedDate.day - 1
        );
        const dateOBJ: Date = {
            day: prevDay.getDate(),
            month: prevDay.getMonth() + 1,
            year: prevDay.getFullYear(),
            dayOfWeek: prevDay.toLocaleDateString('en-US', {
                weekday: 'long',
            }),
        };
        console.log(dateOBJ);
        setSelectedDate(dateOBJ);
        setDateData(user?.[dateOBJ?.year]?.[dateOBJ?.month]?.[dateOBJ?.day]);
        resetStats();
    };

    const handleAdd = () => {
        setModalDay((prev: any) => ({
            ...prev,
            year: date.year,
            month: date.month,
            day: date.day,
        }));
        const dayData =
            user?.[selectedDate.year]?.[selectedDate.month]?.[selectedDate.day];
        const newSendData = {
            ...user,
            [selectedDate.year]: {
                ...user?.[selectedDate.year],
                [selectedDate.month]: {
                    ...user?.[selectedDate.year]?.[selectedDate.month],
                    [selectedDate.day]: {
                        ...(dayData &&
                            Object.keys(
                                user?.[selectedDate.year]?.[
                                    selectedDate.month
                                ]?.[selectedDate.day]
                            ).length > 0 && { ...dayData }),
                        ...(startTime !== undefined && {
                            start_time: startTime,
                        }),
                        ...(endtTime !== undefined && { end_time: endtTime }),
                        ...(personalTime !== undefined && {
                            personal_time: personalTime,
                        }),
                        ...(project && { project: project }),
                    },
                },
            },
        };
        if (userName) addTime(userName, newSendData);
        setIsOpen(false);
    };

    useEffect(() => {
        console.log('selectedDateeeeeeeee', selectedDate);
    }, [selectedDate]);

    useEffect(() => {
        setSelectedDate(date);
    }, [date]);

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

    useEffect(() => {
        setStartTime(
            dateData
                ? dateData?.start_time
                    ? dateData.start_time
                    : undefined
                : undefined
        );
        setEndtTime(
            dateData
                ? dateData?.end_time
                    ? dateData.end_time
                    : undefined
                : undefined
        );
        setPersonalTime(
            dateData
                ? dateData?.personal_time
                    ? dateData.personal_time
                    : undefined
                : undefined
        );
        setProject(dateData ? (dateData?.project ? dateData.project : '') : '');
    }, [dateData, selectedDate]);

    return (
        <div className="flex flex-col gap-y-5 bg-slate-400 h-full w-full p-4 justify-center items-center">
            <div className="flex flex-row-reverse items-center gap-x-2">
                <div className="flex flex-row-reverse gap-x-2">
                    <p className="text-xl">{selectedDate.day}</p>
                    <p className={`text-xl font-me ${me.className}`}>
                        {persianMonths[selectedDate.month - 1]}
                    </p>
                    <span className="mt-[2px] text-white">|</span>
                    <p className={`text-xl ${me.className}`}>
                        {/*@ts-ignore*/}
                        {daysMap[selectedDate.dayOfWeek]}
                    </p>
                </div>
                {startTime && endtTime && (
                    <p className="text-yellow-200 flex flex-row-reverse gap-x-2">
                        <span className="mt-[2px] text-white">|</span>
                        {personalTime
                            ? hourToText(
                                  Number(
                                      (
                                          calculateTimeDifference(
                                              startTime,
                                              endtTime
                                          ) - convertTimeToHours(personalTime)
                                      ).toFixed(2)
                                  ),
                                  false
                              )
                            : hourToText(
                                  Number(
                                      calculateTimeDifference(
                                          startTime,
                                          endtTime
                                      ).toFixed(2)
                                  ),
                                  false
                              )}
                    </p>
                )}
            </div>
            <ul className="flex flex-col gap-y-3 md:gap-y-4">
                <li>
                    <p>Start Time</p>
                    <TimeInput
                        value={startTime}
                        onChange={(e) => setStartTime(e)}
                    />
                </li>
                <li>
                    <p>End Time</p>
                    <TimeInput
                        value={endtTime}
                        onChange={(e) => setEndtTime(e)}
                    />
                </li>
                <li>
                    <p>Personal Time</p>
                    <TimeInput
                        value={personalTime}
                        onChange={(e) => setPersonalTime(e)}
                    />
                </li>
                <li>
                    <p>Project Names</p>
                    <div>
                        <input
                            className={`p-2 w-full ${me.className} rounded-lg text-black`}
                            value={project}
                            onChange={(e) => setProject(e.target.value)}
                            type="text"
                        />
                    </div>
                </li>
            </ul>
            <div className='flex gap-x-4 items-center justify-between'>
                <button
                    className="bg-blue-500 hover:bg-blue-600 transition-all mt-4 w-fit p-2 md:p-5 rounded-md"
                    onClick={() => handlePrevDay()}
                >
                    prev Day
                </button>
                <button
                    className="bg-slate-600 hover:bg-slate-700 transition-all mt-4 w-fit p-2 md:p-5 rounded-md"
                    onClick={handleAdd}
                >
                    ADD CHANGES
                </button>
                <button
                    className="bg-blue-500 hover:bg-blue-600 transition-all mt-4 w-fit p-2 md:p-5 rounded-md"
                    onClick={() => handleNextDay()}
                >
                    nextDay
                </button>
            </div>
        </div>
    );
}
