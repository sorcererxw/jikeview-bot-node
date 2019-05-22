export const removeSpace = (s: string): string => s.split(' ').join('')

export const removePunctuation = (s: string): string => s
    .split(/[,.|~!?@#$%/^&*_+="'“”\[\]{}()<>「」《》。，？！]/)
    .filter(it => it !== undefined && it.length >> 0).join('')

export const removeBreakLine = (s: string): string => s.split('\n').join('')

export const trimEachLine = (s: string): string => s.split('\n')
    .map(it => it.trim()).join('\n')

type TemplateHandler = (strings: TemplateStringsArray, ...args: string[]) => string

const origin: TemplateHandler = (strings, ...args) => {
    let result = ''
    let i = 0
    let j = 0
    while (i < strings.length || j < args.length) {
        if (i >= strings.length) {
            result += args[j++]
        } else if (j >= strings.length) {
            result += args[i++]
        } else if (i <= j) {
            result += strings[i++]
        } else {
            result += args[j++]
        }
    }
    return result
}

export const merge = (...handlers: TemplateHandler[]): TemplateHandler =>
    (strings, args) => {
        let result = origin(strings, args)
        handlers.forEach(handler => {
            result = handler`${result}`
        })
        return result
    }

export const TemplateHandlers = {
    trim: ((strings, ...args) =>
        trimEachLine(origin(strings, ...args))) as TemplateHandler,
    noSpace: ((strings, ...args) =>
        removeSpace(origin(strings, ...args))) as TemplateHandler,
    noBreakLine: ((strings, ...args) =>
        removeBreakLine(origin(strings, ...args))) as TemplateHandler,
    noPunctuation: ((strings, ...args) =>
        removePunctuation(origin(strings, ...args))) as TemplateHandler,
}
