import { createContext } from "react";

export interface StateFunctions {
    setDiceResult?: Function,
    setTableName?: Function,
    setDarkMode?: Function,
    showTableDialog?: Function,
    closeTableDialog?: Function,
    showSourceDialog?: Function,
    toggleShowExamples?: Function,
    getShowExamples?: Function, // clever, aren't I
    getHiddenSources?: Function
}

export const StateFunctionsContext = createContext<StateFunctions>({});