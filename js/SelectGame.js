import { html, useState } from './common.js'
import GameGiveAnyText from './GameGiveAnyText.js'
import GameGuessTextFromPicture from './GameGuessTextFromPicture.js'

const games = [
    ["Entrer un nom", () => html`<${GameGiveAnyText} />`],
    ["Deviner le nom à partir d'une image", () => html`<${GameGuessTextFromPicture} />`]]

export default function (props) {
    const [state, setState] = useState(null)
    if (state === null) {
        return [html`<h1>Choisissez un jeu</h1>`, ...games.map(game => html`<button onclick=${x => setState(game[1]())}>${game[0]}</button>`)]
    } else {
        return html`<div><button onclick=${x => setState(null)}>Sortir</button></div>${state}`
    }
}