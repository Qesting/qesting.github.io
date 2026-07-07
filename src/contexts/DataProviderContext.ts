import { createContext } from "react";

const DataProviderContext = createContext<{ [key: string]: any }>({})

export default DataProviderContext