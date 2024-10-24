import { useEffect, useRef, useState, useContext, useMemo } from 'react'
import './App.css'
import Section from './Section';
import { JsonData } from './JsonDataContext.js';
import { StateFunctionsContext } from './StateFunctionsContext.js';
import Navbar from './Navbar';
import { parser, rollFromString } from './parser.jsx';
import { CaretDownFill, XCircleFill, XLg } from 'react-bootstrap-icons';

function App() {
  const [diceResult, setDiceResult] = useState(null);
  const [tableName, setTableName] = useState(null);
  const [tableNameSearch, setTableNameSearch] = useState(null);
  const [tableNameSearchExpand, setTableNameSearchExpand] = useState();
  const [tableVisibility, setTableVisibility] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('dw-darkmode') === 'true');
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
  useEffect(() => {
    if (tableVisibility === false) {
      setTableName(null);
    }
  }, [tableVisibility]);
  useEffect(() => {
    if (tableName !== null && tableVisibility === false) {
      setTableVisibility(true);
    }
  }, [tableName]);
  const darkModeSetter = newValue => {
    localStorage.setItem('dw-darkmode', newValue ?? !darkMode);
    setDarkMode(newValue ?? !darkMode);
  }
  const stateFunctions = {
    setDiceResult: setDiceResult,
    setTableName: setTableName,
    setDarkMode: darkModeSetter,
    setTableVisibility: setTableVisibility
  };

  const { sections, tables } = useContext(JsonData);
  const table = useMemo(() => {
    return tables.find(tab => tab.name === tableName);
  }, [tableName]);

  const rollOnTable = () => {
    const mod = +self.prompt(`Rzut ${table.formula ?? 'k100'} w tabeli ${table.displayName}: podaj ewentualne modyfikatory.`)
    const roll = rollFromString(table.formula ?? 'd100').total + (isNaN(mod) ? 0 : mod);
    if (rolledItem.current) {
      rolledItem.current.classList.remove('!bg-amber-500');
    }
    setRolledOnTable(table.content.findIndex(item => item?.match ? item.match === roll : (item.range.min ?? -Infinity) <= roll && (item.range.max ?? Infinity) >= roll));
  };
  return (
    <div className={darkMode ? 'dark': ''} id="app-inner-container">
      <StateFunctionsContext.Provider value={stateFunctions}>
        <Navbar/>
        <main className="py-4 px-2 fixed top-20 bottom-0 left-0 right-0 overflow-scroll bg-inherit">
          {
            sections.map((e, i) => (
              <Section key={i} data={e}/>
            ))
          }
        </main>
        {
          tableVisibility && (
            <aside>
              <div className='fixed z-20 top-0 bottom-0 left-0 right-0 z-20 bg-gray-950 opacity-50'></div>
              <div className="fixed top-24 max-h-[calc(100vh-7rem)] left-1/2 -translate-x-1/2 w-[30rem] md:w-[45rem] lg:w-[60rem] z-30 bg-gray-50 dark:bg-gray-800 flex flex-col rounded-md overflow-auto">
                <div className="p-2">
                  <div className='relative mb-2'>
                    <input placeholder="Zacznij pisać lub naciśnij przycisk po prawej..." className="pr-6 bg-gray-200 dark:bg-gray-700 w-full py-1 px-2 rounded-md !outline-none placeholder:italic" type='text' onInput={evt => { setTableNameSearch(evt.target.value); if (!tableNameSearchExpand) setTableNameSearchExpand(true); }} value={tableNameSearch}/>
                    <span className='absolute right-2 top-1 bottom-0'>{
                      !tableNameSearchExpand  ? (
                        <button onClick={() => setTableNameSearchExpand(true)}><CaretDownFill/></button>
                      ) : (
                        <button onClick={() => setTableNameSearchExpand(false)}><XCircleFill/></button>
                      )
                    }</span>
                  </div>
                  <div>
                    {
                      tables.filter(t => tableNameSearch ? t.displayName.search(tableNameSearch) + 1 : tableNameSearchExpand).map((t, index) => (
                        <button key={index} className="bg-gray-100 dark:bg-gray-700 rounded-sm px-2 py-1 capitalize m-1" onClick={() => { setTableNameSearchExpand(false); setTableName(t.name); setTableNameSearch(null); }}>{t.displayName}</button>
                      ))
                    }
                  </div>
                </div>
                {
                  tableName && (
                    <table className="overflow-y-scroll min-h-0 h-0">
                      <thead className="sticky top-0 z-10 bg-inherit">
                        <tr>
                          <th colSpan={table.table ? Object.keys(table.table).length : 2} className="capitalize text-lg text-center bg-gray-50 dark:bg-gray-800">{table.displayName}</th>
                        </tr>
                        <tr>
                          {
                            table.rollable ? (
                              <>
                                <th><button className='btn !normal-case' onClick={rollOnTable}>{table.formula ?? 'k100'}</button></th>
                                <th>{table.title}</th>
                              </>
                            ) : (
                              <>
                                <th>{table.preTitle}</th>
                                <th>{table.title}</th>
                              </>
                            )
                          }
                          <button className="absolute right-2 top-2 text-red-600 font-bold" onClick={() => { setTableVisibility(false); setTableName(null); }}><XCircleFill/></button>
                        </tr>
                      </thead>
                      <tbody className='overflow-x-scroll' ref={tableItemContainer}>
                        {
                          table.content.map((item, index) => (
                            <tr key={index} ref={rolledOnTable === index ? rolledItem : null} className="scroll-mt-14">
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
                  )
                }
              </div>
            </aside>
          )
        }
      </StateFunctionsContext.Provider>
      <dialog ref={diceDialog} className='px-8 py-4 bg-inherit text-inherit backdrop:bg-gray-950 backdrop:opacity-50 rounded-md'>
        <h6 className='text-xl'>Wynik rzutu:</h6>
        <span className={diceResult?.target ? (diceResult?.total <= diceResult?.target ? 'text-green-500' : 'text-red-600') : ''}>{!!diceResult && diceResult?.target ? (diceResult?.total <= diceResult?.target ? 'Sukces' : 'Porażka') : diceResult?.total}</span>
        <div>&#x5b;
          {
            diceResult?.rolls.map(e => (<span className={`inline-block mx-1 ${e.ignore ? 'text-gray-400' : e.value === 1 ? 'text-red-600' : e.value === diceResult.type ? 'text-green-500' : ''}`}>{e.value}</span>))
          }&#x5d;&nbsp;<span>{diceResult?.bonus}</span>
        </div>
        <button onClick={() => setDiceResult(null)} className='text-red-600 mt-4'>Zamknij</button>
      </dialog>
    </div>
  )
}

export default App
