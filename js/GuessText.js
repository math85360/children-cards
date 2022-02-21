import { html, useEffect, useState, useReducer } from './common.js'

function prepare(str) {
    return (str || "").normalize("NFD").replace(/[-\u0300-\u036f]/g, "").toUpperCase()
}

export default function (props) {
    const { expected, onMatches } = props
    const [state, setState] = useState("")
    const [prevExpected, setPrevExpected] = useState(null)
    const [preparedExpected, setPreparedExpected] = useState(null)

    if (prevExpected != expected) {
        setState("")
        setPrevExpected(expected)
        setPreparedExpected(prepare(expected))
    }

    function handleText(ev) {
        const text = ev.target.value
        setState(text)
        if (prepare(text) == preparedExpected) {
            onMatches()
        }
    }

    return html`<div>${expected}</div><input type="text" onInput=${handleText} value=${state} />`
}