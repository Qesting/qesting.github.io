import Item from "./Item";
import Table from "./Table";
import Parser from "./Parser";
import PropTypes from 'prop-types';
import capitalize from "./capitalize";

function Section({data, superS}) {
    const { 
        displayName,
        name,
        display,
        content,
        table,
        hasSubs,
        footnotes,
        noGrid
    } = data;
    const thisName = superS ? `${superS}-${name}`: name;
    return (
        <section id={`section-${thisName}`} tabIndex={-1} className={`${superS ? "group/section" : ""} outline-none`}>
            <div>
                <h2 
                    className={`${superS ? 'text-2xl group-focus/section:after:bg-accent group-focus/section:text-accent' : 'text-3xl'} py-2 text-center relative after:w-full after:h-px after:absolute after:bottom-0 after:bg-current after:transition-colors duration-300 after:duration-300 transition-colors after:left-0 after:right-0`}
                >{capitalize(displayName)}</h2>
            </div>
            {
                !['description', 'none'].includes(display) && <Table table={table} data={content.filter(i=>i?.name)} section={thisName} hasSubs={hasSubs} footnotes={footnotes}/>
            }
            {
                (!["table", 'none'].includes(display) || (display === 'none' && superS)) && <div className={!(hasSubs || noGrid) ? 'grid gap-x-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4': undefined }>
                    {
                        content?.filter(e => !e?.noDesc).map((e, i) => (
                            typeof e === 'string' ? <Parser key={i} insertParagraphs={true} className={"col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4"} text={e} passedSection={thisName}/> : hasSubs ? <Section key={i} data={{...e, table: table, footnotes: footnotes}} superS={thisName}/> : <Item key={i} data={e} section={thisName}/>
                        ))
                    }
                </div>
            }
        </section>
    );
}

Section.propTypes = {
    data: PropTypes.object,
    superS: PropTypes.string
};

export default Section;