import {regex} from "regex"
import { recursion } from "regex-recursion"

export const generalRegExp = regex({ flags: "g", plugins: [recursion]})`
    (?<all>
    # Linking tags
    @\w+(\{ .*? \}){1,2}
    | (
    # Formatting tags
        \#\[ [a-z] ( \| [a-z] )* \]
    # Inserting tags
        | %[a-zA-Z]+
    )
    # Recursive tail
    \{ ( [^\{\}] )* \}
    )
`

export const diceRegExp = regex`
    ^@dice
    \{
        (?<formula>
            \d* [kd]\d+ ([kd][hl]\d+)? ( [+\-] \d++ )*
            | \d+%
        )
        (\| (?<display>
            [ \p{Letter}\d\ +\-]+
        ) )?
    \}$
`

export const fullDiceRegExp = regex`
    (?<number> \d+ )?
    [kd](?<type> \d+ )
    ( 
        (?<kdOp> [kd] )
        (
            h(?<highest> \d+ )
            | l (?<lowest> \d+ )
        )
    )?
    (?<bonus> [+\-] \d+ )*
`

export const footnoteRegExp = regex`
    ^@footnote
    \{
        (?<index>\d+)
        (\| (?<displayIndex>\d+) )?
    \}$
`

export const tableRegExp = regex`
    ^@table
    \{
        (?<name>\w+)
        ( \| (?<display> [\d\p{Letter}\ ]+ ) )?
    \}
    (
        \{ (?<source> [a-zA-Z]+ ) \}
    )?$
`

export const quoteRegExp = regex`
    ^%quote
    \{
        (?<content>
            .*
        )
        \|
        (?<author> .* )
    \}$
`

export const sectionRegExp = regex`
    ^@(?<section> \w+ )
    \{
        (?<item> < | >? \w+ )
        ( - (?<variant> \w+ ) )?
        ( \| (?<display> [\d\p{Letter}\ ]* ) )?
        ( \| (?<value> [\d\p{Letter}\ ]+ ) )?
    \}
    ( \{ (?<source> [a-zA-Z]+ )\} )?$
`

export const mathRegExp = regex`
    ^\^ (?<equation> .*? ) [^\\]\^
    ( \{ (?<modifiers> [a-z]+ ) \} )?
`