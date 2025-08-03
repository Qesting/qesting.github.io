import { useEffect, useRef, useState, useContext, useMemo } from 'react'
import './App.css'
import Section from './Section';
import { JsonDataContext } from './JsonDataContext.js';
import { StateFunctionsContext } from './StateFunctionsContext';
import Navbar from './Navbar';
import { CaretDownFill, XCircleFill, XLg } from 'react-bootstrap-icons';
import Footer from './Footer.jsx';
import Table from './Table.jsx';
import { Link, useParams } from 'react-router-dom';
import { CheckSquareFill as BIconCheckSquareFill, XSquareFill as BIconXSquareFill } from "react-bootstrap-icons"
import capitalize from './capitalize.js';
import LinkButton from './LinkButton.jsx';
import SourceName from './SourceName.tsx';

function App() {
  const { sections, tables, sources, flatItems, flatSections } = useContext(JsonDataContext);
  const searchPool = flatItems.concat(flatSections)

  const { sectionName, itemName } = useParams()
  const [diceResult, setDiceResult] = useState(null);
  const [tableName, setTableName] = useState(null);
  const [tableNameSearch, setTableNameSearch] = useState("");
  const [tableNameSearchExpand, setTableNameSearchExpand] = useState();
  const [darkMode, setDarkMode] = useState(localStorage.getItem('dw-darkmode') === 'true');
  const diceDialog = useRef(null);
  const tableDialog = useRef(null)
  const sourcesDialog = useRef(null)
  const [hiddenSources, setHiddenSources] = useState(sources.filter(s => !s.visible).map(s => s.name))
  const [showExamples, setShowExamples] = useState(self.localStorage.getItem("dw-hideExamples") !== "true")
  const searchDialog = useRef(null)
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (itemName) {
      const item = self.document.querySelector(
        itemName.startsWith(">")
          ? `[id^=section][id$=${CSS.escape(itemName.substring(1))}`
          : `[id$=${CSS.escape(itemName)}`
      )
      self.document.activeElement.blur()
      item?.scrollIntoView?.({
        behavior: "smooth",
        block: "start"
      })
      item?.focus?.()
    }
  }, [itemName])
  useEffect(() => {
    setTableName(null)
    tableDialog.current?.close()
    sourcesDialog.current?.close()
    searchDialog.current?.close()
    setSearch("")
    if (!itemName) {
      document.querySelector("section")?.scrollIntoView({ behavior: "smooth" })
    }
    const section = sections.find(sec => sec.name === sectionName)
    self.document.title = (section ? `${capitalize(section.displayName)} | ` : "") + "Codex Vigilis"
  }, [itemName, sectionName, sections])

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
    closeTableDialog: () => tableDialog?.current?.close(),
    showSourceDialog: () => sourcesDialog?.current?.showModal(),
    toggleShowExamples: () => {
      self.localStorage.setItem("dw-hideExamples", showExamples ? "true" : "false")
      setShowExamples(!showExamples)
    },
    getShowExamples: () => showExamples,
    getHiddenSources: () => hiddenSources,
    showSearchDialog: () => searchDialog?.current?.showModal()
  };
  const table = useMemo(() => {
    return tables.find(tab => tab.name === tableName);
  }, [tableName, tables]);
  const section = useMemo(() => {
    return sections.find(sec => sec.name === sectionName);
  }, [sectionName, sections]);
  return (
    <div className={`${darkMode ? 'dark': ''} transition-colors duration-200`} id="app-inner-container">
      <StateFunctionsContext.Provider value={stateFunctions}>
        <Navbar/>
        <div className="fixed top-20 bottom-0 left-0 right-0 overflow-y-scroll bg-inherit flex flex-col">
          <main className="py-4 px-2 flex flex-col flex-grow">
              {
                section ? (
                  <Section data={section} key={sectionName}/>
                ) : (
                  <>
                    <h1 className="py-2 text-4xl mb-4 text-center relative after:w-full after:h-px after:absolute after:bottom-0 after:bg-current after:left-0 after:right-0">Codex Vigilis - Kompendium Deathwatch - wita!</h1>
                    <h2 className='text-2xl px-20 text-center'>Na co czekasz? Wybierz kategorię bądź tabelę powyżej i dowiedz się wszystkiego, co potrzebne przy zwalczaniu wrogów ludzkości. Za Imperatora!</h2>
                  </>
                )
              }
            </main>
            <Footer/>
        </div>
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
      <dialog ref={sourcesDialog} className="text-inherit bg-gray-100 dark:bg-gray-800 rounded-md backdrop:bg-gray-950 backdrop:opacity-50 w-[30rem] md:w-[45rem] lg:w-[60rem] max-h-[calc(100vh-7rem)] p-4 relative">
          <button className="absolute right-2 top-2 focus:text-red-600 hover:text-red-600 transtion-colors duration-200" onClick={() => sourcesDialog.current?.close()}><XCircleFill/></button>
          <h2 className="text-3xl pb-2 px-4 text-center relative after:w-full after:h-px after:absolute after:bottom-0 after:bg-current after:left-0 after:right-0">Źródła</h2>
          <table className="w-full text-center mt-2">
            <thead>
              <tr>
                <th>Nazwa</th>
                <th>Oficjalne</th>
                <th>Autor(zy)</th>
                <th>Transkrypcja</th>
                <th>Pokaż</th>
              </tr>
            </thead>
            <tbody>
              {
                sources.map((source, index) => {
                  function toggleSource(evt) {
                    const prevState = [...hiddenSources]
                    if (evt.target.checked) {
                      prevState.splice(prevState.indexOf(source.name), 1)
                      self.localStorage.setItem("dw-hideSources", prevState.join(","))
                    } else {
                      prevState.push(source.name)
                      self.localStorage.setItem("dw-hideSources", prevState.join(","))
                    }
                    setHiddenSources(prevState)
                  }
                  return (<tr key={index}>
                    <td className="text-nowrap"><span className="font-bold">{source.displayName}</span>&nbsp;(<span style={{color: source.color}}>{source.name}</span>)</td>
                    <td><span className="inline-block mx-auto relative top-0.5">{
                      source?.brewed ? <BIconXSquareFill aria-label="nie" className="text-red-600"/>
                        : <BIconCheckSquareFill aria-label="tak" className="text-green-500"/>
                    }</span></td>
                    <td colSpan={source?.brewed && 2}>{source.author}</td>
                    { source.transcriber && <td>{source.transcriber}</td> }
                    <td><span className="inline-block mx-auto"><input checked={!hiddenSources.includes(source.name)} onChange={source?.core ? () => {} : toggleSource} type="checkbox" disabled={source?.core} aria-label={hiddenSources.includes(source.name) ? "pokaż" : "ukryj"}/></span></td>
                  </tr>)
                })
              }
            </tbody>
          </table>
      </dialog>
      <dialog ref={searchDialog} className='px-8 py-4 bg-inherit backdrop:bg-gray-950 backdrop-opacity-50 text-inherit rounded-md w-[50rem] relative'>
        <button className='absolute top-2 right-2 duration-300 transition-colors hover:text-red-600 focus:text-red-600 active:text-red-600' aria-label='Zamknij wyszukiwanie' onClick={() => { setSearch(""); searchDialog?.current?.close() }}><XLg/></button>
        <h2 className='text-3xl pb-2 px-4 text-center relative after:w-full after:h-px after:absolute after:bottom-0 after:bg-current after:left-0 after:right-0'>Wyszukiwanie</h2>
        <div className='relative mt-4'>
          <input type='search' placeholder='Wyszukaj...' className='pr-6 bg-gray-200 dark:bg-gray-700 w-full py-1 px-2 rounded-md !outline-none placeholder:italic' value={search} onInput={evt => setSearch(evt.target.value)}/>
          <button className='absolute top-2 right-1' aria-label='Wyczyść' onClick={() => setSearch("")}><XCircleFill/></button>
        </div>
        <div className='max-h-80 overflow-y-scroll px-2'>
          {
            search.length > 0 && searchPool.filter(e => (e.name.search(search) + 1) || (e.displayName.search(search) + 1)).sort((a,b) => a.name > b.name ? 1 : a.name < b.name ? -1 : 0).map((e, index) => <div key={index} className="flex">
              <div>
                <LinkButton elementId={(e.type === 'section' ? 'section-' : 'item-') + (e?.parentPath ? e.parentPath + '-' : '') + e.name} innerText={e.displayName}/>&nbsp;
                <span>({e.name})</span>&nbsp;
                {
                  e.parentPath && <span className='italic text-gray-600 dark:text-gray-400'>{capitalize(flatSections.find(s => s.name === e.parentPath.split('-')[0]).displayName)}</span>
                }
              </div>
              <span className='ml-auto relative'><SourceName source={sources.find(s => s.name === (e.source ?? 'CRB'))}/></span>
            </div>)
          }
        </div>
      </dialog>
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
