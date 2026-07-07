import { useContext } from "react"
import { StateFunctions, StateFunctionsContext } from "../contexts/StateFunctionsContext"
import { RPCSource } from "../helpers/types"

export default function SourceName({ source }: { source: RPCSource }) {
    const { showSourceDialog } = useContext<StateFunctions>(StateFunctionsContext)
    return (
        <button 
            className="block absolute top-0 bottom-2 right-0 hover:underline focus:underline !outline-none"
            style={{color: source.color}}
            title={source.displayName}
            onClick={() => showSourceDialog?.()}
        >{source.name}</button>)
}