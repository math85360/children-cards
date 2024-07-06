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
  const [pointerData, setPointerData] = useState({});

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
      if (x + wordWidth > canvas.width * 0.8) {
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

  function getFixedPosition(event) {
    const { offsetX, offsetY, tiltX, tiltY } = event;
    const realX = offsetX - tiltX;
    const realY = offsetY + tiltY;
    return { x: realX, y: realY };
  }

  function handleDraw(event) {
    updatePointerData(event);
    if (isDrawing && isRightPointer(event)) {
      if (event.buttons === 1) {
        const { x, y } = getFixedPosition(event);
        drawSegment(x, y, false);
        setLastPosition({ x, y });
      } else if (event.buttons === 2) {
        clearPoint(offsetX, offsetY);
      }
    }
  }

  function updatePointerData(event) {
    if (event.isPrimary && false)
      setPointerData({
        x: event.offsetX.toFixed(0),
        y: event.offsetY.toFixed(0),
        tiltX: event.tiltX,
        tiltY: event.tiltY,
        button: event.button,
        buttons: event.buttons,
        twist: event.twist,
        pressure: event.pressure,
        tangentialPressure: (
          (360 * event.tangentialPressure) /
          Math.PI
        ).toFixed(2),
        altitudeAngle: ((360 * event.altitudeAngle) / Math.PI).toFixed(2),
        azimuthAngle: ((360 * event.azimuthAngle) / Math.PI).toFixed(2),
      });
  }

  function handlePointerDown(event) {
    updatePointerData(event);
    if (isRightPointer(event)) {
      if (event.button === 0) {
        const { x, y } = getFixedPosition(event);
        setIsDrawing(true);
        drawSegment(x, y, true);
        setLastPosition({ x, y });
      } else if (event.button === 1) {
        clearPoint(offsetX, offsetY);
      }
    }
  }

  function handlePointerUp(event) {
    updatePointerData(event);
    if (isRightPointer(event)) {
      setIsDrawing(false);
    }
  }

  function handlePointerOver(event) {
    updatePointerData(event);
  }

  function isRightPointer(event) {
    return event.isPrimary && event.pointerType === "pen";
  }

  function clearPoint(x, y) {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = "white";
    ctx.lineWidth = 100;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 1, y + 1);
    ctx.stroke();
    // ctx.clearRect(x, y, 1, 1);
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
      // ctx.drawImage(offscreenCanvasRef.current, 0, 0);
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
    <div
      style="display: flex; justify-content: space-between; "
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
      <div style="font-size: 7pt; ">
        ${/*JSON.stringify(pointerData, null, 2)*/ ""}
      </div>
      <button onClick=${handleNextWord} style="font-size: 40px; ">
        ${currentWordIndex + wordsOnScreen < words.length
          ? "Continuer"
          : "Terminer"}
      </button>
    </div>
    <div class="print-canvas">${text}</div>
    <div>
      <canvas
        ref=${canvasRef}
        width=${docWidth}
        height="300"
        onPointerMove=${handleDraw}
        onPointerDown=${handlePointerDown}
        onPointerUp=${handlePointerUp}
        onPointerOver=${handlePointerOver}
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
    <div style="user-select: none;">
      <${EnterText}
        onTextEntered=${(text) => setText(text)}
        onSizeEntered=${(nextSize) => setSize(nextSize)}
      />
      <${Writing} docWidth=${docWidth} text=${text} fontSize=${size} />
    </div>
  `;
}

export default LearnWriting;
