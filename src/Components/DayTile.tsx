import Modal from './Modal';
import { useRecoilState } from 'recoil';
import { loadStateAtom, modalDayStateAtom } from '@/recoil/stateRecoils';
import { useEffect, useState } from 'react';
import {
    DocumentData,
    Firestore,
    doc,
    getDoc,
    setDoc,
} from 'firebase/firestore';
import AddOrEditDateTimes from './AddOrEditDateTimes';
import { DateProps } from './DateChecker';

export interface DateObject {
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
}

type DateTileProps<T extends DateObject> = {
    date: T;
    isSelecting: boolean;
    className?: string;
    dayState?: any;
    db: Firestore;
    user: DocumentData | null;
    userName: string | undefined;
    id?: string;
    fetch: any;
    onClick?: (e?: any) => void;
};

export default function DayTile<T extends DateObject>({
    date,
    className,
    isSelecting,
    dayState,
    db,
    fetch,
    userName,
    user,
    id,
    onClick,
}: DateTileProps<T>) {
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalDay, setModalDay] = useState<DateObject>(modalDayStateAtom);

    async function addWorkHourEntry(
        userName: string,
        userData: DocumentData | null
    ): Promise<void> {
        setIsLoading(true);
        try {
            await setDoc(doc(db, 'users', userName), userData);
            fetch(userName);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    const checkDayInUser = (date: any, user: any) => {
        if (user?.[date.year]?.[date.month]?.[date.day]) {
            if (user?.[date.year]?.[date.month]?.[date.day]?.isHoliday) {
                return squareCLasses['holiday'];
            } else if (
                Object.keys(user?.[date.year]?.[date.month]?.[date.day]).filter(
                    (item) => item !== 'isHoliday'
                ).length === 4 &&
                user?.[date.year]?.[date.month]?.[date.day]?.start_time !== 0 &&
                user?.[date.year]?.[date.month]?.[date.day]?.end_time !== 0
            ) {
                return squareCLasses['done'];
            } else if (
                Object.keys(user?.[date.year]?.[date.month]?.[date.day])
                    .length === 0
            ) {
                return squareCLasses['notTouched'];
            } else if (
                Object.keys(user?.[date.year]?.[date.month]?.[date.day])
                    .length !== 5
            ) {
                return squareCLasses['halflyDone'];
            }
        } else {
            return squareCLasses['notTouched'];
        }
    };

    const squareCLasses: any = {
        done: `${
            isLoading && modalDay.day === date.day ? 'greeneLoad' : 'greene'
        }`,
        holiday: `${
            isLoading && modalDay.day === date.day ? 'redeLoad' : 'rede'
        }`,
        notTouched: `${
            isLoading && modalDay.day === date.day ? 'slateeLoad' : 'slatee'
        }`,
        halflyDone: `${
            isLoading && modalDay.day === date.day ? 'yelloweLoad' : 'yellowe'
        }`,
    };

    return (
        <>
            <div
                className={`daytile border-[0.4rem] rounded-[20%] hover:rounded-[30%] w-12 h-12 md:w-16 lg:w-20 md:h-16 lg:h-20 flex text-center items-center justify-center cursor-pointer transition-all ${
                    isLoading && modalDay.day === date.day
                        ? 'fullroundi animate-spin'
                        : ''
                } ${className} ${checkDayInUser(date, user)}`}
                id={id}
                onClick={() => {
                    if (isSelecting && onClick) {
                        onClick();
                    } else {
                        setModalDay((prev) => date);
                        setIsModalOpen(true);
                    }
                }}
            >
                <h3
                    className={`text-md md:text-xl font-bold ${
                        isLoading && modalDay.day === date.day
                            ? 'animate-spin-reverse'
                            : ''
                    }`}
                >
                    {date.day}
                </h3>
            </div>
            {isModalOpen && <Modal isOpen={isModalOpen} setIsOpen={setIsModalOpen}>
                <AddOrEditDateTimes
                    userName={userName}
                    user={user}
                    date={modalDay}
                    addTime={addWorkHourEntry}
                    setIsOpen={setIsModalOpen}
                />
            </Modal>}
        </>
    );
}
