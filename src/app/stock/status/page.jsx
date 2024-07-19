"use client";
import Select, { createFilter } from "react-select";
import CustomOption from "../../Dropdown/CustomOption";
import CustomMenuList from "../../Dropdown/CustomMenuList";

const StockStatus = () => {
  const demoAPI = [
    {
      id: 1,
      item: "Item 1",
      value: "Item 1",
      label: "Item 1",
    },
    {
      id: 2,
      item: "Item 2",
      value: "Item 2",
      label: "Item 2",
    },
    {
      id: 3,
      item: "Item 3",
      value: "Item 3",
      label: "Item 3",
    },
  ];
  return (
    <>
      <p className="text-center text-3xl font-bold">Stock Status</p>
      <div className="flex justify-center mt-16">
        <div className="w-[90%]">
          <div className="flex justify-between items-center bg-base-200 rounded-sm p-5">
            <p className="text-lg">Item Name</p>
            <Select
              plaaceholder="SELECT ITEM/PART NO"
              className="w-[75%] text-blue-800 font-bold"
              options={demoAPI}
              getOptionLabel={(option) => `${option["value"]}`}
              onChange={(e) => {}}
              filterOption={createFilter({ ignoreAccents: false })}
              components={{ Option: CustomOption, MenuList: CustomMenuList }}
            />
          </div>
          <section className="mt-20 p-2 glass rounded-md">
            <div className="flex justify-between items-center bg-base-100 rounded-md p-5 mt-5">
              <p className="text-lg">Closing Stock</p>
              <p className="text-xl font-bold text-green-400">1270</p>
            </div>
            <div className="flex justify-between items-center bg-base-100 rounded-md p-5 mt-5">
              <p className="text-lg">Location</p>
              <p className="text-xl font-bold text-green-400">BIN-76F-2024</p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default StockStatus;
