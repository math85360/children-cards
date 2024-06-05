import { html, useMemo, useState, useRef, useEffect } from "./common.js";

function EnterText({ onTextEntered }) {
  const [text, setText] = useState("");
  const handleInput = (e) => {
    const newText = e.target.value;
    setText(newText);
    onTextEntered(newText);
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
  `;
}

function Writing({ text, fontSize }) {
  const lines = useMemo(() => text.split("\n"), [text]);
  const [currentLine, setCurrentLine] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const offscreenCanvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Effacer le canvas avant de redessiner
    ctx.fillStyle = "black";
    ctx.font = `${fontSize}px 'Belle Allure CM'`;
    ctx.fillText(lines[currentLine], 10, 100);

    // Copier le contenu du canvas hors écran sur le canvas visible
    const offscreenCanvas = offscreenCanvasRef.current;
    ctx.drawImage(offscreenCanvas, 0, 0);
  }, [lines, currentLine, fontSize]);

  function handleDraw(event) {
    console.log("handleDraw", event.isPrimary, isDrawing, event);
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

  function handleNextLine() {
    if (currentLine < lines.length - 1) {
      setCurrentLine(currentLine + 1);
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
        width="800"
        height="200"
        onPointerMove=${handleDraw}
        onPointerDown=${handlePointerDown}
        onPointerUp=${handlePointerUp}
        style="touch-action: none;"
      ></canvas>
      <canvas
        ref=${offscreenCanvasRef}
        width="800"
        height="200"
        style="display: none;"
      ></canvas>
      <button onClick=${handleNextLine}>Next Line</button>
      <button onClick=${calculateScore}>Calculate Score</button>
    </div>
  `;
}

function LearnWriting() {
  const [text, setText] = useState("");
  return html`
    <div>
      <${EnterText} onTextEntered=${(text) => setText(text)} />
      <${Writing} text=${text} fontSize="40" />
    </div>
  `;
}

export default LearnWriting;
