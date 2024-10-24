import { useContext } from "react";
import { JsonData } from "./JsonDataContext";
import { StateFunctionsContext } from "./StateFunctionsContext";
import Accordion from "./Accordion";
import { AccordionDepthContext } from "./AccordionDepthContext";
import { Table as BIconTable, Github as BIconGithub, MoonFill as BIconMoonFill, SunFill as BIconSunFill } from "react-bootstrap-icons";

export default function Navbar() {
    const data = useContext(JsonData).sections;
    const { setDarkMode, setTableVisibility } = useContext(StateFunctionsContext);
    return (
        <nav className="h-20 w-full top-0 left-0 right-0 fixed bg-gray-100 dark:bg-gray-900 border-b-2 border-solid border-current z-20 flex flex-row flex-wrap-nowrap items-center p-2">
            <div className="text-2xl">Deathwatch RPG - Kompendium</div>
            <div className="w-content h-20 pt-6 mx-10">
                <AccordionDepthContext.Provider value={0}>
                    <Accordion title="kategorie" items={data}/>
                </AccordionDepthContext.Provider>
            </div>
            <div className="ml-auto flex flex-row">
                <button className="nav-btn" onClick={() => setTableVisibility(true)} role="button" aria-label="Pokaż Tabele"><BIconTable/></button>
                <a className="nav-btn" href="https://github.com/Qesting/qesting.github.io" aria-label="Repozytorium GitHub"><BIconGithub/></a>
                <button className="nav-btn" onClick={() => setDarkMode()} role="button" aria-label="Przełącz trub ciemny">{ localStorage.getItem('dw-darkmode') === 'true' ? <BIconSunFill/> : <BIconMoonFill/> }</button>
            </div>
        </nav>
    );
}