import { RPCItemTag, hasTag } from "./itemTags"

export type ContentItem =
  | {
      [key: string]: any
    }
  | string
  | ContentItem[]

export type TextItem = ContentItem & {
  title?: string
  content: ContentItem[] | string
}

export function contentItemIsTextItem(sub: ContentItem): sub is TextItem {
  return (
    sub !== null &&
    typeof sub !== "string" &&
    !Array.isArray(sub) &&
    sub.content
  )
}

export type List = ContentItem & {
  title?: string
  style: "ordered" | "unordered"
  type: "list"
  content: ContentItem[]
}

export function contentItemIsList(sub: ContentItem): sub is List {
  return (
    sub !== null &&
    typeof sub !== "string" &&
    !Array.isArray(sub) &&
    sub.type === "list" &&
    (sub.style === "unordered" || sub.style === "ordered")
  )
}

export type Example = ContentItem & {
  type: "example"
  content: ContentItem[] | string
}

export function contentItemIsExample(sub: ContentItem): sub is Example {
  return (
    sub !== null &&
    typeof sub !== "string" &&
    !Array.isArray(sub) &&
    sub.type === "example"
  )
}

export type TextTable = ContentItem & {
  header: string[]
  rows: string[][]
  type: "textTable"
}

export function contentItemIsTextTable(sub: ContentItem): sub is TextTable {
  return (
    sub !== null &&
    typeof sub !== "string" &&
    !Array.isArray(sub) &&
    sub.type === "textTable"
  )
}

export type JsonItem = {
  parentPath?: string
  source?: string
  content?: ContentItem[]
  type?: string
  [key: string]: any
}

export function objectIsJsonItem(obj: { [key: string]: any }): obj is JsonItem {
  return (
    obj !== null && (obj.parentPath || obj.source || obj.content || obj.type)
  )
}

export type Alias = {
  name: string
  displayName: string
}

export type Variant = {
  name: string
  displayName: string
  content: ContentItem[]
}

export type RPCItem = JsonItem & {
  name: string
  displayName?: string
  elementId: string
  subName?: string
  tags?: RPCItemTag[]
  footnotes?: FootnoteRef
  image?: string
  alias?: Alias[]
  noDesc?: boolean
  noTable?: boolean
  noGrid?: boolean
  variants?: Variant[]
  groups?: { [name: string]: string|{
    [key: string]: string
  }}
  prerequisite?: string
  innerGrid?: boolean
  parent?: RPCSection
  [key: string]: any
}

export function jsonItemIsItem(jsonItem: JsonItem): jsonItem is RPCItem {
  return jsonItem !== null && jsonItem.name
}

export function rootParent(item: RPCItem): RPCSection|null {
  if (item === null || (!itemIsSection(item) && item.parent === null)) return null
  let i = item
  while (i.parent) {
    i = i.parent
  }
  return i as RPCSection
}

export type Footnote =
  | string
  | {
      content: string
      source: string
    }

export type FootnoteRef = {
  [key: string]:
    | number
    | {
        index: number
        source: string
      }
}

export type TableTemplate = {
  [key: string]:
    | string
    | {
        name: string
        noCap: boolean
      }
}

export type RPCSection = RPCItem & {
  type: "section"
  children?: RPCItem[]
  footnotes?: Footnote[]
  display: "table" | "description" | "both" | "none"
  table: TableTemplate
}

export function itemIsSection(item: RPCItem): item is RPCSection {
  return item !== null && item.type === "section"
}

export type RPCGroup = JsonItem & {
  type: "group"
}

export function jsonItemIsGroup(item: JsonItem): item is RPCGroup {
  return item !== null && item.type === "group"
}

export type RPCEquipment = RPCItem & {
  requisition?: number | string
  renown?: 0 | 1 | 2 | 3 | 4 | string
  weight?: number | string
}

export type DamageType = "explosion" | "energy" | "impact" | "rending"

export type Damage = {
  formula: string
  display: string
  type: DamageType|DamageType[]
}

export type Quality =
  | string
  | {
      name: string
      value?: number
      footnote?: number
      display?: string
      noParser?: true
      source?: string
    }

export type RPCWeapon = RPCEquipment & {
  class?: string
  damage: Damage | string
  penetration?: number | string
  qualities?: Quality[] | string
  hitModifier?: number
}

export function itemIsWeapon(item: RPCItem): item is RPCWeapon {
  return item !== null && hasTag(item, "weapon")
}

export type RateOfFire = {
  "single": boolean
  "burst"?: number
  "auto"?: number
}

export type RPCRangedWeapon = RPCWeapon & {
  class?: "basic" | "pistol" | "heavy" | "thrown" | "mounted" | "placed"
  range: number | string
  rof: RateOfFire
  clip?: number
  reload?: number | string
}

export function weaponIsRanged(weapon: RPCWeapon): weapon is RPCRangedWeapon {
  return weapon !== null && weapon.class !== "melee"
}

export type RPCMeleeWeapon = RPCWeapon & {
  class: "melee"
  doublesStrengthBonus?: boolean
  parryModifier?: number
}

export function weaponIsMelee(weapon: RPCWeapon): weapon is RPCMeleeWeapon {
  return weapon !== null && weapon.class === "melee"
}

export type RPCArmour = RPCEquipment & {
  armour: {
    head?: number
    body?: number
    arms?: number
    legs?: number
    leftArm?: number
    rightArm?: number
    leftLeg?: number
    rightLeg?: number
  }
}

export type RPCForceField = RPCEquipment & {
  protectionRating: number
  overload?: number
}

export function itemIsForceField(item: RPCItem): item is RPCForceField {
  return item?.protectionRating != null
}

export type RPCPsychicPower = RPCItem & {
  cost: number
  action: string
  opposed: boolean
  range?: string
  sustained: boolean
}

export function itemIsPsychicPower(item: RPCItem): item is RPCPsychicPower {
  return item?.opposed === true || item?.opposed === false
}

export type RPCAbility = RPCItem & {
  rank?: number
  action?: string
  cost?: number
  sustained?: boolean
}

export function itemIsAbility(item: RPCItem): item is RPCAbility {
  return (
    (!itemIsPsychicPower(item) && item?.sustained === true) ||
    item?.sustained === false
  )
}

export type RPCAction = RPCItem & {
  type?: string
  subtype: string[]
}

export type Characteristic =
  | null
  | number
  | {
      value: number
      unnatural?: number,
      bonus?: number
    }

export type ItemRef =
  | string
  | {
      name: string
      source?: string
      section?: string
    }

export type WeaponRef = {
  name: string
  source?: string
  section: "melee" | "ranged" | "relic"
}

export type CharacteristicSet = {
  [name: string]: Characteristic|undefined
  weaponSkill?: Characteristic
  ballisticSkill?: Characteristic
  strength?: Characteristic
  toughness?: Characteristic
  agility?: Characteristic
  intelligence?: Characteristic
  perception?: Characteristic
  willpower?: Characteristic
  fellowship?: Characteristic
}

export type RPCCreature = JsonItem & {
  type: "creature"
  name: string
  displayName: string
  elementId: string
  tier?: "troop" | "elite" | "master"
  characteristics: CharacteristicSet
  movement?: number
  wounds: number
  skills?: (
    | string
    | {
        name: string
        source?: string
        groups?: string[]
        modifier?: null | 10 | 20
      }
  )[]
  talents?: (
    | string
    | {
        name: string
        source?: string
        groups?: string[]
      }
  )[]
  traits?: (
    | string
    | {
        name: string
        source?: string
        value?: any
      }
  )[]
  armour?: {
    [name: string]: number|undefined|string
    head?: number
    body?: number
    arms?: number
    legs?: number
    leftArm?: number
    rightArm?: number
    leftLeg?: number
    rightLeg?: number
    horde?: number
    description: string
  }
  weapons?: (WeaponRef | WeaponRef[])[]
  gear?: (ItemRef | ItemRef[])[]
  image?: string
  unnaturalSpeed?: boolean
  subName?: string,
  rules?: ContentItem[]
}

export function itemIsCreature(item: RPCItem): item is RPCCreature {
  return item !== null && item.type === "creature"
}

export type VehicleWeaponOption = {
  name: string
  source?: string
  section?: string
  clip?: number
  twinLinked?: boolean
  doublesStrengthBonus?: boolean
  info?: string
}

export type VehicleWeaponFacing =
  | "all"
  | ("front" | "back" | "sides" | "left" | "right")[]

export type VehicleWeaponRef = {
  operator?: string
  mounting?: string
  number?: number
  options: (VehicleWeaponOption | string)[]
  info?: string
  facing?: VehicleWeaponFacing
}

export type RPCVehicle = JsonItem & {
  type: "vehicle"
  name: string
  displayName: string
  elementId: string
  vehicleType: "ground" | "walker" | "skimmer" | "flyer" | "spacecraft"
  tacticalSpeed: number
  tacticalSpeedAir?: number
  cruisingSpeed: number
  manoeuvrability: number
  integrity: number
  armour: {
    [name: string]: number|undefined,
    front?: number
    sides?: number
    back?: number
    all?: number
  }
  size:
    | "minuscule"
    | "puny"
    | "scrawny"
    | "average"
    | "hulking"
    | "enormous"
    | "massive"
    | "immense"
    | "monumental"
    | "titanic"
  crew?: string
  renown?: number
  weapons?: (VehicleWeaponRef | string)[]
  capacity?: string
  rules?: ContentItem[]
  image?: string
  characteristics?: CharacteristicSet
}

export function itemIsVehicle(item: RPCItem): item is RPCVehicle {
  return item !== null && item.type === "vehicle"
}

export type TableIndex = {
  chapter: number
  number: number
}

export type RPCTable = JsonItem & {
  name: string
  rollable?: boolean
  displayName: string
  type: "table"
  index?: TableIndex
  table: TableTemplate
  content: {
    [key: string]: any
    footnotes?: FootnoteRef
  }[]
  footnotes: Footnote[]
}

export type TableFormula =
  | string
  | {
      formula: string
      display: string
    }

export type RPCRollTable = RPCTable & {
  rollable: true
  formula: TableFormula
  content: {
    match?: number
    range?: {
      min?: number
      max?: number
    }
  }[]
}

export function tableIsRollable(table: RPCTable): table is RPCRollTable {
  return table !== null && !!table.rollable
}

export type RPCSource = {
  name: string
  displayName: string
  brewed: boolean
  author: string
  transcriber?: string
  core?: boolean
  index: number
  color: string

  visible: boolean // not in JSON
}
