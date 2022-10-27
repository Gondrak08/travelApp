import {useState, useEffect} from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DatePicker from "react-datepicker";
import{DestinatioinType} from '../App'
import haversine from 'haversine-distance';


type DestinyProp = {
    state:Partial<DestinatioinType>
}

const Results =({state}:DestinyProp)=>{
    const [interDes, setInterDes] = useState<any>()
    const [totalDistance, setTotalDistance]=useState<string>()
    const [cityData, setCityData]=useState<any>()
    const [urlData, setUrlData] = useState<any>()
    const [isUrl, setIsUrl] = useState<boolean>(false);
    const [isCalculating ,setIsCalculataing] = useState<boolean>(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    let date;

    useEffect(()=>{                
        if(Object.keys(state).length ===0){
            let searchData = {
                origin:searchParams?.get('originCity'),
                originLoc:searchParams?.get('originLoc'),
                destination:searchParams?.get('destinationCity'),
                destinationLoc:searchParams?.get('destinationLoc'),
                passenger:searchParams?.get('passengerNumber'),
                intermediateCities: searchParams?.get('cityIntermediate'),
                date: searchParams?.get('date'),
                total:searchParams?.get('totalDistance')  
            }
            setIsUrl(true);
            setUrlData({...searchData});
        }else
         if(Object.keys(state).length > 0){
            setCityData(state)
        }
        else { 
            navigate('/');
        }
    },[]);

    useEffect(()=>{
        if(isUrl&&urlData?.intermediateCities) 
            setInterDes(JSON.parse(urlData.intermediateCities)); 
    },[urlData])
    useEffect(()=>{
        if(cityData?.cityIntermediate)
            setInterDes(cityData.cityIntermediate); 
       
        CalculateDestination();
    },[cityData])
    
    
    if(cityData&&Object.keys(cityData).length > 0){
        let a:any = state.date;
        date = new Date(a);
    }
    else 
    if(isUrl){
        date = new Date(urlData.date)
    };
    


    function CalculateDestination(){
        // e.preventDefault()
        if(cityData){
            if(cityData.originLocation && cityData.destinationLocation){
                if(cityData.originLocation.latitude && cityData.originLocation.longitude){
                
                const origin = {
                    latitude:cityData.originLocation?.latitude, 
                    longitude:cityData.originLocation?.longitude
                };
                const destination = {
                    latitude:cityData.destinationLocation?.latitude, 
                    longitude:cityData.destinationLocation?.longitude
                };
                const interLocations:any = cityData.cityIntermediate&&cityData.cityIntermediate?.length >= 1 ? [...cityData.cityIntermediate.map((item:any, index:number)=>{
                    return{latitude:item.location?.latitude, longitude:item.location?.longitude};
                })]:null;

               
               if(interLocations){
                    if(interLocations.length === 1){
                        // for 3 distances
                        const a = haversine(origin, interLocations[0]);
                        const b = haversine(interLocations[0], destination);
                        const c = a + b;
                        const total = (a+b) + (b+c); 
                        const transformToKm = JSON.stringify(Math.round(total/100)/10);
                        setTotalDistance(transformToKm );
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
                        setTotalDistance(transformToKm );
                        setIsCalculataing(true);
                    }        
                    if( interLocations.length > 2 ){
                       
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

                    }    
               }else{
                    const total = haversine(origin, destination);
                    const transformToKm = JSON.stringify(Math.round(total/100)/10);
                    setTotalDistance(transformToKm);
                    setIsCalculataing(true);
                }

               
            }
        }
      }
        
};


console.log(totalDistance);


    
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
                                selected={date}  
                                minDate={new Date()}
                                disabled
                                onChange={()=>{}}
                                />
                            </div>
                        </div>
                    </div>

                    <div id="intermeDestinies" className={`${interDes?.length >= 1?'flex flex-col gap-3 w-full  pt-3 px-5':''}`} >

                        <h3>intermediate cities</h3>

                        {
                            interDes?.length >= 1? (
                                <div className='grid grid-cols-3 gap-3 w-full h-full' >
                                
                                {interDes.map((item:any, index:number)=>(
                                    <>
                                    <input className='w-[fit-content] bg-gray-200 p-3' type="text" disabled value={item.city} />
                                    </>
                                ))}
                            </div>
                            ) :null
                        }
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