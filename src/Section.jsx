import Item from "./Item";
import Table from "./Table";
import PropTypes from 'prop-types';
import capitalize from "./capitalize";
import { useContext } from "react";
import SectionNameContext from "./SectionNameContext"
import TextContent from "./TextContent";
import DataProviderContext from "./DataProviderContext";
import SourceName from "./SourceName"
import { JsonDataContext } from "./JsonDataContext"
import CopyItemLink from "./CopyItemLink"
import { StateFunctionsContext } from "./StateFunctionsContext";

function Section({data}) {
    const { 
        displayName,
        name,
        display,
        content,
        items,
        children,
        table,
        footnotes,
        noGrid,
        source
    } = data;
    const superS = useContext(SectionNameContext)
    const { sources } = useContext(JsonDataContext)
    const { table: replacementTable, footnotes: replacementFootnotes } = useContext(DataProviderContext) ?? {}
    const { getHiddenSources } = useContext(StateFunctionsContext)
    const thisName = superS ? `${superS}-${name}`: name;
    const contentLength = content ? content.length : 0
    const childrenLength = children ? children.length : 0
    const foundSource = sources.find(s => s.name === (source ?? "CRB"))
    const filteredItems = items?.filter(e => !getHiddenSources?.()?.includes(e.source))
    const filteredFootnotes = (footnotes ?? replacementFootnotes)?.filter(e => !getHiddenSources?.apply()?.includes(e?.source)).map(e => e?.content ?? e)

    const contextData = {...data, footnotes: filteredFootnotes}

    if (getHiddenSources?.()?.includes(source)) return <></>

    return (
        <section id={`section-${thisName}`} tabIndex={-1} className={`${superS ? "group/section" : ""} outline-none`}>
            <SectionNameContext.Provider value={thisName}>
                <DataProviderContext.Provider value={contextData}>
                    <div className="relative">
                        <h2 
                            className={`${superS ? 'text-2xl group-focus/section:after:bg-accent group-focus/section:text-accent' : 'text-3xl'} py-2 text-center relative after:w-full after:h-px after:absolute after:bottom-0 after:bg-current after:transition-colors duration-300 after:duration-300 transition-colors after:left-0 after:right-0`}
                        >{capitalize(displayName)}</h2>
                        <CopyItemLink sectionName={superS ? superS.substring(0, superS.indexOf("-") !== -1 ? superS.indexOf("-") : superS.length) : name} item={superS ? data : ""}/>
                        <SourceName source={foundSource}/>
                    </div>
                    {
                        !['description', 'none'].includes(display) && <Table table={table ?? replacementTable} data={filteredItems} footnotes={filteredFootnotes ?? replacementFootnotes}/>
                    }
                    {
                        (!["table", 'none'].includes(display) || (display === 'none' && superS)) && <div className={!(children || noGrid) ? 'grid gap-x-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4': undefined }>
                            {
                                <TextContent content={content}/>
                            }
                            {
                                Array.isArray(children) ? children.map((e, index) => <Section key={index + contentLength} data={e}/>) : []
                            }
                            {
                                Array.isArray(filteredItems) ? filteredItems.filter(e => !e?.noDesc).map((e, index) => <Item key={index + contentLength + childrenLength} data={e} section={thisName}/>) : []
                            }
                        </div>
                    }
                </DataProviderContext.Provider> 
            </SectionNameContext.Provider>
        </section>
    );
}

Section.propTypes = {
    data: PropTypes.object,
    superS: PropTypes.string
};

export default Section;