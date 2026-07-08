import { useEffect, useMemo, useRef, useState, Dispatch, SetStateAction } from "react"
import { XCircleFill, XLg } from "react-bootstrap-icons"
import { RPCItem } from "../../helpers/types"
import { ItemLinkButton } from "../LinkButton"
import capitalize from "../../helpers/capitalize"
import { JsonDataType } from "../../contexts/JsonDataContext"
import SourceName from "../SourceName"

export default function SearchDialog({
  jsonData,
  open,
  setOpen,
}: {
  jsonData: JsonDataType
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}) {
  const [search, setSearch] = useState<string>("")
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (open) {
      ref.current?.showModal()
    } else {
      ref.current?.close()
      if (search) {
        setSearch("")
      }
    }
  }, [open])

  const close = () => {
    setOpen(false)
  }

  const searchPool = useMemo<RPCItem[]>(
    () => jsonData.flatItems.concat(jsonData.flatSections),
    [jsonData],
  )

  const searchResults = useMemo<RPCItem[]>(() => {
    if (!search) {
      return []
    }
    return searchPool
      .filter(
        (e) =>
          (e.name && e.name.search(search) + 1) ||
          (e.displayName &&
            e.displayName
              .toLocaleLowerCase("pl")
              .search(search.toLocaleLowerCase("pl")) + 1),
      )
      .sort((a, b) => (a.name > b.name ? 1 : a.name < b.name ? -1 : 0))
  }, [search])

  return (
    <dialog
      onCancel={close}
      ref={ref}
      className="px-8 py-4 bg-inherit backdrop:bg-gray-950 backdrop-opacity-50 text-inherit rounded-md w-[50rem] relative"
    >
      <button
        className="absolute top-2 right-2 duration-300 transition-colors hover:text-red-600 focus:text-red-600 active:text-red-600"
        aria-label="Zamknij wyszukiwanie"
        onClick={close}
      >
        <XLg />
      </button>
      <h2 className="text-3xl pb-2 px-4 text-center relative after:w-full after:h-px after:absolute after:bottom-0 after:bg-current after:left-0 after:right-0">
        Wyszukiwanie
      </h2>
      <div className="relative mt-4">
        <input
          type="search"
          placeholder="Wyszukaj..."
          className="pr-6 bg-gray-200 dark:bg-gray-700 w-full py-1 px-2 rounded-md !outline-none placeholder:italic"
          value={search}
          onChange={(evt) => setSearch(evt.target.value)}
        />
        <button
          className="absolute top-2 right-1"
          aria-label="Wyczyść"
          onClick={() => setSearch("")}
        >
          <XCircleFill />
        </button>
      </div>
      <div className="max-h-80 overflow-y-scroll px-2">
        {searchResults.map((e, index) => {
          const foundSource = jsonData.sources.find((s) => s.name === e.source)
          if (!foundSource) return
          return (
          <div key={index} className="flex">
            <div className="mr-8">
              <ItemLinkButton item={e} />
              &nbsp;
              <span>({e.name})</span>&nbsp;
              {e.parentPath && (
                <span className="italic text-gray-600 dark:text-gray-400">
                  {capitalize(
                    jsonData.flatSections.find(
                      (s) =>
                        s.name === e.parentPath?.split("-")[0] && !s?.parentPath,
                    )?.displayName ?? '',
                  )}
                </span>
              )}
            </div>
            <span className="ml-auto relative">
              <SourceName
                source={foundSource}
              />
            </span>
          </div>
        )})}
      </div>
    </dialog>
  )
}
