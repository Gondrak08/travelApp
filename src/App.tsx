import {useState} from 'react';
import {Routes, Route}from 'react-router-dom';
import Search from './components/Search'
import Results from './components/Results';


export type DestinatioinType = {
  cityOrigin:string;
  originLocation?:{latitude?:any; longitude?:any;};
  cityDestination:string;
  destinationLocation?:{latitude?:any; longitude?:any;};
  cityIntermediate:[{
    city?:string
    location?:{latitude?:any; longitude?:any;};
  }];
  date:Date;
  passengersNumber:string;
  totalDistance:string
}

function App() {
  const [state, setState] = useState<Partial<DestinatioinType>>({});

  return (
    <div className='w-full h-screen bg-[#3671E9]'>
      <Routes>
        <Route path="/" element={<Search setUserDest={setState} userDest={state} />} />
        <Route path="/results" element={<Results state={state} />} />
      </Routes>
    </div>
  );
}

export default App;
