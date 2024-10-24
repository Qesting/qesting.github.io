import { useContext, useState } from "react";
import { linkButton } from "./parser";
import { AccordionDepthContext } from "./AccordionDepthContext";
import { CaretDownFill, CaretUpFill } from "react-bootstrap-icons";

export default function Accordion({title, items, previousSection, append}) {
    const [expanded, setExpanded] = useState(false);
    const depth = useContext(AccordionDepthContext);
    const id = item => previousSection ? previousSection+`-${item.name}` : `section-${item.name}`;

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
        <div className={`inline-block ${bgColor} p-1 rounded-md`}>
            <button className='capitalize relative w-full flex flex-row justify-between items-center' onClick={() => setExpanded(!expanded)}><span>{title}</span>&nbsp;<span className="ml-2 text-sm">{expanded ? <CaretDownFill/> : <CaretUpFill/>}</span></button>
            <div className={`flex flex-col overflow-y-hidden pt-1 ${expanded ? 'h-auto' : 'h-0'}`}>
                <AccordionDepthContext.Provider value={depth + 1}>
                    {
                        append ?? null
                    }
                    {
                        items.filter(item => item.name && item.display).map(item => (
                            item.hasSubs ? <Accordion items={item.content} previousSection={id(item)} append={linkButton(id(item), item.displayName)} title={item.displayName}/> :
                            linkButton(id(item), item.displayName, 'py-1')
                        ))
                    }
                </AccordionDepthContext.Provider>
                
            </div>
        </div>
    );
}