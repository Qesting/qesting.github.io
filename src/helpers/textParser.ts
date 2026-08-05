import { AlreadyResolvedType } from "../contexts/AlreadyResolvedContext"
import { JsonDataType } from "../contexts/JsonDataContext"
import capitalise from "./capitalize"
import {
  resolveItem,
  getFieldValue,
  prepare,
  replaceText,
  replaceMathTags,
  resolveTable,
  simplifyFormula,
} from "./parserHelpers"
import {
  generalRegExp,
  diceRegExp,
  quoteRegExp,
  tableInsertRegExp,
  tableRegExp,
  footnoteRegExp,
  sectionRegExp,
} from "./ParserRegExp"
import { RPCItem } from "./types"

export function textParser(
  text: string,
  provider: { [key: string]: any },
  itemIndex: number,
  passedSection: string,
  cap: boolean,
  jsonData: JsonDataType,
  alreadyResolved: AlreadyResolvedType,
) {
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

  return capitalized.replaceAll(generalRegExp, (match) => {
    let matchData: RegExpMatchArray|null
    if ((matchData = match.match(diceRegExp))) {
      const { formula } = matchData?.groups ?? {}
      return simplifyFormula(formula)
    } else if ((matchData = match.match(quoteRegExp))) {
      const { content, author } = match.match(quoteRegExp)?.groups ?? {}
      return `> ${content}\n—${author}`
    } else if ((matchData = match.match(tableInsertRegExp))) {
      const { name, source } = matchData?.groups ?? {}
      const foundTable = resolveTable(
        name,
        source === "" ? provider.source : source,
        jsonData,
      )
      return foundTable ? capitalise(foundTable.displayName) : match
    } else if ((matchData = match.match(tableRegExp))) {
      const { name, display, source } = matchData?.groups ?? {}
      const foundTable = resolveTable(
        name,
        source === "" ? provider.source : source,
        jsonData,
      )
      return foundTable ? capitalise(display ?? foundTable.displayName) : match
    } else if ((matchData = match.match(footnoteRegExp))) {
      const { index, displayIndex } = matchData.groups ?? {}
      return "\u2020".repeat(+(displayIndex ?? index) + 1)
    } else if ((matchData = match.match(sectionRegExp))) {
      const { section, item, display, value, source } = matchData?.groups ?? {}
      const resolvedItem = resolveItemDefault(
        section,
        item,
        source === "" ? provider.source : source,
      )
      if (!resolvedItem) console.warn(`'${match}' could not be resolved`)
      if (!resolvedItem) return match

      const displayName =
        (display ? display : resolvedItem?.displayName?.replace(/\s*\(x\)/, "")) +
        (value
          ? ` (${value
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

      return capitalise(displayName)
    } else {
      return match
    }
  })
}
