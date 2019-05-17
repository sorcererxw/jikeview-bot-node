function concatTemplateString(strings: TemplateStringsArray, ...placeHolders: string[]) {
    let result = ''
    for (let i = 0; i < strings.length + placeHolders.length; i++) {
        if (i % 2 === 0) {
            result += strings[i / 2]
        } else {
            result += placeHolders[(i - 1) / 2]
        }
    }
    return result
}

export function trim(strings: TemplateStringsArray, ...placeHolders: string[]): string {
    return concatTemplateString(strings, ...placeHolders)
        .split('\n').map(it => it.trim()).join('\n')
}

export function noSpace(strings: TemplateStringsArray, ...placeHolders: string[]) {
    return concatTemplateString(strings, ...placeHolders)
        .split(' ').join('')
}
