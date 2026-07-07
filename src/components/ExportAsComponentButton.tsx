import { useContext } from "react"
import { ArrowLeftSquareFill as BIconArrowLeftSquareFill } from "react-bootstrap-icons"
import { StateFunctionsContext } from "../contexts/StateFunctionsContext"
import { RPCItem } from "../helpers/types"

export default function ExportAsComponentButton({ item }: { item: RPCItem }) {
  const { addToVttesExports, getVttesExports } = useContext(
    StateFunctionsContext,
  )
  const disabled = getVttesExports?.()?.findIndex(
    (e) => e.item.source === item.source && e.item.name === item.name,
  )
  return (
    <button
      className="top-1.5 left-6 disabled:text-gray-800 dark:disabled:text-gray-200 absolute !outline-none focus:text-accent hover:text-accent dark:focus:text-accentDark dark:hover:text-accentDark transition-[color,transform] duration-200"
      onClick={() => addToVttesExports?.(item)}
      disabled={disabled !== -1}
    >
      <BIconArrowLeftSquareFill />
    </button>
  )
}
