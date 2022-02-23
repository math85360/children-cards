import { html, useEffect, useState, useReducer } from './common.js'
import { useCategoriesLoader, useObjectListLoader } from './data.js'
import GuessText from './GuessText.js'

const NEXT_WORD = "NEXT_WORD"
const WORD_FOUND = "WORD_FOUND"
const WORD_LIST_LOADED = "WORD_LIST_LOADED"
const RESET_SCORE = "RESET_SCORE"
const SET_CATEGORY = "SET_CATEGORY"
const CATEGORY_LIST_LOADED = "CATEGORY_LIST_LOADED"

function buildAction(actionName, data) {
    return { name: actionName, ...(data || {}) }
}

function stateReducer(state, action) {
    console.log("reduce state :", state, action)
    const { availableWords, expected_word, points } = state
    switch (action.name) {
        case RESET_SCORE:
            var { result, ...nextState } = state
            return nextState
        case WORD_FOUND:
            var nextState = { ...state, points: points + 1, availableWords: availableWords.filter(x => x.name != expected_word.name) }
            if (nextState.availableWords.length == 0)
                return { ...nextState, result: { score: points } }
            else
                return stateReducer(nextState, buildAction(NEXT_WORD))
        case NEXT_WORD:
            const idx = Math.floor(Math.random() * availableWords.length)
            return { ...state, expected_word: availableWords[idx] }
        case CATEGORY_LIST_LOADED:
            return { ...state, categories: action.list }
        case WORD_LIST_LOADED:
            var nextState = { ...state, availableWords: action.list, expected_word: null }
            return stateReducer(stateReducer(nextState, buildAction(RESET_SCORE)), buildAction(NEXT_WORD))
        case SET_CATEGORY:
            return { ...state, category: action.category, points: 0 }
        default:
            console.log("state Reudcer", state, action)
            throw new Exception()
    }
}

function SelectCategory(props) {
    const { categories, setCategory } = props
    if (categories == null) {
    } else {
        return categories.map(cat => html`<button onclick=${() => setCategory(cat)}>${cat.name}</button>`)
    }
}

export default function () {
    const [state, _dispatch] = useReducer(stateReducer, {
        availableWords: [],
        expected_word: null,
        points: 0
    })
    const { category, categories, points, expected_word } = state
    function dispatch(actionName, data) {
        return _dispatch(buildAction(actionName, data))
    }
    useObjectListLoader(category?.id, list => dispatch(WORD_LIST_LOADED, { list: list }))
    useCategoriesLoader(list => dispatch(CATEGORY_LIST_LOADED, { list: list }))

    function found() {
        dispatch(WORD_FOUND)
    }

    function buildResult() {
        if (!!state.result)
            return html`Gagné !`
        else {
            return html`<${GuessText} expected=${state.expected_word?.name} onMatches=${found} />`
        }
    }

    function setCategory(category) {
        return dispatch(SET_CATEGORY, { category: category })
    }

    return [
        html`<div class="SelectCategory"><${SelectCategory} categories=${categories} category=${category} setCategory=${setCategory} /></div>`,
        html`<div class="Filler" />`,
        buildResult()
    ]
}