import { useEffect, useRef, useState, useContext } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Section from './Section';
import { JsonData } from './jsonDataContext';
import Navbar from './Navbar';

function App() {
  const [diceResult, setDiceResult] = useState(null);
  const diceDialog = useRef(null);
  useEffect(() => {
    if (diceResult) diceDialog?.current?.showModal()
    else diceDialog?.current?.close()
  }, [diceResult])

  const data = useContext(JsonData);
  return (
    <>
      <Navbar/>
      <div className="fixed top-20 bottom-0 left-0 right-0 overflow-scroll">
        <main className="my-4 mx-2">
          {
            data.map((e, i) => (
              <Section key={i} data={e} setDiceResult={setDiceResult}/>
            ))
          }
        </main>
      </div>
      <dialog ref={diceDialog} className='px-8 py-4'>
        <h6 className='text-lg font-bold'>Wynik rzutu:</h6>
        <span className={diceResult?.target ? (diceResult?.total <= diceResult?.target ? 'text-green-500' : 'text-red-600') : ''}>{!!diceResult && diceResult?.target ? (diceResult?.total <= diceResult?.target ? 'Sukces' : 'Porażka') : diceResult?.total}</span>
        <div>&#x5b;
          {
            diceResult?.rolls.map(e => (<span className={`inline-block mx-1 ${e.ignore ? 'text-gray-400' : e.value === 1 ? 'text-red-600' : e.value === diceResult.type ? 'text-green-500' : ''}`}>{e.value}</span>))
          }&#x5d;&nbsp;<span>{diceResult?.bonus}</span>
        </div>
        <button onClick={() => setDiceResult(null)} className='text-red-600 mt-4'>Zamknij</button>
      </dialog>
    </>
  )
}

export default App
