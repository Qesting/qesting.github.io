import { useContext } from "react"
import { StateFunctionsContext, StateFunctions } from "./StateFunctionsContext"

export interface Source {
    name: string,
    displayName: string,
    brewed: boolean,
    author: string,
    transcriber?: string,
    color: string
}

export default function SourceName({ source }: { source: Source }) {
    const { showSourceDialog } = useContext<StateFunctions>(StateFunctionsContext)
    return (
        <button 
            className="block absolute top-0 bottom-2 right-0 hover:underline focus:underline !outline-none"
            style={{color: source.color}}
            title={source.displayName}
            onClick={() => showSourceDialog()}
        >{source.name}</button>)
}