import { html, useEffect, useState, useReducer, useRef } from './common.js'

function prepare(str) {
    return str?.normalize("NFD").replace(/[-\u0300-\u036f]/g, "").toUpperCase()
}

function findIndex(str, predicate) {
    console.log("findIndex", str)
    for (let i = 0; i <= str.length; i++) {
        console.log(`${i} ${str[i]}`)
        if (!predicate(str[i], i)) {
            return i
        }
    }
    return -1
}


export default function (props) {
    const { expected, onMatches } = props
    const [state, setState] = useState("")
    const [prevExpected, setPrevExpected] = useState(null)
    const [preparedExpected, setPreparedExpected] = useState(null)
    const [helper, setHelper] = useState(null)
    const [found, setFound] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
        const text = prepare(state) || ""
        const exp = preparedExpected || ""
        const maxLength = text.length
        let i = findIndex(exp, (c, i) => i < maxLength && c == text[i])
        setHelper(html`<span class="found">${exp.substring(0, i)}</span><span class="current">${exp[i]}</span><span class="expected">${exp.substring(i + 1)}</span>`)
    }, [preparedExpected, state])

    useEffect(() => {
        if (expected != null) {
            focus()
        }
    }, [expected])

    function focus() {
        ref.current?.focus()
    }

    if (prevExpected != expected) {
        setState("")
        setPrevExpected(expected)
        setPreparedExpected(prepare(expected))
        setFound(false)
    }

    function handleText(ev) {
        const text = ev.target.value
        setState(text)
        if (prepare(text) == preparedExpected) {
            setFound(true)
        }
    }

    function submit(ev) {
        ev.preventDefault()
        if (found) {
            onMatches()
        }
    }


    const input = html`<form onSubmit=${submit}><input class="input" type="text" onInput=${handleText} value=${state} ref=${ref} /><input class="submit" type="submit" value="" onclick="${focus}" /></form>`

    return html`<div class="GuessText"><div class="helper" onclick="${focus}">${helper}</div><div>${input}</div></div>`
}