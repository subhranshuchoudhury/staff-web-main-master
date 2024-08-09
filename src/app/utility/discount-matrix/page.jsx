"use client"
import {useState,useEffect} from 'react'


const page = () =>{
	useEffect(() => {
		loadData()
		
	}, [])

	const [addDataModal, setAddDataModal] = useState(false);
	const [isLoading, setIsLoading] = useState(true)
	const [Data, setData] = useState(null)
	const [formData, setFormData] = useState({
		partyName:"",
		groupName:"",
		value:null
	})

	const handleFormChange = (name, value) => {
    if (!name) return;
    setFormData((values) => ({ ...values, [name]: value }));
  };

	const loadData = async()=>{
		setIsLoading(true)
		try{
			const response = await fetch("/api/discount-matrix");
			const data = await response.json()
			setData(data)

		}catch(error){

		}finally{
			setIsLoading(false)
		}
	}


	const addData = async()=>{
		setIsLoading(true)

		
		try{
			const body = {
				groupName:"Test Group",
				partyName:"Test Party",
				value:12
			}

			const response = await fetch("/api/discount-matrix",{
				method:"POST",
				body:JSON.stringify(body),
				"Content-Type":"application/json"
			})

			const data = await response.json()
			console.log(data)
		}catch(error){
			console.log(error)
		}finally{
			setIsLoading(false)
		}
	}


	return <>
		<p className="text-2xl text-center mb-12 font-bold">Discount Matrix</p>
		{
			isLoading && <div className="text-center mb-5">
				<span className="loading loading-spinner loading-lg"></span>
			</div>
		}
		
		{
			!isLoading && <div className="h-12 flex justify-center mb-10">
			<button onClick={()=>document.getElementById('add_discount_matrix_iten').showModal()} className="bg-blue-600 rounded-md hover:bg-blue-400 p-2">Add a new data</button>
		</div>
		}
	{
		!isLoading && Data && <div className="overflow-x-auto">
  <table className="table table-zebra">
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
      {
      	Data && Data.map((item,index)=>{
      		return <tr key={index}>
        <th>{index+1}</th>
        <td>{item.groupName}</td>
        <td>{item.partyName}</td>
        <td>{item.value}</td>
      </tr>
      	})
      }
      
    </tbody>
  </table>
</div>
	}

	{/*Modals*/}

<dialog id="add_discount_matrix_iten" className="modal">
  <div className="modal-box">
    <form method="dialog">
      {/* if there is a button in form, it will close the modal */}
      <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
    </form>
    <h3 className="font-bold mb-8">Create Structure</h3>
    <label className="input input-bordered flex items-center gap-2 mb-4">
  Group
  <input type="text" name={"groupName"} className="grow" value={formData.groupName || ""} onChange={(e)=>{
  	handleFormChange("groupName",e.target.value?.toUpperCase())
  }} placeholder="SPICER" />
</label>
<label  className="input input-bordered flex items-center gap-2 mb-4">
  Party
  <input name={"partyName"} value={formData.partyName || ""} onChange={(e)=>{
	handleFormChange("partyName",e.target.value?.toUpperCase())
}} type="text" className="grow" placeholder="MAHAVIR MOTORS" />
</label>
<label className="input input-bordered flex items-center gap-2">
  Discount
  <input name={"value"} value={formData.value || ""} onWheel={(e) => {
              e.target.blur();
            }} onChange={(e)=>{
	handleFormChange("value",parseFloat(e.target.value))
}} type="number" className="grow" placeholder={2.4} />
</label>
<div className="flex justify-center mt-4">
	<button onClick={()=>addData()} className="btn btn-info flex items-center text-center">Submit</button>
</div>

  </div>
</dialog>

	</>
}



export default page