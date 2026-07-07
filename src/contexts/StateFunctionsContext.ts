import { createContext } from "react";
import { RPCItem } from "../helpers/types";
import { VttesInput } from "../helpers/vttesExportFunctions";

export interface StateFunctions {
    setDiceResult?: Function,
    setTableName?: Function,
    setDarkMode?: Function,
    showTableDialog?: Function,
    closeTableDialog?: Function,
    showSourceDialog?: Function,
    toggleShowExamples?: Function,
    getShowExamples?: Function, // clever, aren't I
    getHiddenSources?: Function,
    showSearchDialog?: Function,
    addToVttesExports?: (item: RPCItem) => void,
    showVttesExports?: Function,
    getVttesExports?: () => readonly VttesInput[]
}

export const StateFunctionsContext = createContext<StateFunctions>({});