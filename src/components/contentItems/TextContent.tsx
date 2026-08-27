import { useContext } from "react"
import Parser from "../Parser"
import {
  ContentItem,
  contentItemIsExample,
  contentItemIsList,
  contentItemIsTextTable,
  contentItemIsTextItem,
} from "../../helpers/types"
import { StateFunctionsContext } from "../../contexts/StateFunctionsContext"

function TextContent({ content }: { content: ContentItem[] | ContentItem }) {
  const { getShowExamples } = useContext(StateFunctionsContext)
  return Array.isArray(content) ? (
    content.map((e: ContentItem, index: number) =>
      typeof e === "string" ? (
        <div className="paragraph @container" key={index}>
          <Parser
            text={e}
            className={
              e.startsWith("%")
                ? "col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4"
                : ""
            }
          />
        </div>
      ) : e === undefined || e === null ? (
        <></>
      ) : Array.isArray(e) ? (
        <div className="paragraph pl-2 @container" key={index}>
          <TextContent content={e} />
        </div>
      ) : contentItemIsList(e) ? (
        <div
          className={`col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 ${e.title ? "mt-4" : ""} first:mt-0 mb-2 @container`}
          key={index}
        >
          {e.title && (
            <h4 className="text-xl pb-2 relative after:w-full after:h-px after:absolute after:bottom-1 after:bg-current after:left-0 after:right-0 text-center">
              {e.title}
            </h4>
          )}
          {e.style === "unordered" ? (
            <ul className="list-disc ml-4">{e.content?.map((f, jndex) => (
              <li key={jndex}>
                <TextContent content={f} />
              </li>
            ))}</ul>
          ) : (
            <ol className="list-disc ml-4">{e.content?.map((f, jndex) => (
              <li key={jndex}>
                <TextContent content={f} />
              </li>
            ))}</ol>
          )}
        </div> 
      ) : contentItemIsTextTable(e) ? (
        <table key={index} className="mx-auto my-2">
          <thead>
            <tr>
              {e.header.map((h, jndex) => (
                <th key={jndex} className="font-bold text-center">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {e.rows.map((row, jndex) => (
              <tr key={jndex}>
                {row.map((cell, kndex) => (
                  <td key={kndex} className="text-center">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : contentItemIsExample(e) ? (
        (getShowExamples?.() ?? true) ? (
          <div
            key={index}
            className="pb-2 my-4 last:mb-0 first:mt-0 relative after:w-full after:h-px after:absolute after:bottom-1 after:bg-current after:left-0 after:right-0 col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4"
          >
            <h2 className="text-lg pb-2 relative after:w-full after:h-px after:absolute after:bottom-1 after:bg-current after:left-0 after:right-0 text-center">
              Przykład
            </h2>
            <div>{<TextContent content={e.content} />}</div>
          </div>
        ) : (
          <></>
        )
      ) : contentItemIsTextItem(e) ? (
        <div
          key={index}
          className={
            "paragraph col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 text-justify @container"
          }
        >
          {e?.heading && (
            <h4 className="text-xl pb-2 relative after:w-full after:h-px after:absolute after:bottom-1 after:bg-current after:left-0 after:right-0 text-center">
              {e.heading}
            </h4>
          )}
          {e?.title && (
            <>
              <strong className="font-bold">
                <Parser
                  text={e.title}
                />
              </strong>
              &nbsp;
            </>
          )}
          <TextContent content={e?.content ?? e} />
        </div>
      ) : (
        <></>
      ),
    )
  ) : content === undefined || content === null ? (
    <></>
  ) : contentItemIsTextItem(content) ? (
    <div
      className={
        "paragraph col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 text-justify @container"
      }
    >
      {content?.title && (
        <>
          <strong className="font-bold">
            <Parser
              cap={true}
              text={
                content.title +
                (content.title.endsWith(":") || content.title.endsWith(".")
                  ? ""
                  : ".")
              }
            />
          </strong>
          &nbsp;
        </>
      )}
      <TextContent content={content.content} />
    </div>
  ) : typeof content === "string" ? (
    <span>
      <Parser text={content} />
    </span>
  ) : (
    <></>
  )
}

export default TextContent
