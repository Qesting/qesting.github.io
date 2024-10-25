import Parser from './Parser';
import PropTypes from 'prop-types';

function Item({data, section}) {
    const {
        displayName,
        name,
        content,
        image,
        innerGrid,
        noGrid
    } = data;
    return (
        <div id={`item-${section}-${name}`} className={`my-2 relative bg-gray-100 dark:bg-gray-800 rounded-md p-2 ${noGrid ? "col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4" : ""}`}>
            <h4 className="capitalize text-xl pb-2 relative after:w-full after:h-px after:absolute after:bottom-1 after:bg-current after:left-0 after:right-0 text-center">{displayName}</h4>
            {
                image && <img src={image} className="max-w-[50%] min-h-30 my-2"/>
            }
            {
                typeof content === "string" ? (
                    <p>{<Parser text={content} passedSection={section}/>}</p>
                ) : (
                    <ul className={innerGrid ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2' : ''}>
                        {
                            content?.map((e, i) => (
                                <p key={i} className={e?.title ? '' : 'col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4'}>
                                    { e?.title && <strong className="font-bold capitalize inline-block mr-1">{e?.title}{!e.title.endsWith(':') && '.'}</strong>}{<Parser text={e.content ?? e} passedSection={section}/>}
                                </p>
                            ))
                        }
                    </ul>
                )
            }
        </div>
    );
}

Item.propTypes = {
    data: PropTypes.object,
    section: PropTypes.string
};

export default Item;