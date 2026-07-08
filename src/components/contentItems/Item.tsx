import capitalize from "../../helpers/capitalize"
import TextContent from "./TextContent"
import DataProviderContext from "../../contexts/DataProviderContext"
import { useContext } from "react"
import Parser from "../Parser"
import { RPCItem } from "../../helpers/types"
import { hasExportFunction } from "../../helpers/vttesExportFunctions"
import { JsonDataContext } from "../../contexts/JsonDataContext"
import { StateFunctionsContext } from "../../contexts/StateFunctionsContext"
import CopyItemLink from "../CopyItemLink"
import ExportAsComponentButton from "../ExportAsComponentButton"
import SourceName from "../SourceName"

function Item({ data }: { data: RPCItem }) {
  const {
    displayName,
    content,
    image,
    innerGrid,
    noGrid,
    source,
    variants,
    subName,
    elementId,
  } = data
  const { sources } = useContext(JsonDataContext)
  const foundSource = sources.find((s) => s.name === source)
  if (!foundSource) return

  const { getHiddenSources } = useContext(StateFunctionsContext)
  if (getHiddenSources?.()?.includes(source)) return <></>

  return (
    <div
      id={elementId}
      className={`my-2 relative bg-gray-100 dark:bg-gray-800 rounded-md p-2 group/item !outline-none item ${noGrid ? "col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4" : ""}`}
      tabIndex={-1}
    >
      <DataProviderContext.Provider value={data}>
        <div className="relative">
          <h4 className="text-xl pb-2 relative after:w-full after:h-px after:absolute after:bottom-1 after:bg-current after:left-0 after:right-0 text-center group-focus/item:after:bg-accent after:transition-colors duration-300 after:duration-300 transition-colors group-focus/item:text-accent px-8">
            <Parser
              text={capitalize(
                displayName + (subName ? `\u2004(${subName})` : ""),
              )}
            />
          </h4>
          <CopyItemLink item={data} />
          {hasExportFunction(data) && <ExportAsComponentButton item={data} />}
          <SourceName source={foundSource} />
        </div>
        {image && (
          <div
            className="relative size-[20rem] p-2 mx-auto pb-3 after:w-full after:h-px after:absolute after:bottom-1 after:bg-current after:left-0 after:right-0"
            tabIndex={-1}
          >
            <img src={image} className="w-full h-full object-contain round" alt=""/>
          </div>
        )}
        {
          <div
            className={
              innerGrid
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2"
                : ""
            }
          >
            <TextContent content={content ?? ''} />
            {variants && (
              <ul>
                {variants.map((variant, index) => (
                  <li
                    id={`${elementId}.${variant.name}`}
                    key={index + (Array.isArray(content) ? content.length : 0)}
                  >
                    <strong>
                      <Parser text={variant.displayName} cap={true} />
                    </strong>
                    :&nbsp;
                    <TextContent content={variant.content} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        }
      </DataProviderContext.Provider>
    </div>
  )
}

export default Item
