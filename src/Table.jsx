import { parser } from "./parser";

export default function Table({table, data, section, hasSubs, setDiceResult, footnotes}) {
    const keys = Object.keys(table);
    const locations = {
        head: "głowa",
        body: "korpus",
        al: "lewa ręka",
        ar: "prawa ręka",
        ll: "lewa noga",
        lr: "prawa loga",
        arm: "ręce",
        leg: "nogi",
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
            <tr className="even:bg-gray-300">
                {
                    keys.map(k => (
                        <td className="text-center capitalize p-0.5">
                            {
                                e[k] === undefined ? '\u2013' :
                                e[k] === null ? 'N/D' :
                                k === 'armor' ? Object.values(e[k]).filter(f => f !== null).join('/') : 
                                k === 'covers' ?  (e.armor.general ? 'wszystkie' : Object.keys(e.armor).filter(l => e.armor[l] !== null).map(l => locations[l]).join(', ')) :
                                k === 'name' ? parser(e.footnote ? `@${section}{${e.name}}@footnote{${e.footnote}}` : `@${section}{${e.name}}`, null, section)  : 
                                k === 'renown' ? renown[e.renown] :
                                k === 'rof' ? Object.values(e.rof).map(f => f ? (typeof f === 'number' ? f : 'S') : '-').join('/') :
                                k === 'damage' && typeof e.damage !== 'string' ? (<span>{parser(`@dice{${e.damage.formula + (e.damage.display ? '|' + e.damage.display : '')}}` + (e.footnote ? `@footnote{${e.footnote}}` : ''), setDiceResult)} {damageType[e.damage.type]}</span>) :
                                k === 'class' ? rangedClass[e.class] : 
                                k === 'qualities' && typeof e.qualities !== 'string' ? parser(e.qualities.map(f => (typeof f === 'string' ? `@quality{${f}}` : f?.value ? `@quality{${f.name}||${f.value}}` : `@quality{${f.name}}`) + (f.footnote ? `@footnote{${f.footnote}}` : '')).join(', '), null, section) :
                                k === 'range' && typeof e.range === 'number' ? `${e.range}m`:
                                k === 'reload' && typeof e.reload === 'number' ? `${e.reload} akcji podw.` : parser(e[k], null, section)
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
                                <tr className="even:bg-gray-300">
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
                        <tr className="even:bg-gray-300" id={`footnote-${section}-${i}`}>
                            <td colSpan={keys.length} className="italic">{e.startsWith('{no-daggers}') ? ' ' : '\u2020'.repeat(i + 1)+ ' '}{parser(e.replace('{no-daggers}', ''), setDiceResult)}</td>
                        </tr>
                    ))
                }
            </tbody>
        </table>
    );
}