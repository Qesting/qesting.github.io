import {
  RPCVehicle,
  VehicleWeaponRef,
  Characteristic,
  VehicleWeaponFacing,
  VehicleWeaponOption,
  RPCRangedWeapon,
  Damage,
  RPCMeleeWeapon,
  itemIsWeapon,
  weaponIsMelee,
  Quality,
  weaponIsRanged,
  CharacteristicSet,
  ContentItem,
} from "../../helpers/types"
import { useContext } from "react"
import capitalize from "../../helpers/capitalize.js"
import DataProviderContext from "../../contexts/DataProviderContext"
import TextContent from "./TextContent"
import { resolveItem } from "../../helpers/parserHelpers.js"
import {
  locations,
  damageType,
  size,
  vehicleType,
  renown,
  facing,
} from "../../helpers/translation.js"
import AlreadyResolvedContext, {
  AlreadyResolvedType,
} from "../../contexts/AlreadyResolvedContext"
import { JsonDataType, JsonDataContext } from "../../contexts/JsonDataContext"
import { StateFunctionsContext } from "../../contexts/StateFunctionsContext"
import CopyItemLink from "../CopyItemLink"
import SourceName from "../SourceName"
const characteristicKeys = [
  "weaponSkill",
  "ballisticSkill",
  "strength",
  "toughness",
  "agility",
  "intelligence",
  "perception",
  "willpower",
  "fellowship",
]

function renderDamage(damage: string | Damage, bonus: number = 0) {
  return typeof damage === "string"
    ? damage
    : `@dice{${
        bonus
          ? damage.formula + (bonus >= 0 ? "+" + bonus : bonus)
          : damage.formula
      }${
        damage?.display
          ? "|" + damage?.display + (bonus >= 0 ? "+" + bonus : bonus)
          : ""
      }} ${
        typeof damage.type === 'string' 
          ? damageType[damage.type].charAt(0).toUpperCase()
          : damage.type.map(e => damageType[e]).join('/')
      }`
}

function renderCharacteristic(char: Characteristic|null, noBonus: boolean = true) {
  const trueValue =
    char === null ? 0 : typeof char === "number" ? char : char.value
  const rawBonus = Math.floor(trueValue / 10)
  const lastDigit = trueValue % 10
  const unnatural =
    typeof char === "number" || char === null 
      ? null 
      : char.bonus === undefined 
        ? rawBonus * (char?.unnatural ?? 1)
        : char.bonus

  return (
    <span className="block text-center">
      {unnatural && !noBonus && (
        <span className="text-accentLight font-bold absolute top-0 left-2 text-sm w-5 text-right">
          ({unnatural})
        </span>
      )}
      {char && trueValue !== -1 && !noBonus && (
        <span className="text-accentLight font-bold inline-block w-5 text-right">
          {char ? rawBonus : "—"}
        </span>
      )}
      {trueValue !== -1 ? (
        <span>{char ? (noBonus ? trueValue : lastDigit) : "—"}</span>
      ) : (
        <span className="text-accentLight" title="Używa wartości pilota">
          *
        </span>
      )}
    </span>
  )
}

function renderQualities(qualities: Quality[]): string {
  let qualityStr = ""
  let quality: Quality
  for (let index = 0; index < qualities.length; ++index) {
    quality = qualities[index]
    if (typeof quality === "string") {
      qualityStr += `@quality{${quality}}`
    } else if (quality.noParser) {
      qualityStr += quality.name
    } else {
      qualityStr +=
        `@quality{${quality.name}${quality.value ? "||" + quality.value : ""}}` +
        (quality.source ? `{${quality.source}}` : "")
    }
    if (index < qualities.length - 1) {
      qualityStr += ", "
    }
  }
  return qualityStr
}

function rangedWeaponStr(
  weapon: VehicleWeaponOption,
  foundWeapon: RPCRangedWeapon,
  qualities?: Quality[] | string,
  weaponFacing?: VehicleWeaponFacing,
) {
  return (
    (weapon?.twinLinked ? "Sprzężony " : "") +
    `@ranged{${weapon.name}}${weapon.source ? "{" + weapon.source + "}" : ""} (` +
    (weaponFacing
      ? `${
          weaponFacing === "all"
            ? facing.all
            : weaponFacing?.map((side) => facing[side])?.join("/")
        }; `
      : "") +
    `${foundWeapon.range} m; ${
      (foundWeapon.rof.single ? 'S' : '–') + 
      '/' + (foundWeapon.rof.burst ?? '–') +
      '/' + (foundWeapon.rof.auto ?? '–')
    }${foundWeapon.damage ? '; ' + renderDamage(foundWeapon.damage) : ''}${
      foundWeapon.penetration 
        ? '; Pen ' + foundWeapon.penetration
        : ''
    }${foundWeapon.clip ? '; Mag ' + (weapon?.clip ?? foundWeapon.clip) : ''}; Ład ${
      foundWeapon.reload
        ? typeof foundWeapon.reload === "string"
          ? foundWeapon.reload
          : foundWeapon.reload === 1
            ? "A2"
            : foundWeapon.reload + " AC"
        : "—"
    }` +
    (qualities?.length
      ? "; " +
        (typeof qualities === "string" ? qualities : renderQualities(qualities))
      : "") +
    (weapon.info ? "; " + weapon.info : "") +
    ")"
  )
}

function launcherStr(
  weapon: VehicleWeaponOption,
  foundWeapon: RPCRangedWeapon,
  qualities?: Quality[] | string,
  weaponFacing?: VehicleWeaponFacing,
) {
  return (
    (weapon?.twinLinked ? "Sprzężony " : "") +
    `@ranged{${weapon.name}}${weapon.source ? "{" + weapon.source + "}" : ""} (` +
    (weaponFacing
      ? `${
          weaponFacing === "all"
            ? facing.all
            : weaponFacing?.map((side) => facing[side])?.join("/")
        }; `
      : "") +
    `${foundWeapon.range} m; ${
      (foundWeapon.rof.single ? 'S' : '–') + 
      '/' + (foundWeapon.rof.burst ?? '–') +
      '/' + (foundWeapon.rof.auto ?? '–')
    }; Mag ${weapon?.clip ?? foundWeapon.clip}; Ład ${
      foundWeapon.reload
        ? typeof foundWeapon.reload === "string"
          ? foundWeapon.reload
          : foundWeapon.reload === 1
            ? "A2"
            : foundWeapon.reload + " AC"
        : "—"
    }` +
    (qualities?.length
      ? "; " +
        (typeof qualities === "string" ? qualities : renderQualities(qualities))
      : "") +
    (weapon.info ? "; " + weapon.info : "") +
    ")"
  )
}

function meleeWeaponStr(
  weapon: VehicleWeaponOption,
  foundWeapon: RPCMeleeWeapon,
  strength?: Characteristic,
  qualities?: Quality[] | string,
) {
  const strengthBonus =
    Math.floor(
      (strength ? (typeof strength === "number" ? strength : strength.value) : 0) / 10,
    ) *
    (strength ? (typeof strength === "number" ? 1 : (strength.unnatural ?? 1)) : 1 +
      (foundWeapon.doublesStrengthBonus ? 1 : 0))
  return (
    (weapon?.twinLinked ? "Sprzężony " : "") +
    `@melee{${weapon.name}}${weapon.source ? "{" + weapon.source + "}" : ""} (Biała; ${renderDamage(foundWeapon.damage, strengthBonus)}; Pen ${
      foundWeapon.penetration
    }` +
    (qualities
      ? "; " +
        (typeof qualities === "string" ? qualities : renderQualities(qualities))
      : "") +
    (weapon.info ? "; " + weapon.info : "") +
    ")"
  )
}

function renderWeapon(
  weapon: VehicleWeaponRef,
  alreadyResolved: AlreadyResolvedType,
  jsonData: JsonDataType,
  characteristics: CharacteristicSet|undefined,
) {
  const foundWeapons = []
  let weaponString: string = ""
  for (const wpn of weapon.options ?? []) {
    if (typeof wpn === "string") {
      weaponString = wpn
    } else {
      const foundWeapon = resolveItem(
        wpn?.section === "launcher" ? "ranged" : (wpn?.section ?? "ranged"),
        wpn.name,
        wpn.source ?? jsonData.rootSource.name,
        alreadyResolved,
        jsonData,
      )
      if (!foundWeapon || !itemIsWeapon(foundWeapon)) continue
      const qualities = wpn?.twinLinked
        ? (foundWeapon.qualities
            ? typeof foundWeapon.qualities !== "string"
              ? foundWeapon.qualities
              : [foundWeapon.qualities]
            : []
          ).concat([{ name: "twinLinked" } as Quality])
        : (foundWeapon.qualities ?? [])
      if (wpn.section === "melee" && weaponIsMelee(foundWeapon)) {
        weaponString = meleeWeaponStr(
          wpn,
          foundWeapon,
          characteristics?.strength,
          qualities,
        )
      } else if (weaponIsRanged(foundWeapon)) {
        if (wpn.section === "launcher") {
          weaponString = launcherStr(wpn, foundWeapon, qualities, weapon.facing)
        } else {
          weaponString = rangedWeaponStr(
            wpn,
            foundWeapon,
            qualities,
            weapon.facing,
          )
        }
      }
    }
    foundWeapons.push(weaponString)
  }

  const result: ContentItem[] = [
    ((weapon.number ?? 1) > 1 ? `${weapon.number} \u00d7 ` : "") +
      (weapon?.mounting ? `${weapon.mounting}: ` : "") +
      (weapon?.info ? `(${weapon.info}) ` : ""),
  ]
  if (foundWeapons.length === 1) {
    result[0] +=
      (weapon.operator ? `Obsługiwany przez ${weapon.operator} ` : "") +
      foundWeapons[0]
  } else {
    result.push(
      foundWeapons.map(
        (e, i) =>
          (i > 0 ? "LUB " : "") +
          (weapon.operator ? `Obsługiwany przez ${weapon.operator} ` : "") +
          e,
      ),
    )
  }
  return result
}

export default function Vehicle({ vehicle }: { vehicle: RPCVehicle }) {
  const jsonData = useContext(JsonDataContext)
  const alreadyResolved = useContext(AlreadyResolvedContext)

  const foundSource = jsonData.sources.find((s) => s.name === vehicle.source)

  if (!foundSource) return

  const { getHiddenSources } = useContext(StateFunctionsContext)
  if (getHiddenSources?.()?.includes(vehicle.source)) return <></>

  return (
    <div
      id={vehicle.elementId}
      className="my-2 relative bg-gray-100 dark:bg-gray-800 rounded-md p-2 group/item !outline-none item col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4"
      tabIndex={-1}
    >
      <div className="relative">
        <h4 className="text-xl pb-2 relative after:w-full after:h-px after:absolute after:bottom-1 after:bg-current after:left-0 after:right-0 text-center group-focus/item:after:bg-accent after:transition-colors duration-300 after:duration-300 transition-colors group-focus/item:text-accent px-8">
          {capitalize(vehicle.displayName)}
        </h4>
        <CopyItemLink item={vehicle} />
        <SourceName source={foundSource} />
      </div>
      {vehicle.image && (
        <div className="relative size-[20rem] p-2 mx-auto pb-3 after:w-full after:h-px after:absolute after:bottom-1 after:bg-current after:left-0 after:right-0">
          <img
            src={vehicle.image}
            className="w-full h-full object-contain round"
            alt=""
          />
        </div>
      )}
      <DataProviderContext.Provider value={vehicle}>
        <div className="">
          <TextContent content={vehicle.content ?? ""} />
        </div>
        <div style={{ columns: 2, marginTop: "1rem" }}>
          <div className="flex justify-between">
            <span className="mr-2">
              <span className="font-bold">Typ:</span>&nbsp;
              {vehicleType[vehicle.vehicleType]}
            </span>
            <span>
              <span className="font-bold">Szybkość Taktyczna:</span>&nbsp;
              {vehicle.tacticalSpeed}&nbsp;m
              {vehicle.tacticalSpeedAir
                ? `/${vehicle.tacticalSpeedAir} JP`
                : ""}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="mr-2">
              <span className="font-bold">Szybkość Marszowa:</span>&nbsp;
              {vehicle.cruisingSpeed}&nbsp;km/h
            </span>
            <span>
              <span className="font-bold">Manewrowość:</span>&nbsp;
              {vehicle.manoeuvrability === null
                ? "—"
                : (vehicle.manoeuvrability > -1 ? "+" : "") +
                  vehicle.manoeuvrability}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="mr-2">
              <span className="font-bold">Wytrzymałość:</span>&nbsp;
              {vehicle.integrity}
            </span>
            <span>
              <span className="font-bold">Rozmiar:</span>&nbsp;
              {size[vehicle.size]}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="mr-2">
              <span className="font-bold">Pancerz:</span>&nbsp;
              {Object.keys(vehicle.armour)
                .map((k) => `${locations[k]}: ${vehicle.armour[k]}`)
                .join(", ")}
            </span>
            <span>
              <span className="font-bold">Załoga:</span>&nbsp;
              {vehicle.crew ?? "brak"}
            </span>
          </div>
          <div>
            <span className="font-bold">Przewozi:</span>&nbsp;
            {vehicle.capacity ?? "brak"}
          </div>
          {vehicle.renown !== null && vehicle.renown !== undefined && (
            <div>
              <span className="font-bold">Sława:</span>&nbsp;
              {renown[vehicle.renown]}
            </div>
          )}
        </div>
        {vehicle.characteristics !== undefined && (
          <table className="my-4">
            <thead>
              <tr>
                <th colSpan={8}>Profil: {capitalize(vehicle.displayName)}</th>
              </tr>
              <tr>
                <th>WW</th>
                <th>US</th>
                <th>K</th>
                <th>Odp</th>
                <th>Zr</th>
                <th>Int</th>
                <th>Per</th>
                <th>SW</th>
                <th>Ogd</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {characteristicKeys.map((k, index) => (
                  <td key={index} className="relative h-8 pt-4">
                    {renderCharacteristic(
                      vehicle?.characteristics?.[k] ?? null,
                      index < 2,
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        )}
        {Array.isArray(vehicle.weapons) && (
          <div>
            <h6 className="my-2 text-lg font-bold">Uzbrojenie</h6>
            <div>
              {vehicle.weapons.map((e, i) => (
                <TextContent
                  key={i}
                  content={
                    typeof e === "string"
                      ? e
                      : renderWeapon(
                          e,
                          alreadyResolved,
                          jsonData,
                          vehicle?.characteristics,
                        )
                  }
                />
              ))}
            </div>
          </div>
        )}
        {Array.isArray(vehicle.rules) && (
          <div>
            <h6 className="my-2 text-lg font-bold">Zasady Specjalne</h6>
            <div>
              <TextContent content={vehicle.rules} />
            </div>
          </div>
        )}
      </DataProviderContext.Provider>
    </div>
  )
}
