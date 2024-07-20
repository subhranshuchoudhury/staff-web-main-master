"use client";
import Select, { createFilter } from "react-select";
import CustomOption from "../../Dropdown/CustomOption";
import CustomMenuList from "../../Dropdown/CustomMenuList";
import { useState } from "react";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { set } from "mongoose";

const StockStatus = () => {
  const [closingStock, setClosingStock] = useState({
    closingStockValue: null,
    location: null
  });

  const [items, setItems] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { 
    fetchItems()
  }, [])



  const fetchItems = async () => { 
    console.log('fetching items...')
    setLoading(true)
    try {
      const response = await fetch('/api/stock/status', { next: { revalidate: 300 },cache:'force-cache' })
      const data = await response.json()
      console.log(data)
      setItems(data)
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
        loading && <p className="text-center text-2xl font-bold mt-5 text-sky-500">Loading...</p>
      }
      <div className="flex justify-center mt-16">
        <div className="w-[90%]">
          <div className="flex justify-between items-center bg-base-200 rounded-sm p-5">
            <p className="text-lg">Item Name</p>
            <Select
              plaaceholder="SELECT ITEM/PART NO"
              className="w-[75%] text-blue-800 font-bold"
              options={items}
              getOptionLabel={(option) => `${option["itemName"]} - ${option["partNumber"]}`}
              onChange={(e) => {
                setSelectedItem(e)
              }
              }
              filterOption={createFilter({ ignoreAccents: false })}
              components={{ Option: CustomOption, MenuList: CustomMenuList }}

            />
          </div>
          <section className="mt-20 p-2 glass rounded-md">
            <div className="flex justify-between items-center bg-base-100 rounded-md p-5 mt-5">
              <p className="text-lg">Closing Stock</p>
              <p className="text-xl font-bold text-green-400">{
              selectedItem ? selectedItem.closingStock : 'Select an item'
              }</p>
            </div>
            <div className="flex justify-between items-center bg-base-100 rounded-md p-5 mt-5">
              <p className="text-lg">Location</p>
              <p className="text-xl font-bold text-green-400">{
              selectedItem ? selectedItem.storageLocation : 'Select an item'
              }</p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default StockStatus;
