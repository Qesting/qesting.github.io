/* eslint-disable no-cond-assign */
import { useContext } from "react";
import { JsonDataContext } from "./JsonDataContext";
import { StateFunctionsContext } from "./StateFunctionsContext";
import { AlreadyResolvedContext } from "./AlreadyResolvedContext"
import DataProviderContext from "./DataProviderContext"
import SectionNameContext from "./SectionNameContext";
import reactStringReplace from "react-string-replace";
import PropTypes from 'prop-types';
import rollFromString from './rollDice';
import LinkButton from "./LinkButton";
import Table from "./Table";
import capitalize from "./capitalize";
import { generalRegExp, diceRegExp, tableRegExp, quoteRegExp, sectionRegExp, footnoteRegExp, replacerRegExp, tableInsertRegExp, mathRegExp } from "./ParserRegExp"

function Parser({text, replacementContext, insertParagraphs, className}) {
    const jsonData = useContext(JsonDataContext);
    const passedSection = useContext(SectionNameContext)
    const receivedContext = useContext(StateFunctionsContext);
    const alreadyResolved = useContext(AlreadyResolvedContext)
    const provider = useContext(DataProviderContext)
    const { setDiceResult, setTableName } = replacementContext ?? receivedContext;

    function childrenAndSelf(section, topLevel=true) {
        return section.children ? [section].concat(section.children.map(c => childrenAndSelf(c, false))) : topLevel ? [section] : section
    }

    function resolveItem(sectionName, itemName, source) {
        const trueSource = source ?? "CRB"
        if (alreadyResolved?.[trueSource]?.[sectionName]?.[itemName]) {
            return alreadyResolved[trueSource][sectionName][itemName]
        }
        const section = jsonData.sections.find(s => s.name === sectionName)
        if (!section) return
        if (itemName === "<") return section
        const sectionSet = childrenAndSelf(section)
        if (itemName.startsWith(">")) return sectionSet.find(s => s.name === itemName.substring(1) && (s.source ?? "CRB") === trueSource)
        let item, replacement
        for (let index = 0; index < sectionSet.length; index++) {
            if (!sectionSet[index].items) {
                continue
            }
            for (let jndex = 0; jndex < sectionSet[index].items.length; jndex++) {
                const aliased = sectionSet[index].items[jndex]?.alias?.find(a => a.name === itemName)
                if (
                    (
                        sectionSet[index].items[jndex]?.name === itemName
                        || aliased
                    )
                    && sectionSet.map(s => s.name).includes(sectionSet[index].name)
                    && (sectionSet[index].items[jndex].source ?? "CRB") === trueSource
                ) {
                    if (item && !replacement && !sectionSet[index].items[jndex]?.noDesc) {
                        replacement = sectionSet[index].items[jndex]
                    } else {
                        item = sectionSet[index].items[jndex]
                    }
                    if (aliased) {
                        item = {...item, displayName: aliased.displayName}
                    }
                    if (!item.noDesc) {
                        break
                    }
                }
            }
            if (item) {
                break
            }
        }
        if (!alreadyResolved[trueSource]) {
            alreadyResolved[trueSource] = {}
        }
        if (!alreadyResolved[trueSource][sectionName]) {
            alreadyResolved[trueSource][sectionName] = {}
        }
        alreadyResolved[trueSource][sectionName][itemName] = replacement ?? item
        return replacement ?? item
    }

    function resolveTable(tableName, source) {
        return jsonData.tables?.find(t => t.name === tableName && (t.source ?? "CRB") === (source ?? "CRB"))
    }

    const noOrphanLinkers = text?.replace(/(?<=\P{L}\p{L}{1,3}) /ug, "\u00a0") ?? ""

    const textTagsReplaced = noOrphanLinkers.replace(/(\$\{.*?\})/, match => {
        const {
            operation,
            field,
            subfield,
            optString
        } = match?.match(replacerRegExp)?.groups ?? {}
        const opts = {}
        if (optString) {
            for (const opt of optString.split("|")) {
                const [key, value] = opt.split("=")
                opts[key] = ["true", "false"].includes(value) ? value === "true" : value ?? true
            }
        }
        let result
        try {
            let section = opts?.section ?? passedSection
            const divider = section.indexOf("-")
            section = section.substring(0, divider !== -1 ? divider : section.length)

            switch (operation) {
                case "bool": {
                    result = provider[field] ? opts?.ifTrue ?? 'tak' : opts?.ifFalse ?? 'nie'
                    break
                }
                case "insert": {
                    result = provider[field]?.toString()
                    break
                }
                case "insertArray": {
                    const realField = opts?.ifUndef ? provider[field] ?? opts.ifUndef : provider[field] ?? []
                    result = realField === opts.ifUndef ? realField 
                        : [opts?.prepend, ...realField, opts?.append]
                            .filter(e => !(e === null || e === undefined)).join(opts?.sep ?? " ")
                    break
                }
                case "insertKeys": {
                    result = Object.keys(provider[field]).join(opts?.sep ?? " ")
                    break
                }
                case "insertValues": {
                    result = Object.values(provider[field]).join(opts?.sep ?? " ")
                    break
                }
                case "insertValueAt": {
                    result = provider[field][subfield]
                    break
                }
                case "insertLinkTo": {
                    result = `@${section}{${provider[field]}}`
                    break
                }
                case "insertItemName": {
                    result = resolveItem(section, provider[field], opts?.source).displayName
                    break
                }
            }
        } catch (e) {
            console.error(e)
            return match
        }
        return opts?.capitalize ? capitalize(result) : result
    })

    const mathTagsReplaced = textTagsReplaced.replace(/(\^.*?\^)/, match => {
        const {
            equation,
            modifiers
        } = match?.match(mathRegExp)?.groups ?? {}
        const heap = []
        const equationParts = equation.split(/\s+/)
        const radix = modifiers ? (
            modifiers.indexOf("b") + 1 ? 2 :
            modifiers.indexOf("o") + 1 ? 8 :
            modifiers.indexOf("h") + 1 ? 16 :
            10
        ) : 10
        const integersOnly = modifiers && modifiers?.search(/i[boh]?/) !== -1
        while (equationParts.length) {
            const part = equationParts.shift()
            const partAsNumber = integersOnly ? parseInt(part, radix) : parseFloat(part)
            if (Number.isNaN(partAsNumber)) {
                const number2 = heap.pop()
                const number1 = heap.pop()

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
        return heap.pop().toString()
    })

    const replaced = reactStringReplace(mathTagsReplaced, generalRegExp, (match, index) => {
        let matchData
        if (matchData = match.match(diceRegExp)) {
            const { formula, display } = matchData?.groups ?? {};
            return (
                <button key={index} className="btn !normal-case" onClick={() => {
                    setDiceResult(rollFromString(formula))
                }}>{display ?? formula ?? match}</button>
            );
        } else if (matchData = match.match(quoteRegExp)) {
            const {
                content,
                author
            } = match.match(quoteRegExp)?.groups ?? {}
            const classes = (className + " " + "rounded-md bg-gray-200 dark:bg-gray-800 py-2 px-4 mx-4 md:mx-[12.5%] lg:mx-[16.7%] xl:mx-[25%] my-4")
                .split(' ').filter((e, i, a) => a.indexOf(e, i + 1) == -1).join(' ')
            return (
                <div key={index} className={classes}>
                    <blockquote className="italic text-lg mb-2">{content}</blockquote>
                    <p>{"\u2014\u00a0" + author}</p>
                </div>
            ) 
        } else if (matchData = match.match(tableInsertRegExp)) {
            const {
                name,
                source
            } = matchData.groups
            const foundTable = resolveTable(name, source)
            return foundTable ? (
                <div key={index}>
                    <h2 className="text-xl pb-2 relative after:w-full after:h-px after:absolute after:bottom-1 after:bg-current after:left-0 after:right-0 text-center mt-4 -mb-6">{capitalize(foundTable.displayName)}</h2>
                    <Table table={foundTable.table} data={foundTable.content}/>
                </div>
            ) : match
        } else if (matchData = match.match(tableRegExp)) {
            const {
                name,
                display,
                source
            } = matchData.groups
            const foundTable = resolveTable(name, source)
            return foundTable ? (
                <button className="btn" key={index} onClick={() => setTableName(name)}>{ capitalize(display ?? foundTable.displayName) }</button>
            ) : match
        } else if (matchData = match.match(footnoteRegExp)) {
            const {index, displayIndex} = matchData.groups ?? {};
            return (<sup key={index}><LinkButton elementId={`footnote-${passedSection}-${index}`} innerText={'\u2020'.repeat(+(displayIndex ?? index) + 1)} additionalClasses={['italic']}/></sup>);
        } else if (matchData = match.match(sectionRegExp)) {
            const {
                section,
                item,
                display,
                value,
                source
            } = matchData.groups

            const resolvedItem = resolveItem(section, item, source)
            if (!resolvedItem) console.warn(`'${match}' could not be resolved`)
            if (!resolvedItem) return match

            const itemId = 
                // top level section
                item.displayName === section
                ? `section-${section}`
                // subsections
                : item.startsWith(">")
                ? `section-${section}-${resolvedItem.name}`
                // items
                : `item-${section}-${resolvedItem.name}`

            const displayName = (display ? display : resolvedItem.displayName.replace("(x)", "")).replace(' ', '\u2004') + (value ? ( resolvedItem?.groups?.[value] ? `(${resolvedItem.groups[value]})` : `(${value})`) : "")
            
            return (<LinkButton key={index} innerText={displayName} elementId={itemId}/>)
        } else {
            return match
        }
    }) 

    return replaced.findIndex(e => e?.type === "div") == -1 & insertParagraphs ? (<p className={className}>{replaced}</p>) : (replaced)
};

Parser.propTypes = {
    text: PropTypes.string,
    passedSection: PropTypes.string,
    replacementContext: PropTypes.object,
    insertParagraphs: PropTypes.bool,
    className: PropTypes.string,
};

export default Parser;