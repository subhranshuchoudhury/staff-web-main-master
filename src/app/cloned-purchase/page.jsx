"use client";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import xlsx from "json-as-xlsx";
import { useState, useEffect } from "react";
import Select, { createFilter } from "react-select";
import gstAmount from "../DB/Purchase/gstamount";
import gstType from "../DB/Purchase/gsttype";
import {
    InclusiveCalc,
    ExclusiveCalc,
    ExemptCalc,
    TotalAmountCalc,
    exclusiveDM,
    IGSTnewAmount,
    IGSTnewDiscPercentage,
    unitPriceCalcExclDISC,
    unitPriceCalcEXemptInclDISC,
} from "../Disc/disc";
import Image from "next/image";
import CustomOption from "../Dropdown/CustomOption";
import CustomMenuList from "../Dropdown/CustomMenuList";
import { useRouter } from "next/navigation";
import purchasetype from "../DB/Purchase/purchasetype";
import toast, { Toaster } from "react-hot-toast";
import { choiceIGST } from "../DB/Purchase/choice";
import dateToFormattedString from "@/utils/dateFormatter";
import purchaseBillFormat from "@/utils/purchase-bill-format";
import purchaseBarcodeFormat from "@/utils/purchase-barcode-format";

export default function page(props) {
    const router = useRouter();

    useEffect(() => {
        getItemsData();
    }, []);


    const [loadingExcel, setLoadingExcel] = useState(true); 
    const [excelContent, setExcelContent] = useState([]);
    const [partyData, setPartyData] = useState([]);
    const [itemData, setItemData] = useState([]);
    const [qrResult, setQrResult] = useState("");
    const [barcodeScannedData, setBarcodeScannedData] = useState(null);
    const [formData, setFormData] = useState({
        partyName: null,
        invoiceNo: null,
        invoiceDate: new Date(), // default date is today
        gstType: null,
        unit: "Pcs", // default value
        purchaseType: "DNM",
        mDiscPercentage: 0, // mention discount percentage
        itemName: null,
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


    const handleFormChange = (event) => {
        const name = event.target?.name;
        const value = event.target?.value;
        setFormData((values) => ({ ...values, [name]: value }));
    };

    // * save the current state: (date, gstType, DNM)

    const saveStateField = () => {
        const tempObj = {
            partyName: formData?.partyName,
            invoiceNo: formData?.invoiceNo,
            invoiceDate: formData?.invoiceDate,
            gstType: formData?.gstType,
            purchasetype: formData?.purchaseType,
            mDiscPercentage: formData?.mDiscPercentage,
        };

        localStorage.setItem("US_STATE_PURCHASE", JSON.stringify(tempObj));
    };

   


    const getItemsData = async () => {
        

        checkLocalStorageSaved("PARTY_API_DATA", setPartyData);
        checkLocalStorageSaved("ITEM_API_DATA", setItemData);

        Promise.all([
            fetch(
                "/api/items"
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

                console.log("Item Data",item_data)


            
                setItemData(item_data);
                setPartyData(party_data);

                setLoadingExcel(false);

                localStorage.setItem("PARTY_API_DATA", JSON.stringify(party_data));
                localStorage.setItem("ITEM_API_DATA", JSON.stringify(item_data));
            })
            .catch((error) => {
                setLoadingExcel(true);
                console.error(error);
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
            itemName: formData?.itemName,
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
            handleModal("Success ✅", "Content Added Successfully!", "Okay");
            window.purchase_modal_1.showModal();

            
            // * clearing some fields

            setQrResult("...");

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
                columns: purchaseBillFormat,
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



            

        }

        // Barcode Invoice Generation

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
                columns: purchaseBarcodeFormat,
                content: barcodeContent,
            },
        ];


        DownloadExcel(content[0]?.partyName, content[0]?.invoiceNo, data, barcodeData);
        DownloadBarcodeExcel(content[0]?.invoiceNo, barcodeData);
    };

    // * download the excel file

    const DownloadExcel = (fileName, invoice, data, barcodeData) => {
        const settings = {
            fileName: `${fileName}-${invoice?.split("-")[1] || invoice}`,
            extraLength: 3,
            writeMode: "writeFile",
            writeOptions: {},
            RTL: false,
        };
        let callback = function () {
            // * send the document to purchase history
            sendPurchaseHistory(fileName, invoice, data, barcodeData);
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

    const sendPurchaseHistory = (partyname, invoice, sheet, barcodeSheet) => {
        console.log("Barcode Data", barcodeSheet)
        console.log("Sheet Data", sheet)
        handleModal(
            "⏳ Uploading...",
            "Please wait while we upload your document...",
            "Okay"
        );
        window.purchase_modal_1.showModal();

        const payload = {
            sheetdata: JSON.stringify(sheet),
            barcodedata: JSON.stringify(barcodeSheet),
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



            <p className="text-center text-2xl glass m-5 p-4">PURCHASE MODULE</p>
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
                    <form className="animate-pulse" onSubmit={(e) => { e.preventDefault(); barCodeScanner() }}>
                        <input value={barcodeScannedData || ""} onFocus={(e) => {
                            e.target.value = "";
                            setBarcodeScannedData("");
                            blur()
                        }} type="text" placeholder="BARCODE SCAN 🔎" onChange={(e) => { setBarcodeScannedData(e.target.value) }} className="m-5 p-5 glass rounded-sm w-[295px] text-center" />
                    </form>
                    <p className="text-center m-5 glass rounded-sm">{qrResult}</p>

                    {itemData?.length > 0 && (
                        <Select
                            filterOption={createFilter({ ignoreAccents: false })}
                            components={{ Option: CustomOption, MenuList: CustomMenuList }}
                            placeholder="ITEM / PART NO."
                            className="w-full m-auto p-5 text-blue-800 font-bold"
                            options={itemData}
                            value={
                                formData?.itemName && {
                                    itemName: formData.itemName,
                                    storageLocation: formData?.itemLocation,
                                    gstPercentage: formData?.gstPercentage,
                                    unitName: formData?.unit
                                }
                            }
                            onChange={(e) => {
                                handleFormChange({
                                    target: { name: "itemName", value: e.itemName },
                                });
                                handleFormChange({
                                    target: { name: "unit", value: e?.unitName }
                                })
                                handleFormChange({
                                    target: { name: "itemPartNoOrg", value: e.partNumber },
                                });
                                handleFormChange({
                                    target: {
                                        name: "itemLocation",
                                        value: e?.storageLocation || "Not Available",
                                    },
                                });

                               

                                if (formData?.gstType !== "Exempt") {
                                    // * if gst type is exempt, then it will not change the gst percentage
                                    handleFormChange({
                                        target: {
                                            name: "gstPercentage",
                                            value:
                                                isNaN(e?.gstPercentage) || e?.gstPercentage === "" ? null : `${e?.gstPercentage}%`,
                                        },
                                    });
                                }

                                
                            }}
                            getOptionLabel={(option) =>
                                `${option["itemName"]} ${option["partNumber"]}`
                            }
                            formatOptionLabel={
                                ({ itemName }) => (
                                    <div className="flex justify-between">
                                        <p className="text-black">{itemName}</p>
                                    </div>
                                )
                            }
                            noOptionsMessage={() => {
                                return (
                                    <p
                                        onClick={() => {
                                            alert("Developer: A popup will come here.")
                                        }}
                                        className="hover:cursor-pointer"
                                    >
                                        ➕ Add An Item
                                    </p>
                                );
                            }}
                        />
                    )}



                    <div>
                        <input
                            onChange={(e) => {
                                handleFormChange({
                                    target: { name: "quantity", value: e.target.value },
                                });
                                if (formData?.dynamicdisc && !isNaN(formData?.dynamicdisc)) {


                                    let unitPrice = 0;

                                    if (formData?.gstType === "Exclusive") {
                                        unitPrice = unitPriceCalcExclDISC(formData?.mrp, formData?.dynamicdisc, formData?.gstPercentage?.replace("%", ""));

                                    } else {
                                        unitPrice = unitPriceCalcEXemptInclDISC(formData?.mrp, formData?.dynamicdisc);
                                    }

                                    handleFormChange({
                                        target: {
                                            name: "amount",
                                            value: unitPrice * e.target.value,
                                        },
                                    })
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
                    </div>

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
                </div>

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
                    <p>RECORDED DISC%: {formData?.dynamicdisc ?? "N/A"}</p>
                }

                <br />
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
                        window.location.href = "/purchase";
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