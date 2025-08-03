export default function capitalize(str) {
    return str?.replace(
        /(?<!!&)(?:^\p{Lower}|(?<=\s|[^\p{Letter}\d_])\p{Lower}(?=\p{Letter}{3,}|(?<=[.:\u2014][\s\d]*?)(?=\s)\P{Lower}|(?<=\p{Letter}[-\u2010\u2011])\p{Lower}))|(?<=[^!]&)\p{Lower}/gu,
        match => match.toLocaleUpperCase()
    )?.replace(/!?&/, "")
}