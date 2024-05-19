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
    const [UploadReport, setUploadReport] = useState([])
    const [CurrentUpload, setCurrentUpload] = useState(0)

    const handleExcelFileInput = (e) => {
        const selectedFile = e.target.files?.[0];


        if (!selectedFile) {
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
            const transformedData = excelData.filter(obj => {
                return Object.values(obj).every(value => String(value).trim() !== "");
            });
            setExcelJsonInput(transformedData)


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



    const handleStoreSimilarItemNew = async (excelData) => {

        let UploadReport = []

        for (let i = 0; i < excelData.length; i++) {
            setCurrentUpload(i + 1)
            const itemName = excelData[i]['A']
            const similarItemName = excelData[i]['B']

            if (itemName && similarItemName) {
                const response = await manualStoreSimilarItem(itemName, similarItemName)
                if (response.status) {
                    UploadReport.push({ parentItem: itemName, similarItem: similarItemName, status: 'Success', message: response.data.message })
                } else {
                    UploadReport.push({ parentItem: itemName, similarItem: similarItemName, status: 'Failed', message: response.data.message })
                }
            }
        }

        setUploadReport(UploadReport)
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
                        ExcelJsonInput.length === 0 ? <input name='own' id='excelData' onChange={handleExcelFileInput} accept='application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' type="file" title='Your Excel File' className="file-input file-input-bordered file-input-warning w-full max-w-xs" /> : null
                    }
                </div>




                <div className='justify-center items-center flex text-2xl font-extrabold mb-6'>
                    {
                        ExcelJsonInput.length > 0 && CurrentUpload > 1 && <>
                            <p className='animate-pulse'>Processing {CurrentUpload} of {ExcelJsonInput.length} ({Math.round((CurrentUpload / ExcelJsonInput.length) * 100)}%)</p>
                        </>
                    }
                </div>



                <div className='justify-center items-center flex'>
                    <div className='flex flex-col'>

                        {
                            ExcelJsonInput.map((item, index) => {
                                return <div key={index} className='items-center justify-center gap-5 bg-green-300 p-4 rounded-sm flex mb-2'>
                                    <p className='text-black font-bold'>{item['A']}</p>
                                    <p className='w-52 h-1 rounded-md bg-green-900'></p>
                                    <p className='text-black font-bold'>{item['B']}</p>
                                </div>
                            })
                        }



                    </div>
                </div >





            </div >
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
                        if (ExcelJsonInput.length > 0)
                            if (CurrentUpload !== 0)
                                toast.error('Please wait for the current upload to finish', { icon: '🚀' });
                            else
                                handleStoreSimilarItemNew(ExcelJsonInput)
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
