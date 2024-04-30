"use client"
import React, { useState } from 'react'

export default function page() {

    const [Data, setData] = useState([])

    const postSimilarItem = async (itemName, similarItem) => {
        const response = await fetch('/api/similaritem', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ itemName, similarItem })
        })
        const data = await response.json()
        console.log(data)
    }
    return (
        <div>
            <button onClick={() => postSimilarItem("Hello", "Hii")}>TEST</button>
        </div>
    )
}
