import { html, useEffect, useReducer, useCallback } from "./common.js";

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
    label: "Tables de 1 à 5",
    ranges: [
      [1, 10],
      [1, 5],
    ],
    operation: (a, b) => a + b,
    buildLabel: (operands) => [
      `${operands[0]} + ${operands[1]} =`,
      `${operands[1]} + ${operands[0]} =`,
    ],
  },
];

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
      const history = [
        ...state.history,
        {
          label: state.label,
          value: action.value,
          duration,
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
            (item.ruleId =
              rule.id && item.operands.every((v, i) => v == operands[i]))
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
      style="flex: 1; zoom:0.5; height: 3em;"
      onClick=${() => action(i)}
    >
      ${i}
    </button>`;
  }
}
function* windowedRange(start, end, window, action) {
  for (let i = start; i <= end; i += window) {
    yield html`<div
      style="display: flex; flex-direction: row; gap: 2em; flex: 1;"
    >
      ${[...range(i, Math.min(end, i + window - 1), action)]}
    </div>`;
  }
}

function Answers(props) {
  const buttons = [...windowedRange(1, 20, 10, props.action)];
  return html`<div
    style="display: flex; flex-direction: row; flex-wrap: wrap; gap: 3em; opacity: ${props.active
      ? 1
      : 0.1}; transition: opacity 0.3s; "
  >
    ${buttons}
  </div>`;
}

function ShowHistory(props) {
  const { state } = props;
  return html`<div
    style="display: flex; flex-direction: column; flex: 1; gap: 2em;"
  >
    <table>
      <thead>
        <tr>
          <th>Opération</th>
          <th>Réponse</th>
          <th>Temps</th>
        </tr>
      </thead>
      <tbody>
        ${state.history.map((item) => {
          return html` <tr>
            <td>${item.label}</td>
            <td style="color: ${item.correct ? "#00A000" : "#FF0000"}">
              ${item.value}
            </td>
            <td>${item.duration} ms</td>
          </tr>`;
        })}
      </tbody>
    </table>
  </div>`;
}

export default function () {
  const [state, dispatch] = useReducer(reducer, {
    history: [],
    guess: 0,
    score: 0,
    next: null,
  });

  const handleAnswer = useCallback(
    (i) => dispatch({ type: "GUESS", value: i }),
    [dispatch]
  );

  useEffect(() => {
    let forget = false;
    let done = false;
    const handle = setTimeout(
      () => {
        if (!forget && (state.mode === "RESULT" || state.history.length === 0))
          dispatch({ type: "NEXT" });
        done = true;
      },
      state.history.length === 0 ? 0 : state.correct ? 800 : 5000
    );
    return () => {
      forget = true;
      if (!done) clearTimeout(handle);
    };
  }, [state.history.length, state.mode]);

  function buildTitle() {
    if (state.mode === "GUESS") {
      return html`${state.label}`;
    } else if (state.mode === "RESULT") {
      return html`
        <div>${state.correct ? "Bravo !" : "Dommage..."}</div>
        <div>
          ${state.correct
            ? "+1"
            : html`<div>La bonne réponse était :</div>
                <div>
                  ${state.label}
                  <span style="color: #00A000; font-weight: bold;"
                    >${state.answer}</span
                  >
                </div>`}
        </div>
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
          style="font-size: 50%;"
          onClick=${() => dispatch({ type: "SHOW_HISTORY" })}
        >
          ${state.score} / ${state.history.length}
        </div>
      </div>
      <div class="helper" style="text-align: center; height:4em; ">
        ${buildTitle()}
      </div>
      <${Answers} action=${handleAnswer} active=${state.mode === "GUESS"} />
    </div>`;
  }
}
