import { parser } from "./parser";

export default function Item({data, section, setDiceResult}) {
    const {
        displayName,
        name,
        content,
        image
    } = data;
    return (
        <div id={`item-${section}-${name}`} className="my-4 relative">
            <h4 className="capitalize text-xl font-bold mb-2">{displayName}</h4>
            {
                image && <img src={image} className="max-w-[50%] min-h-30 my-2"/>
            }
            {
                typeof content === "string" ? (
                    <p>{parser(content, setDiceResult, section)}</p>
                ) : (
                    <ul>
                        {
                            content?.map((e, i) => (
                                <p key={i}>
                                    { e?.title && <strong className="font-bold capitalize inline-block mr-1">{e?.title}{!e.title.endsWith(':') && '.'}</strong>}{parser(e.content ?? e, setDiceResult, section)}
                                </p>
                            ))
                        }
                    </ul>
                )
            }
        </div>
    );
}