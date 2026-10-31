import { useRef, useContext } from "react"
import Parser from "../Parser"
import { XCircleFill } from "react-bootstrap-icons"
import SectionNameContext from "../../contexts/SectionNameContext"
import DataProviderContext from "../../contexts/DataProviderContext"
import {
  locations,
  renown,
  weaponClass,
  damageType,
} from "../../helpers/translation"
import {
  DamageType,
  Footnote,
  jsonItemIsItem,
  objectIsJsonItem,
  Quality,
  RPCItem,
  TableFormula,
  TableIndex,
  TableTemplate,
} from "../../helpers/types"
import { ItemLinkButton } from "../LinkButton"
import { JsonDataContext } from "../../contexts/JsonDataContext"
import { StateFunctionsContext } from "../../contexts/StateFunctionsContext"
import { Dice } from "../../helpers/rollDice"
import SourceName from "../SourceName"

export default function Table({
  table,
  data,
  hasSubs,
  footnotes,
  formula,
  displayName,
  index,
  source,
}: {
  table: TableTemplate
  data: (RPCItem | { [key: string]: any })[]
  hasSubs?: boolean
  footnotes?: Footnote[]
  formula?: TableFormula
  displayName?: string
  index?: TableIndex
  source?: string
}) {
  const keys = Object.keys(table ?? {})

  const rofKeys = ["single", "burst", "auto"]
  const rowContainer = useRef<HTMLTableSectionElement|null>(null)
  const rollOnTable = () => {
    if (rowContainer.current) {
      const roll = Dice.parse(
        (typeof formula === "string" ? formula : formula?.formula) ?? "d100",
      ).roll().total
      const rowIndex = data.findIndex((item) =>
        item?.match
          ? item.match === roll
          : (item.range.min ?? -Infinity) <= roll &&
            (item.range.max ?? Infinity) >= roll,
      )
      const row = rowContainer.current.children[rowIndex]
      row.classList.add("!bg-amber-500")
      self.setTimeout(() => row.classList.remove("!bg-amber-500"), 1000)
    }
  }
  const tableNameSetter = useContext(StateFunctionsContext).closeTableDialog
  const section = useContext(SectionNameContext)
  const { sources } = useContext(JsonDataContext)
  const foundSource = sources.find(s => s.name === source)
  if (!foundSource) return
  const formatter = Intl.NumberFormat("pl-PL")
  const usedFootnotes =
    footnotes
      ?.map((f, i) =>
        data.find(
          (e) =>
            Object.values(e?.footnotes ?? {}).includes(i) ||
            e?.qualities?.find?.((q: Quality) => typeof q !== 'string' && q?.footnote === i),
        ) ||
        (typeof f === "string" ? f : f.content).startsWith(
          `{no-daggers|${section.split("-").pop()}}`,
        )
          ? i
          : null,
      )
      .filter((e) => e !== null) ?? []
  function tableRows(passedData: { [key: string]: any }[]) {
    return passedData
      ?.filter((e) => !e?.noTable)
      .map((e, index) => {
        objectIsJsonItem(e) && jsonItemIsItem(e);
        return (
            <tr key={index} className="transition-colors duration-200">
            <DataProviderContext.Provider value={e}>
              {keys.map((k, jndex) => (
                <td
                  key={jndex}
                  className={
                    "text-center p-0.5 relative " +
                    (k === "$name" ? "pl-3 " : " ") +
                    (k === "$roll" ? " whitespace-nowrap" : "")
                  }
                >
                  {k.startsWith("${") ? (
                    <DataProviderContext.Provider value={e}>
                      <Parser text={k} itemIndex={jndex} />
                    </DataProviderContext.Provider>
                  ) : k.startsWith("$index") ? (
                    <Parser itemIndex={index} text={k} />
                  ) : k === "$roll" ? (
                    (e?.match?.toString()?.padStart(2, "0") ??
                    (e?.range?.min?.toString()?.padStart(2, "0") ?? "01") +
                      (e?.range?.max !== undefined ? "\u2013" : "") +
                      (e?.range?.max?.toString()?.padStart(2, "0") ?? "+"))
                  ) : k === "$content" ? (
                    <>
                      <strong className="font-bold">
                        <Parser
                          text={e.title}
                          cap={false}
                          itemIndex={jndex}
                        />
                      </strong>{" "}
                      <Parser text={e.content} itemIndex={jndex} />
                    </>
                  ) : (
                      k.startsWith("$")
                        ? e[k.substring(1)] === undefined && k !== "$covers"
                        : e[k] === undefined
                    ) ? (
                    "\u2013"
                  ) : e[k] === null ? (
                    "N/D"
                  ) : k === "$armour" ? (
                    typeof e.armour === "string" ? (
                      e.armour
                    ) : (
                      Object.values(e.armour)
                        .filter((f) => f !== null)
                        .join("/")
                    )
                  ) : k === "$covers" ? (
                    e.armor === undefined ? (
                      "\u2013"
                    ) : typeof e?.armor === "string" ? (
                      <Parser text={e.armor} itemIndex={jndex} />
                    ) : e.armor.general ? (
                      "wszystkie"
                    ) : (
                      Object.keys(e.armor)
                        .filter((l) => e.armor[l] !== null)
                        .map((l) => locations[l])
                        .join(", ")
                    )
                  ) : k === "$name" ? (
                    <>
                      <span
                        className="absolute z-10 left-1 size-2 rounded-full top-3"
                        style={{
                          backgroundColor: sources.find(
                            (s) => s.name == e.source,
                          )?.color,
                        }}
                      ></span>
                      <ItemLinkButton item={e as RPCItem} />
                    </>
                  ) : k === "$renown" ? (
                    (renown[e.renown] ?? e.renown)
                  ) : k === "$rof" && e.rof ? (
                    rofKeys
                      .map((f) =>
                        e.rof[f]
                          ? typeof e.rof[f] === "number"
                            ? e.rof[f]
                            : "S"
                          : "\u2013",
                      )
                      .join("/")
                  ) : k === "$damage" ? (
                    typeof e.damage !== "string" ? (
                      <span>
                        {
                          <Parser
                            text={`@dice{${e.damage.formula + (e.damage.display ? "|" + e.damage.display : "")}}`}
                            itemIndex={jndex}
                          />
                        }
                        &nbsp;{typeof e.damage.type === 'string' 
                          ? damageType[e.damage.type as DamageType].charAt(0).toUpperCase()
                          : e.damage.type.map((f: DamageType) => damageType[f]).join('/')}
                      </span>
                    ) : (
                      e.damage
                    )
                  ) : k === "$class" ? (
                    weaponClass[e.class]
                  ) : k === "$qualities" ? (
                    typeof e.qualities !== "string" ? (
                      <Parser
                        itemIndex={jndex}
                        text={e.qualities
                          .map((f: Quality) => {
                            const [qname, qsource] = typeof f === 'string' ? f.split("|") : [f.name, f.source]
                            return (
                              (typeof f === "string"
                                ? `@quality{${qname}}`
                                : f?.noParser
                                  ? f.name
                                  : f?.value
                                    ? `@quality{${qname}||${f.value}}`
                                    : `@quality{${qname}}`) +
                              (qsource ? `{${qsource}}` : "") +
                              (typeof f !== 'string' && f.footnote
                                ? `@footnote{${f.footnote}|${usedFootnotes.indexOf(f.footnote)}}`
                                : "")
                            )
                          })
                          .join(", ")}
                      />
                    ) : (
                      e.qualities
                    )
                  ) : k === "$range" ? (
                    typeof e.range === "number" ? (
                      <>
                        {e.range}&nbsp;<span className="normal-case">m</span>
                      </>
                    ) : (
                      e.range
                    )
                  ) : k === "$reload" ? (
                    typeof e.reload === "number" ? (
                      e.reload === 0.5 ? (
                        "A1"
                      ) : e.reload === 1 ? (
                        "A2"
                      ) : (
                        `${e.reload}AC`
                      )
                    ) : (
                      e.reload
                    )
                  ) : k === "$protectionRating" ? (
                    <Parser
                      itemIndex={jndex}
                      text={`@dice{${e.protectionRating}%}`}
                    />
                  ) : k === "$overload" ? (
                    e.overload ? (
                      <Parser
                        itemIndex={jndex}
                        text={`@dice{${e.overload}%|${e.overload === 1 ? "01" : "01-" + (e.overload + []).padStart(2, "0")}}`}
                      />
                    ) : (
                      "\u2013"
                    )
                  ) : k === "weight" && typeof e.weight === "number" ? (
                    formatter.format(e.weight)
                  ) : Array.isArray(e[k]) ? (
                    e[k].join(", ")
                  ) : (
                    <Parser itemIndex={jndex} text={`${e[k]}`} />
                  )}
                  {e?.footnotes?.[k] !== undefined && (
                    <Parser
                      itemIndex={jndex}
                      text={`@footnote{${e?.footnotes?.[k]}|${usedFootnotes ? usedFootnotes.indexOf(e?.footnotes?.[k]) : ""}}`}
                    />
                  )}
                </td>
              ))}
            </DataProviderContext.Provider>
          </tr>
        )
      })
  }

  return (
    <table className="w-full my-8 overflow-x-scroll">
      <thead>
        {!section && (
          <tr>
            <th
              className="text-center font-bold relative"
              colSpan={keys.length}
            >
              <SourceName source={foundSource} />
              <span>
                {index ? `(${index.chapter}–${index.number}) ` : ""}
                {displayName ?? ''}
              </span>
            </th>
          </tr>
        )}
        <tr className="relative">
          {keys.map((k, index) => (
            <th key={index} className={k === "$name" ? "pl-3" : ""}>
              {k === "$roll" ? (
                <button className="btn !normal-case" onClick={rollOnTable}>
                  {(typeof formula === "string" ? formula : formula?.formula) ??
                    "k100"}
                </button>
              ) : (
                typeof table[k] === "string" ? table[k] : table[k].name
              )}
            </th>
          ))}
          {!section && (
            <button
              className="text-inherit transition-colors duration-200 hover:text-red-600 text-center absolute top-1 right-2"
              onClick={() => tableNameSetter?.(false)}
            >
              <XCircleFill />
            </button>
          )}
        </tr>
      </thead>
      <tbody ref={rowContainer}>
        {hasSubs
          ? data.map((f) => (
              <>
                <tr>
                  <th colSpan={keys.length} className="uppercase">
                    {f.displayName}
                  </th>
                </tr>
                {tableRows(f.content)}
              </>
            ))
          : tableRows(data)}
        {footnotes && usedFootnotes?.map((e, index) => (
          <tr
            id={`footnote-${section}-${e}`}
            key={index}
            className="focus:text-accent transition-colors duration-300"
            tabIndex={-1}
          >
            <td colSpan={keys.length} className="italic">
              {(typeof footnotes[e] === "string"
                ? footnotes[e]
                : footnotes[e].content
              ).startsWith("{no-daggers")
                ? " "
                : "\u2020".repeat(index + 1) + " "}
              {
                <Parser
                  text={(typeof footnotes[e] === "string"
                    ? footnotes[e]
                    : footnotes[e].content
                  ).replace(/\{no-daggers\|.*?}/, "")}
                />
              }
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
