import { html, useState, useEffect } from "./common.js";
import GameGiveAnyText from "./GameGiveAnyText.js";
import LearnTable from "./LearnTable.js";
import GameGuessTextFromPicture from "./GameGuessTextFromPicture.js";
import CollectBarcode from "./CollectBarcode.js";
import Settings from "./Settings.js";
import LearnWriting from "./LearnWriting.js";

const games = [
  //["Entrer un nom", () => html`<${GameGiveAnyText} />`],
  [
    "Deviner le nom à partir d'une image",
    () => html`<${GameGuessTextFromPicture} />`,
  ],
  ["Collecter des codes-barres", () => html`<${CollectBarcode} />`],
  ["Jeu audio : deviner le mot", () => html`<${AudioGame} />`],
  ["Apprendre les tables", () => html`<${LearnTable} />`],
  ["Apprendre l'écriture", () => html`<${LearnWriting} />`],
];

export default function (props) {
  const [state, setState] = useState(null);
  useEffect(() => {
    document.fonts.add(
      new FontFace(
        "Belle Allure CM",
        "url(resources/fonts/BELLEALLURECM-FIN.OTF)",
        { style: "normal", weight: "normal" }
      )
    );
  }, []);
  if (state === null) {
    const list = games.map(
      (game) =>
        html`<button onclick=${(x) => setState(game[1]())}>${game[0]}</button>`
    );
    return [
      html`<div class="header">
        <h1>Choisissez un jeu</h1>
        <button
          class="settings"
          onclick=${() => setState(html`<${Settings} />`)}
        ></button>
      </div>`,
      html`<div class="GameList">${list}</div>`,
    ];
  } else {
    return html`<div>
        <button onclick=${(x) => setState(null)}>Sortir</button>
      </div>
      ${state}`;
  }
}
