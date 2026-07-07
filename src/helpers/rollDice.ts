import { fullDiceRegExp } from "./ParserRegExp"
import Stringable from "./Stringable"

class DiceKeepDrop {
  readonly direction: "h" | "l"
  readonly action: "k" | "d"
  readonly number: number

  constructor(direction: "h" | "l", action: "d" | "k", number: number) {
    if (number < 1) {
      throw new RangeError(
        "Number has to be a positive integer, " + number + " passed",
      )
    }
    this.action = action
    this.direction = direction
    this.number = number
  }

  apply(rolls: DieResult[]): DieResult[] {
    if (this.action === "k") {
      return new DiceKeepDrop(
        this.direction,
        "d",
        rolls.length - this.number,
      ).apply(rolls)
    }
    const newRolls = [...rolls] // not to modify the array in place
    newRolls.forEach((e) => e.hide(false)) // show all rolls, then hide
    for (let i = 0; i < this.number; i++) {
      newRolls
        .find(
          (e) =>
            e.value ===
              (this.direction === "h" ? Math.max : Math.min)(
                ...rolls.filter((f) => !f.hidden()).map((f) => f.value),
              ) && !e.hidden(),
        )
        ?.hide()
    }
    return newRolls
  }
}

class DieResult {
  readonly value: number
  private ignore: boolean

  constructor(value: number, ignore = false) {
    this.value = value
    this.ignore = ignore
  }

  hide(hide = true): DieResult {
    this.ignore = hide
    return this
  }

  hidden(): boolean {
    return this.ignore
  }
}

export class DiceResult {
  readonly rolls: DieResult[]
  readonly target?: number
  readonly dice: Dice
  readonly total: number

  constructor(rolls: DieResult[], dice: Dice, target?: number) {
    this.rolls = rolls
    this.dice = dice
    this.target = target
    this.total =
      rolls
        .map((e) => (e.hidden() ? 0 : e.value))
        .reduce((e, total) => e + total, 0) + (dice.bonus ?? 0)
  }
}

export class Dice {
  readonly number?: number
  readonly sides: number
  readonly keepDrop?: DiceKeepDrop
  bonus?: number
  readonly formula: Stringable

  constructor(
    formula: string,
    sides: number,
    number?: number,
    bonus?: number,
    keepDrop?: DiceKeepDrop,
  ) {
    this.formula = Stringable.of(formula)
    this.sides = sides
    this.number = number
    this.bonus = bonus
    this.keepDrop = keepDrop
  }

  static parse(formula: string): Dice {
    const formulaMatch = (formula.endsWith("%") ? "1k100" : formula)
      .replace(/\s+/, "")
      .match(fullDiceRegExp)
    const { number, type, kdOp, bonus, highest, lowest } = formulaMatch?.groups ?? {}

    const kd =
      kdOp === "k" || kdOp === "d"
        ? new DiceKeepDrop(
            lowest ? "l" : "h",
            kdOp,
            parseInt(lowest ?? highest),
          )
        : null
    const parsedBonus = bonus
      ? bonus
          .split(/(?=[+-])/g)
          .map((e) => parseInt(e))
          .reduce((e, total) => e + total, 0)
      : 0
    return new Dice(
      formula,
      parseInt(type),
      number ? parseInt(number) : 1,
      parsedBonus,
      kd ?? undefined,
    )
  }

  changeBonusBy(amount: number): Dice {
    if (this.bonus === undefined) this.bonus = 0
    this.bonus += amount
    return this
  }

  roll(): DiceResult {
    const target = this.formula.endsWith("%")
      ? parseInt(this.formula.before("%").toString())
      : null
    let rolls = Array(this.number)
      .fill(0)
      .map(
        () => new DieResult(Math.round(Math.random() * (this.sides - 1)) + 1),
      )
    if (this.keepDrop) {
      rolls = this.keepDrop.apply(rolls)
    }
    return new DiceResult(rolls, this, target ?? undefined)
  }
}

/*export default function rollFromString(str: string) {
    const formula = (str.endsWith('%') ? '1k100' : str).replace(/\s+/, '').match(fullDiceRegExp);
    const {
        number,
        type,
        kdOp,
        bonus
    } = formula.groups
    let {
        highest, 
        lowest
    } = formula.groups

    if (kdOp == "d") {
        if (highest) {
            lowest = number - (highest ? highest : 1)
            highest = null
        } else if (lowest) {
            highest = number - (lowest ? lowest : 1)
            lowest = null
        }
    } 
    
    const target = str.endsWith('%') ? str.substring(0, str.length - 1) : null
    const result = Array(+(number ?? 1)).fill(0).map(() => ({value: Math.round(Math.random() * (type - 1)) + 1}));
    for (let i = 0; i < number - (highest ?? lowest); i++) {
        result.find(e => e.value === (lowest ? Math.max : Math.min)(...result.filter(f => !f?.ignore).map(f => f.value)) && !e?.ignore).ignore = true;
    }
    return ({
        total: result.reduce((total, e) => total + (!e?.ignore && e.value), 0) + +(bonus ?? null),
        rolls: result,
        highest: highest ?? null,
        lowest: lowest ?? null,
        bonus: bonus ?? null,
        type: +type,
        target: target
    });
}*/
