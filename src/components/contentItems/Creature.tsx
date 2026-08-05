import {
  Characteristic,
  itemIsWeapon,
  RPCCreature,
  weaponIsMelee,
  WeaponRef,
} from "../../helpers/types"
import { useContext } from "react"
import { StateFunctionsContext } from "../../contexts/StateFunctionsContext"
import { JsonDataContext, JsonDataType } from "../../contexts/JsonDataContext"
import CopyItemLink from "../CopyItemLink"
import SourceName from "../SourceName"
import capitalise from "../../helpers/capitalize.js"
import DataProviderContext from "../../contexts/DataProviderContext"
import AlreadyResolvedContext, {
  AlreadyResolvedType,
} from "../../contexts/AlreadyResolvedContext"
import TextContent from "./TextContent"
import Parser from "../Parser"
import { resolveItem } from "../../helpers/parserHelpers.js"
import {
  locations,
  damageType,
  creatureTier,
} from "../../helpers/translation.js"

const rofKeys = ["single", "burst", "auto"]

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

function renderWeapon(
  weapon: WeaponRef,
  strength: Characteristic,
  alreadyResolved: AlreadyResolvedType,
  jsonData: JsonDataType,
) {
  const foundWeapon = resolveItem(
    weapon.section,
    weapon.name,
    weapon.source ?? jsonData.rootSource.name,
    alreadyResolved,
    jsonData,
  )
  if (!foundWeapon) {
    console.warn(`Weapon not found for entry`, weapon)
    return
  }
  if (!itemIsWeapon(foundWeapon)) {
    console.warn(`Weapon not found for entry`, weapon, 'found a non–weapon item', foundWeapon)
    return
  }
  const strengthBonus = strength === null ? 0 : (typeof strength === "number")
    ? Math.floor(strength/10) * (foundWeapon.doublesStrengthBonus ? 2 : 1)
    : strength.bonus
      ? strength.bonus + (foundWeapon.doublesStrengthBonus ? Math.floor(strength.value/10) : 0)
      : Math.floor(strength.value/10) * ((strength.unnatural ?? 1) + (foundWeapon.doublesStrengthBonus ? 1 : 0))
  return (
    capitalise(foundWeapon.displayName ?? '') +
    " (" +
    (weaponIsMelee(foundWeapon)
      ? (
          typeof foundWeapon.damage === 'string' 
            ? foundWeapon.damage : 
            `@dice{${foundWeapon.damage.formula}+${strengthBonus}${foundWeapon.damage?.display ? "|" + foundWeapon.damage?.display+"+"+strengthBonus : ""}} ${
              typeof foundWeapon.damage.type === 'string' 
                ? damageType[foundWeapon.damage.type].charAt(0).toUpperCase()
                : foundWeapon.damage.type.map(e => damageType[e].charAt(0)).join('/')
            }${foundWeapon.penetration ? "; Pen " + foundWeapon.penetration : ""}`
        ) +
        (
          foundWeapon.qualities
            ? "; " +
              (
                typeof foundWeapon.qualities === 'string' 
                  ? foundWeapon.qualities 
                  : 
                  foundWeapon.qualities.map(
                      (e) => typeof e === 'string' 
                        ? `@quality{${e}}`
                        : `@quality{${e?.name}${e?.value ? "||" + e.value : ""}}{${e?.source ?? jsonData.rootSource.name}}`,
                    )
                    .join(", ")
              )
            : ""
        )
      : `${foundWeapon.range}m; ${rofKeys.map((e) => (foundWeapon.rof[e] === true ? "S" : typeof foundWeapon.rof[e] === "number" ? foundWeapon.rof[e] : "–")).join("/")}; `
        + (
          typeof foundWeapon.damage === 'string' 
            ? foundWeapon.damage : 
            `@dice{${foundWeapon.damage.formula}+${strengthBonus}${foundWeapon.damage?.display ? "|" + foundWeapon.damage?.display : ""}} ${
              typeof foundWeapon.damage.type === 'string' 
                ? damageType[foundWeapon.damage.type].charAt(0).toUpperCase()
                : foundWeapon.damage.type.map(e => damageType[e].charAt(0)).join('/')
            }${foundWeapon.penetration ? "; Pen " + foundWeapon.penetration : ""}`
        ) + `; Mag ${foundWeapon.clip ?? "—"}; Ład ${foundWeapon.reload ? (foundWeapon.reload === 1 ? "A2" : foundWeapon.reload + " AC") : '—'}`
        + (
          foundWeapon.qualities
            ? "; " +
              (
                typeof foundWeapon.qualities === 'string' 
                  ? foundWeapon.qualities 
                  : 
                  foundWeapon.qualities.map(
                      (e) => typeof e === 'string' 
                        ? `@quality{${e}}`
                        : `@quality{${e?.name}${e?.value ? "||" + e.value : ""}}{${e?.source ?? jsonData.rootSource.name}}`,
                    )
                    .join(", ")
              )
            : ""
        )) +
    ")"
  )
}

export default function Creature({ creature, disp }: { creature: RPCCreature, disp?: boolean }) {
  const jsonData = useContext(JsonDataContext)
  const alreadyResolved = useContext(AlreadyResolvedContext)

  const foundSource = jsonData.sources.find((s) => s.name === creature.source)
  if (!foundSource) return

  const { getHiddenSources } = useContext(StateFunctionsContext)
  if (getHiddenSources?.()?.includes(creature.source)) return <></>

  const speed =
    (Math.floor(
      (typeof creature.characteristics.agility === "number"
        ? creature.characteristics.agility
        : creature.characteristics.agility?.value ?? 0) / 10,
    ) +
      (creature.movement ?? 0)) *
    (creature.unnaturalSpeed ? 2 : 1)

  const subName = [
    creature?.subName,
    creature?.tier ? creatureTier[creature.tier] : null,
  ]
    .filter((e) => e)
    .join("; ")

  // anchor
  if (!disp) return (
    <div
      id={creature.elementId}
      tabIndex={-1}
    ></div>
  )

  return (
    <div
      id={creature.elementId}
      className="my-2 relative bg-gray-100 dark:bg-gray-800 rounded-md p-2 group/item !outline-none item col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-2"
      tabIndex={-1}
    >
      <div className="relative">
        <h4 className="text-xl pb-2 relative after:w-full after:h-px after:absolute after:bottom-1 after:bg-current after:left-0 after:right-0 text-center group-focus/item:after:bg-accent after:transition-colors duration-300 after:duration-300 transition-colors group-focus/item:text-accent px-8">
          {capitalise(creature.displayName + (subName ? ` (${subName})` : ""))}
        </h4>
        <CopyItemLink item={creature} />
        <SourceName source={foundSource} />
      </div>
      {creature.image && (
        <div className="relative size-[20rem] p-2 mx-auto pb-3 after:w-full after:h-px after:absolute after:bottom-1 after:bg-current after:left-0 after:right-0">
          <img
            src={creature.image}
            className="w-full h-full object-contain round"
            alt=""
          />
        </div>
      )}
      <div style={{ columns: 2 }} className="@container [container-name:twocolumn]">
        <div>
          <DataProviderContext.Provider value={creature}>
            <TextContent content={creature.content ?? ''} />
          </DataProviderContext.Provider>
        </div>
        <table className="my-4">
          <thead>
            <tr>
              <th colSpan={8}>Profil: {capitalise(creature.displayName)}</th>
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
              {Object.values(creature.characteristics).map((e, index) => (
                <td key={index} className="relative h-8 pt-4">
                  {renderCharacteristic(e ?? null, index < 2)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
        <div className="flex justify-between">
          <span>
            <span className="font-bold">Szybkość:</span>&nbsp;
            {creature.movement === null ? (
              "—"
            ) : (
              <>
                {speed} / {speed * 2} / {speed * 3} / {speed * 6}
              </>
            )}
          </span>
          <span>
            <span className="font-bold">Rany:</span>&nbsp;{creature.wounds}
          </span>
        </div>
        <div>
          <span className="font-bold">Umiejętności:</span>&nbsp;
          {
            <Parser
              text={
                (creature.skills
                  ? creature.skills
                      ?.map((e) =>
                        typeof e === "string"
                          ? e
                          : `@skill{${e.name}${e.groups ? "||" + e.groups.join(",") : ""}}${e.source ? "{" + e.source + "}" : ""}\u2004(\${insert:#skill.${e.name}${e.source ? "=" + e.source : ""}.@characteristic=characteristic.subName})${e.modifier ? " +" + e.modifier : ""}`,
                      )
                      ?.join(", ")
                  : "Brak") + "."
              }
            />
          }
        </div>
        <div>
          <span className="font-bold">Talenty:</span>&nbsp;
          {
            <Parser
              text={
                (creature.talents
                  ? creature.talents
                      ?.map((e) =>
                        typeof e === "string"
                          ? e
                          : `@talent{${e.name}${e.groups ? "||" + e.groups.join(",") : ""}}${e.source ? "{" + e.source + "}" : ""}`,
                      )
                      ?.join(", ")
                  : "Brak") + "."
              }
            />
          }
        </div>
        <div>
          <span className="font-bold">Cechy:</span>&nbsp;
          {
            <Parser
              text={
                (creature.traits
                  ? creature.traits
                      ?.map((e) =>
                        typeof e === "string"
                          ? e
                          : `@trait{${e.name}${e.value ? "||" + e.value : ""}}${e.source ? "{" + e.source + "}" : ""}${e.horde ? ' (Horda)' : ''}`,
                      )
                      ?.join(", ")
                  : "Brak") + "."
              }
            />
          }
        </div>
        <div>
          <span className="font-bold">Pancerz:</span>&nbsp;
          {(creature.armour
            ? creature.armour.description +
              " (" +
              Object.keys(creature.armour)
                .filter((k) => k !== "description")
                .map(
                  (k) =>
                    `${capitalise(locations[k])}\u2004${creature?.armour?.[k]}`,
                )
                .join(", ") +
              ")"
            : "Brak") + "."}
        </div>
        <div>
          <span className="font-bold">Uzbrojenie:</span>&nbsp;
          {
            <Parser
              text={
                (creature.weapons
                  ? creature.weapons
                      ?.map((e) =>
                        typeof e === "string"
                          ? e
                          : Array.isArray(e)
                            ? e
                                .map((f) =>
                                  renderWeapon(
                                    f,
                                    creature.characteristics.strength ?? null,
                                    alreadyResolved,
                                    jsonData,
                                  ),
                                )
                                .join(" albo ")
                            : renderWeapon(
                                e,
                                creature.characteristics.strength ?? null,
                                alreadyResolved,
                                jsonData,
                              ),
                      )
                      ?.join(", ")
                  : "Brak") + "."
              }
            />
          }
        </div>
        <div>
          <span className="font-bold">Wyposażenie:</span>&nbsp;
          {
            <Parser
              text={
                (creature.gear
                  ? creature.gear
                      ?.map((e) =>
                        typeof e === "string"
                          ? e
                          : Array.isArray(e)
                            ? e
                                .map((f) =>
                                  typeof f === "string"
                                    ? f
                                    : `@${f.section}{${f.name}}${f.source ? "{" + f.source + "}" : ""}`,
                                )
                                .join(" albo ")
                            : `@${e.section}{${e.name}}${e.source ? "{" + e.source + "}" : ""}`,
                      )
                      ?.join(", ")
                  : "Brak") + "."
              }
            />
          }
        </div>
        {Array.isArray(creature.rules) && (
          <div>
            <h6 className="my-2 text-lg font-bold">Zasady Specjalne</h6>
            <div>
              <TextContent content={creature.rules} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
