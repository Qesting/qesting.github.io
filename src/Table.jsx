import { useRef, useContext } from "react";
import Parser from "./Parser";
import PropTypes from 'prop-types';
import rollFromString from "./rollDice";
import { XCircleFill } from "react-bootstrap-icons";
import { StateFunctionsContext } from "./StateFunctionsContext";
import SectionNameContext from "./SectionNameContext";
import DataProviderContext from "./DataProviderContext";

function Table({table, data, hasSubs, footnotes, formula, displayName}) {
    const keys = Object.keys(table ?? {});
    const locations = {
        head: "głowa",
        body: "korpus",
        leftArm: "lewa ręka",
        rightArm: "prawa ręka",
        leftLeg: "lewa noga",
        rightLeg: "prawa loga",
        arms: "ręce",
        legs: "nogi",
    };
    const renown = [
        "-",
        "szanowany",
        "odznaczony",
        "sławny",
        "bohater"
    ];
    const rangedClass = {
        basic: "zwykła",
        pistol: "pistolet",
        heavy: "ciężka",
        mounted: "stała",
        thrown: "rzucana",
        melee: "biała"
    };
    const damageType = {
        explosion: "wybuch",
        energy: "energia",
        impact: "uderzenia",
        rending: "rozrywające"
    };
    const rowContainer = useRef()
    const rollOnTable = () => {
        const roll = rollFromString(formula ?? 'd100').total;
        const rowIndex = data.findIndex(item => item?.match ? item.match === roll : (item.range.min ?? -Infinity) <= roll && (item.range.max ?? Infinity) >= roll)
        const row = rowContainer.current.children[rowIndex]
        row.scrollIntoView();
        row.classList.add('!bg-amber-500')
        self.setTimeout(() => row.classList.remove('!bg-amber-500'), 500)
    };
    const tableNameSetter = useContext(StateFunctionsContext).closeTableDialog;
    const section = useContext(SectionNameContext)
    const topSection = section?.split('-')?.shift()
    const usedFootnotes = footnotes?.map((f,i) => data.find(e => Object.values(e?.footnotes ?? {}).includes(i) || e?.qualities?.find?.(q => q?.footnote === i)) || f.startsWith(`{no-daggers|${section.split('-').pop()}}`) ? i : null).filter(e => e !== null) ?? []
    function tableRows(passedData) {
        return passedData?.filter(e => !e?.noTable).map((e, index) => (
            <tr key={index}>
                <DataProviderContext.Provider value={e}>
                    {
                        keys.map((k, jndex) => (
                            <td 
                                key={jndex} 
                                className={(['shortDesc', 'prerequisite', '$roll', '$content', 'content', 'result'].includes(k) ? '' : 'capitalize') + " text-center p-0.5" + (k === "$roll" ? " whitespace-nowrap" : "")}
                            >
                                {
                                    k.startsWith("${") ? (<DataProviderContext.Provider value={e}>
                                        <Parser text={k}/>
                                    </DataProviderContext.Provider>) :
                                    k === '$roll' ? (
                                        e?.match?.toString()?.padStart(2, "0") ?? (
                                            (e?.range?.min?.toString()?.padStart(2, "0") ?? "01")
                                            + (e?.range?.min !== undefined && e?.range?.max !== undefined ? "\u2013" : "")
                                            + (e?.range?.max?.toString()?.padStart(2, "0") ?? "+")
                                        )
                                    ) :
                                    k === '$content' ? (<><strong className="font-bold capitalize">{e.title}</strong> <Parser text={e.content} passedSection={section}/></>) :
                                    (k.startsWith('$') ? e[k.substring(1)] === undefined && k !== '$covers' : e[k] === undefined) ? '\u2013' :
                                    e[k] === null ? 'N/D' :
                                    k === '$armor' ? (typeof e.armor === 'string' ? e.armor : Object.values(e.armor).filter(f => f !== null).join('/')) : 
                                    k === '$covers' ?  (e.armor === undefined ? '\u2013' : typeof e?.armor === 'string' ? (<Parser text={e.armor} passedSection={section}/>) : (e.armor.general ? 'wszystkie' : Object.keys(e.armor).filter(l => e.armor[l] !== null).map(l => locations[l]).join(', '))) :
                                    k === '$name' ? (<Parser text={`@${topSection}{${e.name}}${e?.source && e.source !== 'CRB' ? '{' + e.source + '}' : ''}`} passedSection={section}/>)  : 
                                    k === '$renown' ? ( renown[e.renown] ?? e.renown ) :
                                    k === '$rof' ? Object.values(e.rof).map(f => f ? (typeof f === 'number' ? f : 'S') : '-').join('/') :
                                    k === '$damage' ? (typeof e.damage !== 'string' ? (<span>{<Parser text={`@dice{${e.damage.formula + (e.damage.display ? '|' + e.damage.display : '')}}`} passedSection={section}/>}&nbsp;{damageType[e.damage.type]}</span>) : e.damage ):
                                    k === '$class' ? rangedClass[e.class] : 
                                    k === '$qualities' ? (typeof e.qualities !== 'string' ? (<Parser text={e.qualities.map(f => (typeof f === 'string' ? `@quality{${f}}` : f?.value ? `@quality{${f.name}||${f.value}}` : `@quality{${f.name}}`) + (f.footnote ? `@footnote{${f.footnote}|${usedFootnotes.indexOf(f.footnote)}}` : '')).join(', ')} passedSection={section}/>) : e.qualities) :
                                    k === '$range' ? (typeof e.range === 'number' ? `${e.range}m` : e.range) :
                                    k === '$reload' ? (typeof e.reload === 'number' ? `${e.reload} akcji podw.` : e.reload) : 
                                    k === '$protectionRating' ? (<Parser text={`@dice{${e.protectionRating}%}`} passedSection={section}/>) : 
                                    k === '$overload' ? (<Parser text={`@dice{${e.overload}%|${e.overload === 1 ? '01' : '01-' + (e.overload+[]).padStart(2, '0')}}`} passedSection={section}/>) :
                                    Array.isArray(e[k]) ? e[k].join(', ') : 
                                    (<Parser text={(e[k] + [])} passedSection={section}/>)
                                }
                                {
                                    e?.footnotes?.[k] !== undefined && (
                                        <Parser text={`@footnote{${e?.footnotes?.[k]}|${usedFootnotes ? usedFootnotes.indexOf(e?.footnotes?.[k]) : ""}}`} passedSection={section}/>
                                    )
                                }
                            </td>
                        ))
                    }
                </DataProviderContext.Provider>
            </tr>
        ));
    }

    return (
        <table className="w-full my-8 overflow-x-scroll">
            <thead>
                {
                    !section && (
                        <tr>
                           <th
                            className='text-center capitalize font-bold'
                            colSpan={keys.length}
                           >{displayName}</th> 
                        </tr>
                    )
                }
                <tr className="relative">
                    {
                        keys.map((k, index) => (<th key={index} className="capitalize">{k === '$roll' ? (
                            <button
                                className="btn !normal-case"
                                onClick={rollOnTable}
                            >{ formula ?? 'k100' }</button>
                        ) : table[k]}</th>))
                    }
                    {
                        !section && (
                            <button
                                className="text-inherit transition-colors duration-200 hover:text-red-600 text-center absolute top-1 right-2"
                                onClick={() => tableNameSetter(false)}
                            >
                                <XCircleFill/>
                            </button>
                        )
                    }
                </tr>
            </thead>
            <tbody ref={rowContainer}>
                {
                    hasSubs ? (
                        data.map(f => (
                            <>
                                <tr>
                                    <th colSpan={keys.length} className="uppercase">{f.displayName}</th>
                                </tr>
                                {
                                    tableRows(f.content)
                                }
                            </>
                        ))
                    ) : tableRows(data)

                }
                {
                    usedFootnotes?.map((e, index) => (
                        <tr id={`footnote-${section}-${e}`} key={index} className="focus:text-accent transition-colors duration-300" tabIndex={-1}>
                            <td colSpan={keys.length} className="italic">{footnotes[e].startsWith('{no-daggers}') ? ' ' : '\u2020'.repeat(index + 1)+ ' '}{<Parser text={footnotes[e].replace(/\{no-daggers\|.*?\}/, '')}/>}</td>
                        </tr>
                    ))
                }
            </tbody>
        </table>
    );
}

Table.propTypes = {
    table: PropTypes.object,
    data: PropTypes.arrayOf(PropTypes.object),
    section: PropTypes.string,
    hasSubs: PropTypes.bool,
    footnotes: PropTypes.arrayOf(PropTypes.string),
    formula: PropTypes.string,
    displayName: PropTypes.string,
};

export default Table;