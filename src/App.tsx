import { useEffect, useState, useContext, useMemo } from "react"
import "./App.css"
import Section from "./components/contentItems/Section"
import Navbar from "./components/Navbar"
import { useParams } from "react-router-dom"
import capitalize from "./helpers/capitalize"
import { RPCItem, RPCWeapon } from "./helpers/types"
import { findAllCombi, findDefaultAmmo, VttesInput } from "./helpers/vttesExportFunctions"
import TableDialog from "./components/dialogs/TableDialog"
import SourceDialog from "./components/dialogs/SourceDialog"
import SearchDialog from "./components/dialogs/SearchDialog"
import DiceDialog from "./components/dialogs/DiceDialog"
import ExportDialog from "./components/dialogs/ExportDialog"
import Footer from "./components/Footer"
import AlreadyResolvedContext from "./contexts/AlreadyResolvedContext"
import { JsonDataContext } from "./contexts/JsonDataContext"
import { StateFunctions, StateFunctionsContext } from "./contexts/StateFunctionsContext"
import { DiceResult } from "./helpers/rollDice"

function App() {
  const jsonData = useContext(JsonDataContext)

  const { sectionName, itemName } = useParams()
  const [diceResult, setDiceResult] = useState<DiceResult|null>(null)
  const [tableName, setTableName] = useState<string>("")
  const [darkMode, setDarkMode] = useState<boolean>(
    localStorage.getItem("dw-darkmode") === "true",
  )
  const [tableDialog, setTableDialog] = useState<boolean>(false)
  const [sourcesDialog, setSourcesDialog] = useState<boolean>(false)
  const [hiddenSources, setHiddenSources] = useState<string[]>(
    jsonData.sources.filter((s) => !s.visible).map((s) => s.name),
  )
  const [showExamples, setShowExamples] = useState<boolean>(
    self.localStorage.getItem("dw-hideExamples") !== "true",
  )
  const [searchDialog, setSearchDialog] = useState<boolean>(false)
  const [vttesExportDialog, setVttesExportDialog] = useState<boolean>(false)
  const [vttesExportElements, setVttesExportElements] = useState<VttesInput[]>(
    [],
  )

  useEffect(() => {
    setTimeout(() => {
      if (itemName) {
        const selector = itemName.startsWith(">")
          ? `[id^=section][id$=${CSS.escape(itemName.substring(1))}]`
          : `[id$=${CSS.escape(itemName)}]`
        const item = self.document.querySelector<HTMLElement>(selector)
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur()
        }
        item?.scrollIntoView?.({
          behavior: "smooth",
          block: "start",
        })
        item?.focus?.()
      }
    }, 50)
  }, [itemName])
  useEffect(() => {
    setTableName("")
    setTableDialog(false)
    setSourcesDialog(false)
    setSearchDialog(false)
    if (!itemName) {
      document.querySelector("section")?.scrollIntoView({ behavior: "smooth" })
    }
    if (!sectionName) return
    const [sName, sSource] = sectionName.split("|")
    const section = jsonData.sections.find(
      (sec) =>
        sec.name === sName &&
        sec.source === (sSource ?? jsonData.rootSource.name),
    )
    self.document.title =
      (section ? `${capitalize(section.displayName ?? '')} | ` : "") + "Codex Vigilis"
  }, [itemName, sectionName, jsonData.sections])
  useEffect(() => {
    if (tableName && !tableDialog) {
      setTableDialog(true)
    }
  }, [tableName])
  const darkModeSetter = (newValue: boolean) => {
    localStorage.setItem("dw-darkmode", (newValue ?? !darkMode).toString())
    setDarkMode(newValue ?? !darkMode)
  }
  const stateFunctions: StateFunctions = {
    setDiceResult: setDiceResult,
    setTableName: setTableName,
    setDarkMode: darkModeSetter,
    showTableDialog: () => setTableDialog(true),
    closeTableDialog: () => setTableDialog(false),
    showSourceDialog: () => setSourcesDialog(true),
    toggleShowExamples: () => {
      self.localStorage.setItem(
        "dw-hideExamples",
        showExamples ? "true" : "false",
      )
      setShowExamples(!showExamples)
    },
    getShowExamples: () => showExamples,
    getHiddenSources: () => hiddenSources,
    showSearchDialog: () => setSearchDialog(true),
    addToVttesExports: (item: RPCItem) => {
      const combi = findAllCombi(jsonData, item)
      setVttesExportElements([
        ...vttesExportElements,
        {
          item: item,
          craftsmanship: 0,
          quantity: 1,
          combi: combi,
          combiId: combi?.[0]?.id ?? null,
          ammo: findDefaultAmmo(jsonData, item as RPCWeapon).concat(combi.length ? findDefaultAmmo(jsonData, combi[0].item as RPCWeapon) : [])
        },
      ])
    },
    showVttesExports: () => setVttesExportDialog(true),
    getVttesExports: () => vttesExportElements,
  }
  const section = useMemo(() => {
    if (!sectionName) return
    const [sName, sSource] = sectionName.split("|")
    return jsonData.sections.find(
      (sec) =>
        sec.name === sName &&
        sec?.source == (sSource ?? jsonData.rootSource.name),
    )
  }, [sectionName, jsonData.sections])

  return (
    <div
      className={`${darkMode ? "dark" : ""} transition-colors duration-200`}
      id="app-inner-container"
    >
      <AlreadyResolvedContext.Provider value={{}}>
        <StateFunctionsContext.Provider value={stateFunctions}>
          <Navbar />
          <div className="fixed top-20 bottom-0 left-0 right-0 overflow-y-scroll bg-inherit flex flex-col">
            <main className="py-4 px-2 flex flex-col flex-grow">
              {section ? (
                <Section data={section} key={sectionName} disp={true}/>
              ) : (
                <>
                  <h1 className="py-2 text-4xl mb-4 text-center relative after:w-full after:h-px after:absolute after:bottom-0 after:bg-current after:left-0 after:right-0">
                    Codex Vigilis - Kompendium Deathwatch
                  </h1>
                  <h2 className="text-2xl px-20 text-center nocaps">
                  </h2>
                </>
              )}
            </main>
            <Footer />
          </div>
          <TableDialog
            jsonData={jsonData}
            tableName={tableName}
            open={tableDialog}
          />
          <SourceDialog
            jsonData={jsonData}
            open={sourcesDialog}
            hiddenSources={hiddenSources}
            setHiddenSources={setHiddenSources}
            setOpen={setSourcesDialog}
          />
          <SearchDialog
            jsonData={jsonData}
            open={searchDialog}
            setOpen={setSearchDialog}
          />
          <ExportDialog
            exports={vttesExportElements}
            setExports={setVttesExportElements}
            open={vttesExportDialog}
            setOpen={setVttesExportDialog}
            jsonData={jsonData}
          />
        </StateFunctionsContext.Provider>
      </AlreadyResolvedContext.Provider>
      <DiceDialog diceResult={diceResult} setDiceResult={setDiceResult} />
    </div>
  )
}

export default App
