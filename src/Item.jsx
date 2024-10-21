import { parser } from "./parser";

export default function Item({data, section}) {
    const {
        displayName,
        name,
        content,
        image,
        innerGrid
    } = data;
    return (
        <div id={`item-${section}-${name}`} className="my-4 relative">
            <h4 className="capitalize text-xl font-bold mb-2">{displayName}</h4>
            {
                image && <img src={image} className="max-w-[50%] min-h-30 my-2"/>
            }
            {
                typeof content === "string" ? (
                    <p>{parser(content, section)}</p>
                ) : (
                    <ul className={innerGrid ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2' : ''}>
                        {
                            content?.map((e, i) => (
                                <p key={i} className={e?.title ? '' : 'col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4'}>
                                    { e?.title && <strong className="font-bold capitalize inline-block mr-1">{e?.title}{!e.title.endsWith(':') && '.'}</strong>}{parser(e.content ?? e, section)}
                                </p>
                            ))
                        }
                    </ul>
                )
            }
        </div>
    );
}