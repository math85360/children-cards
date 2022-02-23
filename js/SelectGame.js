import { html, useState } from './common.js'
import GameGiveAnyText from './GameGiveAnyText.js'
import GameGuessTextFromPicture from './GameGuessTextFromPicture.js'
import Settings from './Settings.js'

const games = [
    //["Entrer un nom", () => html`<${GameGiveAnyText} />`],
    ["Deviner le nom à partir d'une image", () => html`<${GameGuessTextFromPicture} />`],
]

export default function (props) {
    const [state, setState] = useState(null)
    if (state === null) {
        const list = games.map(game => html`<button onclick=${x => setState(game[1]())}>${game[0]}</button>`)
        return [html`<div class="header"><h1>Choisissez un jeu</h1><button class="settings" onclick=${() => setState(html`<${Settings} />`)}></button></div>`, html`<div class="GameList">${list}</div>`]
    } else {
        return html`<div><button onclick=${x => setState(null)}>Sortir</button></div>${state}`
    }
}