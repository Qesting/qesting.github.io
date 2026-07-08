import { createContext } from "react"
import { head, content } from "../../assets/dw_new.rpc.json"
import {
  itemIsSection,
  JsonItem,
  jsonItemIsGroup,
  RPCItem,
  RPCSection,
  RPCSource,
  RPCTable,
} from "../helpers/types"
import { parseTag } from "../helpers/itemTags"
import Stringable from "../helpers/Stringable"
import { makeItemElementId } from "../components/LinkButton"

const sections: RPCSection[] = [],
  tables: RPCTable[] = [],
  flatItems: RPCItem[] = [],
  flatSections: RPCSection[] = []

function findInTree(
  sectionName: string | Stringable,
  root: { children?: RPCItem[] },
  rootSource: RPCSource,
): RPCSection|null {
  const sSectionName =
    sectionName instanceof Stringable ? sectionName : Stringable.of(sectionName)
  const [name, source] = sSectionName.before("-").toString().split("|")
  /*for (let index = 0; index < sectionSet.length; index++) {
        if (sectionSet[index].name === name && sectionSet[index].source === (source ?? rootSource.name)) {
            if (!sSectionName.contains('-')) {
                return sectionSet[index]
            } else {
                return findInTree(sSectionName.after('-'), sectionSet[index]?.children, rootSource)
            }
        }
    }*/
  for (let node of root?.children ?? []) {
    if (!itemIsSection(node)) continue
    if (node.name === name && node.source === (source ?? rootSource.name)) {
      if (sSectionName.contains("-")) {
        return findInTree(sSectionName.after("-"), node, rootSource)
      }
      return node
    }
  }
  return null
}

const sources = head.sources.map((source) => {
  const visible = !self.localStorage
    .getItem("dw-hideSources")
    ?.split(",")
    ?.includes(source.name)
  return { ...source, visible: visible } as RPCSource
})

const rootSource = sources.find((s) => s.name === head.rootSource)

if (!rootSource) {
  throw new Error("No core source identified; aborting.")
}

for (let index = 0; index < content.length; index++) {
  const examined = content[index]
  if (!examined.source) {
    examined.source = rootSource.name
  }
  if (examined.type === "section") {
    const castExamined = examined as unknown as RPCSection
    if (!examined?.parentPath) {
      // a root section
      castExamined.parent = undefined
      castExamined.elementId = makeItemElementId(castExamined)
      sections.push(castExamined)
    } else {
      // an ungrouped subsection
      const parent = findInTree(
        castExamined.parentPath ?? '',
        { children: sections },
        rootSource,
      )
      if (!parent) {
        console.error(examined)
        continue
      }
      if (!parent?.children) {
        parent.children = []
      }
      castExamined.tags = (parent.tags ?? []).concat(
        castExamined.tags?.map((t) => parseTag(t)).filter(e => e !== null) ?? [],
      )
      castExamined.parent = parent
      castExamined.elementId = makeItemElementId(castExamined)
      parent.children.push(castExamined)
    }
    flatSections.push(castExamined)
  } else if (examined?.type === "table") {
    tables.push(examined as unknown as RPCTable)
  } else if (jsonItemIsGroup(examined)) {
    let parent: RPCSection|null = null
    if (examined.parentPath) {
      parent = findInTree(
        examined.parentPath,
        { children: sections },
        rootSource,
      )
      if (!parent) {
        console.error(examined)
        continue
      }
      if (!parent?.children) {
        parent.children = []
      }
    }
    if (!examined.items) continue
    for (let jndex = 0; jndex < examined?.items?.length; jndex++) {
      const examinedSub = examined.items[jndex] as JsonItem
      if (examinedSub.parentPath) {
        parent = findInTree(
          examinedSub.parentPath,
          { children: sections },
          rootSource,
        )
        if (!parent) {
          console.error(examined)
          continue
        }
        if (!parent?.children) {
          parent.children = []
        }
      }
      if (!examinedSub?.source) {
        examinedSub.source = examined.source
      }
      examinedSub.parentPath = examined.parentPath
      examinedSub.tags = (parent?.tags ?? []).concat(
        examinedSub.tags?.map((t: string) => parseTag(t)) ?? [],
      )
      if (examinedSub?.type === "section") {
        const castExamined = examinedSub as RPCSection
        castExamined.parent = parent ?? undefined
        castExamined.elementId = makeItemElementId(castExamined)
        parent?.children?.push(castExamined)
        flatSections.push(castExamined)
      } else if (examinedSub?.type == "table") {
        tables.push(examinedSub as RPCTable)
      } else {
        const castExamined = examinedSub as RPCItem
        castExamined.parent = parent ?? undefined
        castExamined.elementId = makeItemElementId(castExamined)
        parent?.children?.push(castExamined)
        flatItems.push(castExamined)
      }
    }
  } else {
    const parent = findInTree(
      examined.parentPath ?? '',
      { children: sections },
      rootSource,
    )
    if (!parent) continue
    if (!parent.children) {
      parent.children = []
    }
    const castExamined = examined as RPCItem
    castExamined.parent = parent
    castExamined.elementId = makeItemElementId(castExamined)
    parent.children.push(castExamined)
    flatItems.push(castExamined)
  }
}

export type JsonDataType = {
  sections: RPCSection[]
  tables: RPCTable[]
  sources: RPCSource[]
  flatSections: RPCSection[]
  flatItems: RPCItem[]
  rootSource: RPCSource
}

export const JsonDataContext = createContext<JsonDataType>({
  sections: sections,
  tables: tables,
  sources: sources,
  flatSections: flatSections,
  flatItems: flatItems,
  rootSource: rootSource,
})
