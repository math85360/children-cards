import { html, useEffect, useState, useReducer } from './common.js'
import { useCategories, useObjectListLoader } from './data.js'
import GuessText from './GuessText.js'

const NEXT_WORD = "NEXT_WORD"
const WORD_FOUND = "WORD_FOUND"
const WORD_LIST_LOADED = "WORD_LIST_LOADED"

function stateReducer(state, action) {
    const { availableWords, expected_word, points } = state
    switch (action.name) {
        case WORD_FOUND:
            state = { ...state, points: points + 1, availableWords: availableWords.filter(x => x.name != expected_word.name) }
        case NEXT_WORD:
            const idx = Math.floor(Math.random() * availableWords.length)
            return { ...state, expected_word: availableWords[idx] }
        case WORD_LIST_LOADED:
            return stateReducer({ ...state, availableWords: action.list, expected_word: null }, { name: NEXT_WORD })
        default:
            console.log("state Reudcer", state, action)
            throw new Exception()
    }
}

function RandomWord(props) {
    const { category } = props
    const [state, _dispatch] = useReducer(stateReducer, {
        availableWords: [],
        expected_word: null,
        points: 0
    })
    function dispatch(actionName, data) {
        return _dispatch({ name: actionName, ...(data || {}) })
    }
    useObjectListLoader(category?.id, list => dispatch(WORD_LIST_LOADED, { list: list }))

    return html`<div>${state.points} ${category?.id} ${JSON.stringify(state)}</div><${GuessText} expected=${state.expected_word?.name} onMatches=${() => dispatch(WORD_FOUND)} />`
}

function SelectCategory() {
    const [category, setCategory] = useState(null)
    const categories = useCategories()
    if (categories == null) {
    } else {
        const withWord = category == null ? [] : [html`<${RandomWord} category=${category} />`]
        return [...categories.map(cat => html`<button onclick=${() => setCategory(cat)}>${cat.name}</button>`), ...withWord]
    }
}

export default function () {
    return html`<${SelectCategory} />`
}