import {
  html,
  useEffect,
  useState,
  useReducer,
  useCallback,
} from "./common.js";

const ruleSet = [
  {
    id: "doubles",
    label: "Doubles de 1 à 10",
    ranges: [[1, 10]],
    operation: (a) => a * 2,
    buildLabel: (operands) => [
      `Double de ${operands[0]} =`,
      `${operands[0]} + ${operands[0]} =`,
    ],
  },
  {
    id: "additions",
    label: "Tables de 1 à 10",
    ranges: [
      [1, 10],
      [1, 10],
    ],
    operation: (a, b) => a + b,
    buildLabel: (operands) => [
      `${operands[0]} + ${operands[1]} =`,
      `${operands[1]} + ${operands[0]} =`,
      `${operands[0]} plus ${operands[1]} =`,
      `${operands[1]} plus ${operands[0]} =`,
      `La somme de ${operands[0]} et ${operands[1]} est `,
      `La somme de ${operands[1]} et ${operands[0]} est `,
    ],
  },
  {
    id: "multiplications",
    label: "Multiplications de 1 à 5",
    ranges: [
      [1, 10],
      [1, 5],
    ],
    operation: (a, b) => a + b,
    buildLabel: (operands) => [
      `${operands[0]} × ${operands[1]} =`,
      `${operands[1]} × ${operands[0]} =`,
      `${operands[0]} fois ${operands[1]} =`,
      `${operands[1]} fois ${operands[0]} =`,
      `${operands[0]} paquets ${operands[1]} =`,
      `${operands[1]} paquets ${operands[0]} =`,
      `Le produit de ${operands[1]} par ${operands[0]} est `,
      `Le produit de ${operands[0]} par ${operands[1]} est `,
    ],
    renderHints: [
      (operands) => {
        const rows = [];
        for (let i = 0; i < operands[0]; i++) {
          const dots = [];
          for (let j = 0; j < operands[1]; j++) {
            dots.push(html`•`);
          }
          rows.push(html`<div>${dots}</div>`);
        }
        return html`<div>${rows}</div>`;
      },
      (operands) => {
        const sorted = Array.from(operands);
        sorted.sort((a, b) => a - b);
        const units = [];
        for (let i = 0; i < sorted[0]; i++) {
          units.push(html`<div>${sorted[1]}</div>`);
        }
        return html`<div>${units.join(" + ")} =</div>`;
      },
    ],
  },
];

const IS_DEBUG = false;

const count = (range) => range[1] - range[0] + 1;
const countRanges = (ranges) =>
  ranges.reduce((acc, range) => acc + count(range), 0);
const countRuleSet = ruleSet.map((rule) => countRanges(rule.ranges));
const total = countRuleSet.reduce((acc, count) => acc + count, 0);
// const buildDouble = (state) => {
//   const double = state.guess * 2;
//   return double;
// }
// const buildAdditions = (state) => {
//   const additions = state.history.map((item) => item + state.guess);
//   return additions;
// }
// const buildNextGuess = (state) => {
// }

const reducer = (state, action) => {
  const time = Date.now().valueOf();
  switch (action.type) {
    case "SHOW_HISTORY":
      return { ...state, mode: "HISTORY" };
    case "GUESS":
      if (state.mode === "RESULT") return state;
      const correct = action.value === state.answer;
      const score = state.score + (correct ? 1 : 0);
      const duration = time - state.time;
      const date = new Date(time);
      const history = [
        ...state.history,
        {
          label: state.label,
          value: action.value,
          duration,
          date,
          ruleId: state.rule.id,
          operands: state.operands,
          correct,
        },
      ];
      return { ...state, correct, score, history, mode: "RESULT" };
    case "NEXT":
      let iter = -1;
      while (true) {
        iter++;
        let guess = Math.floor(Math.random() * total);
        const rule = ruleSet.find((rule) => {
          guess -= countRanges(rule.ranges);
          return guess < 0;
        });
        const ranges = rule.ranges;
        const operands = ranges.map((range) => {
          const rangeCount = count(range);
          const idx = Math.floor(Math.random() * rangeCount);
          return range[0] + idx;
        });
        const answer = rule.operation(...operands);
        const labels = rule.buildLabel(operands);
        const label = labels[Math.floor(Math.random() * labels.length)];
        const existAlreadyInHistory = state.history.find(
          (item) =>
            item.correct &&
            item.ruleId == rule.id &&
            item.operands.every((v, i) => v == operands[i])
        );
        if (!existAlreadyInHistory || iter > total)
          return {
            ...state,
            guess,
            rule,
            operands,
            answer,
            label,
            time,
            mode: "GUESS",
          };
      }
    default:
      return state;
  }
};

function* range(start, end, action) {
  for (let i = start; i <= end; i++) {
    yield html`<button
      class="helper"
      style="flex: 1; zoom:0.5; height: 2em;"
      onClick=${() => action(i)}
    >
      ${i}
    </button>`;
  }
}
function* windowedRange(start, end, window, action, active) {
  for (let i = start; i <= end; i += window) {
    yield html`<div
      style="display: flex; flex-direction: row; gap: 2%; opacity: ${active
        ? 1
        : 0.1}; transition: opacity 0.3s; "
    >
      ${[...range(i, Math.min(end, i + window - 1), action)]}
    </div>`;
  }
}

function Answers(props) {
  const buttons = [...windowedRange(1, 20, 10, props.action, props.active)];
  return buttons;
}

function HistoryTable({ history }) {
  return html`<table>
    <thead>
      <tr>
        <th>Opération</th>
        <th>Réponse</th>
        <th>Temps</th>
      </tr>
    </thead>
    <tbody>
      ${history.map((item) => {
        return html` <tr>
          <td>${item.label}</td>
          <td style="color: ${item.correct ? "#00A000" : "#FF0000"}">
            ${item.value}
          </td>
          <td>${item.duration} ms</td>
        </tr>`;
      })}
    </tbody>
  </table>`;
}
function* calculateStats(history) {
  const incorrectAnswers = history.filter((item) => !item.correct).length;
  yield { label: "Réponses Incorrectes", value: incorrectAnswers };

  const sortedDurations = history
    .filter((item) => item.correct)
    .map((item) => item.duration)
    .sort((a, b) => a - b);
  const quarterLength = Math.ceil(sortedDurations.length / 4);

  const average = (arr) => arr.reduce((sum, val) => sum + val, 0) / arr.length;

  const avgFastestQuarter =
    average(sortedDurations.slice(0, quarterLength)) / 1000;
  yield {
    label: "Temps Moyen 1/4 rapide",
    value: avgFastestQuarter,
  };
  const avgAll = average(sortedDurations) / 1000;
  yield { label: "Temps Moyen", value: avgAll };
  const avgSlowestQuarter =
    average(sortedDurations.slice(-quarterLength)) / 1000;
  yield {
    label: "Temps Moyen 1/4 lent",
    value: avgSlowestQuarter,
  };
}

function HistoryStatGraph({ history }) {
  const stats = [...calculateStats(history)];
  const radiusLength = 100;
  function pointOnCircle(r, index) {
    const angle = (index / stats.length) * 2 * Math.PI;
    return {
      x: radiusLength * r * Math.cos(angle),
      y: radiusLength * r * Math.sin(angle),
    };
  }
  const points = stats.map((stat, index) => pointOnCircle(1, index));

  return html`
    <svg
      width="300"
      height="300"
      viewBox="0 0 300 300"
      style="min-height: 8cm;"
    >
      <g transform="translate(150, 150)">
        <polygon
          fill-opacity="0"
          stroke="black"
          points=${points.map(({ x, y }) => `${x},${y}`).join(" ")}
        />
        ${points.map(
          ({ x, y }) =>
            html`<line x1="0" y1="0" x2="${x}" y2="${y}" stroke="black" />`
        )}
        ${stats.map((stat, index) => {
          const value = Math.min(stat.value, 10) / 10; // Scale to max 10
          const { x, y } = pointOnCircle(value, index);
          const angle = (index / stats.length) * 360;

          return html`
            <circle cx="${x}" cy="${y}" r="3" fill="red" />
            <text
              text-anchor="middle"
              font-size="10"
              transform="rotate(${angle}) translate(110 0) rotate(90)"
            >
              ${stat.label}: ${stat.value.toFixed(2)}
            </text>
            <line
              x1="0"
              y1="0"
              x2="${x * (value / 100)}"
              y2="${y * (value / 100)}"
              stroke="blue"
            />
          `;
        })}
      </g>
    </svg>
  `;
}

function ShowHistory(props) {
  const { history } = props.state;
  const date = history.length > 0 ? history[0].date : new Date(Date.now());
  function formatDate(date) {
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
      hour: "numeric",
    });
  }
  return html`<div class="HistoryResults">
    <div style="font-size: 135%; font-weight: bold;">
      Session du ${formatDate(date)}
    </div>
    <${HistoryTable} history=${history} />
    <${HistoryStatGraph} history=${history} />
  </div>`;
}

function Timer(props) {
  const [time, setTime] = useState(Date.now());
  const duration = props.duration || 5000;
  const [progress, setProgress] = useState();

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        return ((duration + time - Date.now()) / duration) * 100;
      });
    }, 40);

    return () => clearInterval(interval);
  }, []);

  return html`<div style="width: 20%;">
    <div
      style=${`width: 100%; background-color: ${
        progress <= 0 && Math.round(Date.now() / 500) % 2 === 0
          ? "red"
          : "lightgray"
      }; height: 10px; margin-top: 10px;`}
    >
      <div
        style="width: ${Math.max(
          0,
          progress
        )}%; background-color: green; height: 100%;"
      ></div>
    </div>
  </div>`;
}

export default function () {
  const [state, dispatch] = useReducer(reducer, {
    history: [],
    guess: 0,
    score: 0,
    next: null,
    mode: "IDLE",
  });

  const handleAnswer = useCallback(
    (i) => dispatch({ type: "GUESS", value: i }),
    [dispatch]
  );

  useEffect(() => {
    if (state.history.length === 0) return;
    let forget = false;
    let done = false;
    const handle = setTimeout(
      () => {
        if (!forget && (state.mode === "RESULT" || state.history.length === 0))
          dispatch({ type: "NEXT" });
        done = true;
      },
      IS_DEBUG || state.history.length === 0 ? 0 : state.correct ? 800 : 5000
    );
    return () => {
      forget = true;
      if (!done) clearTimeout(handle);
    };
  }, [state.history.length, state.mode]);

  function buildTitle() {
    if (state.mode === "IDLE") {
      return html`
        <button
          style="font-size: 50%; font-weight: bold;"
          onClick=${() => dispatch({ type: "NEXT" })}
        >
          Commencer
        </button>
      `;
    } else if (state.mode === "GUESS") {
      // <${Timer} />
      return html`<div style="display: flex; flex-direction:row; gap: 1em;">
        <div
          style="flex: 1;"
          onClick=${() => {
            if (IS_DEBUG) {
              dispatch({ type: "GUESS", value: state.answer });
            }
          }}
        >
          ${state.label}
        </div>
      </div>`;
    } else if (state.mode === "RESULT") {
      return html`
        ${state.correct
          ? html`<div>Bravo !</div>
              <div>+1</div>`
          : html`<div style="font-size: 50%;">
                Dommage... La bonne réponse était :
              </div>
              <div>
                ${state.label}
                <span style="color: #00A000; font-weight: bold;"
                  >${state.answer}</span
                >
              </div>`}
      `;
    }
  }
  if (state.mode === "HISTORY") {
    return html`<${ShowHistory} state=${state} />`;
  } else {
    return html` <div
      class="GuessText"
      style="flex-direction: column;justify-content:space-evenly;flex: 1;gap:2em; "
    >
      <div class="helper" style="text-align: right;">
        <div
          style="font-size: 50%; position: absolute; right: 8px; top: 8px;"
          onClick=${() => dispatch({ type: "SHOW_HISTORY" })}
        >
          ${state.score} / ${state.history.length}
        </div>
      </div>
      <div class="helper" style="text-align: center; height:2.5em; ">
        ${buildTitle()}
      </div>
      <${Answers} action=${handleAnswer} active=${state.mode === "GUESS"} />
    </div>`;
  }
}
