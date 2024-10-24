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
  const tableItemContainer = useRef(null);

  useEffect(() => {
    if (diceResult) diceDialog?.current?.showModal()
    else diceDialog?.current?.close()
  }, [diceResult]);
  useEffect(() => {
    if (rolledItem.current) {
      rolledItem.current.classList.add('!bg-amber-500');
      rolledItem.current.scrollIntoView();
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
    const mod = +self.prompt(`Rzut ${table.formula} w tabeli ${table.displayName}: podaj ewentualne modyfikatory.`)
    const roll = rollFromString(table.formula ?? 'd100').total + (isNaN(mod) ? 0 : mod);
    if (rolledItem.current) {
      rolledItem.current.classList.remove('!bg-amber-500');
    }
    setRolledOnTable(table.content.findIndex(item => item?.match ? item.match === roll : (item.range.min ?? -Infinity) <= roll && (item.range.max ?? Infinity) >= roll));
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
        {
          tableName && (
            <aside className="fixed top-20 bottom-0 left-0 right-0 bg-[#000a]">
              <div className="fixed top-24 bottom-4 overflow-y-scroll left-1/2 -translate-x-1/2 w-[30rem] md:w-[45rem] lg:w-[60rem]">

              <table className="bg-[white] ">
                <thead className="sticky top-0 z-10 bg-inherit">
                  <tr>
                    {
                      table.rollable ? (
                        <>
                          <th><button className='text-blue-700 underline' onClick={rollOnTable}>{table.formula ?? 'k100'}</button></th>
                          <th>{table.title}</th>
                        </>
                      ) : (
                        <>
                          <th>{table.preTitle}</th>
                          <th>{table.title}</th>
                        </>
                      )
                    }
                    <button className="absolute right-2 top-0 text-red-600 font-bold" onClick={() => setTableName(null)}>X</button>
                  </tr>
                </thead>
                <tbody className='overflow-x-scroll' ref={tableItemContainer}>
                  {
                    table.content.map((item, index) => (
                      <tr key={index} ref={rolledOnTable === index ? rolledItem : null} className="scroll-mt-6">
                        {
                          table.rollable ? (
                            <td className='text-center'>{item?.match ?? `${item.range.min ?? 1}-${item.range.max ?? 100}`}</td>
                          ) : (
                            <td className='text-center'>{item.pre}</td>
                          )
                        }
                        <td>
                          <strong className='text-bold capitalize'>{item.title}</strong>.&nbsp;
                          <span>{parser(item.content, null, stateFunctions)}</span>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
              </div>
            </aside>
          )
        }
      </StateFunctionsContext.Provider>
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
