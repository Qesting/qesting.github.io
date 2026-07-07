import { RPCItem } from "./types"

export interface RPCItemTag {
  name: string
  [key: string]: string|undefined
}

export interface RPCAmmoTag extends RPCItemTag {
  name: "ammo"
  type: string
  count?: string
}

export interface RPCUsesAmmoTag extends RPCItemTag {
  name: "usesAmmo"
  type: string
}

export interface RPCModTag extends RPCItemTag {
  name: "mod"
  property: string
  mod: string
}

export interface RPCGainQualityTag extends RPCItemTag {
  name: "gainQuality"
  quality: string
  value?: string
}

export interface RPCLoseQualityTag extends RPCItemTag {
  name: "loseQuality"
  quality: string
}

export interface RPCWeaponTag extends RPCItemTag {
  name: "weapon"
  type: "melee" | "ranged" | "combi"
}

export interface RPCCombiTag extends RPCWeaponTag {
  name: "weapon"
  type: "combi"
  id: string
}

export interface RPCModRequisitionTag extends RPCItemTag {
  name: "secondModRequisition"
}

export interface RPCDoublesStrengthBonus extends RPCItemTag {
  name: "doublesStrengthBonus"
}

export function parseTag(tag: string | RPCItemTag): RPCItemTag|null {
  if (typeof tag !== "string") return tag
  const [name, argString] = tag.split(":")
  const args = argString?.split(",") ?? []

  const result = { name: name } as RPCItemTag

  const minArgs = (min: number): void => {
    if (args.length < min)
      throw RangeError(
        `Tag '${name}' expects ${min} arguments, ${args.length} given`,
      )
  }

  try {
    switch (name) {
      case "ammo": {
        minArgs(1)
        result.type = args[0]
        result.count = args[1] ?? null
        break
      }
      case "mod": {
        minArgs(2)
        result.property = args[0]
        result.mod = args[1]
        break
      }
      case "gainQuality": {
        minArgs(1)
        result.quality = args[0]
        result.value = args[1] ?? null
        break
      }
      case "loseQuality": {
        minArgs(1)
        result.quality = args[0]
        result.value = args[1] ?? null
        break
      }
      case "usesAmmo": {
        minArgs(1)
        result.type = args[0]
        break
      }
      case "weapon": {
        minArgs(1)
        result.type = args[0]
        if (args.length > 1) {
          // combi
          result.id = args[1]
        }
        break
      }
      case "secondModRequisition":
      case "defaultammo":
      case "doublesStrengthBonus": {
        minArgs(0)
        break
      }
    }
    return result
  } catch (e: any) {
    console.error(e.message)
  }
  return null
}

export function findFirstTag<Type extends RPCItemTag>(
  item: RPCItem,
  tag: string | RPCItemTag,
): Type {
  const workingTag =
    typeof tag === "string"
      ? tag.indexOf(":") !== -1
        ? parseTag(tag)
        : { name: tag }
      : tag
  return item.tags?.find((t) => {
    for (let key in workingTag) {
      if (workingTag[key] !== t[key]) return false
    }
    return true
  }) as Type
}

export function findAllTags<Type extends RPCItemTag>(
  item: RPCItem,
  tag: string | RPCItemTag,
): Type[] {
  const workingTag =
    typeof tag === "string"
      ? tag.indexOf(":") !== -1
        ? parseTag(tag)
        : { name: tag }
      : tag
  return item.tags?.filter((t) => {
    const tp = parseTag(t)
    for (let key in workingTag) {
      if (workingTag[key] !== t[key]) return false
    }
    return true
  }).map(t => t as Type) ?? []
}

export function hasTag(item: RPCItem, tag: string | RPCItemTag): boolean {
  return !!findFirstTag<RPCItemTag>(item, tag)
}

export function hasAnyTag(
  item: RPCItem,
  tags: (string | RPCItemTag)[],
): boolean {
  for (let tag of tags) {
    if (!!findFirstTag<RPCItemTag>(item, tag)) return true
  }
  return false
}

export function hasAllTags(
  item: RPCItem,
  tags: (string | RPCItemTag)[],
): boolean {
  for (let tag of tags) {
    if (!findFirstTag<RPCItemTag>(item, tag)) return false
  }
  return true
}

export function findAnyTag(
  item: RPCItem,
  tags: (string | RPCItemTag)[],
): RPCItemTag|null {
  for (let tag of tags) {
    const res = findFirstTag<RPCItemTag>(item, tag)
    if (res) return res
  }
  return null
}
