"use client"
import xlsx from 'json-as-xlsx';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import toast, { Toaster } from 'react-hot-toast';
import * as XLSX from 'xlsx';

export default function page() {

    const router = useRouter()

    const [ExcelJsonInput, setExcelJsonInput] = useState([])
    const [loadingExcel, setLoadingExcel] = useState(false)
    const [InputtedExcelItemCount, setInputtedExcelItemCount] = useState(0)
    const [parentItems, setParentItems] = useState([])
    const [UploadReport, setUploadReport] = useState([])

    const handleExcelFileInput = (e) => {
        const selectedFile = e.target.files?.[0];
        // const loading = toast.loading('Please wait while we are processing your file...');


        if (!selectedFile) {
            // toast.error('Please select a excel file');
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

            excelData = XLSX.utils.sheet_to_json(sheet, {
                blankrows: false,
                skipHidden: true,
                header: "A",
                raw: false,
                rawNumbers: false,
                defval: null,
            });
            // excelData.pop();
            const transformedData = excelData.filter(obj => {
                // Check if any of the values are blank or empty strings
                return Object.values(obj).every(value => String(value).trim() !== "");
            });
            setExcelJsonInput(transformedData)

            let parentItems = []

            for (const key in transformedData[0]) {
                if (transformedData[0].hasOwnProperty(key)) {
                    const element = transformedData[0][key];
                    parentItems.push(element)
                }
            }

            setParentItems(parentItems)
            // console.log(transformedData)
            // toast.success('File processed successfully');
            // toast.dismiss(loading);
            setInputtedExcelItemCount(transformedData?.length)
            // ExcelItemFinder(transformedData)
        }

    }

    const manualStoreSimilarItem = async (actualItem, excelItem) => {
        try {

            const response = await fetch('/api/similaritem/upload-list', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ itemName: actualItem, similarItem: excelItem })
            })

            const data = await response.json()
            if (response.status === 200) {
                return {
                    status: true,
                    data
                }
            } else {
                return {
                    status: false,
                    data
                }
            }


        } catch (error) {
            console.error(error)
            return {
                status: false,
                data: {
                    message: error.message
                }
            }


        }
    }

    const handleStoreSimilarItem = async (excelData, parentItems) => {
        // const loading = toast.loading('Please wait while we are processing your file...');
        try {


            const reportData = []



            for (let i = 0; i < excelData.length; i++) {
                const element = excelData[i];
                for (let j = 0; j < parentItems.length; j++) {
                    const parentItem = parentItems[j];
                    if (parentItem !== element[String.fromCharCode(65 + j)] && element[String.fromCharCode(65 + j)]) {
                        const itemToast = toast.loading(`Processing ${parentItem} and ${element[String.fromCharCode(65 + j)]}...`);
                        const response = await manualStoreSimilarItem(parentItem, element[String.fromCharCode(65 + j)])
                        if (response.status) {
                            reportData.push({ parentItem, similarItem: element[String.fromCharCode(65 + j)], status: 'Success', message: response.data.message })
                        } else {
                            reportData.push({ parentItem, similarItem: element[String.fromCharCode(65 + j)], status: 'Failed', message: response.data.message })
                        }
                        toast.dismiss(itemToast);
                        console.log(parentItem, element[String.fromCharCode(65 + j)])
                    }
                }
            }

            setUploadReport(reportData)
            // toast.dismiss(loading);
            toast.success('File processed successfully', { icon: '🚀' });

        } catch (error) {
            toast.error('An error occurred while processing your file', { icon: '🚫' });
            console.log(error)
        }
    }

    const createSheet = (data) => {
        let reportData = [
            {
                sheet: "Sheet1",
                columns: [
                    { label: "ORIGINAL ITEM", value: "parentItem" },
                    { label: "SIMILAR ITEM", value: "similarItem" },
                    { label: "STATUS", value: "status" },
                    { label: "MESSAGE", value: "message" },

                ],
                content: data,
            },
        ];

        DownloadExcel(reportData);
    };

    const DownloadExcel = (data) => {
        const settings = {
            fileName: `SIMILAR ITEM REPORT ${new Date().toISOString()}`,
            extraLength: 3,
            writeMode: "writeFile",
            writeOptions: {},
            RTL: false,
        };

        xlsx(data, settings, () => {
            toast.success('File downloaded successfully', { icon: '🚀' });
        });
    };
    return (
        <>

            <Toaster />

            <div className='flex justify-center flex-col w-[100%]'>

                <div className='m-auto'>

                    {
                        !loadingExcel && ExcelJsonInput.length === 0 && InputtedExcelItemCount === 0 ? <input name='own' id='excelData' onChange={handleExcelFileInput} accept='application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' type="file" title='Your Excel File' className="file-input file-input-bordered file-input-warning w-full max-w-xs" /> : null
                    }
                </div>


                <div className='w-[100%] overflow-scroll justify-between flex bg-green-300'>
                    {
                        parentItems.length > 0 ? parentItems.map((item, index) => {
                            return <div className='bg-green-600 m-2 p-2 rounded-md' key={index}>

                                <p className='text-2xl font-bold'>{item}</p>

                                {
                                    ExcelJsonInput.map((childItem, childIndex) => {
                                        return <p className='p-3' key={childIndex}>{childItem[String.fromCharCode(65 + index)]}</p>

                                    })
                                }
                            </div>

                        }) : null
                    }
                </div>





            </div>
            <div className="btm-nav glass bg-blue-800">
                <button
                    onClick={() => {
                        if (UploadReport.length > 0) {
                            createSheet(UploadReport)
                        }
                    }}
                    className=" text-white hover:bg-blue-900"
                >
                    <Image
                        className=""
                        src="/assets/images/download (1).png"
                        width={50}
                        height={50}
                        alt="icon"
                    ></Image>
                    <span className="mb-6 text-xl font-mono">Report</span>
                </button>
                <button
                    onClick={() => {
                        if (ExcelJsonInput.length > 0 && parentItems.length > 0)
                            handleStoreSimilarItem(ExcelJsonInput, parentItems)
                    }}
                    className="text-white hover:bg-blue-900"
                >
                    <Image
                        className="mb-20"
                        src="/assets/images/uploadfile.png"
                        width={70}
                        height={70}
                        alt="icon"
                    ></Image>
                </button>
                <button
                    onClick={() => {
                        router.back()
                    }}
                    className="text-white hover:bg-blue-900"
                >
                    <Image
                        src="/assets/images/undo.png"
                        width={50}
                        height={50}
                        alt="icon"
                    ></Image>
                    <span className="mb-6 text-xl font-mono">Back</span>
                </button>
            </div>
        </>
    )
}
