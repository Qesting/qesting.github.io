import PropTypes from "prop-types"

function List({title, style, content}) {
    const listContent = content?.map((e, index) => <li key={index}>
        {
            e?.title && <><strong className="font-bold">{e.title + e.title.endsWith(":") ? "." : ""}</strong>&nbsp;</>
        }
        {
            <>{e.content}</>
        }
    </li>)
    return (
        <div>
            <h4 className="text-2xl">{title}</h4>
            {
                style === "unordered"
                ? <ul>
                    {listContent}
                </ul>
                : <ol>
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