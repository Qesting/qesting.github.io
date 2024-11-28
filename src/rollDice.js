export default function rollFromString(str, target) {
    const formula = (str ?? '1k100').replace(/\s+/, '').match(/(?<number>\d+)?[kd](?<type>\d+)(kh(?<highest>\d+)|kl(?<lowest>\d+))?(?<bonus>[+-]\d+)*?/);
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
        target: +target
    });
}