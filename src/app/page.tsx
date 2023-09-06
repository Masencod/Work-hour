"use client"
import Image from 'next/image'
import netlifyIdentity from 'netlify-identity-widget';
import { useEffect, useState } from "react"


declare global {
  interface Window {
    netlifyIdentity: any;
  }
}

export default function Home() {

  const netlifyAuth = {
    isAuthenticated: false,
    user: null,
    initialize(callback: any) {
      window.netlifyIdentity = netlifyIdentity
      netlifyIdentity.on('init', (user: any) => {
        callback(user)
      })
      netlifyIdentity.init()
    },
    authenticate(callback: any) {
      this.isAuthenticated = true
      netlifyIdentity.open()
      netlifyIdentity.on('login', (user: any) => {
        this.user = user
        callback(user)
        netlifyIdentity.close()
      })
    },
    signout(callback: any) {
      this.isAuthenticated = false
      netlifyIdentity.logout()
      netlifyIdentity.on('logout', () => {
        this.user = null
        callback()
      })
    },
  }

  let [user, setUser] = useState(null)
  let [loggedIn, setLoggedIn] = useState(netlifyAuth.isAuthenticated)

  useEffect(() => {
    netlifyAuth.initialize((user: any) => {
      setLoggedIn(!!user)
      setUser(user)
    })
  }, [loggedIn])


  let login = () => {
    netlifyAuth.authenticate((user: any) => {
      setLoggedIn(!!user)
      setUser(user)
    })
  }
  
  let logout = () => {
    netlifyAuth.signout(() => {
      setLoggedIn(false)
      setUser(null)
    })
  }


  return (
    <main>
      <button onClick={() => login()}>{loggedIn ? `damn boi where did u find this` : `damn boi u need to log in`}</button>

    </main>
  )
}
