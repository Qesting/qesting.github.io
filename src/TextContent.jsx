import { useContext } from "react"
import List from "./List"
import Parser from "./Parser"
import capitalize from "./capitalize"
import { StateFunctionsContext } from "./StateFunctionsContext"

function TextContent({content}) {
    const { getShowExamples } = useContext(StateFunctionsContext)
    return Array.isArray(content) ? content.map((e, index) => (
        e?.type === "list" ? <List key={index} title={e.title} style={e.style} content={e.content} /> :
        e?.type === "textTable" ? (
            <table key={index} className="mx-auto my-2">
                <thead>
                    <tr>
                        {
                            e.header.map((h, jndex) => <th key={jndex} className="font-bold text-center">{h}</th>)
                        }
                    </tr>
                </thead>
                <tbody>
                    {
                        e.rows.map((row, jndex) => <tr key={jndex}>
                            {
                                row.map((cell, kndex) => <td key={kndex} className="text-center">{cell}</td>)
                            }
                        </tr>)
                    }
                </tbody>
            </table>
        ) :
        e?.type === "example" ? ( (getShowExamples?.() ?? true) ? <div key={index} className="pb-2 my-4 last:mb-0 first:mt-0 relative after:w-full after:h-px after:absolute after:bottom-1 after:bg-current after:left-0 after:right-0 col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4">
            <h2 className="text-lg pb-2 relative after:w-full after:h-px after:absolute after:bottom-1 after:bg-current after:left-0 after:right-0 text-center">Przykład</h2>
            <div>
                {
                    <TextContent content={e.content}/>
                }
            </div>
        </div> : <></>) :
        typeof e === "string" && e?.startsWith("%") ? <Parser key={index} text={e} className={"col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4"}/> :
        <p key={index} className={"col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 text-justify"}>
            {
                e?.title && <><strong className="font-bold">{ capitalize(e.title) + (e.title.endsWith(":") || e.title.endsWith(".") ? "" : ".") }</strong>&nbsp;</>
            }
            <Parser text={e?.content ?? e}/>
        </p>
    )) : []
}

export default TextContent