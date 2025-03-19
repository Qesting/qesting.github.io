/* eslint-disable no-cond-assign */
import { useContext } from "react";
import { JsonData } from "./JsonDataContext";
import { StateFunctionsContext } from "./StateFunctionsContext";
import { AlreadyResolvedContext } from "./AlreadyResolvedContext"
import reactStringReplace from "react-string-replace";
import PropTypes from 'prop-types';
import rollFromString from './rollDice';
import LinkButton from "./LinkButton";
import capitalize from "./capitalize";
import { generalRegExp, diceRegExp, tableRegExp, quoteRegExp, sectionRegExp, footnoteRegExp } from "./ParserRegExp"

function Parser({text, passedSection, replacementContext, insertParagraphs, className}) {
    const jsonData = useContext(JsonData);
    const receivedContext = useContext(StateFunctionsContext);
    const alreadyResolved = useContext(AlreadyResolvedContext)
    const { setDiceResult, setTableName } = replacementContext ?? receivedContext;

    function childrenAndSelf(section) {
        return [section, ...jsonData.sections.filter(s => s.parent.startsWith(section))]
    }

    /*function resolveItem(sectionName, itemName, source) {
        if (alreadyResolved?.[sectionName]?.[itemName]) {
            return alreadyResolved[sectionName][itemName]
        }
        const trueSource = source ?? "CRB"
        const section = jsonData.sections.find(s => s.name === sectionName && s.topLevel)
        if (!section) return
        if (itemName === "<") return section
        if (itemName.startsWith(">")) return childrenAndSelf(sectionName).find(s => s.name === itemName.substring(1) && (s.source ?? "CRB") === trueSource)
        let item, replacement
        for (let index = 0; index < jsonData.sections.length; index++) {
            for (let jndex = 0; jndex < jsonData.sections[index].items.length; jndex++) {
                const aliased = jsonData.sections[index].items[jndex]?.alias?.find(a => a.name === itemName)
                if (
                    (
                        jsonData.sections[index].items[jndex]?.name === itemName
                        || aliased
                    )
                    && childrenAndSelf(section).map(s => s.name).includes(jsonData.sections[index].name)
                    && (jsonData.sections[index].items[jndex].source ?? "CRB") === trueSource
                ) {
                    if (item && !replacement && !jsonData.sections[index].items[jndex]?.noDesc) {
                        replacement = jsonData.sections[index].items[jndex]
                    } else {
                        item = jsonData.sections[index].items[jndex]
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
        if (!alreadyResolved[sectionName]) {
            alreadyResolved[sectionName] = {}
        }
        alreadyResolved[sectionName][itemName] = replacement ?? item
        return replacement ?? item
    }*/
    function resolveItem(sectionName, itemName) {
        if (alreadyResolved?.[sectionName]?.[itemName]) {
            return alreadyResolved[sectionName][itemName]
        }
        const foundSection = jsonData.sections.find(e => e.name === sectionName);
        if (!foundSection) {
            return
        }
        if (itemName === '<') {
            return foundSection;
        }
        if (itemName.startsWith('>') && foundSection.hasSubs) {
            return foundSection.content.find(e => e?.name === itemName.substring(1));
        }
        let foundItem = null;
        let replacement = null;
        let noDescSkipped = false;
        let alias = null;
        for (let index = 0; index < foundSection?.content?.length; index++) {
            alias = foundSection.content[index]?.alias?.find(a => a.name === itemName)
            if (foundSection.hasSubs) {
                for (let jndex = 0; jndex < foundSection.content[index].content?.length; jndex++) {
                    const testedItem = foundSection.content[index].content[jndex];
                    alias = testedItem?.alias?.find(a => a.name === itemName);
                    if (testedItem.name === itemName || noDescSkipped || alias) {
                        if (alias) {
                            foundItem = alias;
                            replacement = testedItem;
                        } else if (noDescSkipped) {
                            if (testedItem.noDesc) {
                                continue;
                            } else {
                                replacement = testedItem;
                            }
                        } else {
                            foundItem = foundSection.content[index].content[jndex];
                            sectionName += '-'+foundSection.content[index].name;
                            if (testedItem.noDesc) {
                                noDescSkipped = true;
                                continue;
                            }
                        }
                        break;
                    }
                }
                if (foundItem) break;
            } else if (foundSection.content[index].name === itemName || noDescSkipped || alias) {
                const testedItem = foundSection.content[index];
                if (alias) {
                    foundItem = alias;
                    replacement = testedItem;
                } else if (noDescSkipped) {
                    if (testedItem.noDesc) {
                        continue;
                    } else {
                        replacement = testedItem;
                    }
                } else {
                    foundItem = foundSection.content[index];
                    if (testedItem.noDesc) {
                        noDescSkipped = true;
                        continue;
                    }
                }
                break;
            }
        }
        if (!alreadyResolved[sectionName]) {
            alreadyResolved[sectionName] = {}
        }
        alreadyResolved[sectionName][itemName] = replacement ?? foundItem
        return replacement ?? foundItem
    }

    function resolveTable(tableName, source) {
        return jsonData.tables?.find(t => t.name === tableName && (t.source ?? "CRB") === (source ?? "CRB"))
    }

    const replaced = reactStringReplace(text, generalRegExp, (match, index) => {
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
        } else if (matchData = match.match(tableRegExp)) {
            const {
                name,
                display,
                source
            } = matchData.groups
            const foundTable = resolveTable(name, source)
            return foundTable ? (
                <button className="btn" onClick={() => setTableName(name)}>{ capitalize(display ?? foundTable.displayName) }</button>
            ) : match
        } else if (matchData = match.match(footnoteRegExp)) {
            const {index, displayIndex} = matchData.groups ?? {};
            return (<sup><LinkButton elementId={`footnote-${passedSection}-${index}`} innerText={'\u2020'.repeat(+(displayIndex ?? index) + 1)} additionalClasses={['italic']}/></sup>);
        } else if (matchData = match.match(sectionRegExp)) {
            const {
                section,
                item,
                display,
                value,
                source
            } = matchData.groups

            const resolvedItem = resolveItem(section, item, source)
            if (!resolvedItem) return match

            const itemId = 
                // top level section
                item.displayName === section
                ? `section-${section}`
                // subsections
                : item.startsWith(">")
                ? `section-${section}-${item}`
                // items
                : `item-${section}-${item}`

            const displayName = (display ? display : resolvedItem.displayName.replace("(x)", "")) + (value ? ( resolvedItem?.groups?.[value] ? ` (${resolvedItem.groups[value]})` : ` (${value})`) : "")
            
            return (<LinkButton innerText={displayName} elementId={itemId}/>)
        } else {
            return match
        }
/*
    const replacedFootnoteLinks = reactStringReplace(
        replacedRollables,
        /(@footnote\{\d+(?:\|\d+)?\})/g,
        match => {
            
        }
    );
    const replacedSectionLinks = reactStringReplace(
        replacedFootnoteLinks,
        /(?<matched>@[a-z]+\{.*?\})/g,
        match => {
            const {
                section,
                item,
                display,
                value
            } = match.match(sectionRegExp)?.groups ?? {};
            
    );*/
    }) 

    return replaced.findIndex(e => e?.type === "div") == -1 & insertParagraphs ? (<p className={className}>{replaced}</p>) : (replaced)
};

Parser.propTypes = {
    text: PropTypes.string,
    passedSection: PropTypes.string,
    replacementContext: PropTypes.object,
    insertParagraphs: PropTypes.bool,
    className: PropTypes.string
};

export default Parser;