"use client";
import Select, { createFilter } from "react-select";
import CustomOption from "../../Dropdown/CustomOption";
import CustomMenuList from "../../Dropdown/CustomMenuList";
import {  useState } from "react";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";

import { SimpleIDB } from "@/utils/idb";

const stockIDB = new SimpleIDB("Stock", "stock");

const StockStatus = () => {

  const [items, setItems] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { 
    fetchItems()
  }, [])



  const fetchItems = async () => { 
    console.log('fetching items...')
    setLoading(true)

    const storedData = await stockIDB.get("ITEMS_DATA")
    if(storedData)
    setItems(JSON.parse(storedData))
    try {
      const options = {
        method: 'GET',
        cache: 'no-store',
      }
      const response = await fetch('/api/stock/status', options) // cache no-store to avoid caching
      const data = await response.json()
      if (data?.length > 0) {
        setItems(data)
        await stockIDB.set("ITEMS_DATA", JSON.stringify(data))
      }
    } catch (error) {
      console.log(error)
      
    }finally {
      setLoading(false)
    }
  }

  
  return (
    <>
      <Toaster />
      <p className="text-center text-3xl font-bold">Stock Status</p>
      {
        loading && <div className="text-center mt-5">
          <span className="loading loading-spinner loading-lg text-success"></span>
        </div>
      }
      <div className="flex justify-center mt-16">
        <div className="w-[90%]">
          <div className="bg-base-200 rounded-sm p-5">
            <p className="text-lg text-center mb-5 font-bold">Select Item</p>
            <Select
              placeholder="SELECT ITEM/PART NO"
              className="text-blue-800 font-bold"
              options={items}
              formatOptionLabel={
                ({ itemName }) => (
                  <div className="flex justify-between">
                    <p className="text-black">{itemName}</p>
                  </div>
                )
              }
              
              getOptionLabel={(option) => `${option["itemName"]} ${option["partNumber"]}`}
              onChange={(e) => {
                setSelectedItem(e)
              }
              }
              filterOption={createFilter({ ignoreAccents: false })}
              components={{ Option: CustomOption, MenuList: CustomMenuList }}
              value={selectedItem}
            />
          </div>
          <section className="mt-20 p-2 glass rounded-md">
            <div className="flex justify-between items-center bg-base-100 rounded-md p-5 mt-5">
              <p className="text-lg">Closing Stock</p>
              <p className="text-xl font-bold text-green-400">{
              selectedItem ? selectedItem?.closingStock : 'Select an item'
              }</p>
            </div>
            <div className="flex justify-between items-center bg-base-100 rounded-md p-5 mt-5">
              <p className="text-lg">Location</p>
              <p className="text-xl font-bold text-green-400">{
              selectedItem ? selectedItem?.storageLocation : 'Select an item'
              }</p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default StockStatus;
