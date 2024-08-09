"use client";
import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

const page = () => {
  useEffect(() => {
    loadData();
  }, []);

  const [addDataModal, setAddDataModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [Data, setData] = useState(null);
  const [formData, setFormData] = useState({
    partyName: "",
    groupName: "",
    value: null,
    docId: "",
    isUpdateModal: false,
  });

  const handleFormChange = (name, value) => {
    if (!name) return;
    setFormData((values) => ({ ...values, [name]: value }));
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/discount-matrix");
      const data = await response.json();
      setData(data);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const addData = async () => {
    if (!formData.groupName || !formData.partyName || !formData.value) {
      return;
    }
    setIsLoading(true);
    try {
      const body = {
        groupName: formData.groupName,
        partyName: formData.partyName,
        value: formData.value,
      };

      const response = await fetch("/api/discount-matrix", {
        method: "POST",
        body: JSON.stringify(body),
        "Content-Type": "application/json",
      });

      if (response.status == 200) {
        clearFormData();
        document.getElementById("matrix_modal").close();
        toast.success("New discount structure has been created");
        loadData();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateData = async () => {
    if (
      !formData.docId ||
      !formData.groupName ||
      !formData.partyName ||
      !formData.value
    ) {
      return;
    }
    setIsLoading(true);

    try {
      let headersList = {
        "Content-Type": "application/json",
      };

      let bodyContent = JSON.stringify({
        id: formData.docId,
        partyName: formData.partyName,
        groupName: formData.groupName,
        value: formData.value,
      });

      let response = await fetch("/api/discount-matrix/id", {
        method: "PATCH",
        body: bodyContent,
        headers: headersList,
      });

      if (response.status === 200) {
        clearFormData();
        document.getElementById("matrix_modal").close();
        toast.success("Record has been updated");
        loadData();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteData = async () => {
    if (!formData.docId) {
      return;
    }
    setIsLoading(true);

    try {
      let headersList = {
        "Content-Type": "application/json",
      };

      let bodyContent = JSON.stringify({
        id: formData.docId,
      });

      let response = await fetch("/api/discount-matrix/id", {
        method: "DELETE",
        body: bodyContent,
        headers: headersList,
      });

      if (response.status === 200) {
        clearFormData();
        document.getElementById("matrix_modal").close();
        toast.success("Record has been deleted");
        loadData();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearFormData = () => {
    setFormData({
      partyName: "",
      groupName: "",
      value: null,
      docId: "",
      isUpdateModal: false,
    });
  };

  return (
    <>
      <Toaster />
      <p className="text-2xl text-center mb-12 font-bold">Discount Matrix</p>
      {isLoading && (
        <div className="text-center mb-5">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      )}

      {!isLoading && (
        <div className="h-12 flex justify-center mb-10">
          <button
            onClick={() => {
              handleFormChange("isUpdateModal", false);
              document.getElementById("matrix_modal").showModal();
            }}
            className="bg-blue-600 rounded-md hover:bg-blue-400 p-2"
          >
            Create a structure
          </button>
        </div>
      )}
      {!isLoading && Data && (
        <div className="overflow-x-auto">
          <table className="table">
            {/* head */}
            <thead>
              <tr>
                <th></th>
                <th>Group</th>
                <th>Party</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {Data &&
                Data.map((item, index) => {
                  return (
                    <tr
                      className="hover:cursor-pointer hover:bg-green-600"
                      key={index}
                      onClick={() => {
                        handleFormChange("isUpdateModal", true);
                        handleFormChange("docId", item._id);
                        handleFormChange("groupName", item.groupName);
                        handleFormChange("partyName", item.partyName);
                        handleFormChange("value", item.value);
                        document.getElementById("matrix_modal").showModal();
                      }}
                    >
                      <th>{index + 1}</th>
                      <td>{item.groupName}</td>
                      <td>{item.partyName}</td>
                      <td>{item.value}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}

      {/*Modals*/}

      <ItemModal
        id={"matrix_modal"}
        handleFormChange={handleFormChange}
        onSubmit={addData}
        onUpdate={updateData}
        formData={formData}
        onDelete={deleteData}
      />
    </>
  );
};

const ItemModal = ({
  id,
  handleFormChange,
  formData,
  onSubmit,
  onUpdate,
  onDelete,
}) => {
  return (
    <dialog id={id} className="modal">
      <div className="modal-box">
        <form method="dialog">
          {/* if there is a button in form, it will close the modal */}
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
        </form>
        <h3 className="font-bold mb-8">Create Structure</h3>
        <label className="input input-bordered flex items-center gap-2 mb-4">
          Group
          <input
            type="text"
            name={"groupName"}
            className="grow"
            value={formData.groupName || ""}
            onChange={(e) => {
              handleFormChange("groupName", e.target.value?.toUpperCase());
            }}
            placeholder="SPICER"
          />
        </label>
        <label className="input input-bordered flex items-center gap-2 mb-4">
          Party
          <input
            name={"partyName"}
            value={formData.partyName || ""}
            onChange={(e) => {
              handleFormChange("partyName", e.target.value?.toUpperCase());
            }}
            type="text"
            className="grow"
            placeholder="MAHAVIR MOTORS"
          />
        </label>
        <label className="input input-bordered flex items-center gap-2">
          Discount
          <input
            name={"value"}
            value={formData.value || ""}
            onWheel={(e) => {
              e.target.blur();
            }}
            onChange={(e) => {
              handleFormChange("value", parseFloat(e.target.value));
            }}
            type="number"
            className="grow"
            placeholder={2.4}
          />
        </label>
        <div className="flex justify-center mt-4">
          <button
            onClick={
              formData?.isUpdateModal ? () => onUpdate() : () => onSubmit()
            }
            className="btn btn-info flex items-center text-center"
          >
            {formData?.isUpdateModal ? "Update" : "Submit"}
          </button>
          {formData?.isUpdateModal && (
            <button
              onClick={() => onDelete()}
              className="btn btn-warning flex ml-3 items-center text-center"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </dialog>
  );
};

export default page;
