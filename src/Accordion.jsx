import { useContext, useState } from "react";
import LinkButton from "./LinkButton";
import { AccordionDepthContext } from "./AccordionDepthContext";
import { CaretDownFill, CaretUpFill } from "react-bootstrap-icons";
import PropTypes from 'prop-types';
import { StateFunctionsContext } from "./StateFunctionsContext";
import { ArrowDownUp as BIconArrowDownUp } from "react-bootstrap-icons"

function Accordion({title, items, previousSection, append}) {
    const [expanded, setExpanded] = useState(false);
    const depth = useContext(AccordionDepthContext);
    const id = item => (previousSection ? previousSection+`-${item.name}` : `section-${item.name}`) + (item.source ? `|${item.source}` : "");
    const { getHiddenSources } = useContext(StateFunctionsContext)

    let bgColor;
    switch (depth) {
        case 0: {
            bgColor = "bg-gray-200 dark:bg-gray-800";
            break;
        }
        case 1: {
            bgColor = "bg-gray-300 dark:bg-gray-700";
            break;
        }
        case 2: {
            bgColor = "bg-gray-400 dark:bg-gray-600";
            break;
        }
        case 3: {
            bgColor = "bg-gray-500 dark:bg-gray-500";
            break;
        }
        default: {
            bgColor = "bg-gray-600 dark:bg-gray-400";
            break;
        }
    }

    return (
        <div className={`inline-block ${bgColor} p-1 rounded-md my-1 transition-colors duration-200 border-[1px] border-solid border-transparent relative ${depth === 0 && (expanded ? "border-accent dark:border-accentDark border-solid" : "")}`}>
            {
                depth === 0 && <span className={`absolute left-2 top-2 transition-colors duration-200 text-lg ${expanded ? "text-accent dark:text-accentDark" : "text-transparent"}`}><BIconArrowDownUp aria-label={expanded ? "można przewijać" : ""}/></span>
            }
            <button className='capitalize relative w-full flex flex-row justify-between items-center text-center pl-4' onClick={() => setExpanded(!expanded)}><span className="text-center inline-block flex-grow">{title}</span>&nbsp;<span className="ml-2 text-sm">{expanded ? <CaretDownFill/> : <CaretUpFill/>}</span></button>
            <div className={`flex flex-col mt-1 max-h-[calc(100vh-5rem)] no-scroll ${expanded ? 'h-auto overflow-y-scroll' : 'h-0 overflow-y-hidden'}`}>
                <AccordionDepthContext.Provider value={depth + 1}>
                    {
                        append
                    }
                    {
                        items.filter(item => item.name && item.display && !getHiddenSources?.()?.includes(item?.source)).map((item, index) => (
                            item.children 
                                ? <Accordion 
                                    items={item?.children} 
                                    key={index} 
                                    previousSection={id(item)} 
                                    append={[
                                        <LinkButton 
                                            key={index} 
                                            elementId={id(item)} 
                                            innerText={">" + item.displayName} 
                                            additionalClasses={'py-1 block text-center'}
                                        />
                                    ]} 
                                    title={item.displayName}/> 
                                : <LinkButton 
                                    key={index} 
                                    elementId={id(item)} 
                                    innerText={item.displayName} 
                                    additionalClasses={'py-1 block text-center'}
                                />
                        ))
                    }
                </AccordionDepthContext.Provider>
                
            </div>
        </div>
    );
}

Accordion.propTypes = {
    title: PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.object),
    previousSection: PropTypes.string,
    append: PropTypes.arrayOf(PropTypes.object),
};

export default Accordion;