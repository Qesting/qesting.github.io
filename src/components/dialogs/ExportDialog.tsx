import { useEffect, useMemo, useRef, useState } from "react"
import {
  ArrowLeftSquareFill,
  CheckSquareFill,
  List,
  TrashFill,
  XLg,
  XSquareFill,
} from "react-bootstrap-icons"
import { Link } from "react-router-dom"
import { JsonDataType } from "../../contexts/JsonDataContext"
import capitalise from "../../helpers/capitalize"
import { craftsmanship } from "../../helpers/translation"
import { rootParent, RPCWeapon } from "../../helpers/types"
import { hasTag } from "../../helpers/itemTags"
import {
  VttesComponent,
  VttesInput,
  exportItem,
  findAmmo,
} from "../../helpers/vttesExportFunctions"
import { ItemLinkButton } from "../LinkButton"

function exportAll(exports: VttesInput[], jsonData: JsonDataType) {
  const exp: VttesComponent[] = []
  exports.forEach((e) => exportItem(jsonData, {}, e, exp))
  const exportObject = {
    schema_version: 1,
    type: "vttes_component_bundle",
    components: exp,
  }
  const fileName = `CodexVigilisExports_${Date.now()}.vttes_component_bundle`
  const exportFile = new Blob([JSON.stringify(exportObject, null, 2)], {
    type: "application/json",
  })
  const url = URL.createObjectURL(exportFile)
  const a = document.createElement("a")
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  setTimeout(() => {
    a.parentNode?.removeChild(a)
    URL.revokeObjectURL(url)
  }, 1000)
}

type AmmoSelectionInput = {
  index: number
  input: VttesInput
}

export default function ExportDialog({
  exports,
  setExports,
  open,
  setOpen,
  jsonData,
}: {
  exports: VttesInput[]
  setExports: React.Dispatch<React.SetStateAction<VttesInput[]>>
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  jsonData: JsonDataType
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const ammoRef = useRef<HTMLDialogElement>(null)
  const [ammoSelectionInput, setAmmoSelectionInput] =
    useState<AmmoSelectionInput|null>(null)
  const ammoCombi = useMemo(
    () =>
      ammoSelectionInput && ammoSelectionInput.input.combiId && ammoSelectionInput.input.combi
        ? ammoSelectionInput.input.combi.find(
            (e) => (e.id = ammoSelectionInput.input.combiId ?? ''),
          )?.item
        : null,
    [ammoSelectionInput],
  )
  const ammoList = useMemo(
    () =>
      ammoSelectionInput
        ? findAmmo(jsonData, ammoSelectionInput.input.item as RPCWeapon).concat(
            ammoCombi ? findAmmo(jsonData, ammoCombi as RPCWeapon) : [],
          )
        : [],
    [ammoSelectionInput],
  )

  const close = () => setOpen(false)
  const closeAmmo = () => setAmmoSelectionInput(null)
  const saveAmmo = () => {
    setExports(
      exports.map((e, i) =>
        ammoSelectionInput && i === ammoSelectionInput.index ? ammoSelectionInput.input : e,
      ),
    )
    closeAmmo()
  }

  useEffect(() => {
    if (open) {
      ref.current?.showModal()
    } else {
      ref.current?.close()
      setAmmoSelectionInput(null)
    }
  }, [open])

  useEffect(() => {
    if (ammoSelectionInput) {
      ammoRef.current?.showModal()
    } else {
      ammoRef.current?.close()
    }
  }, [ammoSelectionInput])

  return (
    <>
      <dialog
        onCancel={close}
        ref={ref}
        className="px-8 py-4 bg-inherit text-inherit backdrop:bg-gray-950 backdrop:opacity-50 rounded-md w-[60rem] relative"
      >
        <button
          className="absolute top-2 right-2 duration-300 transition-colors hover:text-red-600 focus:text-red-600 active:text-red-600"
          aria-label="Zamknij eksport"
          onClick={close}
        >
          <XLg />
        </button>
        <h2 className="text-3xl pb-2 px-4 text-center relative after:w-full after:h-px after:absolute after:bottom-0 after:bg-current after:left-0 after:right-0">
          Eksport
        </h2>
        <p>
          Ta funkcja pozwala wyeksportować wybrane rodzaje zawartości (oznaczone
          przyciskiem{" "}
          <span className="relative inline-block">
            <ArrowLeftSquareFill />
          </span>
          ) jako zbiór komponentów VTTES. Kompatybilna jest z kartą postaci
          Deathwatch autorstwa Baleine na platformie Roll20 i wymaga wtyczki{" "}
          <Link
            className="btn"
            to="https://wiki.tercept.net/en/VTTES/VTTES_Installation"
            target="_blank"
          >
            VTT Enchancement Suite
          </Link>
          .
        </p>
        <table className="w-full">
          <thead>
            <tr>
              <th>Rodzaj</th>
              <th>Nazwa</th>
              <th>Łączona</th>
              <th>Jakość</th>
              <th>Ilość</th>
            </tr>
          </thead>
          <tbody>
            {exports.length ? (
              exports.map((e, i) => {
                const p = rootParent(e.item)
                if (!p) return
                const pSource = jsonData.sources.find(
                  (s) => s.name === p.source,
                )
                const eSource = jsonData.sources.find(
                  (s) => s.name === e.item.source,
                )
                return (
                  <tr key={i}>
                    <td className="relative pl-4 text-center">
                      <span
                        className="absolute z-10 left-1 size-2 rounded-full top-3"
                        style={{ backgroundColor: pSource?.color }}
                      ></span>
                      <ItemLinkButton item={p} />
                    </td>
                    <td className="relative pl-4 text-center">
                      <span
                        className="absolute z-10 left-1 size-2 rounded-full top-3"
                        style={{ backgroundColor: eSource?.color }}
                      ></span>
                      <ItemLinkButton item={e.item} />
                    </td>
                    <td className="relative text-center">
                      {e.combi?.length ? (
                        <select
                          value={e.combiId}
                          className="bg-inherit text-inherit"
                          onChange={(evt) =>
                            setExports(
                              exports.map((el, j) =>
                                j === i
                                  ? { ...el, combiId: evt.target.value }
                                  : el,
                              ),
                            )
                          }
                        >
                          {e.combi.map((f, j) => (
                            <option key={j} value={f.id}>
                              {f.item.displayName}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <XSquareFill className="inline-block" />
                      )}
                    </td>
                    <td className="relative text-center">
                      <select
                        value={e.craftsmanship}
                        className="bg-inherit text-inherit"
                        onChange={(evt) =>
                          setExports(
                            exports.map((el, j) =>
                              j === i
                                ? {
                                    ...el,
                                    craftsmanship: parseInt(evt.target.value),
                                  }
                                : el,
                            ),
                          )
                        }
                      >
                        {Object.entries(craftsmanship).map(([c, j]: [string, string]) => (
                          <option key={j} value={j}>
                            {capitalise(c)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="relative text-center">
                      <input
                        className="bg-inherit text-inherit text-right w-16"
                        type="number"
                        min="0"
                        step="1"
                        value={e.quantity}
                        onChange={(evt) =>
                          setExports(
                            exports.map((el, j) =>
                              j === i
                                ? {
                                    ...el,
                                    quantity: parseInt(evt.target.value),
                                  }
                                : el,
                            ),
                          )
                        }
                      />
                    </td>
                    <td className="relative text-center">
                      <button className="nav-btn"></button>
                    </td>
                    <td className="relative text-center">
                      <button
                        className="nav-btn"
                        aria-label="Zarządzaj amunicją"
                        onClick={() =>
                          setAmmoSelectionInput({ index: i, input: e })
                        }
                      >
                        <List className="rotate-90" />
                      </button>
                      <button
                        className="nav-btn"
                        aria-label="Usuń pozycję"
                        onClick={() =>
                          setExports(exports.filter((_, j) => j !== i))
                        }
                      >
                        <TrashFill />
                      </button>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={5} className="text-center">
                  Pusto!
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {exports.length > 0 && (
          <button onClick={() => exportAll(exports, jsonData)}>
            Eksportuj
          </button>
        )}
      </dialog>
      {ammoSelectionInput && (
        <dialog
          onCancel={closeAmmo}
          ref={ammoRef}
          className="px-8 py-4 bg-inherit text-inherit backdrop:bg-gray-950 backdrop:opacity-50 rounded-md w-[60rem] relative"
        >
          <button
            className="absolute top-2 right-2 duration-300 transition-colors hover:text-red-600 focus:text-red-600 active:text-red-600"
            aria-label="Zamknij eksport"
            onClick={closeAmmo}
          >
            <XLg />
          </button>
          <h2 className="text-3xl pb-2 px-4 text-center relative after:w-full after:h-px after:absolute after:bottom-0 after:bg-current after:left-0 after:right-0">
            Amunicja dla {capitalise(ammoSelectionInput.input.item.displayName + (ammoCombi ? '/' + ammoCombi.displayName : ''))}
          </h2>
          <table className="w-full">
            <thead>
              <tr>
                <th>Rodzaj</th>
                <th>Nazwa</th>
                <th>Podstawowa</th>
              </tr>
            </thead>
            <tbody>
              {ammoList.map((ammo, index) => (
                <tr key={index}>
                  <td>
                    <ItemLinkButton item={rootParent(ammo)} />
                  </td>
                  <td>
                    <ItemLinkButton item={ammo} />
                  </td>
                  <td>
                    {hasTag(ammo, { name: "defaultammo" }) ? (
                      <CheckSquareFill />
                    ) : (
                      <XSquareFill />
                    )}
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={ammoSelectionInput.input.ammo?.includes(ammo)}
                      onChange={(evt) =>
                        evt.target.checked
                          ? setAmmoSelectionInput({
                              ...ammoSelectionInput,
                              input: {
                                ...ammoSelectionInput.input,
                                ammo: [...(ammoSelectionInput.input.ammo ?? []), ammo],
                              },
                            })
                          : setAmmoSelectionInput({
                              ...ammoSelectionInput,
                              input: {
                                ...ammoSelectionInput.input,
                                ammo: (ammoSelectionInput.input.ammo ?? []).filter(
                                  (f) => f !== ammo,
                                ),
                              },
                            })
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={saveAmmo}>Zapisz</button>
        </dialog>
      )}
    </>
  )
}
