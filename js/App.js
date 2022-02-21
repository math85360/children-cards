import { html, render } from './common.js'
import SelectGame from './SelectGame.js'

function App(props) {
    return html`<${SelectGame} />`
}

render(html`<${App} />`, document.body)
