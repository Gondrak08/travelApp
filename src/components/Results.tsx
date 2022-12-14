import {useState, useEffect} from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DatePicker from "react-datepicker";
import{DestinatioinType} from '../App'
import haversine from 'haversine-distance';
import ClipLoader from "react-spinners/ClipLoader";


type DestinyProp = {
    state:Partial<DestinatioinType>
}

const Results =({state}:DestinyProp)=>{
    const [interDes, setInterDes] = useState<any>()
    const [totalDistance, setTotalDistance]=useState<string>()
    const [cityData, setCityData]=useState<any>()
    const [urlData, setUrlData] = useState<any>({})
    const [isUrl, setIsUrl] = useState<boolean>(false);
    const [isCalculating ,setIsCalculataing] = useState<boolean>(false);
    const [calculated, setCalculated] = useState<boolean>(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    let date;

    useEffect(()=>{
        
        if(Object.keys(urlData).length== 0){
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
            setUrlData({...searchData});
            setIsUrl(true);
        }else
         if(Object.keys(state).length > 0){
            setCityData(state)
        }
        else { 
            console.log('hi')
            navigate('/');
        }
    },[]);

    useEffect(()=>{
        if( isUrl)
            if(urlData.intermediateCities&&urlData.intermediateCities.length >= 1){
                setInterDes(JSON.parse(urlData.intermediateCities)); 
            } 
            CalculateDestination();
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
        let calcData=null;
        if( urlData){
            console.log('url',urlData)
            let  inter,origin,end = null
            if(urlData.intermediateCities && urlData.intermediateCities.length >=1){
                inter = JSON.parse(urlData.intermediateCities);
            }
            if(urlData.originLoc){
                origin =JSON.parse(urlData?.originLoc);
            }
            if(urlData.destinationLoc) end = JSON.parse(urlData?.destinationLoc)
            calcData={
                originLocation:origin,
                destinationLocation:end,
                cityIntermediate: inter
            }
            
            console.log('hi')
        } else{
            calcData = {
               originLocation:cityData?.originLocation,
               destinationLocation:cityData?.destinationLocation,
               cityIntermediate: cityData?.cityIntermediate
           }

        }
        
        // console.log(calcData)
        
        if(calcData){
            if(calcData.originLocation && calcData.destinationLocation){
                if(calcData.originLocation.latitude && calcData.originLocation.longitude){
                
                const origin = {
                    latitude:calcData.originLocation?.latitude, 
                    longitude:calcData.originLocation?.longitude
                };
                const destination = {
                    latitude:calcData.destinationLocation?.latitude, 
                    longitude:calcData.destinationLocation?.longitude
                };
                const interLocations:any = calcData.cityIntermediate&&calcData.cityIntermediate?.length >= 1 ? [...calcData.cityIntermediate.map((item:any, index:number)=>{
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
                    
                        setTotalDistance(transformToKm);
                        setIsCalculataing(true);


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

if(isCalculating){
    setTimeout(()=>{
        setIsCalculataing(false);
        setCalculated(true)
    },1900)
}

console.log(urlData)

    
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


                        {
                            interDes?.length >= 1? (
                                <>
                                <h3>intermediate cities</h3>
                                <div className='grid grid-cols-3 gap-3 w-full h-full' >
                                
                                {interDes.map((item:any, index:number)=>(
                                    <>
                                    <input className='w-[fit-content] bg-gray-200 p-3' type="text" disabled value={item.city} />
                                    </>
                                ))}
                                </div>
                                </>
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
                            <label className='text-inline'>
                                Total distance:
                            </label>
                            {
                                isCalculating ?( 
                                <div className='w-full flex gap-3 items-center'>
                                    <span className="text-blue-500" >Calculating routes...</span>
                                    <ClipLoader
                                        color='blue'
                                        loading={isCalculating}
                                        size={50}
                                        aria-label="Loading Spinner"
                                        data-testid="loader"
                                    />
                                </div>
                            ):null
                            }
                            {
                                calculated&&(<span> { totalDistance } km </span>)
                            }
                                   
                        </div>
                    </div>
                </div>

            </div>
        </section>
    )
};
export default Results;