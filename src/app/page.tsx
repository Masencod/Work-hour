"use client";
import NavBar from "@/Components/NavBar";
import Image from "next/image";
import netlifyIdentity from "netlify-identity-widget";
import { useEffect, useState } from "react";
import DateChecker from "@/Components/DateChecker";
import { userTypes } from "types/*";
import * as jalaali from "jalaali-js";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc , getDoc, DocumentData } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import "firebase/firestore";
import firebase from "firebase/compat/app";

const firebaseConfig = {
  apiKey: "AIzaSyCQLEjdTMFiE-j-3yoCkwPvr7QTw_tDPIg",
  authDomain: "work-hour-sajjad.firebaseapp.com",
  projectId: "work-hour-sajjad",
  storageBucket: "work-hour-sajjad.appspot.com",
  messagingSenderId: "203542690526",
  appId: "1:203542690526:web:2f45358268ef15c27ea04f",
  measurementId: "G-4JYP1TLMVY",
};

declare global {
  interface Window {
    netlifyIdentity: any;
  }
}

const dataF = {
  1402: {
    6: {
      1: {
        enter_time: 1000,
        exit_time: 1200,
        personal_time: 10,
        project: "BEHBINgggggggg",
        isHoliday: true,
      },
      2: {
        enter_time: 1000,
        exit_time: 1200,
        personal_time: 10,
        project: "BEHBINgggggggg",
        isHoliday: false,
      },
      21: {
        enter_time: 1000,
        exit_time: 1200,
        project: "BEHBINgggggggg",
        isHoliday: true,
      },
    },
  },
}

export default function Home() {

  const netlifyAuth = {
    isAuthenticated: false,
    user: null as userTypes | null,
    initialize(callback: any) {
      window.netlifyIdentity = netlifyIdentity;
      netlifyIdentity.on("init", (user: userTypes) => {
        callback(user);
      });
      netlifyIdentity.init();
    },
    authenticate(callback: any) {
      this.isAuthenticated = true;
      netlifyIdentity.open();
      netlifyIdentity.on("login", (user: userTypes) => {
        this.user = user;
        callback(user);
        netlifyIdentity.close();
      });
    },
    signout(callback: any) {
      this.isAuthenticated = false;
      netlifyIdentity.logout();
      netlifyIdentity.on("logout", () => {
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
    currentDate.getMonth() + 1, // Note: JavaScript months are 0-based, so we add 1
    currentDate.getDate()
  );

  const [user, setUser] = useState<userTypes | null>(null);
  const [userFromDb, setUserFromDb] = useState<DocumentData | null>(null);
  const [loggedIn, setLoggedIn] = useState(netlifyAuth.isAuthenticated);
  
  useEffect(() => {
    console.log(user)
  },[user])

  async function addWorkHourEntry(userName: string , userData: DocumentData | null): Promise<void> {
    await setDoc(doc(db, "users", userName), userData);
    fetchUser(userName);
  }

  async function fetchUser(userName: string) {
    const userDoc = doc(db, 'users', userName);
    const userSnapshot = await getDoc(userDoc);
    if (userSnapshot.exists()) {
      setUserFromDb(userSnapshot.data())
    } else {
      const year = jalaliDate.jy
      const month = jalaliDate.jm
      const userData = {
        [year]: {
          [month]: {

          }
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
  
  const login = () => {
    netlifyAuth.authenticate((user: userTypes) => {
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

  useEffect(() => {
    netlifyAuth.initialize((user: userTypes) => {
      setLoggedIn(!!user);
      setUser(user);
    });
    if (user?.email) {
      fetchUser(user?.email)
    }
  }, [loggedIn]);


  return (
    <>
      {loggedIn
        ?
          <main className="w-full">
            <NavBar loggedIn={loggedIn} login={login} logout={logout} user={user} />
            <div className="mt-2 px-2">
              <DateChecker setUser={setUserFromDb} user={userFromDb} addTime={addWorkHourEntry} userName={user?.email}/>
            <div>

              </div>
            </div>
          </main>
        : 
          <>
            <div className="w-full h-[100vh] flex justify-center items-center">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
                onClick={login}
              >
                U NEEED TOOO LOGGGIIIIINNNNNNNNNN
              </button>
            </div>
          </>
      }
    </>
  );
}
