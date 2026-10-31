/* eslint-disable no-cond-assign */
import { useContext, isValidElement } from "react"
import DataProviderContext from "../contexts/DataProviderContext"
import SectionNameContext from "../contexts/SectionNameContext.js"
import reactStringReplace from "react-string-replace"
import LinkButton, { ItemLinkButton } from "./LinkButton"
import Table from "./contentItems/Table.js"
import capitalise from "../helpers/capitalize"
import {
  generalRegExp,
  diceRegExp,
  tableRegExp,
  quoteRegExp,
  sectionRegExp,
  footnoteRegExp,
  tableInsertRegExp,
  formatRegExp,
} from "../helpers/ParserRegExp"
import {
  getFieldValue,
  prepare,
  replaceMathTags,
  replaceText,
  resolveItem,
  resolveTable,
  simplifyFormula,
} from "../helpers/parserHelpers.js"
import { RPCItem } from "../helpers/types"
import AlreadyResolvedContext from "../contexts/AlreadyResolvedContext"
import { JsonDataContext } from "../contexts/JsonDataContext"
import { StateFunctionsContext } from "../contexts/StateFunctionsContext"
import { Dice } from "../helpers/rollDice"

function Parser({
  text,
  replacementContext,
  insertParagraphs,
  className,
  cap,
  itemIndex,
}: {
  text: string
  replacementContext?: { [key: string]: any }
  insertParagraphs?: boolean
  className?: string
  cap?: boolean
  itemIndex?: number
}) {
  const jsonData = useContext(JsonDataContext)
  const passedSection = useContext(SectionNameContext)
  const receivedContext = useContext(StateFunctionsContext)
  const alreadyResolved = useContext(AlreadyResolvedContext)
  const provider = useContext(DataProviderContext)
  const { setDiceResult, setTableName } = replacementContext ?? receivedContext

  function resolveItemDefault(
    sectionName: string,
    itemName: string,
    source: string,
  ): RPCItem|null {
    return resolveItem(
      sectionName,
      itemName,
      source ?? jsonData.rootSource.name,
      alreadyResolved,
      jsonData,
    )
  }

  function getFieldValueDefault(
    obj: { [key: string]: any },
    field: string,
  ): any {
    return getFieldValue(obj, field, resolveItemDefault)
  }

  const preprocessed = prepare(text, provider, itemIndex)

  const textTagsReplaced = replaceText(
    preprocessed,
    passedSection,
    resolveItemDefault,
    provider,
    getFieldValueDefault,
  )

  const mathTagsReplaced = replaceMathTags(textTagsReplaced)

  const capitalized = cap ? capitalise(mathTagsReplaced) : mathTagsReplaced

  const formatted = reactStringReplace(
    capitalized,
    /(!\[[a-z]+]#.+?#)/g,
    (match, index) => {
      const { flags, inner } = match?.match(formatRegExp)?.groups ?? {}
      const flagArray = flags.split("")
      const classNames = [
        flagArray.includes("b") ? "font-bold" : "",
        flagArray.includes("i") ? "italic" : "",
        flagArray.includes("c") ? "smallcaps" : "",
      ]
      return (
        <span key={index} className={classNames.join(" ")}>
          {inner}
        </span>
      )
    },
  )

  const replaced = reactStringReplace(
    formatted,
    generalRegExp,
    (match) => {
      let matchData: RegExpMatchArray|null
      const key = Math.random()
      if ((matchData = match.match(diceRegExp))) {
        const { formula, display } = matchData?.groups ?? {}
        const simplifiedFormula = simplifyFormula(display ?? formula)
        return (
          <button
            key={key}
            className="btn !normal-case"
            onClick={() => {
              setDiceResult(Dice.parse(formula).roll())
            }}
          >
            {simplifiedFormula ?? match}
          </button>
        )
      } else if ((matchData = match.match(quoteRegExp))) {
        const { content, author } = match.match(quoteRegExp)?.groups ?? {}
        const classes = (
          className +
          " " +
          "rounded-md bg-gray-200 dark:bg-gray-800 py-2 px-4 mx-4 @md:mx-[12.5%] @lg:mx-[16.7%] @xl:mx-[25%] my-4"
        )
          .split(" ")
          .filter((e, i, a) => a.indexOf(e, i + 1) == -1)
          .join(" ")
        return (
          <div key={key} className={classes}>
            <blockquote className="italic text-lg mb-2">{content}</blockquote>
            <p>{"\u2014\u00a0" + author}</p>
          </div>
        )
      } else if ((matchData = match.match(tableInsertRegExp))) {
        const { name, source } = matchData?.groups ?? {}
        const foundTable = resolveTable(
          name,
          source === "" ? provider?.source : source,
          jsonData,
        )
        return foundTable ? (
          <div key={key}>
            <h2 className="text-xl pb-2 relative after:w-full after:h-px after:absolute after:bottom-1 after:bg-current after:left-0 after:right-0 text-center mt-4 -mb-6">
              {foundTable.displayName}
            </h2>
            <Table
              table={foundTable.table}
              data={foundTable.content}
              footnotes={foundTable.footnotes}
              source={source ?? provider.source}
              formula={foundTable?.formula}
            />
          </div>
        ) : (
          match
        )
      } else if ((matchData = match.match(tableRegExp))) {
        const { name, display, source } = matchData?.groups ?? {}
        const foundTable = resolveTable(
          name,
          source === "" ? provider.source : source ?? jsonData.rootSource.name,
          jsonData,
        )
        if (!foundTable) {
          console.warn(`'${match}' in '${provider.elementId ?? '[object]'}' could not be resolved`)
          return match
        }
        return (
          <button className="btn" key={key} onClick={() => setTableName(`${name}|${source}`)}>
            {capitalise(display ?? foundTable.displayName)}
          </button>
        )
      } else if ((matchData = match.match(footnoteRegExp))) {
        const { index, displayIndex } = matchData.groups ?? {}
        return (
          <sup key={key}>
            <LinkButton
              elementId={`footnote-${passedSection}-${index}`}
              innerText={"\u2020".repeat(+(displayIndex ?? index) + 1)}
              additionalClasses={["italic"]}
            />
          </sup>
        )
      } else if ((matchData = match.match(sectionRegExp))) {
        const { section, item, display, value, source } = matchData?.groups ?? {}
        const resolvedItem = resolveItemDefault(
          section,
          item,
          source === "" ? provider.source : source,
        )
        if (!resolvedItem) {
          console.warn(`'${match}' in '${provider.elementId ?? '[object]'}' could not be resolved`)
          return match
        }

        const displayName =
          (display
            ? display
            : resolvedItem?.displayName?.replace(/\s*\(x\)/, "")) +
          (value
            ? `\u00a0(${value
                .split(",")
                .map((group) =>
                  resolvedItem?.groups?.[group]
                    ? (
                      typeof resolvedItem.groups[group] === 'string'
                        ? resolvedItem.groups[group]
                        : resolvedItem.groups[group].name
                      )
                    : group,
                )
                .join(", ")})`
            : "")

        return (
          <ItemLinkButton
            key={key}
            innerText={displayName}
            item={resolvedItem}
          />
        )
      } else {
        return match
      }
    },
  )

  return replaced.findIndex((e) => isValidElement(e) && e.type === "div") ==
    -1 && insertParagraphs ? (
    <p className={className}>{replaced}</p>
  ) : (
    <>{replaced}</>
  )
}

export default Parser
