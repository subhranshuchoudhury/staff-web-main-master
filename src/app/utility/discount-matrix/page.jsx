"use client"
import {useState,useEffect} from 'react'


const page = () =>{
	useEffect(() => {
		loadData()
		
	}, [])

	const [addDataModal, setAddDataModal] = useState(false);
	const [isLoading, setIsLoading] = useState(true)
	const [Data, setData] = useState(null)

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
			<button onClick={()=>addData()} className="bg-blue-600 rounded-md hover:bg-blue-400 p-2">Add a new data</button>
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

	</>
}

export default page