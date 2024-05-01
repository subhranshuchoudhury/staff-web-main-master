"use client"
import React, { useState } from 'react'
import toast, { Toaster } from 'react-hot-toast';
import * as XLSX from "xlsx";


export default function page() {

    const [SimilarData, setSimilarData] = useState([])
    const [ExcelJsonInput, setExcelJsonInput] = useState([])

    const saveSimilarItemDB = async (itemName, similarItem) => {
        const response = await fetch('/api/similaritem', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ itemName, similarItem })
        })
        const data = await response.json()
        console.log(data)
        setSimilarData(data)
    }

    const findSimilarItemDB = async (similarItem) => {
        const response = await fetch('/api/similaritem/searchitem', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ searchItem: similarItem })
        })
        const data = await response.json()
        console.log(data)
        setSimilarData(data)
    }

    const handleExcelFileInput = (e) => {
        const selectedFile = e.target.files?.[0];
        const handleName = e.target.name;
        const loading = toast.loading('Please wait while we are processing your file...');

        if (!selectedFile) {
            toast.error('Please select a excel file');
            return;
        }
        let excelData = null;
        const reader = new FileReader();
        reader.readAsArrayBuffer(selectedFile);
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            excelData = XLSX.utils.sheet_to_json(sheet);
            setExcelJsonInput(excelData)
            console.log(excelData)
            toast.success('File processed successfully');
            toast.dismiss(loading);
        }

    }
    return (
        <>
            <Toaster />
            <div className='m-auto text-center'>
                <input name='own' id='excelData' onChange={handleExcelFileInput} accept='application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' type="file" title='Your Excel File' className="file-input file-input-bordered file-input-warning w-full max-w-xs" />
            </div>

            {
                ExcelJsonInput.length > 0 &&
                <div className='m-auto text-center'>

                </div>

            }
        </>
    )

}
