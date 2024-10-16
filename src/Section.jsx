import Item from "./Item";
import Table from "./Table";
import { parser } from "./parser";

export default function Section({data, setDiceResult, superS}) {
    const { 
        displayName,
        name,
        display,
        content,
        table,
        hasSubs,
        footnotes
    } = data;
    const thisName = superS ? `${superS}-${name}`: name;
    return (
        <section id={`section-${thisName}`}>
            <div>
                <h2 className="text-2xl font-bold capitalize my-2">{displayName}</h2>
            </div>
            {
                !['description', 'none'].includes(display) && <Table table={table} data={content} section={thisName} hasSubs={hasSubs} setDiceResult={setDiceResult} footnotes={footnotes}/>
            }
            {
                (!["table", 'none'].includes(display) || (display === 'none' && superS)) && <div className={superS && 'grid gap-x-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}>
                    {
                        content.filter(e => !e?.noDesc).map((e, i) => (
                            typeof e === 'string' ? <p className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4">{parser(e, setDiceResult, thisName)}</p> : hasSubs ? <Section key={i} data={e} superS={thisName} setDiceResult={setDiceResult}/> : <Item key={i} data={e} section={thisName} setDiceResult={setDiceResult}/>
                        ))
                    }
                </div>
            }
        </section>
    );
}