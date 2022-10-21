import {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from "react-datepicker";
import{DestinatioinType} from '../App'
type DestinyProp = {
    state:Partial<DestinatioinType>
}



const Results =({state}:DestinyProp)=>{
    const [data, setData] = useState<any>()
    const [startDate, setStartDate] = useState(new Date());
    const navigate = useNavigate()
    useEffect(()=>{
        if(Object.keys(state).length > 0){
            setData(state)
        }
        if(Object.keys(state).length <= 0){
            navigate("/")
        }
    },[])
    // const newDate = new Date(data.date)
    if(data){
        console.log(data)
    }
    
    return(
        <section className="w-full h-full flex items-center">
            <div className="bg-gray-300 p-3  max-w-[fit-content] w-full flex mx-auto" >
                <div id="destiny_selected" className='w-full bg-white py-2 ' >

                    <div id="cardHead" className='w-full flex flex-col gap-2 px-2'>
                        <h1>Chosen destination:</h1>
                        <div className='w-full flex justify-between gap-5 px-2' >
                            <div className='flex flex-col gap-2 items-start w-full ' >
                                <label>
                                    From:
                                </label>
                                <input className='w-[fit-content] bg-gray-200 p-3' type="text" disabled value={state.cityOrigin} />
                                
                            </div>
                            <div className='flex flex-col gap-2 items-start w-full' >
                                <label>
                                To:
                                </label>
                                <input className='w-[fit-content] bg-gray-200 p-3' type="text" disabled value={state.cityDestination} />
                            </div>
                            <div className='flex flex-col items-start gap-2' >
                            <label>Date:</label>
                            <DatePicker
                                className='p-3 bg-gray-200'  
                                selected={data?data.date:null}  
                                minDate={new Date()}
                                disabled
                                onChange={()=>{}}
                                />
                            </div>
                        </div>
                    </div>

                    <div id="numberOfPassengers" className='w-full flex justify-between px-5 py-3'>
                        <div className='flex  items-center gap-2 items-start w-full  ' >
                            <label>
                                number of passengers:
                            </label>
                            <input className='w-[2em] bg-gray-200 px-2' type="text" disabled value={state.passengersNumber} />        
                        </div>
                        <div className='flex  items-center gap-2 justify-end w-full' >
                            <label>
                                Total distance:
                            </label>
                            <span> {state.totalDistance} km </span>       
                        </div>
                    </div>
                </div>

            </div>
        </section>
    )
};
export default Results;