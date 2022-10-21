import React, {useState, useEffect} from 'react'
import {useNavigate} from 'react-router-dom';
import {CiCircleRemove} from 'react-icons/ci';
import Data from '../data/index'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import{DestinatioinType} from '../App'

import haversine from 'haversine-distance'


type IProps = {
    userDest:Partial<DestinatioinType>
    setUserDest: React.Dispatch<React.SetStateAction<Partial<DestinatioinType>>>
}


const Search = ({userDest, setUserDest}:IProps) =>{
    console.log({userDest})
    const [arr, arrSet] = useState<number[]>([]);
    const [cities, citiesSet] =  useState([] as any)
    const [startDate, setStartDate] = useState(new Date());

    const [error, setError] = useState<boolean>(false);
    const [errorType, errorTypeSet] = useState<string>('');
    const [interError, setInterError] = useState<boolean>(false);
    const [isDistance,setIsDistance] = useState<boolean>(false);
    const[isCalculating, setIsCalculataing] = useState<boolean>(false)
    const [isReady, setIsReady] = useState<boolean>(false);
    
    const navigate = useNavigate();
    
    const [toLocation, setToLocation] = useState<any>({
        latitude:'',
        longitude:''
    });
    
    const [fromLocation, setFromLocation] = useState<any>({
        latitude:'',
        longitude:''
    });

    

    useEffect(()=>{
        citiesSet(Data);
    },[])

    // handling errors
    useEffect(()=>{
        if(Object.keys(userDest).length > 0){
            if(userDest.cityIntermediate && userDest.cityOrigin && userDest.cityIntermediate.includes(userDest.cityOrigin)||
            userDest.cityIntermediate && userDest.cityDestination && userDest.cityIntermediate.includes( userDest.cityDestination)
            ){
                setError(true);
                errorTypeSet('interCity');
            }else if(userDest.cityOrigin && userDest.cityDestination &&
                userDest.cityOrigin == userDest.cityDestination){
                setError(true);
                errorTypeSet('similarCity');
            } 
            else{
                setError(false);
                errorTypeSet('');
            }
        }
    },[userDest])

    useEffect(()=>{
        if(isReady){
            setTimeout(()=>{
                navigate('/results')
            }, 1000)
        };
    },[isReady])

   
    function handleDestination(e:any){
        if(e.target.id === 'cityOrigin'||e.target.id === 'cityDestination'){
            const keyName = e.target.value;
            const item = cities.filter((value:any,key:number)=>{
                if(keyName === value[0]) return [...value]
            })
            if(e.target.id === 'cityOrigin'){
                setFromLocation((state:any)=>{
                    state['latitude'] = item[0][1];
                    state['longitude'] = item[0][2];
                    return({...state})
                });
            }
            if(e.target.id === 'cityDestination'){
                setToLocation((state:any)=>{
                    state['latitude'] = item[0][1];
                    state['longitude'] = item[0][2];

                    return({...state})
                });
            }
            
        }
        // select values
        if(e.target.id === 'cityIntermediate'){
            if(userDest.cityIntermediate){
                const oldValue: string[] = [...userDest.cityIntermediate]
                const newVal= e.target.value;
                JSON.stringify(newVal)
                if(oldValue.includes(newVal)){
                    setInterError(true);
                }else {
                    setUserDest(state=>{
                        return {...state,[e.target.id]:[...oldValue, e.target.value]}
                    })
                    setInterError(false);
                }               
                    
            } else {
                setUserDest(state=>{
                    return {...state,[e.target.id]:[ e.target.value]}
                })
            }
        }else 
            setUserDest(state=>{
                return {...state,[e.target.id]: e.target.value}
            })

    }


    function CalculateForm(e:any){
            e.preventDefault()
            if(toLocation.latitude && fromLocation.latitude){
                const total = haversine(fromLocation, toLocation)
                const Km = JSON.stringify(Math.round(total/100)/10);
                setUserDest({...userDest,['totalDistance']: Km })
                setIsCalculataing(true)
            }
            
        }
    if(isCalculating){
        setTimeout(() => {
            setIsDistance(true);
            setIsCalculataing(false);
            setIsReady(true);
        }, 10000);
    }

    

    function HandleSubmit(e:any){
        if(Object.keys(userDest).length > 0){
            if(userDest.cityOrigin&&
                userDest.cityDestination&&
                userDest.date&&
                userDest.passengersNumber
                && !error
                ){
                    CalculateForm(e)
                    // setIsReady(true);
                    
                }else{
                    if(!userDest.date){
                        setError(true)
                        errorTypeSet("date")
                    }else if(!userDest.passengersNumber||userDest.passengersNumber&&userDest.passengersNumber ==='0'){
                        setError(true)
                        errorTypeSet('numberError')
                    }
                    else if(userDest.cityDestination === userDest.cityOrigin){
                        setError(true);
                        errorTypeSet('similarCity');
                    }
                    else{
                        setError(true);
                        errorTypeSet("global");
                        console.log('não funcionou')
                        console.log(userDest)
                    }
                }
        }
        e.preventDefault();
    }  
    return(
       <section className="w-full h-full flex items-center justify-center">
           <form onSubmit={(e)=>{HandleSubmit(e)}} className="flex flex-col rounded-md p-3 gap-3 bg-white max-w-[30em] w-full h-[fit-content] "  >
                <div id="globalError">
                    {error&&errorType ==='global' ? (
                        <span className='text-red-500' > You must fill all the fields with '*' before to submit</span>
                    ):null}
                </div>

                <div id="userDestContainer" className="w-full">
                    <div className='flex flex-col gap-2'>
                        <div id="destinationError" >
                            {error&&errorType==='similarCity'?(
                               <span className='text-red-500' >City of origin and destination cannot be the same</span>
                                ):
                            null}
                        </div>

                        <div  className="w-full flex items-center justify-between gap-3" >
                            <div>
                                <label>From:*</label>
                                <select id="cityOrigin" 
                                className={`${error&&errorType==='similarCity'?'border-[1px] border-rose-500 ':''} w-full p-3`} onChange={(e)=>{handleDestination(e)}} >
                                    <option>City of origin</option>
                                    {cities && cities.map((item:[string], index:number)=>(
                                        <option key={index} >{item[0]}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label>To:*</label>
                                <select id="cityDestination" className={`${error&&errorType==='similarCity'?'border-[1px] border-rose-500 ':''} w-full p-3`} onChange={(e)=>{handleDestination(e)}} >
                                    <option>City of destination</option>
                                    {cities && cities.map((item:[string], index:number)=>(
                                        <option key={index} >{item[0]}</option>
                                        ))}
                                </select>
                            </div>
                        </div>

                    </div>
                </div>
                
                <div id="intermediateCitiesContainer" className="flex flex-col items-start gap-3">
                    <span>
                        <button className="bg-gray-200 px-2  "
                         onClick={(e: React.SyntheticEvent)=>{
                            e.preventDefault();
                            arrSet([...arr, arr.length + 1])
                         }}>Add</button>
                        {' '}  intermediate city
                    </span>
                    {
                        arr.length >= 1 ? (
                            <>
                                {error&&errorType==='interCity'?(
                                    <span className='text-red-500' >Intermerdiate City cannot be similar to origin or destination city
                                    </span>
                                ):null}
                                <div className='grid grid-cols-3 gap-3 w-full' >
                                    {
                                        arr.map((item, index)=>(
                                          
                                            <div key={item} className='flex flex-col gap-1' >
                                                <CiCircleRemove className='self-end'  onClick={(e: React.SyntheticEvent)=>{
                                                    e.preventDefault();
                                                    const newVal = arr.filter((i, k)=>{
                                                        if(item !== i) return i
                                                    });
                                                
                                                }}/>
                                                <select id="cityIntermediate" key={item} className={`${error&&errorType==='interCity'?'border-[1px] border-rose-500 ':''} w-full p-3`} onChange={(e)=>{handleDestination(e)}} >
                                                        <option>select a city</option>
                                                        {cities && cities.map((item:[string], index:number)=>(
                                                            <option key={index}>{item[0]}</option>
                                                        ))}
                                                </select>
                                            </div>
                                        
                                        ))
                                    }
                                </div>
                            </>
                        ): null
                    }                    
                </div>

               <div className='flex justify-between items-center'>
                    <div className='w-full flex flex-col gap-2 '>
                        <span>Chose a date:*</span>
                        {
                            error&&errorType==='date'? (
                                <span className='text-[12px] text-red-500' >You must select a date</span>
                            ):null
                        }
                        <DatePicker
                            className={`${error&&errorType==='global'||error&&errorType==='date' ?'border-[1px] border-rose-500 ':''} bg-gray-200 p-2`}
                            
                            selected={startDate}  
                            minDate={new Date()}
                            onChange={(date:Date) => {
                                setStartDate(date)
                                setUserDest({...userDest, ['date']: date})  
                        }}/>
                    </div>
                    <div className='w-full flex flex-col gap-2'>
                        <span>number of passengers:*</span>
                        {
                            error&&errorType==='numberError'? (
                                <span className='text-[12px] text-red-500' >You must select a number greater than 0</span>
                            ):null
                        }
                        <input  id="passengersNumber" type="number" min="0" placeholder='0' className={` ${ error&&errorType==='numberError'|| error&&errorType==='global' ? 'border-[1px] border-rose-500 ':'' } bg-gray-200 p-2`} onChange={(e)=>{handleDestination(e)}} />
                    </div>
               </div>

               <div id="distance">
                {isDistance?(
                    <div className='flex gap-2 ' >
                        <label>Total distance to be traveld:</label>
                        {
                            userDest.totalDistance!=null ?(
                                <span>{userDest.totalDistance} Km</span>
                            ) : null
                        }
                       
                    </div>
                ):null}
               </div>
               
               <div id="submitForm" >
                    <button className={`${userDest.cityOrigin&&
                        userDest.cityDestination&&
                        userDest.date&&
                        userDest.passengersNumber&&
                        userDest.passengersNumber !== '0'&& !isCalculating &&
                        !error ? 'bg-blue-200 text-white': isCalculating ? 'bg-rose-500 text-white': 'bg-gray-300'} p-2 rounded-sm`}
                       
                        >
                            {isCalculating? "Calculating route" : isReady? "Ready!" : "Calculate Route"}
                        </button>
               </div>
           </form>
       </section>
    )
};
export {}
export default Search;

