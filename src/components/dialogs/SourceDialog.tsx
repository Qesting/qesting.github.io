import { ChangeEvent, useEffect, useRef } from "react"
import {
  CheckSquareFill,
  XCircleFill,
  XSquareFill,
} from "react-bootstrap-icons"
import { RPCSource } from "../../helpers/types"
import { JsonDataType } from "../../contexts/JsonDataContext"

function compareSources(a: RPCSource, b: RPCSource) {
  if (a.brewed != b.brewed) {
    return +a.brewed - +b.brewed
  }
  return a.index - b.index
}

export default function SourceDialog({
  jsonData,
  hiddenSources,
  setHiddenSources,
  open,
  setOpen,
}: {
  jsonData: JsonDataType
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  hiddenSources: string[]
  setHiddenSources: React.Dispatch<React.SetStateAction<string[]>>
}) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (open) {
      ref.current?.showModal()
    } else {
      ref.current?.close()
    }
  }, [open])

  const close = () => setOpen(false)

  return (
    <dialog
      onCancel={close}
      ref={ref}
      className="text-inherit bg-gray-100 dark:bg-gray-800 rounded-md backdrop:bg-gray-950 backdrop:opacity-50 w-[30rem] md:w-[45rem] lg:w-[60rem] max-h-[calc(100vh-7rem)] p-4 relative"
    >
      <button
        className="absolute right-2 top-2 focus:text-red-600 hover:text-red-600 transtion-colors duration-200"
        onClick={close}
      >
        <XCircleFill />
      </button>
      <h2 className="text-3xl pb-2 px-4 text-center relative after:w-full after:h-px after:absolute after:bottom-0 after:bg-current after:left-0 after:right-0">
        Źródła
      </h2>
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
          {jsonData.sources
            .sort((a, b) => compareSources(a, b))
            .map((source, index) => {
              function toggleSource(evt: ChangeEvent<HTMLInputElement>) {
                const prevState = [...hiddenSources]
                if (evt.currentTarget.checked) {
                  prevState.splice(prevState.indexOf(source.name), 1)
                  self.localStorage.setItem(
                    "dw-hideSources",
                    prevState.join(","),
                  )
                } else {
                  prevState.push(source.name)
                  self.localStorage.setItem(
                    "dw-hideSources",
                    prevState.join(","),
                  )
                }
                setHiddenSources(prevState)
              }
              return (
                <tr key={index}>
                  <td className="text-nowrap">
                    <span className="font-bold">{source.displayName}</span>
                    &nbsp;(
                    <span style={{ color: source.color }}>{source.name}</span>)
                  </td>
                  <td>
                    <span className="inline-block mx-auto relative top-0.5">
                      {source?.brewed ? (
                        <XSquareFill
                          aria-label="nie"
                          className="text-red-600"
                        />
                      ) : (
                        <CheckSquareFill
                          aria-label="tak"
                          className="text-green-500"
                        />
                      )}
                    </span>
                  </td>
                  <td colSpan={source?.brewed ? 2 : undefined}>
                    {source.author}
                  </td>
                  {source.transcriber && <td>{source.transcriber}</td>}
                  <td>
                    <span className="inline-block mx-auto">
                      <input
                        checked={!hiddenSources.includes(source.name)}
                        onChange={source?.core ? () => {} : toggleSource}
                        type="checkbox"
                        disabled={source?.core}
                        aria-label={
                          hiddenSources.includes(source.name)
                            ? "pokaż"
                            : "ukryj"
                        }
                      />
                    </span>
                  </td>
                </tr>
              )
            })}
        </tbody>
      </table>
    </dialog>
  )
}
