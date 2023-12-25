"use client"
import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react'

export default function page() {

    const [isLoaded, setisLoaded] = useState(false)

    const [Settings, setSettings] = useState({
        isApp: true
    });

    const saveLocal = (name, value) => {
        localStorage.setItem(`SETTINGS_${name}`, JSON.stringify(value))
    }


    const handleSettings = (name, value) => {
        saveLocal(name, value)
        setSettings({ ...Settings, [name]: value })
    }

    const getLocalStorage = (name) => {
        return JSON.parse(localStorage.getItem(`SETTINGS_${name}`) || false)
    }

    useEffect(() => {
        setisLoaded(true)
    }, [])

    return (
        <div className='p-3'>

            <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p>Change the way how the app works.</p>
            </div>

            {isLoaded && <div className='mt-6'>
                <h3>Are you on website on app ? <span className='text-yellow-400'>{getLocalStorage("isApp") ? "(APP)" : "(Website)"}</span></h3>
                <div className='mt-2'>
                    <button onClick={() => {
                        handleSettings("isApp", false)
                    }} className='btn btn-success mr-2'>Website</button>
                    <button onClick={() => {
                        handleSettings("isApp", true)
                    }} className='btn btn-success'>App</button>
                </div>
            </div>}

        </div>
    )
}
