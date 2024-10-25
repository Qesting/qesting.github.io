import Parser from "./Parser";
import PropTypes from 'prop-types';

function Table({table, data, section, hasSubs, footnotes}) {
    const keys = Object.keys(table);
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

    function tableRows(passedData) {
        return passedData?.filter(e => typeof e !== 'string' && !e?.noTable).map((e, index) => (
            <tr key={index}>
                {
                    keys.map((k, jndex) => (
                        <td key={jndex} className={(k === 'shortDesc' ? '' : 'capitalize') + " text-center p-0.5"}>
                            {
                                e[k] === undefined && k !== 'covers' ? '\u2013' :
                                e[k] === null ? 'N/D' :
                                k === 'armor' && typeof e[k] !== 'string' ? Object.values(e[k]).filter(f => f !== null).join('/') : 
                                k === 'covers' ?  (e.armor === undefined ? '\u2013' : typeof e?.armor === 'string' ? (<Parser text={e.armor}/>) : (e.armor.general ? 'wszystkie' : Object.keys(e.armor).filter(l => e.armor[l] !== null).map(l => locations[l]).join(', '))) :
                                k === 'name' ? (<Parser text={e.footnote !== undefined ? `@${section}{${e.name}}@footnote{${e.footnote}}` : `@${section}{${e.name}}`} passedSection={section}/>)  : 
                                k === 'renown' ? renown[e.renown] :
                                k === 'rof' ? Object.values(e.rof).map(f => f ? (typeof f === 'number' ? f : 'S') : '-').join('/') :
                                k === 'damage' && typeof e.damage !== 'string' ? (<span>{<Parser text={`@dice{${e.damage.formula + (e.damage.display ? '|' + e.damage.display : '')}}` + (e.footnote ? `@footnote{${e.footnote}}` : '')}/>}&nbsp;{damageType[e.damage.type]}</span>) :
                                k === 'class' ? rangedClass[e.class] : 
                                k === 'qualities' && typeof e.qualities !== 'string' ? (<Parser text={e.qualities.map(f => (typeof f === 'string' ? `@quality{${f}}` : f?.value ? `@quality{${f.name}||${f.value}}` : `@quality{${f.name}}`) + (f.footnote ? `@footnote{${f.footnote}}` : '')).join(', ')} passedSection={section}/>) :
                                k === 'range' && typeof e.range === 'number' ? `${e.range}m`:
                                k === 'reload' && typeof e.reload === 'number' ? `${e.reload} akcji podw.` : 
                                k === 'protectionRating' ? (<Parser text={`@dice{${e.protectionRating}%}`}/>) : 
                                k === 'overload' ? (<Parser text={`@dice{${e.overload}%|${e.overload === 1 ? '01' : '01-' + (e.overload+[]).padStart(2, '0')}}`}/>) :
                                Array.isArray(e[k]) ? e[k].join(', ') : 
                                (<Parser text={(e[k]+[])} passedSection={section}/>)
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
                <tr>
                    {
                        keys.map((k, index) => (<th key={index} className="capitalize">{table[k]}</th>))
                    }
                </tr>
            </thead>
            <tbody>
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
                    footnotes?.map((e, index) => (
                        <tr id={`footnote-${section}-${index}`} key={index}>
                            <td colSpan={keys.length} className="italic">{e.startsWith('{no-daggers}') ? ' ' : '\u2020'.repeat(index + 1)+ ' '}{<Parser text={e.replace('{no-daggers}', '')}/>}</td>
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
    footnotes: PropTypes.arrayOf(PropTypes.string)
};

export default Table;