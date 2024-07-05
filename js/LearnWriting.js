import { html, useMemo, useState, useRef, useEffect } from "./common.js";

function EnterText({ onTextEntered, onSizeEntered }) {
  const [text, setText] = useState("");
  const [size, setSize] = useState("60");
  const handleInput = (e) => {
    const newText = e.target.value;
    setText(newText);
    onTextEntered(newText);
  };

  const handleSizeInput = (e) => {
    const newSize = e.target.value;
    setSize(newSize);
    const parsedSize = parseInt(newSize, 10);
    onSizeEntered(parsedSize);
  };

  return html`
    <div class="screen-only">
      <textarea
        value=${text}
        onInput=${handleInput}
        rows="3"
        style="width: 100%;"
        multiline="true"
      ></textarea>
    </div>
    <div class="screen-only">
      <input value=${size} onInput=${handleSizeInput} style="width: 100%;" />
    </div>
  `;
}

function splitText(text) {
  const regex = /(\p{L}+['']?\p{L}*|[.,!?;:])/gu;
  return text.match(regex) || [];
}

function Writing({ text, fontSize, docWidth }) {
  const words = useMemo(() => splitText(text), [text]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const offscreenCanvasRef = useRef(null);
  const [wordsOnScreen, setWordsOnScreen] = useState(0);
  const [canvasRefs, setCanvasRefs] = useState([]);
  const [showModel, setShowModel] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.font = `${fontSize}px 'Belle Allure CM'`;

    let x = 10;
    let y = 300 - ((3 * fontSize) / 4) * 1.2;
    let i = currentWordIndex;
    let wordsOnScreen = 0;
    while (i < words.length) {
      const word = words[i];
      const wordWidth = ctx.measureText(word).width;
      if (x + wordWidth > canvas.width) {
        break;
      }
      ctx.fillText(word, x, y);
      x += wordWidth + ctx.measureText(" ").width;
      i++;
      wordsOnScreen++;
    }

    const offscreenCanvas = offscreenCanvasRef.current;
    ctx.drawImage(offscreenCanvas, 0, 0);

    setWordsOnScreen(wordsOnScreen);
  }, [words, currentWordIndex, fontSize, showModel]);

  function handleDraw(event) {
    if (isDrawing && event.isPrimary) {
      const { offsetX, offsetY } = event;
      drawSegment(offsetX, offsetY, false);
      setLastPosition({ x: offsetX, y: offsetY });
    }
  }

  function handlePointerDown(event) {
    const { offsetX, offsetY } = event;
    setIsDrawing(true);
    drawSegment(offsetX, offsetY, true);
    setLastPosition({ x: offsetX, y: offsetY });
  }

  function handlePointerUp() {
    setIsDrawing(false);
  }

  function drawSegment(x, y, moveTo) {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const offscreenCanvas = offscreenCanvasRef.current;
    const offscreenCtx = offscreenCanvas.getContext("2d");

    const drawOnCanvas = (ctx, x, y, moveTo) => {
      ctx.strokeStyle = "red";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      if (moveTo) {
        ctx.moveTo(x, y);
      } else {
        ctx.moveTo(lastPosition.x, lastPosition.y);
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    drawOnCanvas(ctx, x, y, moveTo);
    drawOnCanvas(offscreenCtx, x, y, moveTo);
  }

  function handleNextWord() {
    const isTotallyDone = currentWordIndex + wordsOnScreen >= words.length;
    const isLast = currentWordIndex + wordsOnScreen === words.length;

    if (false && isTotallyDone) {
    } else {
      const nextCanvas = document.createElement("canvas");
      nextCanvas.width = canvasRef.current.width;
      nextCanvas.height = canvasRef.current.height;
      const ctx = nextCanvas.getContext("2d");
      ctx.drawImage(canvasRef.current, 0, 0);
      setCanvasRefs((prevRefs) => [...prevRefs, nextCanvas]);
      const offscreenCanvas = offscreenCanvasRef.current;
      const offscreenCtx = offscreenCanvas.getContext("2d");
      offscreenCtx.clearRect(
        0,
        0,
        offscreenCanvas.width,
        offscreenCanvas.height
      );

      // Ajouter un nouveau canvas pour l'étape actuelle

      if (currentWordIndex + wordsOnScreen < words.length) {
        setCurrentWordIndex(currentWordIndex + wordsOnScreen);
      } else {
        // Dernier morceau, on arrête d'afficher le texte
        setCurrentWordIndex(words.length);
        // Effacer le canvas actuel
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }

  function calculateScore() {
    // Logique pour calculer le score basé sur les intersections
  }

  return html`
    <div>
      <canvas
        ref=${canvasRef}
        width=${docWidth}
        height="300"
        onPointerMove=${handleDraw}
        onPointerDown=${handlePointerDown}
        onPointerUp=${handlePointerUp}
        class="writing-screen-only"
      ></canvas>
      <canvas
        ref=${offscreenCanvasRef}
        width=${docWidth}
        height="300"
        style="display: none; width: 100%;"
      ></canvas>
      ${canvasRefs.map(
        (source, index) =>
          html`<${ShowCanvas} source=${source} docWidth=${docWidth} />`
      )}
    </div>
    <div
      style="display: flex; justify-content: space-between;"
      class="screen-only"
    >
      <label>
        <input
          type="checkbox"
          checked=${showModel}
          onChange=${() => setShowModel(!showModel)}
        />
        Voir le modèle en-dessous
      </label>
      <button onClick=${handleNextWord} style="font-size: 40px;">
        ${currentWordIndex + wordsOnScreen < words.length
          ? "Continuer"
          : "Terminer"}
      </button>
    </div>
  `;
}

function ShowCanvas({ source, docWidth }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.drawImage(source, 0, 0);
    }
  }, [source]);
  return html`<canvas
    ref=${canvasRef}
    width=${docWidth}
    height="300"
    style="display: none; width: 100%;"
    class="print-canvas"
  ></canvas> `;
}

function LearnWriting() {
  const [text, setText] = useState("");
  const [size, setSize] = useState(60);
  const [docWidth, setDocWidth] = useState(
    document.documentElement.clientWidth
  );
  return html`
    <div>
      <${EnterText}
        onTextEntered=${(text) => setText(text)}
        onSizeEntered=${(nextSize) => setSize(nextSize)}
      />
      <${Writing} docWidth=${docWidth} text=${text} fontSize=${size} />
    </div>
  `;
}

export default LearnWriting;
