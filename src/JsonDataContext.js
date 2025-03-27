import { createContext } from "react";
import { head, content } from '../assets/dw_new.rpc.json';

const sections = [], tables = []

function findInTree(sectionName, sectionSet = sections) {
    const divider = sectionName.indexOf("-")
    const realDivider = divider !== -1 ? divider : sectionName.length
    const top = sectionName.substring(0, realDivider)
    const rest = sectionName.substring(realDivider + 1)
    for (let index = 0; index < sectionSet.length; index++) {
        if (sectionSet[index].name === top) {
            if (rest === "") {
                return sectionSet[index]
            } else {
                return findInTree(rest, sectionSet[index]?.children)
            }
        }
    }
}

for (let index = 0; index < content.length; index++) {
    const examined = content[index]
    if (examined?.type === "section") {
        sections.push(examined)
    } else if (examined?.type === "table") {
        tables.push(examined)
    } else if (examined?.type === "group") {
        const parent = findInTree(examined.parentPath, sections)
        for (let jndex = 0; jndex < examined.items.length; jndex++) {
            const examinedSub = examined.items[jndex]
            if (!examined.items[jndex].source) {
                examined.items[jndex].source = examined.source
            }
            if (examinedSub?.type === "section") {
                if (!parent?.children) {
                    parent.children = []
                }
                parent.children.push(examinedSub)
            } else {
                if (!parent?.items) {
                    parent.items = []
                }
                parent.items.push(examinedSub)
            }
        }
    }
}

const sources = head.sources.map(source => {
        const visible = !self.localStorage.getItem("dw-hideSources")?.split(",")?.includes(source.name)
        return {...source, visible: visible}
    })

export const JsonDataContext = createContext({
    sections: sections,
    tables: tables,
    sources: sources
});