import {
  itemIsForceField,
  itemIsWeapon,
  Quality,
  rootParent,
  RPCEquipment,
  RPCForceField,
  RPCItem,
  RPCMeleeWeapon,
  RPCRangedWeapon,
  RPCWeapon,
  weaponIsMelee,
  weaponIsRanged,
} from "./types"
import {
  findAllTags,
  findAnyTag,
  findFirstTag,
  hasTag,
  RPCCombiTag,
  RPCGainQualityTag,
  RPCLoseQualityTag,
  RPCModTag,
  RPCUsesAmmoTag
} from "./itemTags"
import { weaponClass, damageType } from "./translation"
import { resolveItem } from "./parserHelpers"
import capitalize from "./capitalize"
import { nameAndSource } from "../components/LinkButton"
import { textParser } from "./textParser"
import { AlreadyResolvedType } from "../contexts/AlreadyResolvedContext"
import { JsonDataType } from "../contexts/JsonDataContext"

const supportedSections = [
  "melee",
  "ranged",
  "wargear",
  "field",
  "tool",
  "consumable",
  "talent",
  "trait",
]

export function hasExportFunction(item: RPCItem): boolean {
  return supportedSections.includes(rootParent(item)?.name ?? '')
}

type VttesAttribute = {
  name: string
  current: string
  max: string
  id: string
}

export type VttesComponent = {
  name: string
  type: string
  repeating_id: string
  old_character_id: string
  attributes: VttesAttribute[]
}

type VttesCombi = {
  item: RPCItem,
  id: string
}

export type VttesInput = {
  item: RPCItem
  craftsmanship: number
  quantity: number
  combiId?: string
  ammo?: RPCItem[]
  combi?: VttesCombi[]
}

function makeId(): string {
  return (
    "-" +
    Array(19)
      .fill(0)
      .map(() => Math.round(Math.random() * 36).toString(36))
      .join("")
  )
}

function makeNextId(currentId: string): string {
  return (
    currentId.substring(0, 5) +
    Array(15)
      .fill(0)
      .map(() => Math.round(Math.random() * 36).toString(36))
      .join("")
  )
}

function makeRepeatingAttribute(
  rsName: string,
  id: string,
  aName: string,
  current: string,
  max: string = "",
): VttesAttribute {
  return {
    name: `repeating_${rsName}_${id}_${aName}`,
    current: current,
    max: max,
    id: makeNextId(id),
  }
}

export function meleeWeapon(
  jsonData: JsonDataType,
  alreadyResolved: AlreadyResolvedType,
  item: RPCMeleeWeapon,
  craftsmanship: number,
): VttesComponent {
  const id: string = makeId()
  const type: string = "meleeweapons"
  const doublesStrengthBonus = hasTag(item, "doublesStrengthBonus")

  const qualityStrings = Array.isArray(item.qualities)
    ? item.qualities.map((e) => {
        if (typeof e === "string") {
          const [name, source] = e.split("|")
          const quality = resolveItem(
            "quality",
            name,
            source ?? jsonData.rootSource.name,
            alreadyResolved,
            jsonData,
          ) as RPCItem
          if (!quality) return
          return `${capitalize(quality.displayName ?? "")} [${quality.source}]`
        }
        const quality = resolveItem(
          "quality",
          e.name,
          e.source,
          alreadyResolved,
          jsonData,
        ) as RPCItem
        if (!quality) return
        return (
          quality.displayName +
          (e.value ? ` (${e.value})` : "") +
          ` [${e.source}]`
        )
      })
    : []

  return {
    name: nameAndSource(item),
    type: type,
    repeating_id: id,
    old_character_id: "--------------------",
    attributes: [
      makeRepeatingAttribute(
        type,
        id,
        "meleeweaponname",
        `${capitalize(item.displayName ?? '')} [${item.source}]`,
      ),
      makeRepeatingAttribute(type, id, "meleeweaponclass", weaponClass.melee),
      makeRepeatingAttribute(
        type,
        id,
        "meleeweapondamage",
        typeof item.damage === "string"
          ? ""
          : item.damage.formula.replace(/k(?=\d+)/, "d") +
              (craftsmanship !== 0 ? "+" + craftsmanship : "") +
              (doublesStrengthBonus
                ? "+[[floor((@{calculatedStrength}-@{pams}*@{pamtoggle})/10)]]"
                : ""),
      ),
      makeRepeatingAttribute(
        type,
        id,
        "meleeweapontype",
        typeof item.damage === "string"
          ? item.damage
          : typeof item.damage.type === 'string'
              ? damageType[item.damage.type].charAt(0)
              : item.damage.type.map(e => damageType[e].charAt(0)).join("/")
      ),
      makeRepeatingAttribute(
        type,
        id,
        "meleeweaponpen",
        item.penetration === undefined ? '' : item.penetration.toString(),
      ),
      makeRepeatingAttribute(
        type,
        id,
        "meleeweaponparrymod",
        (item.parryModifier ?? 0).toString(),
      ),
      makeRepeatingAttribute(
        type,
        id,
        "meleeweaponmod",
        ((item?.hitModifier ?? 0) + 2 * craftsmanship).toString(),
      ),
      makeRepeatingAttribute(
        type,
        id,
        "meleeweaponspecial",
        qualityStrings.join(", "),
      ),
    ],
  }
}

export function rangedWeapon(
  jsonData: JsonDataType,
  alreadyResolved: AlreadyResolvedType,
  item: RPCRangedWeapon,
  craftsmanship: number,
): VttesComponent {
  const id: string = makeId()
  const type: string = "rangedweapons"
  let gundice = ""

  if (item.rof.single) {
    gundice = "1d100cs1cf>96"
  } else {
    gundice = "1d100cs1cf>94"
  }

  const qualityStrings = (craftsmanship === 1 ? ["reliable"] : []).concat(
    Array.isArray(item.qualities)
      ? item.qualities.map((e) => {
          if (typeof e === "string") {
            const [name, source] = e.split("|")
            if (name === "overheats" || name === "unreliable") {
              gundice = "1d100cs1cf>91"
            }
            const quality = resolveItem(
              "quality",
              name,
              source ?? jsonData.rootSource.name,
              alreadyResolved,
              jsonData,
            ) as RPCItem
            if (!quality) return
            return `${capitalize(quality.displayName ?? '')} [${quality.source}]`
          }
          const quality = resolveItem(
            "quality",
            e.name,
            e.source,
            alreadyResolved,
            jsonData,
          ) as RPCItem
          if (!quality) return
          return (
            quality.displayName +
            (e.value ? ` (${e.value})` : "") +
            ` [${e.source}]`
          )
        }).filter(e => e !== undefined)
      : [],
  )

  if (craftsmanship === 2) gundice = "1d100cs1"
  return {
    name: nameAndSource(item),
    type: type,
    repeating_id: id,
    old_character_id: "--------------------",
    attributes: [
      makeRepeatingAttribute(
        type,
        id,
        "rangedweaponname",
        `${capitalize(item.displayName ?? '')} [${item.source}]`,
      ),
      makeRepeatingAttribute(
        type,
        id,
        "rangedweaponmod",
        (item.hitModifier ?? 0).toString(),
      ),
      makeRepeatingAttribute(
        type,
        id,
        "rangedweaponrange",
        typeof item.range === "string" ? item.range : `${item.range} m`,
      ),
      makeRepeatingAttribute(
        type,
        id,
        "rangedweaponsingle",
        item.rof.single ? "S" : "–",
      ),
      makeRepeatingAttribute(
        type,
        id,
        "rangedweaponsemi",
        (item.rof.burst ?? "–").toString(),
      ),
      makeRepeatingAttribute(
        type,
        id,
        "rangedweaponfull",
        (item.rof.auto ?? "–").toString(),
      ),
      makeRepeatingAttribute(
        type,
        id,
        "rangedweaponreload",
        item.reload === 0.5
          ? "A1"
          : item.reload === 1
            ? "A2"
            : `${item.reload} AC`,
      ),
      makeRepeatingAttribute(
        type,
        id,
        "rangedweaponclip",
        item?.clip?.toString() ?? '0',
        item?.clip?.toString() ?? '0',
      ),
      makeRepeatingAttribute(
        type,
        id,
        "rangedweapondamage",
        typeof item.damage === "string"
          ? ""
          : item.damage.formula.replace(/k(?=\d+)/, "d") +
              (craftsmanship !== 0 ? "+" + craftsmanship : ""),
      ),
      makeRepeatingAttribute(
        type,
        id,
        "rangedweapontype",
        typeof item.damage === "string"
          ? item.damage
          : typeof item.damage.type === 'string'
            ? damageType[item.damage.type].charAt(0)
            : item.damage.type.map(e => damageType[e].charAt(0)).join("/"),
      ),
      makeRepeatingAttribute(
        type,
        id,
        "rangedweaponpen",
        item.penetration?.toString() ?? '0',
      ),
      makeRepeatingAttribute(
        type,
        id,
        "rangedweaponspecial",
        qualityStrings.join(", "),
      ),
      makeRepeatingAttribute(type, id, "gundice", gundice),
    ],
  }
}

export function forceField(
  jsonData: JsonDataType,
  alreadyResolved: AlreadyResolvedType,
  item: RPCForceField,
  craftsmanship: number,
): VttesComponent {
  const fieldCraft = ["1d100cf<10", "1d100cf<5", "1d100cf1", "1d100cs1cf101"]
  const id = makeId()
  const type = "forcefields"
  return {
    name: nameAndSource(item),
    type: type,
    repeating_id: id,
    old_character_id: "--------------------",
    attributes: [
      makeRepeatingAttribute(
        type,
        id,
        "fieldName",
        `${capitalize(item.displayName ?? '')} [${item.source}]`,
      ),
      makeRepeatingAttribute(
        type,
        id,
        "fieldRating",
        item.protectionRating.toString(),
      ),
      makeRepeatingAttribute(type, id, "fieldCraft", fieldCraft[craftsmanship]),
      makeRepeatingAttribute(type, id, "fieldNotes", item?.shortDesc ?? ""),
    ],
  }
}

export function talent(
  jsonData: JsonDataType,
  alreadyResolved: AlreadyResolvedType,
  item: RPCItem,
): VttesComponent {
  const type = "talents"
  const id = makeId()
  return {
    name: nameAndSource(item),
    type: type,
    repeating_id: id,
    old_character_id: "--------------------",
    attributes: [
      makeRepeatingAttribute(
        type,
        id,
        "Talents",
        `${capitalize(item.displayName ?? '')} [${item.source}]`,
      ),
      makeRepeatingAttribute(
        type,
        id,
        "talentName",
        `${capitalize(item.displayName ?? '')} [${item.source}]`,
      ),
      makeRepeatingAttribute(
        type,
        id,
        "talentNotes",
        textParser(
          item?.shortDesc ?? "",
          item,
          0,
          "talent",
          false,
          jsonData,
          alreadyResolved,
        ),
      ),
    ],
  }
}

export function trait(
  jsonData: JsonDataType,
  alreadyResolved: AlreadyResolvedType,
  item: RPCItem,
): VttesComponent {
  const type = "traits"
  const id = makeId()
  return {
    name: nameAndSource(item),
    type: type,
    repeating_id: id,
    old_character_id: "--------------------",
    attributes: [
      makeRepeatingAttribute(
        type,
        id,
        "Traits",
        `${capitalize(item.displayName ?? '')} [${item.source}]`,
      ),
      makeRepeatingAttribute(
        type,
        id,
        "traitName",
        `${capitalize(item.displayName ?? '')} [${item.source}]`,
      ),
      makeRepeatingAttribute(
        type,
        id,
        "traitNotes",
        textParser(
          item?.shortDesc ?? "",
          item,
          0,
          "trait",
          false,
          jsonData,
          alreadyResolved,
        ),
      ),
    ],
  }
}

export function equipment(
  jsonData: JsonDataType,
  alreadyResolved: AlreadyResolvedType,
  item: RPCEquipment,
  craftsmanship: number,
  quantity: number,
): VttesComponent {
  const halfSecond = hasTag(item, "secondModRequisition")
  const [requisition, requisitionForTwo] =
    typeof item.requisition === "string"
      ? item.requisition.split("/").map((e) => parseInt(e))
      : [item.requisition]
  const totalRequisition = halfSecond
    ? quantity > 1
      ? (quantity - 2) * (requisition ?? 0) + (requisitionForTwo ?? 0)
      : requisition ?? 0
    : quantity * (requisition ?? 0)

  const type = "gears"
  const id = makeId()
  return {
    name: nameAndSource(item),
    type: type,
    repeating_id: id,
    old_character_id: "--------------------",
    attributes: [
      makeRepeatingAttribute(
        type,
        id,
        "gearName",
        `${capitalize(item.displayName ?? '')} [${item.source}]`,
      ),
      makeRepeatingAttribute(type, id, "gearQty", quantity.toString()),
      makeRepeatingAttribute(
        type,
        id,
        "gearWeight",
        item.weight?.toString() ?? '0',
      ),
      makeRepeatingAttribute(type, id, "gearReq", totalRequisition?.toString() ?? '0'),
    ],
  }
}

export function findCombi(
  jsonData: JsonDataType,
  item: RPCItem,
  combiId: string,
): RPCItem|null {
  const combiTag = { name: "weapon", type: "combi", id: combiId }
  if (!hasTag(item, combiTag)) return null
  return jsonData.flatItems.find(
    (e) => e !== item && hasTag(e, combiTag),
  ) ?? null
}

export function findAllCombi(
  jsonData: JsonDataType,
  item: RPCItem,
): VttesCombi[] {
  const combiTags = findAllTags<RPCCombiTag>(item, { name: "weapon", type: "combi" })
  if (!combiTags.length) return []
  const paired = jsonData.flatItems.map(e => {
    if (!e || e === item) return null
    const tag = findAnyTag(e, combiTags)
    if (tag) return {id: tag.id ?? '', item: e}
    return null
  }).filter(e => e !== null)
  if (paired.length) return paired
  return []
}

export function findAmmo(jsonData: JsonDataType, item: RPCWeapon): RPCItem[] {
  if (!weaponIsRanged(item)) return []
  const ammoType = findFirstTag<RPCUsesAmmoTag>(item, { name: "usesAmmo" })?.type
  return jsonData.flatItems.filter((e) =>
    hasTag(e, { name: "ammo", type: ammoType }),
  )
}

export function findDefaultAmmo(jsonData: JsonDataType, item: RPCWeapon): RPCItem[] {
  if (!weaponIsRanged(item)) return []
  const ammoType = findFirstTag(item, { name: "usesAmmo" })?.type
  return jsonData.flatItems.filter((e) =>
    hasTag(e, { name: "ammo", type: ammoType }) && hasTag(e, { name: "defaultammo"}),
  )
}

export function applyItemModifiers(item: RPCItem): RPCItem {
  const modifiers = findAllTags<RPCModTag>(item, {name: "mod"})
  if (!modifiers || !modifiers.length) return item
  const subject = {...item}
  for (let modifier of modifiers) {
    if (modifier.mod[0] === '=') {
      subject[modifier.property] = modifier.mod.substring(1)
    } else {
      const propertyValue = subject[modifier.property]
      let result: number = 0
      const op = modifier.mod[0]
      const mod = parseFloat(modifier.mod.substring(1))
      switch (op) {
        case '+': {
          result = propertyValue + mod
          break
        }
        case '-': {
          result = propertyValue - mod
          break
        }
        case '*': {
          result = propertyValue * mod
          break
        }
      }
      subject[modifier.property] = result
    }
  }
  return subject
}

export function applyItemQualityModifiers(item: RPCWeapon): RPCWeapon {
  let qualities: Quality[] = Array.isArray(item.qualities) ? [...item.qualities] : []
  const addModifiers = findAllTags<RPCGainQualityTag>(item, {name: "gainQuality"})
  const loseModifiers = findAllTags<RPCLoseQualityTag>(item, {name: "loseQuality"})
  for (let mod of addModifiers) {
    if (mod.value) {
      qualities.push({name: mod.quality, value: parseInt(mod.value)})
    } else {
      qualities.push({name: mod.quality})
    }
  }
  for (let mod of loseModifiers) {
    qualities = qualities.filter(q => typeof q === 'string' ? q !== mod.quality : q.name === mod.quality)
  }
  if (qualities) {
    return {...item, qualities: qualities}
  }
  return item
}

export function exportItem(
  jsonData: JsonDataType,
  alreadyResolved: AlreadyResolvedType,
  input: VttesInput,
  componentList: VttesComponent[],
): VttesComponent[] {
  const { item, craftsmanship, quantity, combiId, combi, ammo } = input
  const rootSectionName = rootParent(item)?.name
  switch (rootSectionName) {
    case "talent": {
      componentList.push(talent(jsonData, alreadyResolved, item))
      return componentList
    }
    case "trait": {
      componentList.push(trait(jsonData, alreadyResolved, item))
      return componentList
    }
  }
  if (itemIsWeapon(item)) {
    if (item) {
      if (weaponIsMelee(item))
        componentList.push(
          meleeWeapon(jsonData, alreadyResolved, item, craftsmanship),
        )
      if (weaponIsRanged(item))
        componentList.push(
          rangedWeapon(jsonData, alreadyResolved, item, craftsmanship),
        )
    }
    if (combiId) {
      const c = combi?.find(i => i.id === combiId)?.item as RPCWeapon
      if (c) {
        if (weaponIsMelee(c))
          componentList.push(
            meleeWeapon(jsonData, alreadyResolved, c, craftsmanship),
          )
        if (weaponIsRanged(c))
          componentList.push(
            rangedWeapon(jsonData, alreadyResolved, c, craftsmanship),
          )
      }
    }
  } else if (itemIsForceField(item)) {
    componentList.push(
      forceField(
        jsonData,
        alreadyResolved,
        item as RPCForceField,
        craftsmanship,
      ),
    )
  }
  componentList.push(
    equipment(jsonData, alreadyResolved, item, craftsmanship, quantity),
  )
  return componentList
}
