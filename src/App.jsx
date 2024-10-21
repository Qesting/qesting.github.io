import { useEffect, useRef, useState, useContext, useMemo } from 'react'
import './App.css'
import Section from './Section';
import { JsonData } from './JsonDataContext.js';
import { StateFunctionsContext } from './StateFunctionsContext.js';
import Navbar from './Navbar';
import { parser, rollFromString } from './parser.jsx';

function App() {
  const [diceResult, setDiceResult] = useState(null);
  const [tableName, setTableName] = useState(null);
  const [rolledOnTable, setRolledOnTable] = useState();

  const diceDialog = useRef(null);
  const rolledItem = useRef(null);
  useEffect(() => {
    if (diceResult) diceDialog?.current?.showModal()
    else diceDialog?.current?.close()
  }, [diceResult]);
  useEffect(() => {
    if (rolledItem.current) {
      rolledItem.current.classList.add('!bg-amber-500');
      const currentItem = rolledItem.current; // without this line there would be lingering highlighted trs if the user rolls again in less than a second
      self.setTimeout(() => currentItem.classList.remove('!bg-amber-500'), 1000);
    }
  }, [rolledOnTable]);
  const stateFunctions = {
    setDiceResult: setDiceResult,
    setTableName: setTableName
  };

  const { sections, tables } = useContext(JsonData);
  const table = useMemo(() => {
    return tables.find(tab => tab.name === tableName);
  }, [tableName]);

  const rollOnTable = () => {
    const roll = rollFromString('d100').total;
    if (rolledItem.current) {
      rolledItem.current.classList.remove('!bg-amber-500');
    }
    setRolledOnTable(table.content.findIndex(item => (item.range.min ?? 1) <= roll && (item.range.max ?? 100) >= roll));
  };
  return (
    <>
      <StateFunctionsContext.Provider value={stateFunctions}>
        <Navbar/>
        <div className="fixed top-20 bottom-0 left-0 right-0 overflow-scroll">
          <main className="my-4 mx-2">
            {
              sections.map((e, i) => (
                <Section key={i} data={e}/>
              ))
            }
          </main>
        </div>
      </StateFunctionsContext.Provider>
      {
        tableName && (
          <aside className="fixed top-20 bottom-0 left-0 right-0 bg-[#000a]">
            <table className="bg-[white] w-[30rem] md:w-[45rem] lg:w-[60rem] mx-[auto] mt-36 p-2">
              <thead className="relative">
                <tr>
                  <th><button className='text-blue-700 underline capitalize' onClick={rollOnTable}>rzut</button></th>
                  <th>{table.title}</th>
                  <button className="absolute right-1 top-0 text-red-600 font-bold" onClick={() => setTableName(null)}>X</button>
                </tr>
              </thead>
              <tbody>
                {
                  table.content.map((item, index) => (
                    <tr key={index} ref={rolledOnTable === index ? rolledItem : null}>
                      <td className='text-center'>{`${item.range.min ?? 1}-${item.range.max ?? 100}`}</td>
                      <td>
                        <strong className='text-bold capitalize'>{item.title}</strong>.&nbsp;
                        <span>{parser(item.content)}</span>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </aside>
        )
      }
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
