import PropTypes from "prop-types"
import Parser from "./Parser"

function List({title, style, content}) {
    const listContent = content?.map((e, index) => <li key={index}>
        {
            e?.title && <><strong className="font-bold"><Parser text={e.title + (!e.title.endsWith(":") && !e.title.endsWith(".") ? "." : "")}/></strong>&nbsp;</>
        }
        {
            <Parser text={e.content ?? e}/>
        }
    </li>)
    return (
        <div className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 mt-4 first:mt-0 mb-2">
            { title && <h4 className="text-xl pb-2 relative after:w-full after:h-px after:absolute after:bottom-1 after:bg-current after:left-0 after:right-0 text-center">{title}</h4> }
            {
                style === "unordered"
                ? <ul className="list-disc ml-4">
                    {listContent}
                </ul>
                : <ol className="list-decimal ml-4">
                    {listContent}
                </ol>
            }
        </div>
    )
}

List.propTypes = {
    title: PropTypes.string,
    style: PropTypes.oneOf(["unordered", "ordered"]),
    content: PropTypes.arrayOf(PropTypes.shape({
        title: PropTypes.string,
        content: PropTypes.string
    }))
}

export default List