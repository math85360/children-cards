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
    <div>
      <textarea
        value=${text}
        onInput=${handleInput}
        rows="3"
        style="width: 100%;"
        multiline="true"
      ></textarea>
    </div>
    <div>
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
  }, [words, currentWordIndex, fontSize]);

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
    if (currentWordIndex + wordsOnScreen < words.length) {
      setCurrentWordIndex(currentWordIndex + wordsOnScreen);
      const offscreenCanvas = offscreenCanvasRef.current;
      const offscreenCtx = offscreenCanvas.getContext("2d");
      offscreenCtx.clearRect(
        0,
        0,
        offscreenCanvas.width,
        offscreenCanvas.height
      );
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
        style="touch-action: none; width: 100%;"
      ></canvas>
      <canvas
        ref=${offscreenCanvasRef}
        width=${docWidth}
        height="300"
        style="display: none; width: 100%;"
      ></canvas>
    </div>
    <div style="display: flex; justify-content: right;">
      <button onClick=${handleNextWord} style="font-size: 40px;">
        Continuer
      </button>
    </div>
  `;
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
