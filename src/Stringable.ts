import { regex } from 'regex'

/**
 * A TypeScript implementation of the Laravel `Illuminate\Support\Stringable` class.
 */
export default class Stringable {
    private readonly subject: string;

    private constructor(source: string) {
        this.subject = source
    }

    /**
     * A public static implementation of the constructor.
     *
     * @param source - The string to be transformed into a Stringable
     * @returns A stringable formed from the `source` string
     **/
    static of(source: string): Stringable {
        return new Stringable(source ?? "")
    }

    /**
     * Returns the internal value of the Stringable.
     *
     * @return The internal string value of `this`
     */
    toString() {
        return this.subject
    }

    /**
     * Returns everything after the given value in a string.
     * The entire string will be returned if the value is not found.
     *
     * @param separator
     */
    after(separator: string) {
        const separatorPos = this.subject.indexOf(separator)
        if (separatorPos === -1) return this
        const stringAfter = this.subject.substring(separatorPos + separator.length)
        return new Stringable(stringAfter)
    }

    /**
     *
     * @param separator
     */
    afterLast(separator: string) {
        const separatorPos = this.subject.lastIndexOf(separator)
        if (separatorPos === -1) return this
        const stringAfter = this.subject.substring(separatorPos + separator.length)
        return new Stringable(stringAfter)
    }
    apa() {
        const titled = this.subject.replace(
            regex({ flags: "g" })`^\p{Lower}|(?<=\s|[^\p{Letter}\d_])\p{Lower}(?=\p{Letter}{3,})|(?<=[\.:\u2014][\s\d]*?)(?=\s)\p{Lower}|(?<=\p{Letter}[\-\u2010\u2011])\p{Lower}`,
            match => {
                return match.toLocaleUpperCase()
            }
        )
        return new Stringable(titled)
    }
    append(other: any) {
        return new Stringable(
            this.subject + other.subject
        )
    }
    ascii() {
        // TODO: implement method, laravel does this using an external package
    }
    basename() {
        return this.afterLast('/')
    }
    before(separator: string) {
        const separatorPos = this.subject.indexOf(separator)
        if (separatorPos === -1) return this
        const stringBefore = this.subject.substring(0, separatorPos)
        return new Stringable(stringBefore)
    }
    beforeLast(separator: string) {
        const separatorPos = this.subject.lastIndexOf(separator)
        if (separatorPos === -1) return this
        const stringBefore = this.subject.substring(0, separatorPos)
        return new Stringable(stringBefore)
    }
    between(start: string, end: string) {
        return this.after(start).beforeLast(end);
    }
    betweenFirst(start: string, end: string) {
        return this.after(start).before(end)
    }
    camel() {
        const words = this.words()
        const firstWordLc = words.shift().replace(regex`^\p{Upper}`, match => match.toLocaleLowerCase())
        const wordsUc = words.map(w => w.replace(regex`^\p{Lower}`, match => match.toLocaleUpperCase()))
        return new Stringable(firstWordLc + wordsUc.join(''))
    }
    charAt(pos: number) {
        const char = this.subject.charAt(pos)
        return char === "" ? false : char
    }
    classBasename() {
        return this.afterLast('.')
    }
    chopStart(chopValue: string | string[]) {
        const chops = Array.isArray(chopValue) ? chopValue : [chopValue]
        for (let index = 0; index < chops.length; index++) {
            if (this.subject.startsWith(chops[index])) {
                return this.after(chops[index])
            }
        }
        return this
    }
    chopEnd(chopValue: string | string[]) {
        const chops = Array.isArray(chopValue) ? chopValue : [chopValue]
        for (let index = 0; index < chops.length; index++) {
            if (this.subject.endsWith(chops[index])) {
                return this.after(chops[index])
            }
        }
        return this
    }
    contains(testValue: string | string[], ignoreCase: boolean = false) {
        const tests = Array.isArray(testValue) ? testValue : [testValue]
        for (let index = 0; index < tests.length; index++) {
            if (
                ignoreCase
                    ? this.subject.toLocaleLowerCase().indexOf(tests[index].toLocaleLowerCase()) > -1
                    : this.subject.indexOf(tests[index]) > -1
            ) {
                return true
            }
        }
        return false
    }
    containsAll(testValues: string[], ignoreCase: boolean = false) {
        for (let index = 0; index < testValues.length; index++) {
            if (
                ignoreCase
                    ? this.subject.toLocaleLowerCase().indexOf(testValues[index].toLocaleLowerCase()) === -1
                    : this.subject.indexOf(testValues[index]) === -1
            ) {
                return false
            }
        }
        return true
    }
    deduplicate(character: string = " ") {
        const regexp = regex`(${character}){2,}`
        const deduped = this.subject.replace(regexp, character)
        return new Stringable(deduped)
    }
    dirname(levelsToTrim: number = 1) {
        let subject: Stringable = this
        for (let index = 0; index < levelsToTrim; index++) {
            subject = subject.beforeLast('/')
        }
        return subject
    }
    endsWith(testValue: string | string[]) {
        const tests = Array.isArray(testValue) ? testValue : [testValue]
        for (let index = 0; index < tests.length; index++) {
            if (this.subject.endsWith(tests[index])) {
                return true
            }
        }
        return false
    }
    exactly(other: string) {
        return this.subject === other
    }
    excerpt(searchValue: string, options: {
        radius?: number,
        omission?: string
    } = { radius: 100, omission: "..."}) {
        const indexOfSearched = this.subject.indexOf(searchValue)
        const startIndex = Math.max(indexOfSearched - (options?.radius ?? 100), 0)
        const endIndex = Math.min(indexOfSearched + searchValue.length + options?.radius, this.subject.length)
        let cut = this.subject.substring(startIndex, endIndex)
        if (startIndex !== 0) {
            cut = (options?.omission ?? "...") + cut
        }
        if (endIndex !== this.subject.length) {
            cut = cut + (options?.omission ?? "...")
        }
        return new Stringable(cut)
    }
    explode(separator: string) {
        return this.subject.split(separator)
    }
    finish(ending: string) {
        return this.subject.endsWith(ending)
            ? this
            : new Stringable(this.subject + ending)
    }
    headline() {
        return new Stringable(this.words().map(w => w[0].toLocaleUpperCase() + w.substring(1)).join(' '))
    }
    inlineMarkdown() {
        // TODO: debate the safety and sense of implementing this method
    }
    is(pattern: string) {
        const regexp = new RegExp(pattern.replace("*", ".*"))
        return regexp.test(this.subject)
    }
    isAscii() {
        for (let index = 0; index < this.subject.length; index++) {
            if (this.subject.charCodeAt(index) > 255) return false
        }
        return true
    }
    isEmpty() {
        return this.subject.length > 0
    }
    isNotEmpty() {
        return !this.isEmpty()
    }
    isJson() {
        try {
            JSON.parse(this.subject)
            return true
        } catch {
            return false
        }
    }
    isUlid() {
        return /[0-7][0-9A-HJKMNP-TV-Z]{25}/.test(this.subject)
    }
    isUrl(protocols: string[] = []): boolean {
        return /[a-z]+:\/\/[a-z\d](\.[a-z\d]+)([\w%]+\/)+[\w%]+(\.[a-zA-Z]+)?(\?[\w%]+=.*?(&[\w%]=.*?)*)?/.test(this.subject)
        && (protocols ? this.startsWith(protocols) : true)
    }
    isUuid() {
        return /[\da-fA-F]{8}-[\da-fA-F]{4}-[\da-fA-F]{4}-[\da-fA-F]-[\da-fA-F]{12}/.test(this.subject)
    }
    kebab() {
        return new Stringable(this.words().map(w => w.toLocaleLowerCase()).join('-'))
    }
    lcfirst() {
        return new Stringable(this.subject[0].toLocaleLowerCase() + this.subject.substring(1))
    }
    length() {
        return this.subject.length
    }
    limit(length: number, ending: string = "...", preserveWords: boolean = true) {
        if (preserveWords) {
            const lastWordBoundary = (new RegExp(`.{0,${length}[\s\P{Letter}](?=\p{Letter})`, 'u')).lastIndex
            return this.subject.substring(0, lastWordBoundary < length ? lastWordBoundary : length) + ending
        }
        return this.subject.substring(0, length) + ending
    }
    lower() {
        return new Stringable(this.subject.toLocaleLowerCase())
    }
    markdown() {
        // TODO: debate if it's with implementing this
    }
    mask(maskChar: string, startOn: number, endOn: number = null) {
        const newString = this.subject
        const startIndex = startOn > 0 ? startOn : newString.length - startOn
        const endIndex = endOn === null ? newString.length : endOn > 0 ? endOn : newString.length - endOn
        return new Stringable(
            newString.substring(0, startIndex)
            + maskChar[0].repeat(endIndex - startIndex)
            + newString.substring(endIndex)
        )
    }
    match(pattern: RegExp) {
        return new Stringable(pattern.exec(this.subject)[0])
    }
    matchAll(pattern: RegExp) {
        return pattern.exec(this.subject)
    }
    isMatch(pattern: RegExp) {
        return pattern.test(this.subject)
    }
    newLine() {
        return new Stringable(this.subject + "\n")
    }
    padBoth(length: number, padChar: string) {
        const toPad = length - this.subject.length
        return new Stringable(
            this.subject.padStart(length - (toPad / 2), padChar)
                .padEnd(length, padChar)
        )
    }
    padLeft(length: number, padChar: string) {
        return new Stringable(this.subject.padStart(length, padChar))
    }
    padRight(length: number, padChar: string) {
        return new Stringable(this.subject.padEnd(length, padChar))
    }
    pipe(lambda: (str: string) => string) {
        return new Stringable(lambda(this.subject))
    }
    plural() {
        // TODO: actually impossible if I don't implement the LARAVEL PLURALIZER IN ITS ENTIRETY
    }
    position(substring: string) {
        const index = this.subject.indexOf(substring)
        return index === -1 ? false : index
    }
    prepend(other: string) {
        return new Stringable(other + this.subject)
    }
    remove(toRemove: string|string[], caseSensitive: boolean = true) {
        const removeArray = Array.isArray(toRemove) ? toRemove : [toRemove]
        let newString = this.subject
        for (let index = 0; index < removeArray.length; index++) {
            const regexpTemplate = removeArray[index].replace(regex`/[\^$\\.*+?()\[\]{}\-]`, match => "\\" + match)
            newString = newString.replace(
                regex({flags: caseSensitive ? '' : 'i'})`${regexpTemplate}`,
                ''
            )
        }
        return new Stringable(newString)
    }
    repeat(times: number) {
        return new Stringable(this.subject.repeat(times))
    }

    replace(needle: string, replacement: string, caseSensitive: boolean = true) {
        const newString = this.subject.replace(
            regex({flags: caseSensitive ? '' : 'i'})`${needle}`,
            replacement
        )
        return new Stringable(newString)
    }

    replaceArray(needle: string, replacements: string[], caseSensitive: boolean = true) {
        const newString = this.subject.replace(
            regex({flags: caseSensitive ? '' : 'i'})`${needle}`,
            (_, index) => replacements[ index % replacements.length ]
        )
        return new Stringable(newString)
    }

    replaceFirst(needle: string, replacement: string, caseSensitive: boolean = true) {
        const pos = this.subject.match(regex({flags: caseSensitive ? '' : 'i'})`${needle}`)
        const newString = pos ? (
            this.subject.substring(0, pos.index) + replacement + this.subject.substring(pos.index + pos.length)
        ) : this.subject
        return new Stringable(newString)
    }

    replaceLast(needle: string, replacement: string, caseSensitive: boolean = true) {
        const lastMatch = Array.from(this.subject.match(regex({flags: caseSensitive ? 'g' : 'gi'})`${needle}`))?.pop()
        const newString = lastMatch ? (
            this.subject.substring(0, this.subject.lastIndexOf(lastMatch)) + replacement + this.subject.substring(this.subject.lastIndexOf(lastMatch) + lastMatch.length)
        ) : this.subject
        return new Stringable(newString)
    }

    words(): string[] {
        return this.subject.split(regex`\s+|[-_]|(?=\p{Upper})`)
    }
}
