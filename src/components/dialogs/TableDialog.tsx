import { useContext, useEffect, useMemo, useRef, useState } from "react"
import { CaretDownFill, XCircleFill } from "react-bootstrap-icons"
import { RPCSource, RPCTable, tableIsRollable } from "../../helpers/types"
import Table from "../contentItems/Table"
import { JsonDataType } from "../../contexts/JsonDataContext"
import { StateFunctionsContext } from "../../contexts/StateFunctionsContext"

function compareTableIndices(a: RPCTable, b: RPCTable, sources: RPCSource[]) {
  if (a?.source != b?.source) {
    const aSource = sources.find((s) => s.name === a.source)
    const bSource = sources.find((s) => s.name === b.source)
    if (!aSource || !bSource) return 0
    if (aSource.brewed != bSource.brewed) {
      return +(aSource.brewed ?? false) - +bSource?.brewed
    }
    return (aSource?.index ?? 0) - (bSource?.index ?? 0)
  }
  if (a?.index?.chapter != b?.index?.chapter) {
    return (a?.index?.chapter ?? 0) - (b?.index?.chapter ?? 0)
  }
  return (a?.index?.number ?? 0) - (b?.index?.number ?? 0)
}

export default function TableDialog({
  jsonData,
  tableName,
  open,
}: {
  jsonData: JsonDataType
  tableName: string
  open: boolean
}) {
  /*const table = useMemo(() => {
    return jsonData.tables.find((tab) => tab.name === tableName)
  }, [tableName, jsonData.tables])*/
  const stateFunctions = useContext(StateFunctionsContext)
  const [name, source] = (tableName ?? "").split("|")
  const table = useMemo(() => jsonData.tables?.find(
    (t) => t.name === name && t.source === (source ?? jsonData.rootSource.name),
  ), [tableName])
  const [search, setSearch] = useState<string>("")
  const [expanded, setExpanded] = useState<boolean>()
  const ref = useRef<HTMLDialogElement|null>(null)

  useEffect(() => {
    if (open) {
      ref.current?.showModal()
    } else {
      ref.current?.close()
    }
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={() => stateFunctions.setTableName?.(null)}
      onCancel={() => stateFunctions.setTableName?.(null)}
      className="px-2 text-inherit bg-gray-100 dark:bg-gray-800 rounded-md backdrop:bg-gray-950 backdrop:opacity-50 w-[30rem] md:w-[45rem] lg:w-[60rem] max-h-[calc(100vh-7rem)]"
    >
      <div className="py-2">
        <div className="relative mb-2">
          <input
            placeholder="Zacznij pisać lub naciśnij przycisk po prawej..."
            className="pr-6 bg-gray-200 dark:bg-gray-700 w-full py-1 px-2 rounded-md !outline-none placeholder:italic"
            type="text"
            onInput={(evt) => {
              setSearch(evt.currentTarget.value)
              if (!expanded) setExpanded(true)
            }}
            value={search}
          />
          <span className="absolute right-2 top-1 bottom-0">
            {!expanded ? (
              <button onClick={() => setExpanded(true)}>
                <CaretDownFill />
              </button>
            ) : (
              <button onClick={() => setExpanded(false)}>
                <XCircleFill />
              </button>
            )}
          </span>
        </div>
        <div>
          {jsonData.tables
            .filter((e) =>
              search
                ? (e.name && e.name.search(search) + 1) ||
                  (e.displayName &&
                    e.displayName
                      .toLocaleLowerCase("pl")
                      .search(search.toLocaleLowerCase("pl")) + 1)
                : expanded,
            )
            .sort((a, b) => {
              const comparedIndices = compareTableIndices(
                a,
                b,
                jsonData.sources,
              )
              return comparedIndices === 0
                ? Intl.Collator("pl").compare(a.displayName, b.displayName)
                : comparedIndices
            })
            .map((t, index) => (
              <button
                key={index}
                className="bg-gray-100 dark:bg-gray-700 rounded-sm px-2 py-1 capitalize m-1 pl-4 relative"
                onClick={() => {
                  setExpanded(false)
                  stateFunctions.setTableName?.(t.name)
                  setSearch('')
                }}
              >
                <span
                  className={`absolute top-3 left-1 size-2 rounded-full`}
                  style={{backgroundColor: jsonData.sources.find((s) => s.name === t.source)?.color}}
                ></span>
                {t?.index ? `(${t.index.chapter}–${t.index.number}) ` : ""}
                {t.displayName}
              </button>
            ))}
        </div>
      </div>
      {tableName && table && (
        <Table
          data={table.content}
          formula={tableIsRollable(table) ? table.formula : ""}
          table={table.table}
          displayName={table.displayName}
          footnotes={table.footnotes}
          index={table.index}
          source={table.source}
        />
      )}
    </dialog>
  )
}
