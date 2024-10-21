import { createContext } from "react";
import { sections, tables } from '../assets/dw.rpc.json';

export const JsonData = createContext({
    sections: sections,
    tables: tables
});