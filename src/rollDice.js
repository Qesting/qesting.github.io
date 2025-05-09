import { fullDiceRegExp } from "./ParserRegExp";

export default function rollFromString(str) {
    const formula = (str.endsWith('%') ? '1k100' : str).replace(/\s+/, '').match(fullDiceRegExp);
    const {
        number,
        type,
        kdOp,
        bonus
    } = formula.groups
    let {
        highest, 
        lowest
    } = formula.groups

    if (kdOp == "d") {
        if (highest) {
            lowest = number - highest
            highest = null
        } else if (lowest) {
            highest = number - lowest
            lowest = null
        }
    } 
    
    const target = str.endsWith('%') ? str.substring(0, str.length - 1) : null
    const result = Array(+(number ?? 1)).fill(0).map(() => ({value: Math.round(Math.random() * (type - 1)) + 1}));
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
        target: target
    });
}