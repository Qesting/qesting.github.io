import { useRef, useState, useEffect, useMemo, useContext } from "react";
import Parser from "./Parser";
import PropTypes from 'prop-types';
import rollFromString from "./rollDice";
import { XCircleFill } from "react-bootstrap-icons";
import { StateFunctionsContext } from "./StateFunctionsContext";

function Table({table, data, section, hasSubs, footnotes, formula, displayName}) {
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
    const [rolledOnTable, setRolledOnTable] = useState(null)
    const rowContainer = useRef()
    const rolledItem = useMemo(() => rowContainer?.current?.children?.[rolledOnTable], [rolledOnTable])
    useEffect(() => {
        if (rolledItem) {
            rolledItem.classList.add('!bg-amber-500');
            rolledItem.scrollIntoView();
            const currentItem = rolledItem; // without this line there would be lingering highlighted trs if the user rolls again in less than a second
            self.setTimeout(() => currentItem.classList.remove('!bg-amber-500'), 500);
        }
    }, [rolledItem]);
    const rollOnTable = () => {
        const mod = +self.prompt(`Rzut ${table.formula ?? 'k100'} w tabeli ${table.displayName}: podaj ewentualne modyfikatory.`)
        const roll = rollFromString(table.formula ?? 'd100').total + (isNaN(mod) ? 0 : mod);
        if (rolledItem) {
            rolledItem.classList.remove('!bg-amber-500');
        }
        setRolledOnTable(data.findIndex(item => item?.match ? item.match === roll : (item.range.min ?? -Infinity) <= roll && (item.range.max ?? Infinity) >= roll));
    };
    const tableNameSetter = useContext(StateFunctionsContext).closeTableDialog;
    const topSection = section.split('-').shift()
    const usedFootnotes = footnotes?.map((f,i) => data.find(e => Object.values(e?.footnotes ?? {}).includes(i) || e?.qualities?.find?.(q => q?.footnote === i)) || f.startsWith(`{no-daggers|${section.split('-').pop()}}`) ? i : null).filter(e => e !== null)
    function tableRows(passedData) {
        return passedData?.filter(e => typeof e !== 'string' && !e?.noTable).map((e, index) => (
            <tr key={index}>
                {
                    keys.map((k, jndex) => (
                        <td 
                            key={jndex} 
                            className={(['shortDesc', 'prerequisite', '$roll', '$content', 'content', 'result'].includes(k) ? '' : 'capitalize') + " text-center p-0.5"}
                        >
                            {
                                k === '$roll' ? (e.match ?? (e.range?.min ?? 1) + '-' + (e.range?.max ?? '') ) :
                                k === '$content' ? (<><strong className="font-bold capitalize">{e.title}</strong> <Parser text={e.content}/></>) :
                                (k.startsWith('$') ? e[k.substring(1)] === undefined && k !== '$covers' : e[k] === undefined) ? '\u2013' :
                                e[k] === null ? 'N/D' :
                                k === '$armor' && typeof e[k] !== 'string' ? Object.values(e[k]).filter(f => f !== null).join('/') : 
                                k === '$covers' ?  (e.armor === undefined ? '\u2013' : typeof e?.armor === 'string' ? (<Parser text={e.armor}/>) : (e.armor.general ? 'wszystkie' : Object.keys(e.armor).filter(l => e.armor[l] !== null).map(l => locations[l]).join(', '))) :
                                k === '$name' ? (<Parser text={`@${topSection}{${e.name}}`} passedSection={section}/>)  : 
                                k === '$renown' ? renown[e.renown] :
                                k === '$rof' ? Object.values(e.rof).map(f => f ? (typeof f === 'number' ? f : 'S') : '-').join('/') :
                                k === '$damage' && typeof e.damage !== 'string' ? (<span>{<Parser text={`@dice{${e.damage.formula + (e.damage.display ? '|' + e.damage.display : '')}}`}/>}&nbsp;{damageType[e.damage.type]}</span>) :
                                k === '$class' ? rangedClass[e.class] : 
                                k === '$qualities' && typeof e.qualities !== 'string' ? (<Parser text={e.qualities.map(f => (typeof f === 'string' ? `@quality{${f}}` : f?.value ? `@quality{${f.name}||${f.value}}` : `@quality{${f.name}}`) + (f.footnote ? `@footnote{${f.footnote}|${usedFootnotes.indexOf(f.footnote)}}` : '')).join(', ')} passedSection={section}/>) :
                                k === '$range' && typeof e.range === 'number' ? `${e.range}m`:
                                k === '$reload' && typeof e.reload === 'number' ? `${e.reload} akcji podw.` : 
                                k === '$protectionRating' ? (<Parser text={`@dice{${e.protectionRating}%}`}/>) : 
                                k === '$overload' ? (<Parser text={`@dice{${e.overload}%|${e.overload === 1 ? '01' : '01-' + (e.overload+[]).padStart(2, '0')}}`}/>) :
                                Array.isArray(e[k]) ? e[k].join(', ') : 
                                (<Parser text={(e[k]+[])} passedSection={section}/>)
                            }
                            {
                                e?.footnotes?.[k] !== undefined && (
                                    <Parser text={`@footnote{${e?.footnotes?.[k]}|${usedFootnotes.indexOf(e?.footnotes?.[k])}}`}/>
                                )
                            }
                        </td>
                    ))
                }
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
                                className="text-inherit transition-colors duration-200 hover:text-red-600 text-center absolute top-2 right-2"
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
                        <tr id={`footnote-${section}-${e}`} key={index}>
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
    displayName: PropTypes.string
};

export default Table;