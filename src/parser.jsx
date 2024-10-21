import { useContext } from "react";
import { JsonData } from "./JsonDataContext";
import { StateFunctionsContext } from "./StateFunctionsContext";
import reactStringReplace from "react-string-replace";

export function scrollButton(elementId, innerText, additionalClasses=null) {
    return (<a href={`#${elementId}`} className={["text-blue-700 underline capitalize"].concat(additionalClasses).join(' ')}>{innerText}</a>)
}

export function rollFromString(str, target) {
    const formula = str.replace(/\s+/, '').match(/(?<number>\d+)?[kd](?<type>\d+)(kh(?<highest>\d+)|kl(?<lowest>\d+))?(?<bonus>[+-]\d+)?/);
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

export function parser(text, passedSection) {
    const jsonData = useContext(JsonData);
    const { setDiceResult, setTableName } = useContext(StateFunctionsContext);
    const replacedDice = reactStringReplace(
        text,
        /@dice\{(?<display>.*?)\}/,
        match => {
            const { formula, displayAs, targetPercent} = match.match(/(?<formula>\d*[kd]\d+(k[hl]\d+)?([+-]\d+))(\|(?<displayAs>[khld\d+-]+))?(\|(?<percent>\d+)\%)?/)?.groups ?? {};
            return (
                <button className="text-blue-700 underline" onClick={() => {
                    setDiceResult(rollFromString(formula, targetPercent))
                }}>{displayAs ?? formula}</button>
            );
        }
    );
    const replacedFootnoteLinks = reactStringReplace(
        replacedDice,
        /@footnote\{(?<footnoteIndex>\d+)\}/,
        match => {
            const footnoteIndex = +match;
            return scrollButton(`footnote-${passedSection}-${footnoteIndex}`, '\u2020'.repeat(footnoteIndex + 1), ['italic']);
        }
    );
    const replacedSectionLinks = reactStringReplace(
        replacedFootnoteLinks,
        /(?<matched>@[a-z]+?\{.*?\})/g,
        match => {
            const {
                section,
                item,
                displayAs,
                areaRadius
            } = match.match(/(?<section>[a-z]+)\{(?<item>[a-zA-Z\s]+)(\|(?<displayAs>.*?)(\|(?<areaRadius>\d+))?)?\}/)?.groups ?? {};
            const foundSection = jsonData.sections.find(e => e.name === section);
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
            return foundItem ? scrollButton(id, areaRadius ? foundItem.displayName.replace('(x)', `(${areaRadius})`) : displayAs ?? foundItem.displayName) : match;
        }   
    );

    return replacedSectionLinks;
};