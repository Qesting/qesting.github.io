import {AlreadyResolvedType} from "../contexts/AlreadyResolvedContext"
import {JsonDataType} from "../contexts/JsonDataContext"
import capitalize from "./capitalize"
import {mathRegExp, replacerRegExp} from "./ParserRegExp"
import {Alias, itemIsSection, RPCItem, RPCSection, RPCTable,} from "./types"

export interface ResolveItemDefault {
  (sectionName: string, itemName: string, source: string): RPCItem|null
}

export interface GetFieldValueDefault {
  (obj: { [key: string]: any }, fieldPath: string): any
}

export function childrenAndSelf(
  section: RPCSection,
): RPCSection[] {
  return section.children
    ? [section].concat(
        ...section.children
          .filter((c) => itemIsSection(c))
          .map((c) => childrenAndSelf(c)),
      )
    : [section]
}

export function resolveItem(
  sectionName: string,
  itemName: string,
  source: string|undefined,
  alreadyResolved: AlreadyResolvedType,
  jsonData: JsonDataType,
): RPCItem|null {
  if (!source) return null
  if (alreadyResolved?.[source]?.[sectionName]?.[itemName]) {
    return alreadyResolved[source][sectionName][itemName]
  }
  const section = jsonData.sections.find((s) => s.name === sectionName)
  if (!section) return null
  if (itemName === "<") return section
  const sectionSet = childrenAndSelf(section)
  if (itemName.startsWith(">"))
    return sectionSet.find(
      (s) => s.name === itemName.substring(1) && s.source === source,
    ) ?? null
  let item: RPCItem|null = null, replacement: RPCItem|null = null
  for (let index = 0; index < sectionSet.length; index++) {
    const ch = sectionSet[index].children
    if (ch !== undefined) {
      for (let jndex = 0; jndex < ch.length; jndex++) {
        const aliased = ch[jndex]?.alias?.find(
          (a: Alias) => a.name === itemName,
        )
        if (
          (ch[jndex]?.name === itemName || aliased) &&
          sectionSet.map((s) => s.name).includes(sectionSet[index].name) &&
          ch[jndex].source === source
        ) {
          if (
            item &&
            !replacement &&
            !ch[jndex]?.noDesc
          ) {
            replacement = ch[jndex]
          } else {
            item = ch[jndex]
          }
          if (aliased) {
            item = { ...item, displayName: aliased.displayName }
          }
          if (!item.noDesc) {
            break
          }
        }
      }
    }
    if (item) {
      break
    }
  }
  if (!item) return null
  if (!alreadyResolved[source]) {
    alreadyResolved[source] = {}
  }
  if (!alreadyResolved[source][sectionName]) {
    alreadyResolved[source][sectionName] = {}
  }
  alreadyResolved[source][sectionName][itemName] = replacement ?? item
  return replacement ?? item
}

export function resolveTable(
  tableName: string,
  source: string,
  jsonData: JsonDataType,
): RPCTable|null {
  const actualSource = source ? source : jsonData.rootSource.name
  return jsonData.tables?.find(
    (t) => t.name === tableName && t.source === actualSource,
  ) ?? null
}

export function prepare(
  text: string,
  provider?: { [key: string]: any },
  itemIndex?: number,
) {
  const noOrphanLinkers =
    text?.replace?.(/(?<=\P{L}\p{L}{1,3}) /gu, "\u00a0") ?? ""

  const parentNameReplaced = provider?.displayName
    ? noOrphanLinkers.replace("$parent", provider.displayName)
    : noOrphanLinkers

  return parentNameReplaced.replace(
      /\$index(?::\d+)?/,
      (match) => {
        const startIndex = match.indexOf(":")
        const start = startIndex !== -1 ? +match.substring(startIndex + 1) : 0
        return ((itemIndex ?? 0) + start).toString()
      },
  )
}

/**
 * Get value of flattened key from object
 *
 * @param {Object} obj
 * @param {String} fieldPath
 * @param resolveItemDefault
 */
export function getFieldValue(
  obj: { [key: string]: any },
  fieldPath: string,
  resolveItemDefault: ResolveItemDefault,
): any {
  let subject = obj
  const fieldParts = fieldPath.split(".")
  for (let index = 0; index < fieldParts.length; index++) {
    if (!fieldParts[index]) continue
    const [part, partSection, partSource] = fieldParts[index].split("=")
    if (!subject) return subject
    subject = part.startsWith("@")
      ? resolveItemDefault(partSection, subject[part.substring(1)], partSource)
      : subject[part]
  }
  return subject
}

export function replaceText(
  text: string,
  passedSection: string,
  resolveItemDefault: ResolveItemDefault,
  provider: { [key: string]: any },
  getFieldValue: GetFieldValueDefault,
): string {
  return text.replace(/(\$\{.*?[^\\]})/g, (match) => {
    const { operation, field, optString } =
      match?.match(replacerRegExp)?.groups ?? {}
    const opts: { [key: string]: any } = {}
    if (optString) {
      for (const opt of optString.split("|")) {
        const [key, value] = opt.split("=")
        opts[key] = ["true", "false"].includes(value)
          ? value === "true"
          : (value ?? true)
      }
    }
    const fieldParts = field.split(".")
    const providerParts =
      fieldParts.length > 1 ? fieldParts[1].split("=") : ['', '']
    const trueProvider = field.startsWith("#")
      ? resolveItemDefault(
          fieldParts[0].substring(1),
          providerParts[0],
          providerParts[1],
        )
      : provider
    if (!trueProvider) return text
    const trueField = field.startsWith("#")
      ? fieldParts.slice(2).join(".")
      : field
    let result: any
    try {
      let section = opts?.section ?? passedSection
      const divider = section.indexOf("-")
      section = section.substring(0, divider !== -1 ? divider : section.length)

      switch (operation) {
        case "bool": {
          result = getFieldValue(trueProvider, trueField)
            ? (opts?.ifTrue ?? "tak")
            : (opts?.ifFalse ?? "nie")
          break
        }
        case "insert": {
          result = getFieldValue(trueProvider, trueField)?.toString()
          break
        }
        case "insertArray": {
          const realField =
            getFieldValue(trueProvider, trueField) ?? opts.ifUndef ?? []
          result =
            realField === opts.ifUndef
              ? realField
              : [opts?.prepend, ...realField, opts?.append]
                  .filter((e) => !(e === null || e === undefined))
                  .join(opts?.sep ?? ",")
          break
        }
        case "insertKeys": {
          result = Object.keys(getFieldValue(trueProvider, trueField)).join(
            opts?.sep ?? ",",
          )
          break
        }
        case "insertValues": {
          result = Object.values(getFieldValue(trueProvider, trueField)).join(
            opts?.sep ?? ",",
          )
          break
        }
        case "insertLinkTo": {
          result = `@${section}{${getFieldValue(trueProvider, trueField)}}`
          break
        }
        case "insertItemName": {
          result = resolveItemDefault(
            section,
            getFieldValue(trueProvider, trueField).toString(),
            opts?.source,
          )?.displayName
          break
        }
        case "mapArray": {
          const realField =
            getFieldValue(trueProvider, trueField) ?? opts.ifUndef ?? []
          const resultArray = []
          const format = opts?.format ?? "$e"
          for (let index = 0; index < realField.length; index++) {
            resultArray.push(
              format
                .replace("$index", index)
                .replace("$name", provider.name)
                .replace(/(\$item\.(?<rfield>[a-zA-Z_]+))/g, (match: RegExpMatchArray) => {
                  const { rfield } = match?.groups ?? {}
                  return getFieldValue(trueProvider, rfield)
                })
                .replace(/\$e\.[a-zA-Z_?']+/g, (match: string) => {
                  const rfield = match.substring(match.indexOf(".") + 1)
                  const fieldChain = rfield.split(/(?<=[^\\])\?/)
                  for (
                    let fieldIndex = 0;
                    fieldIndex < fieldChain.length;
                    fieldIndex++
                  ) {
                    const fieldValue = fieldChain[fieldIndex]
                      ? fieldChain[fieldIndex].charAt(0) === "'"
                        ? fieldChain[fieldIndex].substring(
                            1,
                            fieldChain[fieldIndex].length - 1,
                          )
                        : getFieldValue(
                            realField[index],
                            fieldChain[fieldIndex],
                          )
                      : realField[index]
                    if (fieldValue !== undefined && fieldValue !== null) {
                      return fieldValue
                    }
                  }
                  return getFieldValue(realField[index], rfield)
                })
                .replaceAll("\\}", "}"),
            )
          }
          result = resultArray.join(opts?.sep ?? ",")
          break
        }
        case "mapObject": {
          const realField =
            getFieldValue(trueProvider, trueField) ?? opts.ifUndef ?? {}
          const resultArray = []
          const format = opts?.format ?? "$e"
          const keys = Object.keys(realField)
          for (let index = 0; index < keys.length; index++) {
            resultArray.push(
              format
                .replace("$key", keys[index])
                .replace("$name", provider.name)
                .replace(/(\$item\.(?<rfield>[a-zA-Z_]+))/, (match: RegExpMatchArray) => {
                  const { rfield } = match?.groups ?? {}
                  return getFieldValue(trueProvider, rfield)
                })
                .replace(/\$e\.[a-zA-Z_?']+/g, (match: string) => {
                  const rfield = match.substring(match.indexOf(".") + 1)
                  const fieldChain = rfield.split(/(?<=[^\\])\?/)
                  for (
                    let fieldIndex = 0;
                    fieldIndex < fieldChain.length;
                    fieldIndex++
                  ) {
                    const fieldValue = fieldChain[fieldIndex]
                      ? fieldChain[fieldIndex].charAt(0) === "'"
                        ? fieldChain[fieldIndex].substring(
                            1,
                            fieldChain[fieldIndex].length - 1,
                          )
                        : getFieldValue(
                            realField[keys[index]],
                            fieldChain[fieldIndex],
                          )
                      : realField[index]
                    if (fieldValue !== undefined && fieldValue !== null) {
                      return fieldValue
                    }
                  }
                  return getFieldValue(realField[index], rfield)
                })
                .replaceAll("\\}", "}"),
            )
          }
          result = resultArray.join(opts?.sep ?? ",")
          break
        }
      }
    } catch (e) {
      console.error(e)
      return match
    }
    return opts?.capitalize ? capitalize(result) : result
  })
}

export function replaceMathTags(text: string): string {
  return text.replace(/(\^.*?\^)/, (match) => {
    const { equation, substituteText, modifiers } =
      match?.match(mathRegExp)?.groups ?? {}
    const heap: number[] = []
    const equationParts = equation.split(/\s+/)
    const radix = modifiers
      ? modifiers.indexOf("b") + 1
        ? 2
        : modifiers.indexOf("o") + 1
          ? 8
          : modifiers.indexOf("h") + 1
            ? 16
            : 10
      : 10
    const integersOnly = modifiers && modifiers?.search(/i[boh]?/) !== -1
    try {
      while (equationParts.length) {
        const part = equationParts.shift() ?? ''
        // the above coalescing will not happen
        // it is a guard for TypeScript, but the loop condition prevents it
        const partAsNumber = integersOnly
          ? parseInt(part, radix)
          : parseFloat(part)
        if (Number.isNaN(partAsNumber)) {
          const number2 = heap.pop() ?? 0
          const number1 = heap.pop() ?? 0

          if (part === "+") {
            heap.push(number1 + number2)
          } else if (part === "-") {
            heap.push(number1 - number2)
          } else if (part === "*") {
            heap.push(number1 * number2)
          } else if (part === "/") {
            heap.push(number1 / number2)
          } else if (part === "**") {
            heap.push(Math.pow(number1, number2))
          } else {
            throw new Error(`Unrecognized math operator '${part}'`)
          }
        } else {
          heap.push(partAsNumber)
        }
      }
      const intl = new Intl.NumberFormat("pl")
      return intl.format(heap.pop() ?? 0)
    } catch (e) {
      console.error(e)
      return substituteText ?? match
    }
  })
}

export function simplifyFormula(formula: string): string {
  return formula?.replace(/(?:[+-]\d+)+/, (m) => {
    const replaced = m
      .split(/(?=[+-])/g)
      .reduce((total, current) => +total + parseInt(current), 0)
    return replaced < 0
      ? replaced.toString()
      : replaced > 0
        ? "+" + replaced
        : ""
  })
}
