import Item from "./Item.js"
import Table from "./Table.js"
import capitalize from "../../helpers/capitalize.js"
import { useContext, useState } from "react"
import SectionNameContext from "../../contexts/SectionNameContext.js"
import TextContent from "./TextContent.js"
import DataProviderContext from "../../contexts/DataProviderContext.js"
import Creature from "./Creature.js"
import { CaretDownFill as BIconCaretDownFill } from "react-bootstrap-icons"
import Vehicle from "./Vehicle.js"
import {
  Footnote,
  itemIsCreature,
  itemIsSection,
  itemIsVehicle,
  RPCSection,
  TableTemplate,
} from "../../helpers/types.js"
import { JsonDataContext } from "../../contexts/JsonDataContext.js"
import { StateFunctionsContext } from "../../contexts/StateFunctionsContext.js"
import CopyItemLink from "../CopyItemLink.js"
import SourceName from "../SourceName.js"

export default function Section({ data }: { data: RPCSection }) {
  const {
    displayName,
    name,
    display,
    content,
    children,
    table,
    footnotes,
    noGrid,
    source,
    parentPath,
    elementId,
  } = data
  const { sources } = useContext(JsonDataContext)
  const { table: replacementTable, footnotes: replacementFootnotes } =
    useContext<{ table?: TableTemplate; footnotes?: Footnote[] }>(
      DataProviderContext,
    ) ?? {}
  const { getHiddenSources } = useContext(StateFunctionsContext)
  const thisName = parentPath ? `${parentPath}-${name}` : name
  const foundSource = sources.find((s) => s.name === source)
  if (!foundSource) return
  const filteredItems =
    children?.filter(
      (e) => !getHiddenSources?.()?.includes(e.source) && !e.noDesc,
    ) ?? []
  const usedFootnotes = footnotes ?? replacementFootnotes
  const filteredFootnotes = usedFootnotes
    ?.filter((e) =>
      getHiddenSources instanceof Function
        ? !getHiddenSources()?.includes(typeof e !== "string" ? e?.source : "")
        : true,
    )
    .map((e: Footnote) => (typeof e === "string" ? e : e.content))

  const contextData = {
    ...data,
    footnotes: filteredFootnotes,
    table: replacementTable ?? table,
  }

  if (getHiddenSources?.()?.includes(source)) return <></>

  const [expanded, setExpanded] = useState(true)
  const sectionId = Math.random().toString(16).substring(2)

  return (
    <section
      id={elementId}
      tabIndex={-1}
      className={`${parentPath ? "group/" + sectionId + " p-2 border-[0.0675rem] border-solid border-current rounded-md focus:border-accent transition-colors duration-300" : ""} outline-none col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 my-1`}
    >
      <SectionNameContext.Provider value={thisName}>
        <DataProviderContext.Provider value={contextData}>
          <div className="relative">
            <h2
              className={`${parentPath ? "text-2xl group-focus/" + sectionId + ":after:bg-accent group-focus/" + sectionId + "text-accent" : "text-3xl"} py-2 text-center relative after:w-full after:h-px after:absolute after:bottom-0 after:bg-current after:transition-colors duration-300 after:duration-300 transition-colors after:left-0 after:right-0 px-4`}
            >
              {capitalize(displayName ?? '')}
            </h2>
            {parentPath && (
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="absolute top-4 left-0"
              >
                <span className={expanded ? "block" : "rotate-180 block"}>
                  <BIconCaretDownFill />
                </span>
              </button>
            )}
            <CopyItemLink item={parentPath ? data : undefined} />
            <SourceName source={foundSource} />
          </div>
          <div style={{ height: expanded ? "auto" : 0, overflowY: "hidden" }}>
            {!["description", "none"].includes(display) && (
              <Table
                table={table ?? replacementTable}
                data={filteredItems.filter((e) => !itemIsSection(e))}
                footnotes={filteredFootnotes ?? replacementFootnotes}
                source={source}
              />
            )}
            {(!["table", "none"].includes(display) ||
              (display === "none" && parentPath)) && (
              <div>
                <div className={content ? "my-2" : ""}>
                  <TextContent content={content ?? ''} />
                </div>
                <div
                  className={
                    !noGrid
                      ? "grid gap-x-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                      : ""
                  }
                >
                  {filteredItems &&
                    filteredItems.map((e, index) =>
                      itemIsSection(e) ? (
                        <Section key={index} data={e} />
                      ) : itemIsCreature(e) ? (
                        <Creature creature={e} key={index} />
                      ) : itemIsVehicle(e) ? (
                        <Vehicle vehicle={e} key={index} />
                      ) : (
                        <Item key={index} data={e} />
                      ),
                    )}
                </div>
              </div>
            )}
          </div>
        </DataProviderContext.Provider>
      </SectionNameContext.Provider>
    </section>
  )
}
