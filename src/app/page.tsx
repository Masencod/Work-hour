'use client';
import NavBar from '@/Components/NavBar';
import Image from 'next/image';
import netlifyIdentity from 'netlify-identity-widget';
import { useEffect, useMemo, useState } from 'react';
import DateChecker from '@/Components/DateChecker';
import { userTypes } from 'types/*';
import * as jalaali from 'jalaali-js';
import { initializeApp } from 'firebase/app';
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    DocumentData,
} from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { useRecoilState } from 'recoil';
import { loadStateAtom } from '@/recoil/stateRecoils';
import 'firebase/firestore';

declare global {
    interface Window {
        netlifyIdentity: any;
    }
}

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_MESSAGIN_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID,
};
export default function Home() {
    const netlifyAuth = {
        isAuthenticated: false,
        user: null as userTypes | null,
        initialize(callback: any) {
            window.netlifyIdentity = netlifyIdentity;
            netlifyIdentity.on('init', (user: userTypes) => {
                callback(user);
            });
            netlifyIdentity.init();
        },
        authenticate(callback: any) {
            this.isAuthenticated = true;
            netlifyIdentity.open();
            netlifyIdentity.on('login', (user: userTypes) => {
                this.user = user;
                callback(user);
                netlifyIdentity.close();
            });
        },
        signout(callback: any) {
            this.isAuthenticated = false;
            netlifyIdentity.logout();
            netlifyIdentity.on('logout', () => {
                this.user = null;
                callback();
            });
        },
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const currentDate = new Date();
    const jalaliDate = jalaali.toJalaali(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        currentDate.getDate()
    );

    const [user, setUser] = useState<userTypes | null>(null);
    const [userFromDb, setUserFromDb] = useState<DocumentData | null>(null);
    const [loggedIn, setLoggedIn] = useState(netlifyAuth.isAuthenticated);
    const [isLoading, setIsLoading] = useRecoilState(loadStateAtom);

    useMemo(() => {
        if (user) {
            setLoggedIn(true);
        }
    }, [user]);

    const login = () => {
        netlifyAuth.authenticate((user: userTypes) => {
            console.log(user);
            setLoggedIn(!!user);
            setUser(user);
        });
    };

    const logout = () => {
        netlifyAuth.signout(() => {
            setLoggedIn(false);
            setUser(null);
        });
    };

    async function addWorkHourEntry(
        userName: string,
        userData: DocumentData | null
    ): Promise<void> {
        setIsLoading(true);
        await setDoc(doc(db, 'users', userName), userData);
        fetchUser(userName);
        setIsLoading(false);
    }

    async function fetchUser(userName: string) {
        const userDoc = doc(db, 'users', userName);
        const userSnapshot = await getDoc(userDoc);
        if (userSnapshot.exists()) {
            setUserFromDb(userSnapshot.data());
        } else {
            const year = jalaliDate.jy;
            const month = jalaliDate.jm;
            const userData = {
                [year]: {
                    [month]: {},
                },
            };
            await setDoc(userDoc, userData);
            const newUserSnapshot = await getDoc(userDoc);
            if (newUserSnapshot.exists()) {
                setUserFromDb(newUserSnapshot.data());
            } else {
                console.error('Failed to create and fetch the new document.');
            }
        }
    }

    useEffect(() => {
        netlifyAuth.initialize((user: userTypes) => {
            setLoggedIn(!!user);
            setUser(user);
        });
        if (user?.email) {
            fetchUser(user?.email);
        }
    }, [loggedIn]);

    return (
        <>
            {loggedIn ? (
                <main className="w-full h-[100svh] flex flex-col">
                    <NavBar
                        loggedIn={loggedIn}
                        login={login}
                        logout={logout}
                        user={user}
                    />
                    <div className="mt-2 px-2 flex-1">
                        <DateChecker
                            db={db}
                            fetch={fetchUser}
                            setUser={setUserFromDb}
                            user={userFromDb}
                            addTime={addWorkHourEntry}
                            userName={user?.email}
                        />
                    </div>
                </main>
            ) : (
                <>
                    <div className="w-full h-[100vh] flex flex-col gap-y-12 justify-center items-center">
                        <p className="font-bold text-2xl text-center px-4">
                            IF YOU ARE LOGGING IN WITH GOOGLE OR GITHUB ,{' '}
                            <span className="text-teal-200">REFRESH</span> AFTER
                            LOGIN
                        </p>
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
                            onClick={login}
                        >
                            LOGIN HERE !!!!!
                        </button>
                    </div>
                </>
            )}
        </>
    );
}
