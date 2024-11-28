import { useContext } from "react";
import { JsonData } from "./JsonDataContext";
import { StateFunctionsContext } from "./StateFunctionsContext";
import reactStringReplace from "react-string-replace";
import PropTypes from 'prop-types';
import rollFromString from './rollDice';
import LinkButton from "./LinkButton";

function Parser({text, passedSection, replacementContext}) {
    const jsonData = useContext(JsonData);
    const receivedContext = useContext(StateFunctionsContext);
    const { setDiceResult, setTableName } = replacementContext ?? receivedContext;

    const quoteRegExp = /^@quote\{(?<content>.*)\|(?<author>.*)\}$/
    const sectionRegExp = /@(?<section>\w+)\{(?<item><|>?\w+)(-(?<variant>\w+))?(\|(?<display>[\d\p{Alpha} ]+)?)?(\|(?<value>[\p{Alpha}\d ]+))?\}/u
    const replacedDice = reactStringReplace(
        text,
        /@dice\{(?<display>.*?)\}/,
        match => {
            const { formula, displayAs1, displayAs2, targetPercent} = match.match(/(?<formula>\d*[kd]\d+(k[hl]\d+)?([+-]\d+)?)(\|(?<displayAs1>[khld\d+-]+))?|(?<targetPercent>\d+)%(\|(?<displayAs2>.+))?/)?.groups ?? {};
            const displayAs = displayAs2 ?? displayAs1;
            return (
                <button className="btn !normal-case" onClick={() => {
                    setDiceResult(rollFromString(formula, targetPercent))
                }}>{displayAs ?? formula ?? match}</button>
            );
        }
    );
    const replacedQuotes = reactStringReplace(
        replacedDice,
        /^(@quote\{.*})$/,
        match => {
            const {
                content,
                author
            } = match.match(quoteRegExp)?.groups ?? {}
            return (
                <div className="rounded-md bg-gray-200 dark:bg-gray-800 py-2 px-4 mx-4 md:mx-[12.5%] lg:mx-[16.7%] xl:mx-[25%] my-4">
                    <blockquote className="italic text-lg mb-2">{content}</blockquote>
                    <p>{"\u2024" + author}</p>
                </div>
            ) 
        }
    )
    const replacedRollables = reactStringReplace(
        replacedQuotes,
        /@table\{(?<table>.*?)\}/,
        match => {
            const [ tableName, displayName ] = match.split('|');
            const foundTable = jsonData.tables.find(table => table.name === tableName);
            return foundTable ? (
                <button className="btn" onClick={() => setTableName(tableName)}>{ displayName ?? foundTable.displayName }</button>
            ) : match;
        }
    );
    const replacedFootnoteLinks = reactStringReplace(
        replacedRollables,
        /(@footnote\{\d+(?:\|\d+)?\})/g,
        match => {
            const {footnoteIndex, display} = match.match(/@footnote\{(?<footnoteIndex>\d+)(?:\|(?<display>\d+))?\}/)?.groups ?? {};
            return (<sup><LinkButton elementId={`footnote-${passedSection}-${footnoteIndex}`} innerText={'\u2020'.repeat(+(display ?? footnoteIndex) + 1)} additionalClasses={['italic']}/></sup>);
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
            const foundSection = jsonData.sections.find(e => e.name === section);
            if (!foundSection) {
                return match;
            }
            if (item === '<') {
                return (<LinkButton elementId={`section-${section}`} innerText={foundSection.displayName}/>);
            }
            if (item.startsWith('>') && foundSection.hasSubs) {
                const subSection = foundSection.content.find(e => e?.name === item.substring(1));
                return (<LinkButton elementId={`section-${section}-${subSection.name}`} innerText={subSection.displayName}/>);
            }
            let sectionName = section;
            let foundItem = null;
            let replacementItem = null;
            let noDescSkipped = false;
            let alias = null;
            for (let index = 0; index < foundSection?.content?.length; index++) {
                alias = foundSection.content[index]?.alias?.find(a => a.name === item)
                if (foundSection.hasSubs) {
                    for (let jndex = 0; jndex < foundSection.content[index].content?.length; jndex++) {
                        const testedItem = foundSection.content[index].content[jndex];
                        alias = testedItem?.alias?.find(a => a.name === item);
                        if (testedItem.name === item || noDescSkipped || alias) {
                            if (alias) {
                                foundItem = alias;
                                replacementItem = testedItem.name;
                            } else if (noDescSkipped) {
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
                } else if (foundSection.content[index].name === item || noDescSkipped || alias) {
                    const testedItem = foundSection.content[index];
                    if (alias) {
                        foundItem = alias;
                        replacementItem = testedItem.name;
                    } else if (noDescSkipped) {
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
            return foundItem 
                ? (
                    <LinkButton 
                        elementId={id} 
                        innerText={
                            value 
                                ? (foundItem.displayName.endsWith('(x)') ? foundItem.displayName.replace('(x)', `(${value})`) : `${foundItem.displayName}(${value})`) 
                                : display ?? foundItem.displayName
                        }
                    />) 
                : match;
        }   
    );

    return (<>{replacedSectionLinks}</>);
};

Parser.propTypes = {
    text: PropTypes.string,
    passedSection: PropTypes.string,
    replacementContext: PropTypes.object
};

export default Parser;