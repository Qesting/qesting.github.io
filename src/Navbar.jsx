import { useContext } from "react";
import { JsonData } from "./jsonDataContext";

export default function Navbar() {
    const data = useContext(JsonData);
    return (
        <nav className="h-20 w-full top-0 left-0 right-0 fixed bg-[white] border-[black] border-b-2 border-solid z-20">
            <div className="w-full h-20">
                {
                    data.map(e => {
                        const subs = e.content?.filter(f => typeof f !== 'string');
                        return (<div className="relative inline-block group">
                            <a href={`#section-${e.name}`} className="inline-block mx-2 text-blue-700 underline">{e.displayName}</a>
                            {
                                e.hasSubs && (<div className="bg-[white] absolute h-0 group-hover:h-auto z-30 overflow-hidden">
                                    {
                                        subs.map(f => (
                                            <a href={`#section-${e.name}-${f.name}`} className="inline-block mx-2 text-blue-700 underline w-full">{f.displayName}</a>
                                        ))
                                    }
                                </div>)
                            }
                        </div>);
                    })
                }
            </div>
        </nav>
    );
}