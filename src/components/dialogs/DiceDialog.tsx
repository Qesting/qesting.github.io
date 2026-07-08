import { useEffect, useRef, Dispatch, SetStateAction } from "react"
import { XLg } from "react-bootstrap-icons"
import { DiceResult } from "../../helpers/rollDice"

export default function DiceDialog({
  diceResult,
  setDiceResult,
}: {
  diceResult: DiceResult|null
  setDiceResult: Dispatch<SetStateAction<DiceResult|null>>
}) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (diceResult) {
      ref.current?.showModal()
    } else {
      ref.current?.close()
    }
  }, [diceResult])

  const close = () => setDiceResult(null)

  return (
    <dialog
      ref={ref}
      onCancel={close}
      className="px-8 py-4 bg-inherit text-inherit backdrop:bg-gray-950 backdrop:opacity-50 rounded-md w-[40rem] relative"
    >
      <button
        className="absolute top-2 right-2 duration-300 transition-colors hover:text-red-600 focus:text-red-600 active:text-red-600"
        aria-label="Zamknij eksport"
        onClick={close}
      >
        <XLg />
      </button>
      <h6 className="text-xl">Wynik rzutu:</h6>
      <span
        className={
          diceResult?.target
            ? diceResult?.total <= diceResult?.target
              ? "text-green-500"
              : "text-red-600"
            : ""
        }
      >
        {!!diceResult && diceResult?.target
          ? diceResult?.total <= diceResult?.target
            ? "Sukces"
            : "Porażka"
          : diceResult?.total}
      </span>
      <div>
        &#x5b;
        {diceResult?.rolls.map((e, index) => (
          <span
            key={index}
            className={`inline-block mx-1 ${e.hidden() ? "text-gray-400" : e.value === 1 ? "text-red-600" : e.value === diceResult.dice.sides ? "text-green-500" : ""}`}
          >
            {e.value}
          </span>
        ))}
        &#x5d;&nbsp;<span>+({diceResult?.dice.bonus})</span>
      </div>
    </dialog>
  )
}
