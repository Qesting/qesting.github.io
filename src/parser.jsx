import { useContext } from "react";
import { JsonData } from "./JsonDataContext";
import { StateFunctionsContext } from "./StateFunctionsContext";
import reactStringReplace from "react-string-replace";

export function scrollButton(elementId, innerText, additionalClasses=null) {
    return (<a href={`#${elementId}`} className={["text-blue-700 underline capitalize"].concat(additionalClasses).join(' ')}>{innerText}</a>)
}

export function rollFromString(str, target) {
    const formula = (str ?? '1k100').replace(/\s+/, '').match(/(?<number>\d+)?[kd](?<type>\d+)(kh(?<highest>\d+)|kl(?<lowest>\d+))?(?<bonus>[+-]\d+)?/);
    const {
        number,
        type,
        highest,
        lowest,
        bonus
    } = formula.groups.percent ? {
        ...formula.groups,
        number: 1,
        type: 100
    } : formula.groups;
    const result = Array(+(number ?? 1)).fill(0).map(e => ({value: Math.round(Math.random() * (type - 1)) + 1}));
    for (let i = 0; i < number - (highest ?? lowest); i++) {
        result.find(e => e.value === (lowest ? Math.max : Math.min)(...result.filter(f => !f?.ignore).map(f => f.value)) && !e?.ignore).ignore = true;
    }
    return ({
        total: result.reduce((total, e) => total + (!e?.ignore && e.value), 0) + +(bonus ?? null),
        rolls: result,
        highest: highest ?? null,
        lowest: lowest ?? null,
        bonus: bonus ?? null,
        type: +type,
        target: +target
    });
}

export function parser(text, passedSection, replacementContext) {
    const jsonData = useContext(JsonData);
    const { setDiceResult, setTableName } = replacementContext ?? useContext(StateFunctionsContext);
    const replacedDice = reactStringReplace(
        text,
        /@dice\{(?<display>.*?)\}/,
        match => {
            const { formula, displayAs1, displayAs2, targetPercent} = match.match(/(?<formula>\d*[kd]\d+(k[hl]\d+)?([+-]\d+)?)(\|(?<displayAs1>[khld\d+-]+))?|(?<targetPercent>\d+)\%(\|(?<displayAs2>.+))?/)?.groups ?? {};
            const displayAs = displayAs2 ?? displayAs1;
            return (
                <button className="text-blue-700 underline" onClick={() => {
                    setDiceResult(rollFromString(formula, targetPercent))
                }}>{displayAs ?? formula ?? match}</button>
            );
        }
    );
    const replacedRollables = reactStringReplace(
        replacedDice,
        /@table\{(?<table>.*?)\}/,
        match => {
            const [ tableName, displayName ] = match.split('|');
            const foundTable = jsonData.tables.find(table => table.name === tableName);
            return foundTable ? (
                <button className="text-blue-700 underline capitalize" onClick={() => setTableName(tableName)}>{ displayName ?? foundTable.displayName }</button>
            ) : match;
        }
    );
    const replacedFootnoteLinks = reactStringReplace(
        replacedRollables,
        /@footnote\{(?<footnoteIndex>\d+)\}/,
        match => {
            const footnoteIndex = +match;
            return scrollButton(`footnote-${passedSection}-${footnoteIndex}`, '\u2020'.repeat(footnoteIndex + 1), ['italic']);
        }
    );
    const replacedSectionLinks = reactStringReplace(
        replacedFootnoteLinks,
        /(?<matched>@[a-z]+\{.*?\})/g,
        match => {
            const {
                section,
                item,
                displayAs,
                value1,
                value2
            } = match.match(/@(?<section>[a-z]+)\{(?<item>\<|\>?[a-zA-Z]+)(\|{2}(?<value>.+?)|\|(?<displayAs>.*?)(\|(?<value2>.*?))?)?\}/)?.groups ?? {};
            const value = value2 ?? value1;
            const foundSection = jsonData.sections.find(e => e.name === section);
            if (!foundSection) {
                return match;
            }
            if (item === '<') {
                return scrollButton(`section-${section}`, foundSection.displayName);
            }
            if (item.startsWith('>') && foundSection.hasSubs) {
                const subSection = foundSection.content.find(e => e?.name === item.substring(1));
                return scrollButton(`section-${section}-${subSection.name}`, subSection.displayName);
            }
            let sectionName = section;
            let foundItem = null;
            let replacementItem = null;
            let noDescSkipped = false;
            for (let index = 0; index < foundSection?.content?.length; index++) {
                if (foundSection.hasSubs) {
                    for (let jndex = 0; jndex < foundSection.content[index].content.length; jndex++) {
                        const testedItem = foundSection.content[index].content[jndex];
                        if (testedItem.name === item || noDescSkipped) {
                            if (noDescSkipped) {
                                if (testedItem.noDesc) {
                                    continue;
                                } else {
                                    replacementItem = testedItem.name;
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
                } else if (foundSection.content[index].name === item || noDescSkipped) {
                    const testedItem = foundSection.content[index];
                    if (noDescSkipped) {
                        if (testedItem.noDesc) {
                            continue;
                        } else {
                            replacementItem = testedItem.name;
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
            const id = `item-${sectionName}-${replacementItem ?? item}`;
            return foundItem ? scrollButton(id, value ? (foundItem.displayName.endsWith('(x)') ? foundItem.displayName.replace('(x)', `(${value})`) : `${foundItem.displayName}(${value})`) : displayAs ?? foundItem.displayName) : match;
        }   
    );

    return replacedSectionLinks;
};