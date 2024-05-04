"use client";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import xlsx from "json-as-xlsx";
import * as XLSX from "xlsx";
import { useState, useEffect } from "react";
import Select, { createFilter } from "react-select";
import gstAmount from "../../DB/Purchase/gstamount";
import gstType from "../../DB/Purchase/gsttype";
import {
    InclusiveCalc,
    ExclusiveCalc,
    ExemptCalc,
    TotalAmountCalc,
    exclusiveDM,
    IGSTnewAmount,
    IGSTnewDiscPercentage,
    getMRPExclusive,
    getMRPInclusiveExempt
    // unitPriceCalcExclDISC,
    // unitPriceCalcEXemptInclDISC,
} from "../../Disc/disc";
import Image from "next/image";
import CustomOption from "../../Dropdown/CustomOption";
import CustomMenuList from "../../Dropdown/CustomMenuList";
import { useRouter, useSearchParams } from "next/navigation";
import purchasetype from "../../DB/Purchase/gstamount";
import { uploadItem } from "../../AppScript/script";
import toast, { Toaster } from "react-hot-toast";
import { choiceIGST } from "../../DB/Purchase/choice";
// import * as excelTOJson from "convert-excel-to-json";
export default function page(props) {
    const searchParams = useSearchParams();
    // * Use Effects

    useEffect(() => {
        getExcelData();
        checkNotDownload(searchParams.get("fromNewItem"));
        retrieveDataFromNewItem(searchParams.get("fromNewItem")); // * Retrieve data from the new item page.
        setUnsavedState(); // * for gstType, DNM etc. field
        // const unsubscribe = window.addEventListener("EXPO_LS_EVENT", function () {
        //     // * This is for the expo app, using for scanning bar codes.
        //     digLocalStorageQR(); // * This function is in the app.js file.
        // });
        // return () => {
        //     window.removeEventListener("EXPO_LS_EVENT", unsubscribe);
        // };
    }, []);

    // * useStates for storing data.

    const [loadingExcel, setLoadingExcel] = useState(true); // * false for dev purpose
    const [excelContent, setExcelContent] = useState([]);
    const [partyData, setPartyData] = useState([]);
    const [itemData, setItemData] = useState([]);
    // const [qrResult, setQrResult] = useState("");
    // const [barcodeScannedData, setBarcodeScannedData] = useState(null);
    // const [PrevScanData, setPrevScanData] = useState(null)
    const [formData, setFormData] = useState({
        partyName: null,
        invoiceNo: null,
        invoiceDate: new Date(), // default date is today
        gstType: null,
        unit: "Pcs", // default value
        purchaseType: "DNM",
        mDiscPercentage: 0, // mention discount percentage
        itemPartNo: null,
        itemPartNoOrg: null,
        itemLocation: null, // from item data
        quantity: 0,
        mrp: null,
        gstPercentage: null,
        amount: null,
        finalDisc: "ERROR!",
        selectedItemRow: -1,
        isIGST: false,
        dynamicdisc: null,
    });
    const [modalMessage, setModalMessage] = useState({
        title: "",
        message: "",
        button: "",
    });

    const [modalConfirmation, setModalConfirmation] = useState({
        title: "",
        message: "",
        button_1: "",
        button_2: "",
        messages: [],
        btn_f_1: () => { },
        btn_f_2: () => { },
        norm_f_3: () => { }
    });

    // * handle QR search feature

    // const digLocalStorageQR = () => {
    //     const loading = toast.loading("Searching...");
    //     let localSavedItemApi = [];

    //     if (localSavedItemApi?.length === 0) {
    //         setQrResult("🔍 Searching...");
    //     }

    //     const setLocalITEM_API = (data) => {
    //         localSavedItemApi = data;
    //     };

    //     checkLocalStorageSaved("ITEM_API_DATA", setLocalITEM_API);

    //     // * This function will get the local item whenever the event "EXPO_LS_EVENT" triggered.

    //     const res = localStorage.getItem("EXPO_SCN_RESULT");
    //     let result = localSavedItemApi.find(
    //         (obj) => obj.pn !== "" && res == String(obj?.pn)?.trim()
    //     );

    //     if (!result) {
    //         console.log("Type 1 scanning...");
    //         result = localSavedItemApi.find(
    //             (obj) => obj.pn !== "" && JSON.stringify(obj?.value).includes(res)
    //         );
    //     }

    //     if (!result) {
    //         console.log("Type 2 scanning...");

    //         result = localSavedItemApi.find(
    //             (obj) => obj.pn !== "" && JSON.stringify(obj?.pn).includes(res)
    //         );
    //     }

    //     if (!result) {
    //         console.log("Type 3 scanning...");

    //         result = localSavedItemApi.find((obj) =>
    //             JSON.stringify(obj).includes(res)
    //         );
    //     }

    //     if (!result) {
    //         console.log("Type 4 scanning...");

    //         result = localSavedItemApi.find(
    //             (obj) => obj.pn !== "" && res.includes(obj.pn)
    //         );

    //         if (result) {
    //             toast.error("The result may not be accurate.");
    //         }
    //     }

    //     if (result?.value) {
    //         toast.success("Scan complete");
    //         console.log("SCN_RES", result);
    //         setQrResult(`✔ ${result?.value}-${result?.pn}`);

    //         // * setting the matched value

    //         handleFormChange({
    //             target: { name: "itemPartNo", value: result?.value },
    //         });
    //         handleFormChange({
    //             target: {
    //                 name: "itemLocation",
    //                 value: result?.loc?.toUpperCase(),
    //             },
    //         });
    //         handleFormChange({
    //             target: {
    //                 name: "mrp",
    //                 value: result?.mrp,
    //             },
    //         });

    //         handleFormChange({
    //             target: {
    //                 name: "selectedItemRow",
    //                 value: result?.row,
    //             },
    //         });

    //         if (formData?.gstType !== "Exempt") {
    //             handleFormChange({
    //                 target: {
    //                     name: "gstPercentage",
    //                     value: `${result?.gst}%`,
    //                 },
    //             });
    //         }
    //     } else {
    //         toast.error("No match found");
    //         localSavedItemApi?.length === 0
    //             ? setQrResult(`❓ Oops! Kindly retry..`)
    //             : setQrResult(`❌ No match: ${res}`);
    //     }

    //     toast.remove(loading);
    // };

    const ExcelItemFinder = (excelData) => {

        if (excelData?.length === 0) {
            return
        }

        const itemOrPartNo = excelData[0]["A"]

        /*
        First we have to search the item in the partNo field of our excel file.
        If it is found then directly assign the details.
        If it is not found then search it on 
        */
        const loading = toast.loading("🔍 Searching...");
        let localSavedItemApi = [];

        // if (localSavedItemApi?.length === 0) {
        //     setQrResult("🔍 Searching...");
        // }

        const setLocalITEM_API = (data) => {
            localSavedItemApi = data;
        };

        checkLocalStorageSaved("ITEM_API_DATA", setLocalITEM_API);


        const res = itemOrPartNo; // This will provide to our function
        let result = localSavedItemApi.find(
            (obj) => obj.pn !== "" && res == String(obj?.pn)?.trim()
        );

        if (!result) {
            console.log("Type 1 scanning...");
            result = localSavedItemApi.find(
                (obj) => obj.pn !== "" && JSON.stringify(obj?.value).includes(res)
            );
        }

        if (!result) {
            console.log("Type 2 scanning...");

            result = localSavedItemApi.find(
                (obj) => obj.pn !== "" && JSON.stringify(obj?.pn).includes(res)
            );
        }

        // if (!result) {
        //     console.log("Type 3 scanning...");

        //     result = localSavedItemApi.find((obj) =>
        //         JSON.stringify(obj).includes(res)
        //     );
        // }

        // if (!result) {
        //     console.log("Type 4 scanning...");

        //     result = localSavedItemApi.find(
        //         (obj) => obj.pn !== "" && res.includes(obj.pn)
        //     );

        //     if (result) {
        //         toast.error("The result may not be accurate.");
        //     }
        // }

        handleFormChange({
            target: {
                name: "quantity",
                value: parseInt(excelData[0]["B"]),
            },
        });

        // amount conversion

        handleFormChange({
            target: {
                name: "amount",
                value: amountConversion(excelData[0]["C"]),
            },
        });

        console.log("Total Amount in Excel: ", amountConversion(excelData[0]["C"]))

        if (result?.value) {
            console.log("Excel Finder: ", result);
            // setQrResult(`✔ ${result?.value}-${result?.pn}`);
            // * setting the matched value
            // setPrevScanData(result?.value)
            // setBarcodeScannedData("");

            handleFormChange({
                target: { name: "itemPartNo", value: result?.value },
            });
            handleFormChange({
                target: { name: "itemPartNoOrg", value: result?.pn || "N/A" },
            });
            handleFormChange({
                target: {
                    name: "itemLocation",
                    value: result?.loc?.toUpperCase(),
                },
            });
            // handleFormChange({
            //     target: {
            //         name: "mrp",
            //         value: result?.mrp,
            //     },
            // });

            handleFormChange({
                target: {
                    name: "selectedItemRow",
                    value: result?.row,
                },
            });

            if (formData?.gstType !== "Exempt") {
                handleFormChange({
                    target: {
                        name: "gstPercentage",
                        value: `${result?.gst}%`,
                    },
                });
            }

            if (result?.dynamicdisc) {
                handleFormChange({
                    target: {
                        name: "dynamicdisc",
                        value:
                            isNaN(result?.dynamicdisc) || result?.dynamicdisc === "" ? null : Number(result?.dynamicdisc),
                    },
                });
            }

            // let newQuantity = 0;
            // if (PrevScanData === result?.value) {
            //     // increment the quantity
            //     newQuantity = parseInt(formData?.quantity) + 1;
            // } else {
            //     newQuantity = 1;
            // }
            // handleFormChange({
            //     target: {
            //         name: "quantity",
            //         value: newQuantity,
            //     },
            // });

            // handleFormChange({
            //     target: {
            //         name: "quantity",
            //         value: parseInt(excelData[0]["B"]),
            //     },
            // });

            // handleFormChange({
            //     target: {
            //         name: "amount",
            //         value: parseInt(excelData[0]["C"]),
            //     },
            // });

            if (result?.dynamicdisc && !isNaN(result?.dynamicdisc)) {

                // alert("Dynamically Calculated")
                // let unitPrice = 0;

                // if (result?.gstType === "Exclusive") {
                //     unitPrice = unitPriceCalcExclDISC(result?.mrp, result?.dynamicdisc, result?.gstPercentage?.replace("%", ""));

                // } else {
                //     unitPrice = unitPriceCalcEXemptInclDISC(result?.mrp, result?.dynamicdisc);
                // }

                // handleFormChange({
                //     target: {
                //         name: "amount",
                //         value: unitPrice * newQuantity,
                //     },
                // })


            } else {
                toast.error("No Saved Disc% available")
                handleFormChange({
                    target: {
                        name: "mrp",
                        value: result?.mrp,
                    },
                });
            }
        } else {
            localSavedItemApi?.length === 0
                ? toast.error("No item is found in your localstorage.")
                : toast.error("No match found, choose manually")
        }

        toast.dismiss(loading);
    };

    const amountConversion = (amount) => {
        // 12,34,4.45
        const regexPattern_1 = /^(\d{1,3}(,\d{3})*(\.\d+)?)$/
        if (regexPattern_1.test(amount)) {
            return parseFloat(amount.replace(/,/g, ''));
        } else {
            return parseFloat(amount)
        }

    }




    // * handle the modal

    const handleModal = (title, message, button) => {
        setModalMessage({ title, message, button });
    };

    const handleConfirmationModal = (
        title,
        message,
        button_1,
        button_2,
        messages,
        f1,
        f2,
        f3
    ) => {
        setModalConfirmation({
            title,
            message,
            button_1,
            button_2,
            messages,
            btn_f_1: f1,
            btn_f_2: f2,
            norm_f_3: f3
        });
    };

    // * handle the changes of formData

    const handleFormChange = (event) => {
        const name = event.target?.name;
        const value = event.target?.value;
        setFormData((values) => ({ ...values, [name]: value }));
    };

    // * save the current state: (date, gstType, DNM)

    // New item return page handle
    // const saveStateField = () => {
    //     const tempObj = {
    //         partyName: formData?.partyName,
    //         invoiceNo: formData?.invoiceNo,
    //         invoiceDate: formData?.invoiceDate,
    //         gstType: formData?.gstType,
    //         purchasetype: formData?.purchaseType,
    //         mDiscPercentage: formData?.mDiscPercentage,
    //     };

    //     localStorage.setItem("US_STATE_PURCHASE", JSON.stringify(tempObj));
    // };

    // * router for navigation

    const router = useRouter();

    // * Load our excel document for Party & Item Data.

    const getExcelData = async () => {
        // const loading = toast.loading("Please wait while we fetching some files...")
        // * Check if data is already saved in localStorage

        checkLocalStorageSaved("PARTY_API_DATA", setPartyData);
        checkLocalStorageSaved("ITEM_API_DATA", setItemData);

        Promise.all([
            fetch(
                "https://script.google.com/macros/s/AKfycbx3G0up1xJoNIJqXLRdmSLQ09OPtwKnTfi8uWPzEw-vCUT4nwvluEmwOA3CKinO6PJhPg/exec"
            ),
            fetch(
                "https://script.google.com/macros/s/AKfycbwr8ndVgq8gTbhOCRZChJT8xEOZZCOrjev29Uk6DCDLQksysu80oTb8VSnoZMsCQa3g/exec"
            ),
        ])
            .then((responses) =>
                Promise.all(responses.map((response) => response.json()))
            )
            .then((data) => {
                // data[0] contains the items
                // data[1] contains the party

                const item_data = data[0];
                const party_data = data[1];


                const indexedItems = item_data.map((obj, row) => ({
                    ...obj,
                    row,
                }));

                // console.log(indexedItems)
                setItemData(indexedItems);
                setPartyData(party_data);

                setLoadingExcel(false);
                // toast.dismiss(loading)

                localStorage.setItem("PARTY_API_DATA", JSON.stringify(party_data));
                localStorage.setItem("ITEM_API_DATA", JSON.stringify(indexedItems));
            })
            .catch((error) => {
                // toast.dismiss(loading)
                setLoadingExcel(true);
                console.error(error);
                toast.error("We are unable to load online files. Check your internet connection.")
            });
    };

    // * localStorage for storing data

    const checkLocalStorageSaved = (address, manager) => {
        let storage = localStorage.getItem(address); // * address is the key
        if (storage !== null && storage != undefined) {
            storage = JSON.parse(storage);
            manager(storage); // * manager is the setter function
        }
    };

    const setLocalStorage = (key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
    };

    const getLocalStorage = (key) => {
        const storage = localStorage.getItem(key);
        if (storage !== null && storage !== undefined) {
            return JSON.parse(storage);
        } else {
            return null;
        }
    };

    const getLocalStorageString = (key) => {
        const storage = localStorage.getItem(key);
        if (storage !== null || storage !== undefined) return storage;
        return null;
    };

    const clearLocalStorage = (key) => {
        localStorage.removeItem(key);
    };

    const storeNotDownload = (obj) => {
        const retrievedArray = getLocalStorage("PURCHASE_NOT_DOWNLOAD_DATA") || [];
        retrievedArray.push(obj);
        setLocalStorage("PURCHASE_NOT_DOWNLOAD_DATA", retrievedArray);
    };

    const checkNotDownload = (searchBar) => {
        const retrievedArray = getLocalStorage("PURCHASE_NOT_DOWNLOAD_DATA");
        const agreed = () => {
            if (retrievedArray !== null && retrievedArray !== undefined) {
                setExcelContent(retrievedArray);
                const constantFields = retrievedArray[0];
                let dateString = constantFields?.billDate || "26-08-2003";
                let dateParts = dateString.split("-");
                let dateObject = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
                handleFormChange({
                    target: {
                        name: "invoiceNo",
                        value: constantFields?.invoiceNo,
                    },
                });
                handleFormChange({
                    target: {
                        name: "partyName",
                        value: constantFields?.partyName,
                    },
                });
                handleFormChange({
                    target: {
                        name: "invoiceDate",
                        value: dateObject,
                    },
                });
            }
        };

        if (searchBar === "true") {
            agreed();
            return;
        }

        handleConfirmationModal(
            "Confirmation ❓",
            "Do you want to load the previous unsaved data?",
            "Yes",
            "No",
            [
                {
                    data: `📜 Invoice: ${retrievedArray?.[0]?.invoiceNo}`,
                    style: "text-xl font-bold",
                },
                {
                    data: `🤵 Party: ${retrievedArray?.[0]?.partyName}`,
                    style: "text-sm",
                },
                {
                    data: `📑 Total: ${retrievedArray?.length} items`,
                    style: "text-sm",
                },
                {
                    data: `📅 Date: ${retrievedArray?.[0]?.billDate}`,
                    style: "text-sm",
                },
            ],

            agreed,
            () => clearLocalStorage("PURCHASE_NOT_DOWNLOAD_DATA")
        );
        retrievedArray && window.purchase_modal_2.showModal();
    };

    // * Duplicate check

    const isDuplicate = (item) => {
        const result = excelContent.find(
            (obj) =>
                obj?.itemName === item?.itemName &&
                obj?.itemName !== null &&
                obj?.itemName !== undefined
        );
        if (result) {
            return true;
        }
        return false;
    };

    // * This function used for get & set the data from new item addition page.

    const retrieveDataFromNewItem = (searchBar) => {
        // ? These will be the values from the new item page.

        const retrievedArray =
            JSON.parse(localStorage.getItem("US_ADDED_ITEMS")) || []; // * US_ADDED_ITEMS is the unsaved new added items.

        if (searchBar === "true" && retrievedArray?.length > 0) {
            // * if the user comes from the new item page, then it will set the values from the new item page.
            const lastItemIndex = retrievedArray?.length - 1;
            const loc = retrievedArray?.[lastItemIndex]?.Loc?.toUpperCase();
            const mrp = retrievedArray?.[lastItemIndex]?.MRP;
            const gst = retrievedArray?.[lastItemIndex]?.Tax_Category;
            const item = retrievedArray?.[lastItemIndex]?.Item_Name?.toUpperCase();
            const party = getLocalStorageString("US_PN_REFERER")?.toUpperCase();
            const invoice = getLocalStorageString("US_INV_REFERER")?.toUpperCase();
            const credit = 0; // ! credit days is not available in the new item page.

            handleFormChange({
                target: { name: "itemLocation", value: loc },
            });

            handleFormChange({
                target: { name: "mrp", value: mrp },
            });

            handleFormChange({
                target: { name: "gstPercentage", value: gst },
            });

            handleFormChange({
                target: { name: "itemPartNo", value: item },
            });

            if (excelContent?.length === 0) {
                // * if the excel content is empty, then only it will change the party name, invoice no & credit days.
                handleFormChange({
                    target: { name: "partyName", value: party },
                });

                handleFormChange({
                    target: { name: "invoiceNo", value: invoice },
                });

                handleFormChange({
                    target: { name: "creditDays", value: credit },
                });
            }
        }
    };

    const setUnsavedState = () => {
        // * other unsaved state data

        const unsavedFieldData = getLocalStorage("US_STATE_PURCHASE");

        const localDate = localStorage.getItem("US_INV_DATE");
        if (localDate !== null && localDate !== undefined) {
            const dateObject = new Date(localDate);
            handleFormChange({
                target: {
                    name: "invoiceDate",
                    value: dateObject,
                },
            });
        }

        handleFormChange({
            target: {
                name: "gstType",
                value: unsavedFieldData?.gstType,
            },
        });
        // handleFormChange({
        //   target: {
        //     name: "invoiceDate",
        //     value: parsedDate,
        //   },
        // });

        if (unsavedFieldData?.purchasetype === "DM") {
            handleFormChange({
                target: {
                    name: "amount",
                    value: 0,
                },
            });
            handleFormChange({
                target: {
                    name: "purchaseType",
                    value: unsavedFieldData?.purchasetype,
                },
            });
            handleFormChange({
                target: {
                    name: "mDiscPercentage",
                    value: unsavedFieldData?.mDiscPercentage,
                },
            });
        }
    };

    // * form validation

    const isFormValidated = (form) => {
        for (let key in form) {

            if (key === "dynamicdisc") continue;


            if (form[key] === null || form[key] === undefined || form[key] === "") {
                handleModal(
                    "❌ Error",
                    `Please fill "${key
                        .replace(/[A-Z]/g, (match) => " " + match)
                        .trim()
                        .toUpperCase()}" field.`,
                    "Okay"
                );
                window.purchase_modal_1.showModal();

                return false;
            }
        }
        return true;
    };

    // * handle the add button

    const addSingleFormContent = () => {
        // * Converting the new Date() to dd-mm-yyyy format

        const dateToFormattedString = (date) => {
            var dateString = `${date}`;
            var date = new Date(dateString);
            var day = date.getDate();
            var month = date.getMonth() + 1;
            var year = date.getFullYear();

            var formattedDate =
                (day < 10 ? "0" + day : day) +
                "-" +
                (month < 10 ? "0" + month : month) +
                "-" +
                year;

            return formattedDate;
        };

        // * mutable values
        let gstValue =
            formData?.gstType === "Exempt"
                ? 0
                : parseInt(formData?.gstPercentage?.split("%")[0]?.trim());
        let disc = 0;
        let purchaseType = "";
        let eligibility = "Goods/Services";
        let bill = "GST";
        let cgst = 0;
        // * discount calculation

        if (formData?.gstType === "Exempt") {
            gstValue = 0;
            bill = "Main";
            cgst = 0;
            purchaseType = "EXEMPT";
            disc = ExemptCalc(formData?.mrp, formData?.amount, formData?.quantity);
            eligibility = "None";
        } else if (formData?.gstType === "Inclusive") {
            purchaseType = "GST(INCL)";
            disc = InclusiveCalc(formData?.mrp, formData?.amount, formData?.quantity);
            cgst = parseInt(gstValue / 2);
        } else {
            purchaseType = "GST(INCL)";
            disc = ExclusiveCalc(
                formData?.mrp,
                formData?.amount,
                gstValue,
                formData?.quantity
            );
            cgst = parseInt(gstValue / 2);
        }

        if (formData?.purchaseType === "DM" && formData?.gstType === "Exclusive") {
            disc = exclusiveDM(
                formData?.mrp,
                formData?.quantity,
                formData?.mDiscPercentage,
                gstValue
            );
        } else if (formData?.purchaseType === "DM") {
            disc = formData?.mDiscPercentage;
        }

        // calculate the Total amount:

        const amountField = TotalAmountCalc(
            formData?.mrp,
            disc,
            formData?.quantity
        );

        // * setting the content after all operations

        const tempContent = {
            billSeries: bill,
            billDate: dateToFormattedString(formData?.invoiceDate),
            originDate: formData?.invoiceDate,
            purchaseType: purchaseType,
            partyName: formData?.partyName,
            eligibility: eligibility,
            invoiceNo: formData?.invoiceNo,
            itemName: formData?.itemPartNo,
            quantity: formData?.quantity,
            unit: formData?.unit,
            mrp: formData?.mrp,
            itemPartNo: formData?.itemPartNoOrg,
            disc: disc,
            amount: amountField,
            cgst: cgst,
            sgst: cgst,
            itemLocation: formData?.itemLocation,
            repetition: parseInt(formData?.quantity), // Quantity for print invoice duplication
        };

        handleFormChange({
            target: {
                name: "dynamicdisc",
                value: disc,
            }
        })

        if (excelContent?.length === 0) {
            // credit days function

            const getFutureDate = (curDate, fuDay) => {
                const tempDate = new Date(curDate);
                tempDate.setDate(tempDate.getDate() + fuDay);
                return tempDate;
            };

            const futureCreditDay = dateToFormattedString(
                getFutureDate(formData?.invoiceDate, formData?.creditDays)
            );

            tempContent.bill_ref_due_date = futureCreditDay;
        }

        const repetitionModal = (value) => {

            if (isNaN(value)) { //  when user clears all the value it will go back to default.

                console.log("RESET")

                tempContent.repetition = parseInt(formData.quantity);
            } else {

                tempContent.repetition = value;
            }


        }

        const modalConfirmedAdd = () => {

            setExcelContent((prevArray) => [...prevArray, tempContent]);

            // * saving the data to localStorage
            storeNotDownload(tempContent);

            // * show the modal
            handleModal("Success ✅", "Data Written Successfully!", "Okay");
            window.purchase_modal_1.showModal();

            // * check if price need to be updated

            isMrpMismatched(formData?.selectedItemRow, formData?.mrp);
            isDynamicdiscMissMatched(formData?.selectedItemRow, disc);

            // * clearing some fields

            // setQrResult("...");

            handleFormChange({
                target: {
                    name: "itemPartNo",
                    value: null,
                },
            });

            handleFormChange({
                target: {
                    name: "dynamicdisc",
                    value: null,
                }
            });


            handleFormChange({
                target: {
                    name: "quantity",
                    value: null,
                },
            });
            handleFormChange({
                target: {
                    name: "mrp",
                    value: null,
                },
            });

            if (formData?.gstType !== "Exempt") {
                handleFormChange({
                    target: {
                        name: "gstPercentage",
                        value: null,
                    },
                });
            }

            if (formData?.purchaseType !== "DM") {
                handleFormChange({
                    target: {
                        name: "amount",
                        value: null,
                    },
                });
            }

            // remove 1st item from ExcelJsonInput
            const excelJsonInput = ExcelJsonInput;
            excelJsonInput.shift();
            setExcelJsonInput(excelJsonInput);
            ExcelItemFinder(excelJsonInput);
        };

        const askForConfirmation = (choice) => {



            if (choice === "NO")
                tempContent.repetition = 0


            handleConfirmationModal(
                "Confirmation",
                "Are you sure you want to add this content?",
                "Yes",
                "No",
                [
                    {
                        data: `🎫 Discount: ${disc}%`,
                        style: "text-xl font-bold text-orange-500",
                    },
                    {
                        data: `🗺 Location: ${formData?.itemLocation}`,
                        style: "text-xl font-bold",
                    },
                    {
                        data: `📜 Invoice: ${formData?.invoiceNo}`,
                        style: "text-xl font-bold",
                    },
                    {
                        data: `Party: ${formData?.partyName}`,
                        style: "text-sm",
                    },
                    {
                        data: `Item: ${formData?.itemPartNo}`,
                        style: "text-sm",
                    },
                ],
                modalConfirmedAdd,
                () => { }
            );
            window.purchase_modal_2.showModal();
        }

        const askPrintPreference = () => {
            // Duplication print invoice

            handleConfirmationModal(
                "Print Preference 🖨",
                "Print on the basis of quantity ?",
                "Yes",
                "No",
                [
                    {
                        data: `🎫 Discount: ${disc}%`,
                        style: "text-xl font-bold text-orange-500",
                    },
                    {
                        data: `🗺 Location: ${formData?.itemLocation}`,
                        style: "text-xl font-bold",
                    },
                ],
                askForConfirmation,
                askForConfirmation,
                repetitionModal
            );

            window.print_modal_1.showModal();
        }

        if (isDuplicate(tempContent)) {
            handleConfirmationModal(
                "Duplicate ❓",
                "The item is already added. Do you want to add again?",
                "Yes",
                "No",
                [
                    {
                        data: `🎫 Discount: ${disc}%`,
                        style: "text-xl font-bold text-red-500",
                    },
                    {
                        data: `🗺 Location: ${formData?.itemLocation}`,
                        style: "text-xl font-bold",
                    },
                    {
                        data: `📜 Invoice: ${formData?.invoiceNo}`,
                        style: "text-xl font-bold",
                    },
                    {
                        data: `Party: ${formData?.partyName}`,
                        style: "text-sm",
                    },
                    {
                        data: `Item: ${formData?.itemPartNo}`,
                        style: "text-sm",
                    },
                ],
                askPrintPreference,
                () => { }
            );
            window.purchase_modal_2.showModal();
        } else {

            askPrintPreference();


        }
    };

    // * create Excel file

    const createSheet = () => {
        if (excelContent.length === 0) {
            handleModal(
                "⚠ Empty",
                "The file is empty. Add one item before generating excel file.",
                "Okay"
            );
            window.purchase_modal_1.showModal();
            return;
        }
        // empty variable to restore.

        let content = [];
        let BILL_REF_AMOUNT = 0;

        // do not touch this.
        excelContent.forEach((e) => {
            content.push(e);
            BILL_REF_AMOUNT += e?.amount;
        });
        content[0].BILL_REF_AMOUNT = Math.round(BILL_REF_AMOUNT);

        let data = [
            {
                sheet: "Sheet1",
                columns: [
                    { label: "BILL SERIES", value: "billSeries" },
                    { label: "BILL DATE", value: "billDate" },
                    { label: "Purc Type", value: "purchaseType" },
                    { label: "PARTY NAME", value: "partyName" },
                    { label: "ITC ELIGIBILITY", value: "eligibility" },
                    { label: "NARRATION", value: "invoiceNo" },
                    { label: "ITEM NAME", value: "itemName" },
                    { label: "QTY", value: "quantity", format: "0" },
                    { label: "Unit", value: "unit" },
                    { label: "PRICE", value: "mrp", format: "0.00" },
                    { label: "DISC%", value: "disc", format: "0.00" },
                    { label: "Amount", value: "amount", format: "0.00" },
                    { label: "CGST", value: "cgst", format: "0" },
                    { label: "SGST", value: "sgst", format: "0" },

                    { label: "BILL_REF", value: "invoiceNo" },
                    {
                        label: "BILL_REF_AMOUNT", // * total amount
                        value: "BILL_REF_AMOUNT",
                        format: "0",
                    },
                    {
                        label: "BILL_REF_DUE_DATE", // * credit days with current days
                        value: "bill_ref_due_date",
                    },
                ],
                content,
            },
        ];

        // console.log(data);

        if (formData?.isIGST) {

            data[0].columns = data[0].columns.filter(col => col.value !== "cgst" && col.value !== "sgst");
            data[0].columns.push({
                label: "IGST PERCENT",
                value: "igstPercent",
                format: "0",
            });

            data[0].content.forEach((e, index) => {
                data[0].content[index].igstPercent = parseInt(e?.sgst + e?.cgst);
                data[0].content[index].disc = IGSTnewDiscPercentage(e?.disc, e?.igstPercent);
                data[0].content[index].amount = IGSTnewAmount(e?.mrp, e?.disc, parseInt(e?.quantity), e?.igstPercent);
                data[0].content[index].purchaseType = "IGST"
            });



            // console.log(data[0])

        }

        // Barcode Data

        let barcodeContent = [];

        for (let index = 0; index < content.length; index++) {


            // format of disc: 10.65 -> 11, combine with today date to make it unique - 11100124
            // Get current date
            const currentDate = new Date(content[index]?.originDate);
            const day = currentDate.getDate().toString().padStart(2, '0');
            const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
            const year = currentDate.getFullYear().toString().slice(-2);

            // Given disc value
            const disc = content[index]?.disc;

            // Round off the disc value
            const roundedDisc = Math.round(disc);

            // Format the output
            const output = `${roundedDisc}${day}${month}${year}`;


            const tempObj = {
                itemName: content[index]?.itemPartNo === "N/A" ? content[index]?.itemName : content[index]?.itemPartNo,
                discCode: output,
                location: content[index]?.itemLocation || "N/A",
                // orgName: "Jyeshtha Motors",
                coupon: "",
            }

            for (let j = 0; j < content[index].repetition; j++) {
                barcodeContent.push(tempObj);
            }
        }

        console.log("CONTENT", content, "BARCODE", barcodeContent)



        let barcodeData = [
            {
                sheet: "Sheet1",
                columns: [
                    // { label: "Org Name", value: "orgName" },
                    { label: "Item Name", value: "itemName" },
                    { label: "Disc Code", value: "discCode" },
                    { label: "Location", value: "location" },
                    { label: "Coupon", value: "coupon" },

                ],
                content: barcodeContent,
            },
        ];


        DownloadExcel(content[0]?.partyName, content[0]?.invoiceNo, data);
        DownloadBarcodeExcel(content[0]?.invoiceNo, barcodeData);
    };

    // * download the excel file

    const DownloadExcel = (fileName, invoice, data) => {
        const settings = {
            fileName: `${fileName}-${invoice?.split("-")[1] || invoice}`,
            extraLength: 3,
            writeMode: "writeFile",
            writeOptions: {},
            RTL: false,
        };
        let callback = function () {
            // * send the document to purchase history
            sendPurchaseHistory(fileName, invoice, data);
            // * clear the localStorage
            clearLocalStorage("PURCHASE_NOT_DOWNLOAD_DATA");
        };
        xlsx(data, settings, callback);
    };

    const DownloadBarcodeExcel = (invoice, data) => {

        const settings = {
            fileName: `BARCODE-${invoice?.split("-")?.[1] || invoice}`,
            extraLength: 3,
            writeMode: "writeFile",
            writeOptions: {},
            RTL: false,
        };
        let callback = function () {

        };
        xlsx(data, settings, callback);
    };

    // * upload the document to history

    const sendPurchaseHistory = (partyname, invoice, sheet) => {
        handleModal(
            "⏳ Uploading...",
            "Please wait while we upload your document...",
            "Okay"
        );
        window.purchase_modal_1.showModal();

        const payload = {
            sheetdata: JSON.stringify(sheet),
            items: sheet[0]?.content?.length,
            invoice,
            partyname,
            desc: "purchase",
        };

        const options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        };

        fetch("/api/purchases", options)
            .then((response) => {
                if (response.status === 200) {
                    // ? show modal
                    handleModal("Uploaded ✔", "The document has been uploaded", "Okay");
                    window.purchase_modal_1.showModal();
                    const isApp = JSON.parse(localStorage.getItem("SETTINGS_isApp") || false);
                    if (isApp) {
                        router.push("/history/purchase/share/latest?download=1");
                    }
                } else {
                    handleModal(
                        "Uploaded Failed ❌",
                        "Kindly re-download the document",
                        "Okay"
                    );
                    window.purchase_modal_1.showModal();
                }
            })
            .catch((err) => {
                handleModal(
                    "Uploaded Failed ❌",
                    "Kindly re-download the document",
                    "Okay"
                );
                window.purchase_modal_1.showModal();
            });
    };

    // * update the mrp field if any changes happened in the mrp field.

    const isMrpMismatched = (row, newMrp) => {
        // Find the object with the specified row number
        var obj = itemData.find(function (o) {
            return o.row == row;
        });

        // Check if the object was found and if the new MRP value is different from the previous MRP value
        if (obj && obj.mrp != newMrp) {
            updateMrp(row, newMrp);
        }
    };
    const updateMrp = async (row, mrp) => {
        const payload = {
            updateRow: parseInt(row) + 2,
            mrp,
        };

        try {
            const response = await uploadItem(payload);

            if (response === "200") {
                console.log("MRP UPDATED");
            } else {
                console.log("MRP NOT UPDATED");
            }
        } catch (error) {
            console.log(error);
        }
    };
    const isDynamicdiscMissMatched = (row, newDynamicdisc) => {

        // console.log("row", row, "newDynamicdisc", newDynamicdisc)
        // Find the object with the specified row number
        var obj = itemData.find(function (o) {
            return o.row == row;
        });

        // Check if the object was found and if the new MRP value is different from the previous MRP value
        if (obj && obj.dynamicdisc != newDynamicdisc) {
            updateDynamicdisc(row, newDynamicdisc);
        }
    }

    const updateDynamicdisc = async (row, dynamicdisc) => {
        const payload = {
            updateRow: parseInt(row) + 2,
            dynamicdisc,
        };

        try {
            const response = await uploadItem(payload);

            if (response === "200") {
                console.log("DYNAMIC DISCOUNT UPDATED");
            } else {
                console.log("DYNAMIC DISCOUNT NOT UPDATED");
            }
        } catch (error) {
            console.log(error);
        }
    }

    // Excel input handle and other dynamic functions

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
            console.log(transformedData)
            toast.success('File processed successfully');
            toast.dismiss(loading);
            ExcelItemFinder(transformedData)
        }

    }



    const handleFinalCalculation = () => {

        const gstType = formData?.gstType;
        const dynamicdisc = formData?.dynamicdisc;
        const totalAmount = formData.amount;
        const quantity = formData.quantity;
        const gstPercentage = formData.gstPercentage;

        if (!gstType || !totalAmount || !quantity || !gstPercentage) {
            toast.error('Please fill the required fields');
            return;
        }

        if (dynamicdisc) {

            console.log("GST TYPE", gstType)

            if (gstType === "Exclusive") {
                const mrp = getMRPExclusive(Number(totalAmount), Number(quantity), Number(dynamicdisc), Number(gstPercentage?.replace("%", "")));
                console.log("MRP", mrp)
                handleFormChange({
                    target: {
                        name: "mrp",
                        value: mrp
                    }
                })
            } else {
                const mrp = getMRPInclusiveExempt(Number(totalAmount), Number(quantity), Number(dynamicdisc));
                console.log("MRP", mrp)
                handleFormChange({
                    target: {
                        name: "mrp",
                        value: mrp
                    }
                })
            }



        } else {

        }
    }

    // const convertExcelJSON = (excelData) => {
    //     // Input array of objects
    //     const test = excelData

    //     console.log("TEST", test)

    //     // Function to transform the array of objects
    //     function transformArray(inputArray, keys) {
    //         const outputArray = [];

    //         // Create the first object dynamically based on the specified keys
    //         const firstObject = {};
    //         const arrKeys = Object.keys(test[0])
    //         firstObject[keys[0]] = arrKeys[0]
    //         firstObject[keys[1]] = arrKeys[1]
    //         firstObject[keys[2]] = arrKeys[2]

    //         outputArray.push(firstObject);

    //         inputArray.forEach(obj => {
    //             const newObj = {};

    //             let isEmptyRow = false;

    //             Object.keys(obj).forEach((key, index) => {
    //                 console.log("Index", index)
    //                 const strObj = String(obj[key]).trim();
    //                 console.log("Obj Key", obj[key])
    //                 if (strObj == "") {
    //                     isEmptyRow = true;
    //                     return; // Exit the loop if any field is empty
    //                 }
    //                 // Assign the value to the corresponding label dynamically based on the keys array
    //                 const label = keys[index]; // Assuming keys start from 1
    //                 newObj[label] = strObj;
    //             });

    //             if (!isEmptyRow) {
    //                 outputArray.push(newObj);
    //             }
    //         });

    //         return outputArray;
    //     }

    //     // Define the keys array
    //     const keys = ["Qty", "Tot Amt", "A"];

    //     // Transform the array
    //     const transformedArray = transformArray(test, keys);

    //     // Output the transformed array
    //     return (transformedArray);

    // }
    return (
        <>
            <Toaster />
            <dialog id="purchase_modal_1" className="modal">
                <form method="dialog" className="modal-box">
                    <h3 className="font-bold text-lg">{modalMessage?.title}</h3>
                    <p className="py-4">{modalMessage?.message}</p>
                    <div className="modal-action">
                        {/* if there is a button in form, it will close the modal */}
                        <button className="btn">{modalMessage?.button}</button>
                    </div>
                </form>
            </dialog>

            <dialog id="purchase_modal_2" className="modal">
                <form method="dialog" className="modal-box">
                    <h3 className="font-bold text-lg">{modalConfirmation?.title}</h3>
                    <p className="py-4">{modalConfirmation?.message}</p>
                    {
                        // * if there is a message array, it will show the message
                        modalConfirmation?.messages?.map((e, i) => {
                            return (
                                <p key={i} className={[`${e?.style} text-teal-700`]}>
                                    {e?.data}
                                </p>
                            );
                        })
                    }
                    <div className="modal-action">
                        {/* if there is a button in form, it will close the modal */}
                        <button
                            onClick={() => modalConfirmation?.btn_f_1("Hello")}
                            className="btn"
                        >
                            {modalConfirmation?.button_1}
                        </button>
                        <button
                            onClick={() => modalConfirmation?.btn_f_2("Hii")}
                            className="btn"
                        >
                            {modalConfirmation?.button_2}
                        </button>
                    </div>
                </form>
            </dialog>

            <dialog id="print_modal_1" className="modal">
                <form method="dialog" className="modal-box">
                    <h3 className="font-bold text-lg">{modalConfirmation?.title}</h3>
                    <p className="py-4">{modalConfirmation?.message}</p>
                    {
                        // * if there is a message array, it will show the message
                        modalConfirmation?.messages?.map((e, i) => {
                            return (
                                <p key={i} className={[`${e?.style} text-teal-700`]}>
                                    {e?.data}
                                </p>
                            );
                        })
                    }
                    <label className="text-yellow-300">Quantity</label>
                    <input onWheel={(e) => {
                        e.target.blur();
                    }} className="input input-bordered input-secondary m-5 uppercase w-[295px]" placeholder={`No. of prints ${formData?.quantity}`} type="number" name="repetitionPrint" onChange={(e) => {
                        modalConfirmation.norm_f_3(parseInt(e.target.value));
                    }} />
                    <div className="modal-action">
                        {/* if there is a button in form, it will close the modal */}
                        <button
                            onClick={() => modalConfirmation?.btn_f_1("YES")}
                            className="btn"
                        >
                            {modalConfirmation?.button_1}
                        </button>
                        <button
                            onClick={() => modalConfirmation?.btn_f_2("NO")}
                            className="btn"
                        >
                            {modalConfirmation?.button_2}
                        </button>
                    </div>
                </form>
            </dialog>

            {/* Excel Input */}

            <p className="text-center text-xl glass m-5 p-4">DYNAMIC PURCHASE MODULE</p>


            <div className='m-auto text-center'>
                {
                    !loadingExcel && ExcelJsonInput.length === 0 ? <input name='own' id='excelData' onChange={handleExcelFileInput} accept='application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' type="file" title='Your Excel File' className="file-input file-input-bordered file-input-warning w-full max-w-xs" /> : null
                }

                {
                    loadingExcel && <span className="loading loading-lg"></span>
                }

            </div>



            {
                ExcelJsonInput.length > 0 &&
                <div className='flex border flex-wrap space-x-2 justify-center m-5'>

                    {
                        ExcelJsonInput.map((item, index) => {
                            return <div title={`Quantity: ${item["B"]}, Total Amount: ${item["C"]}`} key={index}>
                                <p className={["p-1 m-1 rounded-sm", index === 0 ? "animate-pulse bg-amber-500" : "bg-purple-500 "].join(" ")}>{ExcelJsonInput.length - index}: {item['A']}</p>
                            </div>
                        })
                    }
                </div>

            }



            <div className={[ExcelJsonInput.length == 0 && "hidden"].join(" ")}>
                <div className="text-center m-auto">
                    {loadingExcel && (
                        <span className="loading loading-infinity w-[80px] text-sky-500"></span>
                    )}

                    <div className="m-5 flex justify-between flex-col">
                        {partyData?.length > 0 && (
                            <Select
                                filterOption={createFilter({ ignoreAccents: false })}
                                components={{ Option: CustomOption, MenuList: CustomMenuList }}
                                placeholder="PARTY NAME"
                                className="w-full m-auto p-5 text-blue-800 font-bold"
                                getOptionLabel={(option) => `${option["value"]}`}
                                options={partyData}
                                value={
                                    formData?.partyName && {
                                        value: formData.partyName,
                                        creditDays: formData?.creditDays,
                                    }
                                }
                                onChange={(e) => {
                                    handleFormChange({
                                        target: { name: "partyName", value: e?.value },
                                    });
                                    handleFormChange({
                                        target: {
                                            name: "creditDays",
                                            value:
                                                isNaN(e?.creditDays) || e?.creditDays === ""
                                                    ? 0
                                                    : e?.creditDays,
                                        },
                                    });
                                    localStorage.setItem("US_PN_REFERER", e?.value);
                                }}
                                noOptionsMessage={() => {
                                    return (
                                        <p
                                            onClick={() => router.push("/party")}
                                            className="hover:cursor-pointer"
                                        >
                                            ➕ Add Party
                                        </p>
                                    );
                                }}
                            />
                        )}

                        <div className="flex justify-center items-center flex-wrap">
                            {!loadingExcel && (
                                <input
                                    placeholder="Invoice No"
                                    className="input input-bordered input-secondary m-5 uppercase w-[295px]"
                                    type="text"
                                    disabled={excelContent?.length > 0}
                                    value={formData?.invoiceNo || ""}
                                    onChange={(e) => {
                                        handleFormChange({
                                            target: {
                                                name: "invoiceNo",
                                                value: e.target.value?.toUpperCase(),
                                            },
                                        });
                                        localStorage.setItem(
                                            "US_INV_REFERER",
                                            e.target.value?.toUpperCase()
                                        );
                                    }}
                                />
                            )}

                            <DatePicker
                                className="input input-bordered input-secondary w-[295px] m-5 hover:cursor-pointer"
                                placeholderText="INVOICE DATE"
                                showPopperArrow={true}
                                maxDate={new Date()}
                                todayButton="Today"
                                dateFormat="dd/MM/yyyy"
                                selected={formData?.invoiceDate ?? new Date()}
                                onChange={(selectedDate) => {
                                    handleFormChange({
                                        target: {
                                            name: "invoiceDate",
                                            value: selectedDate,
                                        },
                                    });
                                    localStorage.setItem("US_INV_DATE", selectedDate);
                                }}
                            />
                        </div>

                        {!loadingExcel && (
                            <Select
                                placeholder="GST Type"
                                isSearchable={false}
                                className="w-full m-auto p-5 text-blue-800 font-bold"
                                options={gstType}
                                getOptionLabel={(option) => `${option["value"]}`}
                                value={formData?.gstType && { value: formData.gstType }}
                                onChange={(e) => {
                                    if (e?.value === "Exempt") {
                                        handleFormChange({
                                            target: {
                                                name: "gstPercentage",
                                                value: 0,
                                            },
                                        });
                                    }
                                    handleFormChange({
                                        target: { name: "gstType", value: e.value },
                                    });
                                    // ExcelItemFinder(ExcelJsonInput);
                                }}
                            />
                        )}
                        {!loadingExcel && (
                            <div>
                                <Select
                                    placeholder="PURCHASE TYPE"
                                    className="w-full m-auto p-5 text-blue-800 font-bold"
                                    isSearchable={false}
                                    options={purchasetype}
                                    onChange={(e) => {
                                        if (e?.value === "DM") {
                                            // * whenever the purchase type is DM, the amount field will be hidden & zero.
                                            handleFormChange({
                                                target: {
                                                    name: "amount",
                                                    value: 0,
                                                },
                                            });
                                        }
                                        handleFormChange({
                                            target: { name: "purchaseType", value: e.value },
                                        });
                                    }}
                                    value={
                                        formData?.purchaseType && {
                                            label: `${formData?.purchaseType === "DNM"
                                                ? "Discount Not Mentioned"
                                                : "Discount Mentioned"
                                                }`,
                                            value: formData.purchaseType,
                                        }
                                    }
                                    defaultValue={{ label: "Discount Not Mentioned", value: "DNM" }}
                                    isClearable={false}
                                />
                                {/* IGST Purchase Type */}
                                <Select
                                    placeholder="PURCHASE TYPE (IGST) ?"
                                    className="w-full m-auto p-5 text-blue-800 font-bold"
                                    isSearchable={false}
                                    options={choiceIGST}
                                    onChange={(e) => {
                                        // alert("This is under development.");
                                        // return;
                                        handleFormChange({
                                            target: {
                                                name: "isIGST",
                                                value: e?.value,
                                            },
                                        });
                                    }}
                                    value={{
                                        label: formData?.isIGST ? "Choose IGST? (YES)" : "Choose IGST? (NO)",
                                        value: formData?.isIGST
                                    }}
                                    defaultValue={{ label: "Choose IGST? (NO)", value: "NO" }}
                                    isClearable={false}
                                />
                                <input
                                    hidden={formData?.purchaseType === "DNM"}
                                    value={formData?.mDiscPercentage || ""}
                                    onChange={(e) => {
                                        handleFormChange({
                                            target: {
                                                name: "mDiscPercentage",
                                                value: e.target.value,
                                            },
                                        });
                                    }}
                                    className="input input-bordered input-secondary w-[295px] m-5"
                                    placeholder="MENTIONED DISC %"
                                    type="number"
                                    onWheel={(e) => {
                                        e.target.blur();
                                    }}
                                />
                            </div>
                        )}
                        {/* <form className="animate-pulse" onSubmit={(e) => { e.preventDefault(); barCodeScanner() }}>
                            <input value={barcodeScannedData || ""} onFocus={(e) => {
                                e.target.value = "";
                                setBarcodeScannedData("");
                                blur()
                            }} type="text" placeholder="BARCODE SCAN 🔎" onChange={(e) => { setBarcodeScannedData(e.target.value) }} className="m-5 p-5 glass rounded-sm w-[295px] text-center" />
                        </form>
                        <p className="text-center m-5 glass rounded-sm">{qrResult}</p> */}

                        {itemData?.length > 0 && (
                            <Select
                                filterOption={createFilter({ ignoreAccents: false })}
                                components={{ Option: CustomOption, MenuList: CustomMenuList }}
                                placeholder="ITEM / PART NO."
                                className="w-full m-auto p-5 text-blue-800 font-bold"
                                options={itemData}
                                value={
                                    formData?.itemPartNo && {
                                        value: formData.itemPartNo,
                                        loc: formData?.itemLocation,
                                        gst: formData?.gstPercentage,
                                        // mrp: formData?.mrp, // We will generate it in this page.
                                    }
                                }
                                onChange={(e) => {
                                    handleFormChange({
                                        target: { name: "itemPartNo", value: e.value },
                                    });
                                    handleFormChange({
                                        target: { name: "itemPartNoOrg", value: e?.pn || "N/A" },
                                    });
                                    handleFormChange({
                                        target: {
                                            name: "itemLocation",
                                            value: e?.loc || "N/A",
                                        },
                                    });

                                    // handleFormChange({
                                    //     target: {
                                    //         name: "mrp",
                                    //         value: isNaN(e?.mrp) || e?.mrp === "" ? null : e?.mrp, // * if mrp is not a number, then it will be null
                                    //     },
                                    // });

                                    handleFormChange({
                                        target: {
                                            name: "selectedItemRow",
                                            value: e?.row,
                                        },
                                    });

                                    if (formData?.gstType !== "Exempt") {
                                        // * if gst type is exempt, then it will not change the gst percentage
                                        handleFormChange({
                                            target: {
                                                name: "gstPercentage",
                                                value:
                                                    isNaN(e?.gst) || e?.gst === "" ? null : `${e?.gst}%`,
                                            },
                                        });
                                    }

                                    if (e?.dynamicdisc) {
                                        handleFormChange({
                                            target: {
                                                name: "dynamicdisc",
                                                value:
                                                    isNaN(e?.dynamicdisc) || e?.dynamicdisc === "" ? null : Number(e?.dynamicdisc),
                                            },
                                        });
                                    }

                                    handleFormChange({
                                        target: { name: "quantity", value: parseInt(ExcelJsonInput[0]["B"]) },
                                    });

                                }}
                                getOptionLabel={(option) =>
                                    `${option["value"]} ${option["pn"] || ""}`
                                }
                                noOptionsMessage={() => {
                                    return (
                                        <p
                                            onClick={() => {
                                                // saveStateField(); // * saving the state of fields , fix: back button press from new item page.
                                                // router.push("/purchase/item");
                                            }}
                                            className="hover:cursor-pointer"
                                        >
                                            No item found
                                        </p>
                                    );
                                }}
                            />
                        )}

                        {!loadingExcel && (
                            <Select
                                isDisabled={formData?.gstType === "Exempt"}
                                placeholder="GST %"
                                isSearchable={false}
                                className="w-full m-auto p-5 text-blue-800 font-bold"
                                options={gstAmount}
                                getOptionLabel={(option) => `${option["value"]}`}
                                value={
                                    formData?.gstPercentage && { value: formData.gstPercentage }
                                }
                                onChange={(e) => {
                                    handleFormChange({
                                        target: { name: "gstPercentage", value: e.value },
                                    });
                                }}
                            />
                        )}


                        {/* This is the final fields that should be calculated */}
                        <div className="border mb-5">
                            <input
                                onChange={(e) => {
                                    handleFormChange({
                                        target: { name: "quantity", value: e.target.value },
                                    });



                                    if (formData?.dynamicdisc && !isNaN(formData?.dynamicdisc)) {


                                        let unitPrice = 0;

                                        alert("NEW FUNCTION CALLED")

                                        if (formData?.gstType === "Exclusive") {
                                            // unitPrice = unitPriceCalcExclDISC(formData?.mrp, formData?.dynamicdisc, formData?.gstPercentage?.replace("%", ""));

                                        } else {
                                            // unitPrice = unitPriceCalcEXemptInclDISC(formData?.mrp, formData?.dynamicdisc);
                                        }

                                        // Dynamic : This need to delete ig
                                        // handleFormChange({
                                        //     target: {
                                        //         name: "amount",
                                        //         value: unitPrice * e.target.value,
                                        //     },
                                        // })
                                    }
                                }}
                                className="input input-bordered input-secondary w-[295px] m-5"
                                placeholder="Quantity"
                                type="number"
                                onWheel={(e) => {
                                    e.target.blur();
                                }}
                                value={formData?.quantity || ""}
                            />
                            <input
                                onChange={(e) => {
                                    handleFormChange({
                                        target: { name: "mrp", value: e.target.value },
                                    });
                                }}
                                value={formData?.mrp || ""}
                                className="input input-bordered input-secondary w-[295px] m-5"
                                placeholder="MRP"
                                type="number"
                                onWheel={(e) => {
                                    e.target.blur();
                                }}
                            />

                            <input
                                onChange={(e) => {
                                    handleFormChange({
                                        target: { name: "amount", value: e.target.value },
                                    });
                                }}
                                value={formData?.amount || ""}
                                className={["input input-bordered  w-[295px] m-5", formData?.dynamicdisc !== "N/A" ? "input-primary" : "input-secondary"].join(" ")}
                                placeholder="Total Amount"
                                type="number"
                                hidden={formData?.purchaseType === "DM"}
                                onWheel={(e) => {
                                    e.target.blur();
                                }}
                            />

                            {
                                <p>SAVED DISC%: {formData?.dynamicdisc ?? "N/A"}</p>
                            }

                            <br />
                        </div>

                        <div>
                            {
                                formData?.dynamicdisc && <button onClick={handleFinalCalculation} className="bg-blue-500 w-[295px] p-2 rounded-md">Calculate</button>
                            }

                        </div>


                    </div>


                </div>
            </div>






            <div className="py-20"></div>
            {/* Bottom Nav Bar */}
            <div className="btm-nav glass bg-blue-800">
                <button
                    onClick={() => {
                        createSheet();
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
                    <span className="mb-6 text-xl font-mono">Download</span>
                </button>
                <button
                    onClick={() => {
                        // handleFinalCalculation();
                        if (isFormValidated(formData)) {
                            addSingleFormContent();
                        }
                    }}
                    className="text-white hover:bg-blue-900"
                >
                    <Image
                        className="mb-20"
                        src="/assets/images/add-button.png"
                        width={70}
                        height={70}
                        alt="icon"
                    ></Image>
                </button>
                <button
                    onClick={() => {
                        clearLocalStorage("PURCHASE_NOT_DOWNLOAD_DATA");
                        window.location.href = "/purchase/dynamic";
                    }}
                    className="text-white hover:bg-blue-900"
                >
                    <Image
                        src="/assets/images/remove.png"
                        width={50}
                        height={50}
                        alt="icon"
                    ></Image>
                    <span className="mb-6 text-xl font-mono">Reset</span>
                </button>
            </div>
        </>
    );
}