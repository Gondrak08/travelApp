import React, {useState, useEffect} from 'react'
import {createSearchParams, useNavigate} from 'react-router-dom';
import {CiCircleRemove} from 'react-icons/ci';
import Data from '../data/index'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import{DestinatioinType} from '../App'

import haversine from 'haversine-distance'

import ClipLoader from "react-spinners/ClipLoader";

type IProps = {
    userDest:Partial<DestinatioinType>
    setUserDest: React.Dispatch<React.SetStateAction<Partial<DestinatioinType>>>
}


const Search = ({userDest, setUserDest}:IProps) =>{
    const [cities, citiesSet] =  useState([] as any);
    const [searchOrigin, setSearchOrigin] = useState<string>('');
    const [searchDestin, setSearchDestin] = useState<string>('')
    const [startDate, setStartDate] = useState(new Date());

    const [error, setError] = useState<boolean>(false);
    const [calculateError, setCalculateError] = useState<boolean>(false);
    const [errorType, errorTypeSet] = useState<string>('');
    const [isDistance,setIsDistance] = useState<boolean>(false);

    const [isCalculating, setIsCalculataing] = useState<boolean>(false)
    const [isReady, setIsReady] = useState<boolean>(false);
    const navigate = useNavigate();
    
    useEffect(()=>{
        citiesSet(Data);
    },[]);
    // Handling Errors:
    useEffect(()=>{
        if(Object.keys(userDest).length > 0){
            //Catching Erros 
            if(userDest.cityIntermediate){
                const arrNames:any = userDest.cityIntermediate.map((value, index)=>{return value.city});
                if(arrNames.includes(userDest.cityOrigin)){
                    setError(true);
                    errorTypeSet('originSimilarToInterCity');
                }
                if( arrNames.includes(userDest.cityDestination)){
                    setError(true);
                    errorTypeSet('destinationSimilarToInterCity');
                }
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
    },[userDest]);
    
       
    function onSelect(e:any, item:any, keyName:string, index:number){
        setUserDest((state)=>{
            return{...state,[keyName]:item[0]}
        })
        if(keyName==='cityOrigin') setUserDest((state)=>{return{...state, ['originLocation']:{'latitude':item[1], 'longitude':item[2]}}});
        if(keyName==='cityDestination') setUserDest((state)=>{return{...state, ['destinationLocation']:{'latitude':item[1], 'longitude':item[2]}}});
    }

    function handleDestination(e:any,keyName:string, index:number){
        // select values
        if(e.target.id === 'cityIntermediate'){
            setUserDest(state=>{
                let arr:any = Object.assign([], state['cityIntermediate'])
                let selectedCities:any = [...arr.map((value:any, index:number)=> {if(value.city===e.target.value) return value.city})];
                const city = cities.filter((value:any,key:number)=>{if(e.target.value === value[0]) return [...value]});
                if(selectedCities.includes(e.target.value)){
                    setError(true);
                    errorTypeSet('interCity');
                }else
                arr[index] = {'city':e.target.value, 'location':{'latitude':city[0][1], 'longitude': city[0][2]}};
                return { 
                    ...state,[ e.target.id]:[...arr] }
                }
            );
        }else {
            setUserDest(state=>{
                return {...state,[e.target.id]: e.target.value}
            });
            
        } 
        
    };


    function CalculateDestination(e:any){
            e.preventDefault()

            if(userDest.cityOrigin=='Dijon'||userDest.cityDestination==='Dijon'){
                // setCalculateError(true);
                setError(true);
                errorTypeSet('Dijon');
                setIsCalculataing(true)
            }else{    
                if(userDest.originLocation && userDest.destinationLocation){
                    if(userDest.originLocation.latitude && userDest.originLocation.longitude){
                        const origin = {
                            latitude:userDest.originLocation?.latitude, 
                            longitude:userDest.originLocation?.longitude
                        };
                        const destination = {
                            latitude:userDest.destinationLocation?.latitude, 
                            longitude:userDest.destinationLocation?.longitude
                        };
                        const interLocations:any = userDest.cityIntermediate&&userDest.cityIntermediate?.length >= 1 ? [...userDest.cityIntermediate.map((item, index)=>{return{latitude:item.location?.latitude, longitude:item.location?.longitude}})]:null
    
                       if(interLocations){
                            if(interLocations.length === 1){
                                // for 3 distances
                                const a = haversine(origin, interLocations[0]);
                                const b = haversine(interLocations[0], destination);
                                const c = a + b;
                                const total = (a+b) + (b+c); 
                                const transformToKm = JSON.stringify(Math.round(total/100)/10);
                                setUserDest({...userDest,['totalDistance']: transformToKm });
                                setIsCalculataing(true);
                            };
                            if( interLocations.length === 2){
                                // for 4 distances 
                                const a = haversine(origin, interLocations[0])
                                const b = haversine(interLocations[0], interLocations[1]);
                                const c = haversine(interLocations[1], destination)       
                                const total = (a + b) + (b+c);
                                const transformToKm = JSON.stringify(Math.round(total/100)/10);
                                console.log(transformToKm, '4');    
                                setUserDest({...userDest,['totalDistance']: transformToKm });
                                setIsCalculataing(true);
                            }        
                            if( interLocations.length > 2 ){
                                console.log('this is bigger than two. Deal with it.');
    
                                const startPoint = haversine(origin, interLocations[0]);
                                const startMidCc  = haversine(interLocations[0], interLocations[1]);
                                
                                const lastElement = interLocations[interLocations.length - 1];
                                const finalMidCc = haversine(interLocations[interLocations.length -2], lastElement);
                                const finalDestiny = haversine(lastElement, destination);
    
                                let midvalueArr:any=[];
                                let i=1;
                                while(i < interLocations.length - 1){
                                    let value = haversine(interLocations[i], interLocations[i+1])
                                    midvalueArr.push(value)
                                    i++;
                                }
                                
                                let sumMidValue = midvalueArr.reduce((accumulator:any, value:any)=> accumulator + value,0)
    
                                console.log(sumMidValue, 'sumMidValue')
                                let total = (startPoint + startMidCc) + (startMidCc + midvalueArr[0]) + sumMidValue + (midvalueArr[midvalueArr.length -1] + finalMidCc) + (finalMidCc + finalDestiny);
                                const transformToKm = JSON.stringify(Math.round(total/100)/10);
                            
                                setUserDest({...userDest,['totalDistance']: transformToKm });
                                setIsCalculataing(true);
    
                            }    
                       }else{
                            const total = haversine(origin, destination);
                            const transformToKm = JSON.stringify(Math.round(total/100)/10);
                            setUserDest({...userDest,['totalDistance']: transformToKm });
                            setIsCalculataing(true);
                        };
    
                       
                    }
                };
                
            }
            
    };
    if(isCalculating){
        if(error && errorType == 'Dijon'){
                setTimeout(() => {
                    setIsCalculataing(false);
                    setCalculateError(true)
                }, 1900);    
    
        }else{
            setTimeout(() => {
                setIsDistance(true);
                setIsCalculataing(false);
                setIsReady(true);
            }, 1900);
        }
    };

    if(calculateError){
        setTimeout(()=>{
            setCalculateError(false);
        },1000)
    }

    function HandleSubmit(e:any){

        if(error && errorType=='Dijon' && !calculateError){
            navigate("/")
        };
        if(isReady){
            const params:any = {
                originCity:userDest.cityOrigin,
                originLoc:JSON.stringify(userDest.originLocation), 
                destinationCity:userDest.cityDestination,
                destinationLoc:JSON.stringify(userDest.destinationLocation),
                cityIntermediate:JSON.stringify(userDest.cityIntermediate), 
                passengerNumber:userDest.passengersNumber, 
                date:userDest.date, 
                totalDistance:userDest.totalDistance
            };
            navigate({
                pathname:'/results',
                search: `?${createSearchParams(params)}`
            });
            
            setIsCalculataing(true);
        } else { 
            if(Object.keys(userDest).length > 0){
                if(userDest.cityOrigin&&
                    userDest.cityDestination&&
                    userDest.date&&
                    userDest.passengersNumber&&
                    userDest.passengersNumber !== '0'
                    ){
                        CalculateDestination(e);
                        setError(false);
                        errorTypeSet('');
                    }else{
                        if(!userDest.cityOrigin){
                            setError(true);
                            errorTypeSet('cityOrigin');
                        } 
                        else if(!userDest.cityDestination){
                            setError(true);
                            errorTypeSet('cityDestination');
                        }
                        else if(userDest.cityDestination === userDest.cityOrigin){
                            setError(true);
                            errorTypeSet('similarCity');
                        } 
                        else if(!userDest.date){
                            setError(true)
                            errorTypeSet("date")
                        }else if(!userDest.passengersNumber||userDest.passengersNumber&&userDest.passengersNumber ==='0'){
                            setError(true)
                            errorTypeSet('numberError')
                        }
                        else {
                            setError(true);
                            errorTypeSet("global");
                        }
                    };
                } else{
                    setError(true);
                    errorTypeSet("global");
                }
            };
        e.preventDefault();
    };

    if(calculateError){
        console.log(errorType);
    }

    
    console.log(error, errorType);

    return(
    <section className="w-full h-full flex items-center justify-center">            
           <form onSubmit={(e)=>{HandleSubmit(e)}} className="flex flex-col rounded-md p-3 gap-3 bg-white max-w-[30em] w-full h-[fit-content] "  >
                <div className='w-full flex flex-col justify-center '>
                    <h1 className='text-center text-[20px]' >Travel<span className='text-rose-500' >App</span></h1>
                    <span className='text-center' >Welcome. Please feel free to chose your destination</span>
                </div>

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

                        <div  className="w-full flex items-center justify-between gap-5 " >
                            <div className='flex w-full flex-col' >
                                <label>From:*</label>
                                {error&&errorType==='cityOrigin'?(
                                     <span className='text-red-500 text-[8]'>Select a city of origin</span>
                                ):error&&errorType==='originSimilarToInterCity'?(
                                    <span className='text-red-500 text-[8]'>Origin cannot be similar to intermediate city</span>
                                ) :null}

                                
                                <div className='relative w-full' >
                                    {
                                        userDest.cityOrigin&&(
                                            <button 
                                            className='text-[14px] absolute top-[-10px] right-[-5px] bg-gray-400 hover:bg-black hover:text-white rounded-full w-[1.5em] h-[1.5em]'
                                            onClick={(e)=>{setUserDest((state:any)=>{
                                                return{...state,['cityOrigin']:null}
                                            })}}
                                            >X</button>
                                        )
                                    }
                                    <input type="text"
                                    value={userDest?.cityOrigin}
                                    disabled={userDest.cityOrigin?true:false}
                                    placeholder='Chose your city of origin' 
                                    className={`${error&&errorType==='finalOrigin'||error&&errorType==='similarCity'||error&&errorType==='global'||error&&errorType==='cityOrigin'||error&&errorType==='originSimilarToInterCity'?'border-[1px] border-rose-500 ':'border border-[1px] border-black'} active:border-0  w-full p-3`} 
                                    onChange={(e)=>{ setSearchOrigin(e.target.value)  }}
                                    />

                                    <div id="result" className='absolute bg-black w-full z-50' >
                                        {
                                            !userDest.cityOrigin && (
                                                cities && cities.filter((item:[string], index:number)=>{
                                                    if(searchOrigin === ''){
                                                        if(error&&errorType=='failOrigin'){
                                                            setError(false)
                                                            errorTypeSet('')
                                                        }
                                                        return null
                                                    } else if(searchOrigin.toLocaleLowerCase() == 'fail' ){
                                                        if(!error){
                                                            setError(true)
                                                            errorTypeSet('failOrigin')
                                                        }
                                                        // return  ;
                                                    } 
                                                    else if(item[0].toLowerCase().includes(searchOrigin.toLocaleLowerCase())) {
                                                        return item[0]
                                                    }
                                                }).map((item:[string], index:number)=>(
                                                    <div onClick={(e)=> onSelect(e,item,'cityOrigin', index)} key={index} className='cursor-pointer bg-gray-300 border border-gray-500 hover:bg-black hover:text-white hover:bg-opacity-10 p-2'>
                                                        <span>{item[0]}</span>
                                                    </div>
                                                ))
                                            )
                                        }

                                        {
                                            error&&errorType=="failOrigin"?(
                                                <div className='text-red-500 bg-gray-300 border border-rose-500 p-2'>
                                                    <span>error during search....</span>
                                                </div>
                                            ):null
                                        }

                                    </div>
                                </div>


                            </div>
                            <div className='flex w-full flex-col' >
                                    <label>To:*</label>
                                    {error&&errorType==='cityDestination'?(
                                        <span className='text-red-500 text-[8]'>Select a destination</span>
                                    ):error&&errorType==='destinationSimilarToInterCity' ? (
                                        <span className='text-red-500 text-[8]'>Destination cannot be similar to a intermediate city</span>
                                    ):null}

                                <div className='w-full relative'>
                                        {
                                            userDest.cityDestination&&(
                                                <button 
                                                className='text-[14px] absolute top-[-10px] right-[-5px] bg-gray-400 hover:bg-black hover:text-white rounded-full w-[1.5em] h-[1.5em]'
                                                onClick={(e)=>{
                                                    setUserDest((state:any)=>{
                                                    return{...state,['cityDestination']:null}
                                                    setSearchDestin('');
                                                })}}
                                                >X</button>
                                            )
                                        }
                                        <input type="text"
                                        value={userDest?.cityDestination}
                                        disabled={userDest.cityDestination?true:false}
                                        placeholder='Chose your city of origin' 
                                        className={`${error&&errorType==='similarCity' ||  error&&errorType==='global'||error&&errorType==='cityDestination'||error&&errorType==='destinationSimilarToInterCity' ?'border-[1px] border-rose-500 ':''} border border-[1px] border-black w-full p-3`} 
                                        onChange={(e)=>{ setSearchDestin(e.target.value)  }}
                                        />
                                        <div id="result" className='absolute bg-black w-full z-50' >
                                            {
                                                !userDest.cityDestination && (
                                                    cities && cities.filter((item:[string], index:number)=>{
                                                        if(searchDestin === ''){
                                                            if(error&&errorType=='failDes'){
                                                                setError(false)
                                                                errorTypeSet('');
                                                            }
                                                            return null
                                                        } else if(searchDestin.toLocaleLowerCase()=='fail'){
                                                            if(!error){
                                                                setError(true)
                                                                errorTypeSet('failDes');
                                                            }
                                                            // return ;
                                                        } 
                                                        else if(item[0].toLowerCase().includes(searchDestin.toLocaleLowerCase())) {
                                                            return item[0]
                                                        }
                                                    }).map((item:[string], index:number)=>(
                                                        <div onClick={(e)=> onSelect(e,item,'cityDestination', index)} key={index} className='cursor-pointer  bg-gray-300 border border-gray-500 hover:bg-black hover:text-white hover:bg-opacity-10 p-2'>
                                                            <span>{item[0]}</span>
                                                        </div>
                                                    ))
                                                )
                                            }
                                            {
                                                error&&errorType=="failDes"?(
                                                    <div className='text-red-500 bg-gray-300 border border-rose-500 p-2'>
                                                        <span>error during search....</span>
                                                    </div>
                                                ):null
                                            }
                                        </div>   
                                
                                </div>

                                
                            </div>
                        </div>

                    </div>
                </div>
                
                <div id="intermediateCitiesContainer" className="flex flex-col items-start gap-3">
                    <span>
                        <button className="bg-gray-200 px-2  "
                         onClick={(e: React.SyntheticEvent)=>{
                            e.preventDefault();
                            setUserDest((state:any) =>{
                                    let arr:any = Object.assign([], state['cityIntermediate'])   
                                    arr[arr.length] = {'city':''};
                                    return {...state,['cityIntermediate']:[...arr]};
                                }
                            );
                         }}>Add</button>
                        {' '}  intermediate city
                    </span>
                    {
                        userDest.cityIntermediate && userDest.cityIntermediate.length >= 1 ? (
                            <>
                                {error&&errorType==='originSimilarToInterCity'?(
                                    <span className='text-red-500' >Intermerdiate City cannot be similar to city of origin
                                    </span>
                                ):error&&errorType==='destinationSimilarToInterCity'?(
                                    <span className='text-red-500' >Intermerdiate City cannot be similar to city of destination
                                    </span>
                                ):error&&errorType==='emptyInterCity'? (
                                    <span className='text-red-500' >Intermerdiate City cannot be send empty
                                    </span>
                                ) :null}


                                <div className='grid grid-cols-3 gap-3 w-full'>
                                    {
                                        userDest.cityIntermediate.map((item:any, index:number)=>(
                                            <div key={index} className='flex flex-col gap-1' >
                                            <CiCircleRemove className='self-end'  onClick={(e: React.SyntheticEvent)=>{
                                                e.preventDefault();
                                                if(userDest.cityIntermediate){
                                                    const rmValue = userDest.cityIntermediate.filter((value:any, k:number)=>{
                                                        if(value.city && item.city !== value.city) return value
                                                        else if(index !== k) return item
                                                    });
                                                    setUserDest((state:any)=>{return{...state,['cityIntermediate']: rmValue}});
                                                }
                                            }}/>
                                            <select id="cityIntermediate" key={item} className={`${error&&errorType==='interCity'||error&&errorType==='originSimilarToInterCity'||error&&errorType==='destinationSimilarToInterCity'?'border-[1px] border-rose-500 ':''} w-full p-3`} 
                                            value={item.city}
                                            onChange={(e)=>{handleDestination(e, 'cityIntermediate' ,index)}} >
                                                    <option>select a city</option>
                                                    {cities && cities.map((item:[string], key:number)=>(
                                                        <>
                                                            <option key={key}>{item[0]}</option>
                                                        </>
                                                    ))}
                                            </select>
                                        </div>
                                        ))
                                    }
                                </div>
                            </>
                        ):null
                    }

                </div>

               <div className='flex gap-3 items-center'>
                    <div id="dateContainer" className='w-full flex flex-col gap-2 '>
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
                    <div id="passengerContainer" className='w-full flex flex-col gap-2'>
                        <span>number of passengers:*</span>
                        {
                            error&&errorType==='numberError'? (
                                <span className='text-[12px] text-red-500' >You must select a number greater than 0</span>
                            ):null
                        }
                        <input  id="passengersNumber" type="number" min="0" placeholder='0' className={` ${ error&&errorType==='numberError'|| error&&errorType==='global' ? 'border-[1px] border-rose-500 ':'w-[12em] ' } bg-gray-200 p-2`} onChange={(e)=>{handleDestination(e, "passengersNumber",0)}} />
                    </div>
               </div>

               <div id="distanceContainer">
              
                {
                    isCalculating || calculateError?(
                        <div className='w-full flex flex-col items-center'>
                            <span className={`${calculateError? 'text-red-500' : 'text-blue-500'}`} >Calculating routes...</span>
                            <ClipLoader
                                color={`${calculateError? 'red' : 'blue'}`}
                                loading={calculateError}
                                size={100}
                                aria-label="Loading Spinner"
                                data-testid="loader"
                            />
                        </div>

                    ):null
                }

                {isDistance?(
                    <div className='flex gap-2 ' >

                        <div>
                            <label>Total distance to be traveld:  </label>
                            {
                                userDest.totalDistance!=null ?(
                                    <span>{userDest.totalDistance} Km</span>
                                ) : null
                            }
                        </div>
                    </div>
                ):null}


                {
                   error && errorType=='Dijon' && !calculateError && !isCalculating ?(
                        <div   className='w-[fit-content] mx-auto text-bold text-red-500' >
                            <h3>Error when trying to calculate "Dijon" distance</h3>
                        </div>
                    ):null
                }

               </div>
               
               <div id="submitForm" >
                    <button className={`${userDest.cityOrigin&&
                        userDest.cityDestination&&
                        userDest.date&&
                        userDest.passengersNumber&&
                        userDest.passengersNumber !== '0'&& !isCalculating &&
                        !error ? 'bg-blue-500 text-white': isCalculating ? 'bg-rose-500 text-white': error && errorType=='Dijon' && !calculateError ? 'bg-red-500 text-white': 'bg-gray-300 cursor-not-allowed '} p-2 rounded-sm`}                       
                        >
                            {isCalculating ? "Calculating route..." : isReady? "Submit!" : error && errorType=='Dijon' && !calculateError ? 'try it again': "Calculate Route"}
                           
                        </button>
               </div>
           </form>
       </section>
    )
};
export {}
export default Search;


