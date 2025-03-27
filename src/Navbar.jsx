import { useContext } from "react";
import { JsonDataContext } from "./JsonDataContext";
import { StateFunctionsContext } from "./StateFunctionsContext";
import Accordion from "./Accordion";
import { AccordionDepthContext } from "./AccordionDepthContext";
import { 
    Table as BIconTable, 
    Github as BIconGithub, 
    CircleHalf as BIconCircleHalf, 
    Braces as BIconBraces, 
    QuestionCircle as BIconQuestionCircle, 
    QuestionCircleFill as BIconQuestionCircleFill 
} from "react-bootstrap-icons";

export default function Navbar() {
    const data = useContext(JsonDataContext).sections;
    const { setDarkMode, showTableDialog, setCurrentSection, showSourceDialog, toggleShowExamples, getShowExamples } = useContext(StateFunctionsContext);
    return (
        <nav className="h-20 w-full top-0 left-0 right-0 fixed bg-gray-100 dark:bg-gray-900 border-b-2 border-solid border-current z-20 flex flex-row flex-wrap-nowrap items-center p-2 duration-200 transition-colors">
            <button className="text-2xl" onClick={() => setCurrentSection('')}>Codex Vigilis</button>
            <div className="w-content h-20 pt-6 mx-10">
                <AccordionDepthContext.Provider value={0}>
                    <Accordion title="kategorie" items={data}/>
                </AccordionDepthContext.Provider>
            </div>
            <div className="ml-auto flex flex-row">
                <button className="nav-btn" onClick={() => toggleShowExamples?.()} role="button" aria-label={getShowExamples?.() ? "Ukryj Przykłady" : "Pokaż Przykłady"}>
                    {
                        getShowExamples?.() ? <BIconQuestionCircleFill/>
                        : <BIconQuestionCircle/> 
                    }
                </button>
                <button className="nav-btn" onClick={() => showTableDialog?.()} role="button" aria-label="Pokaż Tabele"><BIconTable/></button>
                <button className="nav-btn" onClick={() => showSourceDialog?.()} role="button" aria-label="Pokaż Źródła"><BIconBraces/></button>
                <a className="nav-btn" href="https://github.com/Qesting/qesting.github.io" aria-label="Repozytorium GitHub"><BIconGithub/></a>
                <button className="text-xl mx-1 first:ml-0 last:mr-0 transition-[color,transform] duration-200 hover:text-yellow-400 dark:hover:text-blue-800 focus:text-yellow-400 dark:focus:text-blue-800 hover:scale-110 focus:scale-110 dark:rotate-180 !outline-none" onClick={() => setDarkMode()} role="button" aria-label="Przełącz trub ciemny"><BIconCircleHalf/></button>
            </div>
        </nav>
    );
}