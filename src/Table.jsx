import { parser } from "./parser";

export default function Table({table, data, section, hasSubs, footnotes}) {
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
        return passedData?.filter(e => typeof e !== 'string' && !e?.noTable).map(e => (
            <tr>
                {
                    keys.map(k => (
                        <td className={(k === 'shortDesc' ? '' : 'capitalize') + " text-center p-0.5"}>
                            {
                                e[k] === undefined && k !== 'covers' ? '\u2013' :
                                e[k] === null ? 'N/D' :
                                k === 'armor' && typeof e[k] !== 'string' ? Object.values(e[k]).filter(f => f !== null).join('/') : 
                                k === 'covers' ?  (e.armor === undefined ? '\u2013' : typeof e?.armor === 'string' ? parser(e.armor) : (e.armor.general ? 'wszystkie' : Object.keys(e.armor).filter(l => e.armor[l] !== null).map(l => locations[l]).join(', '))) :
                                k === 'name' ? parser(e.footnote !== undefined ? `@${section}{${e.name}}@footnote{${e.footnote}}` : `@${section}{${e.name}}`, section)  : 
                                k === 'renown' ? renown[e.renown] :
                                k === 'rof' ? Object.values(e.rof).map(f => f ? (typeof f === 'number' ? f : 'S') : '-').join('/') :
                                k === 'damage' && typeof e.damage !== 'string' ? (<span>{parser(`@dice{${e.damage.formula + (e.damage.display ? '|' + e.damage.display : '')}}` + (e.footnote ? `@footnote{${e.footnote}}` : ''))} {damageType[e.damage.type]}</span>) :
                                k === 'class' ? rangedClass[e.class] : 
                                k === 'qualities' && typeof e.qualities !== 'string' ? parser(e.qualities.map(f => (typeof f === 'string' ? `@quality{${f}}` : f?.value ? `@quality{${f.name}||${f.value}}` : `@quality{${f.name}}`) + (f.footnote ? `@footnote{${f.footnote}}` : '')).join(', '), section) :
                                k === 'range' && typeof e.range === 'number' ? `${e.range}m`:
                                k === 'reload' && typeof e.reload === 'number' ? `${e.reload} akcji podw.` : 
                                k === 'protectionRating' ? parser(`@dice{${e.protectionRating}%}`) : 
                                k === 'overload' ? parser(`@dice{${e.overload}%|${e.overload === 1 ? '01' : '01-' + (e.overload+[]).padStart(2, '0')}}`) : 
                                parser(e[k], section)
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
                        keys.map(k => (<th className="capitalize">{table[k]}</th>))
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
                    footnotes?.map((e, i) => (
                        <tr id={`footnote-${section}-${i}`}>
                            <td colSpan={keys.length} className="italic">{e.startsWith('{no-daggers}') ? ' ' : '\u2020'.repeat(i + 1)+ ' '}{parser(e.replace('{no-daggers}', ''))}</td>
                        </tr>
                    ))
                }
            </tbody>
        </table>
    );
}