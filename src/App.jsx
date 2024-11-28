import { useEffect, useRef, useState, useContext, useMemo } from 'react'
import './App.css'
import Section from './Section';
import { JsonData } from './JsonDataContext.js';
import { StateFunctionsContext } from './StateFunctionsContext.js';
import Navbar from './Navbar';
import { CaretDownFill, XCircleFill } from 'react-bootstrap-icons';
import Footer from './Footer.jsx';
import Table from './Table.jsx';

function App() {
  const [currentSection, setCurrentSection] = useState(location.hash?.substring(1));
  const [diceResult, setDiceResult] = useState(null);
  const [tableName, setTableName] = useState(null);
  const [tableNameSearch, setTableNameSearch] = useState();
  const [tableNameSearchExpand, setTableNameSearchExpand] = useState();
  const [darkMode, setDarkMode] = useState(localStorage.getItem('dw-darkmode') === 'true');
  const diceDialog = useRef(null);
  const tableDialog = useRef(null)

  useEffect(() => {
    location.hash = currentSection;
  }, [currentSection]);
  useEffect(() => {
    if (diceResult) diceDialog?.current?.showModal()
    else diceDialog?.current?.close()
  }, [diceResult]);
  useEffect(() => {
    if (tableName !== null) {
      tableDialog?.current?.showModal();
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
    showTableDialog: () => tableDialog.current?.showModal(),
    setCurrentSection: setCurrentSection,
    closeTableDialog: () => tableDialog?.current?.close()
  };
  const { sections, tables } = useContext(JsonData);
  const table = useMemo(() => {
    return tables.find(tab => tab.name === tableName);
  }, [tableName, tables]);
  const section = useMemo(() => {
    return sections.find(sec => sec.name === currentSection);
  }, [currentSection, sections]);
  return (
    <div className={darkMode ? 'dark': ''} id="app-inner-container">
      <StateFunctionsContext.Provider value={stateFunctions}>
        <Navbar/>
        <div className="fixed top-20 bottom-0 left-0 right-0 overflow-y-scroll bg-inherit flex flex-col">
          <main className="py-4 px-2 flex flex-col flex-grow">
              {
                section ? (
                  <Section data={section} key={currentSection}/>
                ) : (
                  <>
                    <h1 className="py-2 text-4xl mb-4 text-center relative after:w-full after:h-px after:absolute after:bottom-0 after:bg-current after:left-0 after:right-0">Witamy w Kompendium</h1>
                    <h2 className='text-2xl px-20'>Na co czekasz? Wybierz kategorię bądź tabelę powyżej i dowiedz się wszystkiego, co potrzebne przy zwalczaniu wrogów ludzkości. Za Imperatora!</h2>
                  </>
                )
              }
            </main>
            <Footer/>
        </div>
        
        {
          <dialog ref={tableDialog} onClose={() => setTableName(null)} className="text-inherit bg-gray-100 dark:bg-gray-800 rounded-md backdrop:bg-gray-950 backdrop:opacity-50 w-[30rem] md:w-[45rem] lg:w-[60rem] max-h-[calc(100vh-7rem)]">
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
                  <Table data={table.content} formula={table.formula} table={table.table} displayName={table.displayName}/>
                )
              }
          </dialog>
        }
      </StateFunctionsContext.Provider>
      <dialog ref={diceDialog} className='px-8 py-4 bg-inherit text-inherit backdrop:bg-gray-950 backdrop:opacity-50 rounded-md'>
        <h6 className='text-xl'>Wynik rzutu:</h6>
        <span className={diceResult?.target ? (diceResult?.total <= diceResult?.target ? 'text-green-500' : 'text-red-600') : ''}>{!!diceResult && diceResult?.target ? (diceResult?.total <= diceResult?.target ? 'Sukces' : 'Porażka') : diceResult?.total}</span>
        <div>&#x5b;
          {
            diceResult?.rolls.map((e, index) => (<span key={index} className={`inline-block mx-1 ${e.ignore ? 'text-gray-400' : e.value === 1 ? 'text-red-600' : e.value === diceResult.type ? 'text-green-500' : ''}`}>{e.value}</span>))
          }&#x5d;&nbsp;<span>{diceResult?.bonus}</span>
        </div>
        <button onClick={() => setDiceResult(null)} className='text-red-600 mt-4'>Zamknij</button>
      </dialog>
    </div>
  )
}

export default App
