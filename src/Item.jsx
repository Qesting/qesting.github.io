import PropTypes from 'prop-types';
import capitalize from './capitalize';
import TextContent from './TextContent';
import DataProviderContext from './DataProviderContext';
import { useContext } from 'react';
import { JsonDataContext } from './JsonDataContext';
import { StateFunctionsContext } from './StateFunctionsContext';
import SourceName from './SourceName';
import CopyItemLink from './CopyItemLink';
import Parser from './Parser';

function Item({data, section}) {
    const {
        displayName,
        name,
        content,
        image,
        innerGrid,
        noGrid,
        source,
        variants,
    } = data;
    const { sources } = useContext(JsonDataContext)
    const foundSource = sources.find(s => s.name === (source ?? "CRB"))

    const { getHiddenSources } = useContext(StateFunctionsContext)
    if (getHiddenSources?.()?.includes(source)) return <></>

    return (
        <div id={`item-${section}-${name}${source ? "|" + source : ""}`} className={`my-2 relative bg-gray-100 dark:bg-gray-800 rounded-md p-2 group/item !outline-none item ${noGrid ? "col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4" : ""}`} tabIndex={-1}>
            <div className='relative'>
                <h4 className="text-xl pb-2 relative after:w-full after:h-px after:absolute after:bottom-1 after:bg-current after:left-0 after:right-0 text-center group-focus/item:after:bg-accent after:transition-colors duration-300 after:duration-300 transition-colors group-focus/item:text-accent px-8">{capitalize(displayName)}</h4>
                <CopyItemLink sectionName={section.substring(0, section.indexOf("-") !== -1 ? section.indexOf("-") : section.length)} item={data}/>
                <SourceName source={foundSource}/>
            </div>
            {
                image && <div className="relative size-[20rem] p-2 mx-auto pb-3 after:w-full after:h-px after:absolute after:bottom-1 after:bg-current after:left-0 after:right-0"><img src={image} className="w-full h-full object-contain round"/></div>
            }
            {
                <div className={innerGrid ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2' : ''}>
                    <DataProviderContext.Provider value={data}>
                        <TextContent content={content}/>
                        {
                            variants && <ul>{ variants.map((variant, index) => <li id={`item-${section}-${name}|${variant.name}`} key={index}><strong><Parser text={variant.displayName} cap={true}/></strong>:&nbsp;<Parser text={variant.content}/></li>) }</ul>
                        }
                    </DataProviderContext.Provider>
                </div>
            }
        </div>
    );
}

Item.propTypes = {
    data: PropTypes.object,
    section: PropTypes.string
};

export default Item;