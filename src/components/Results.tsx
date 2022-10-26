import {useState, useEffect} from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DatePicker from "react-datepicker";
import{DestinatioinType} from '../App'


type DestinyProp = {
    state:Partial<DestinatioinType>
}

const Results =({state}:DestinyProp)=>{
    const [data, setData] = useState<any>()
    const [urlData, setUrlData] = useState<any>()
    // const [date, setDate] = useState(new Date());
    const [isUrl, setIsUrl] = useState<boolean>(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    let date = null;

    useEffect(()=>{        
        if(Object.keys(state).length > 0){
            // setDate(new Date(state.date))
        } else if(searchParams?.get('originCity')){
            let searchData = {
                origin:searchParams?.get('originCity'),
                destination:searchParams?.get('destinationCity'),
                passenger:searchParams?.get('passengerNumber'),
                date: searchParams?.get('date'),
                total:searchParams?.get('totalDistance')  
            }
            setIsUrl(true);
            setUrlData({...searchData})
            
        } 
        else { 
            navigate('/');
        }
    },[]);


    if(isUrl){
        date = new Date(urlData.date)
        console.log(urlData);
    };
    if(state){
        let a:any = state.date;
        date = new Date(a);    
        console.log(date);
    }
    
    
    return(
        <section className="w-full h-full flex items-center">
            <div className="bg-gray-300 p-3  max-w-[fit-content] w-full flex mx-auto" >
                <div id="destiny_selected" className='w-full bg-white py-2 ' >
                    <div className='w-full flex flex-col justify-center '>
                        <h1 className='text-center text-[20px]' >Travel<span className='text-rose-500' >App</span></h1>
                    </div>
                    <div id="cardHead" className='w-full flex flex-col gap-2 px-3'>
                        <h1 className='pl-2' >Your destination recipe:</h1>
                        <div className='w-full flex justify-between gap-5 px-2' >
                            <div className='flex flex-col gap-2 items-start w-full ' >
                                <label>
                                    From:
                                </label>
                                
                                <input className='w-[fit-content] bg-gray-200 p-3' type="text" disabled value={isUrl ? urlData.origin : state.cityOrigin} />
                                
                                
                            </div>
                            <div className='flex flex-col gap-2 items-start w-full' >
                                <label>
                                To:
                                </label>
                                <input className='w-[fit-content] bg-gray-200 p-3' type="text" disabled value={isUrl ? urlData.destination : state.cityDestination} />
                            </div>
                            <div className='flex flex-col items-start gap-2' >
                            <label>Date:</label>
                            <DatePicker
                                className='p-3 bg-gray-200'  
                                selected={date??null}  
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
                            <input className='w-[2em] bg-gray-200 px-2' type="text" disabled value={isUrl ? urlData.passenger : state.passengersNumber} />        
                        </div>
                        <div className='flex  items-center gap-2 justify-end w-full' >
                            <label>
                                Total distance:
                            </label>
                            <span> {isUrl ? urlData.total : state.totalDistance} km </span>       
                        </div>
                    </div>
                </div>

            </div>
        </section>
    )
};
export default Results;