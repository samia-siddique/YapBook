import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./NoteEditor.css";

const stickerOptions = [
  "🌷", "💗", "⭐", "🎀", "☁️", "🍓",
  "🦋", "✨", "🌼", "😭", "🫠", "🧠",
  "💅", "🗿", "🤡", "♡", "✿",
];

const quoteTypes = [
  {
    type: "brainrot",
    label: "Brainrot",
    icon: "✳",
    text: "my last two brain cells are fighting",
  },
  {
    type: "life",
    label: "Life update",
    icon: "✎",
    text: "currently figuring it all out...",
  },
  {
    type: "memory",
    label: "Little memory",
    icon: "♡",
    text: "a little moment worth keeping",
  },
];

const initialTitle = "little things lately";
const initialContent =
  "Today was a little chaotic, but at least the sky looked pretty.\n\nAnyway, here's everything my brain wants to remember...";

function NoteEditor() {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [objects, setObjects] = useState([]);
  const [strokes, setStrokes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activeTool, setActiveTool] = useState("select");
  const [activePanel, setActivePanel] = useState("");
  const [brushColor, setBrushColor] = useState("#ff6b9d");
  const [brushSize, setBrushSize] = useState(4);
  const [customSticker, setCustomSticker] = useState("");
  const [canUndoDrawing, setCanUndoDrawing] = useState(false);
  const [pageSize, setPageSize] = useState({ width: 600, height: 800 });

  const pageRef = useRef(null);
  const fileRef = useRef(null);
  const nextId = useRef(1);
  const pointerAction = useRef(null);
  const drawingRef = useRef(false);
  const drawingHistory = useRef([]);
  const objectsRef = useRef(objects);
  const strokesRef = useRef(strokes);

  useEffect(() => {
    objectsRef.current = objects;
  }, [objects]);

  useEffect(() => {
    strokesRef.current = strokes;
  }, [strokes]);

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;

    const observer = new ResizeObserver(([entry]) => {
      setPageSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });

    observer.observe(page);
    return () => observer.disconnect();
  }, []);

  function saveDrawingHistory() {
    drawingHistory.current.push(
      structuredClone(strokesRef.current),
    );

    if (drawingHistory.current.length > 50) {
      drawingHistory.current.shift();
    }

    setCanUndoDrawing(true);
  }

  function undoDrawing() {
    const previous = drawingHistory.current.pop();
    if (!previous) return;

    setStrokes(previous);
    strokesRef.current = previous;
    setCanUndoDrawing(drawingHistory.current.length > 0);
  }

  function addObject(type, extra = {}) {
    const id = nextId.current++;

    const defaults = {
      id,
      type,
      x: 8 + (objects.length % 4) * 7,
      y: 20 + (objects.length % 4) * 8,
      rotation: type === "sticker" ? 0 : (objects.length % 3 - 1) * 2,
      width: type === "photo" ? 25 : 38,
      height: 22,
    };

    setObjects((current) => [...current, { ...defaults, ...extra }]);
    setSelectedId(id);
    setActiveTool("select");
    setActivePanel("");
  }

  function updateObject(id, changes) {
    setObjects((current) =>
      current.map((item) =>
        item.id === id ? { ...item, ...changes } : item,
      ),
    );
  }

  function deleteSelected() {
    if (selectedId === null) return;

    setObjects((current) =>
      current.filter((item) => item.id !== selectedId),
    );
    setSelectedId(null);
  }

  function startDrag(event, item) {
    if (
      event.target.closest(
        "input, textarea, button, .note-resize-handle",
      )
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    setSelectedId(item.id);
    setActiveTool("select");

    pointerAction.current = {
      type: "drag",
      id: item.id,
      startX: event.clientX,
      startY: event.clientY,
      originalX: item.x,
      originalY: item.y,
    };
  }

  function startResize(event, item) {
    event.preventDefault();
    event.stopPropagation();
    setSelectedId(item.id);

    pointerAction.current = {
      type: "resize",
      id: item.id,
      startX: event.clientX,
      startY: event.clientY,
      originalWidth: item.width,
      originalHeight: item.height,
    };
  }

  useEffect(() => {
    function handlePointerMove(event) {
      const action = pointerAction.current;
      if (!action || !pageSize.width || !pageSize.height) return;

      const deltaX = event.clientX - action.startX;
      const deltaY = event.clientY - action.startY;

      if (action.type === "drag") {
        const nextX = Math.max(
          0,
          Math.min(
            90,
            action.originalX + (deltaX / pageSize.width) * 100,
          ),
        );
        const nextY = Math.max(
          0,
          Math.min(
            90,
            action.originalY + (deltaY / pageSize.height) * 100,
          ),
        );

        setObjects((current) =>
          current.map((item) =>
            item.id === action.id
              ? { ...item, x: nextX, y: nextY }
              : item,
          ),
        );
      }

      if (action.type === "resize") {
        const item = objectsRef.current.find(
          (object) => object.id === action.id,
        );
        if (!item) return;

        const widthDelta = (deltaX / pageSize.width) * 100;
        const heightDelta = (deltaY / pageSize.height) * 100;

        setObjects((current) =>
          current.map((object) => {
            if (object.id !== action.id) return object;

            return {
              ...object,
              width: Math.max(
                12,
                Math.min(75, action.originalWidth + widthDelta),
              ),
              ...(object.type === "quote"
                ? {
                    height: Math.max(
                      12,
                      Math.min(45, action.originalHeight + heightDelta),
                    ),
                  }
                : {}),
            };
          }),
        );
      }
    }

    function handlePointerUp() {
      pointerAction.current = null;
      drawingRef.current = false;
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [pageSize]);

  function handlePhoto(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      window.alert("Please choose an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      window.alert("Choose an image smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      addObject("photo", {
        src: reader.result,
        caption: "",
        width: 27,
      });
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  }

  function chooseTool(tool) {
    if (tool === "photo") {
      fileRef.current?.click();
      return;
    }

    if (tool === "undo-drawing") {
      undoDrawing();
      return;
    }

    if (tool === "delete") {
      deleteSelected();
      return;
    }

    if (tool === "eraser") {
      setActiveTool("eraser");
      setActivePanel("draw");
      setSelectedId(null);
      return;
    }

    if (tool === "draw") {
      setActiveTool("draw");
      setActivePanel(activePanel === "draw" ? "" : "draw");
      setSelectedId(null);
      return;
    }

    setSelectedId(null);
    setActiveTool("select");
    setActivePanel(activePanel === tool ? "" : tool);
  }

  function addQuote(quote) {
    addObject("quote", {
      quoteType: quote.type,
      text: quote.text,
      color:
        quote.type === "brainrot"
          ? "#ffe477"
          : quote.type === "life"
            ? "#e9dfff"
            : "#dff2e3",
      width: quote.type === "memory" ? 34 : 40,
      height: quote.type === "brainrot" ? 18 : 23,
    });
  }

  function addCustomSticker() {
    const value = customSticker.trim();
    if (!value) return;

    addObject("sticker", { emoji: value.slice(0, 18) });
    setCustomSticker("");
  }

  function getPoint(event) {
    const rect = pageRef.current.getBoundingClientRect();

    return {
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    };
  }

  function pointDistance(pointA, pointB) {
    const dx = ((pointA.x - pointB.x) / 100) * pageSize.width;
    const dy = ((pointA.y - pointB.y) / 100) * pageSize.height;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function eraseAt(point) {
    const eraseRadius = Math.max(14, brushSize * 2.5);
    const remaining = strokesRef.current.filter((stroke) => {
      return !stroke.points.some(
        (strokePoint) => pointDistance(point, strokePoint) < eraseRadius,
      );
    });

    if (remaining.length !== strokesRef.current.length) {
      setStrokes(remaining);
      strokesRef.current = remaining;
    }
  }

  function handleDrawStart(event) {
    if (activeTool !== "draw" && activeTool !== "eraser") return;

    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);

    const point = getPoint(event);

    if (activeTool === "eraser") {
      eraseAt(point);
      return;
    }

    saveDrawingHistory();
    drawingRef.current = true;

    const stroke = {
      id: nextId.current++,
      color: brushColor,
      size: brushSize,
      points: [point],
    };

    setStrokes((current) => [...current, stroke]);
    strokesRef.current = [...strokesRef.current, stroke];
  }

  function handleDrawMove(event) {
    if (activeTool === "eraser" && event.buttons === 1) {
      eraseAt(getPoint(event));
      return;
    }

    if (activeTool !== "draw" || !drawingRef.current) return;

    const point = getPoint(event);

    setStrokes((current) => {
      if (!current.length) return current;

      const next = [...current];
      const last = next[next.length - 1];

      next[next.length - 1] = {
        ...last,
        points: [...last.points, point],
      };

      strokesRef.current = next;
      return next;
    });
  }

  function handleDrawEnd() {
    drawingRef.current = false;
  }

  const selectedObject = objects.find((item) => item.id === selectedId);

  return (
    <main className="note-editor">
      <nav className="note-nav">
        <Link to="/dashboard" className="note-brand">
          yapbook<span className="note-brand-mark">✳</span>
        </Link>

        <div className="note-nav-center">
          <span className="note-nav-dot" />
          little journal
        </div>

        <Link to="/dashboard" className="note-back-link">
          <span aria-hidden="true">←</span> all yaps
        </Link>
      </nav>

      <section className="note-workspace">
        <div className="note-page-area">
          <article
            className={`note-paper ${
              activeTool === "draw"
                ? "note-paper-drawing"
                : activeTool === "eraser"
                  ? "note-paper-erasing"
                  : ""
            }`}
            ref={pageRef}
          >
            <div className="note-paper-tape" aria-hidden="true" />

            <input
              className="note-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="give this yap a title..."
              aria-label="Journal title"
            />

            <div className="note-divider">
              <span />
              <span>✳</span>
              <span />
            </div>

            <textarea
              className="note-writing"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="start yapping here..."
              aria-label="Journal text"
            />

            <div className="note-decoration-layer">
              <svg
                className="note-strokes"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-label="Drawing strokes"
              >
                {strokes.map((stroke) => (
                  <polyline
                    key={stroke.id}
                    points={stroke.points
                      .map((point) => `${point.x},${point.y}`)
                      .join(" ")}
                    fill="none"
                    stroke={stroke.color}
                    strokeWidth={
                      (stroke.size / Math.max(pageSize.width, 1)) * 100
                    }
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
              </svg>

              {objects.map((item) => (
                <div
                  key={item.id}
                  className={[
                    "note-object",
                    `note-object-${item.type}`,
                    item.type === "quote"
                      ? `note-quote-${item.quoteType}`
                      : "",
                    selectedId === item.id ? "note-object-selected" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={{
                    left: `${item.x}%`,
                    top: `${item.y}%`,
                    width:
                      item.type === "sticker"
                        ? "auto"
                        : `${item.width}%`,
                    height:
                      item.type === "quote"
                        ? `${item.height}%`
                        : "auto",
                    transform: `rotate(${item.rotation}deg)`,
                    "--note-quote-color": item.color,
                  }}
                  onPointerDown={(event) => startDrag(event, item)}
                  onClick={() => setSelectedId(item.id)}
                >
                  {item.type === "sticker" && (
                    <span className="note-sticker">{item.emoji}</span>
                  )}

                  {item.type === "photo" && (
                    <div className="note-polaroid">
                      <img
                        className="note-photo-image"
                        src={item.src}
                        alt="Journal decoration"
                        draggable="false"
                      />
                      <input
                        className="note-photo-caption"
                        value={item.caption}
                        onChange={(event) =>
                          updateObject(item.id, {
                            caption: event.target.value,
                          })
                        }
                        onPointerDown={(event) => event.stopPropagation()}
                        placeholder="little caption..."
                        aria-label="Photo caption"
                      />
                    </div>
                  )}

                  {item.type === "quote" && (
                    <div className="note-quote-inner">
                      <span className="note-quote-label">
                        {item.quoteType === "brainrot"
                          ? "BRAINROT DIARY"
                          : item.quoteType === "life"
                            ? "LIFE LATELY"
                            : "KEEP THIS"}
                      </span>

                      <textarea
                        className="note-quote-text"
                        value={item.text}
                        onChange={(event) =>
                          updateObject(item.id, { text: event.target.value })
                        }
                        onPointerDown={(event) => event.stopPropagation()}
                        placeholder="write something..."
                        aria-label="Quote text"
                      />

                      <span className="note-quote-decoration">
                        {item.quoteType === "brainrot"
                          ? "✳"
                          : item.quoteType === "life"
                            ? "↗"
                            : "♡"}
                      </span>
                    </div>
                  )}

                  {selectedId === item.id && (
                    <button
                      className="note-object-delete"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setObjects((current) =>
                          current.filter((object) => object.id !== item.id),
                        );
                        setSelectedId(null);
                      }}
                      aria-label="Remove item"
                      title="Remove"
                    >
                      ×
                    </button>
                  )}

                  {selectedId === item.id && item.type !== "sticker" && (
                    <button
                      type="button"
                      className="note-resize-handle"
                      onPointerDown={(event) => startResize(event, item)}
                      aria-label={`Resize ${item.type}`}
                      title="Drag to resize"
                    />
                  )}
                </div>
              ))}
            </div>

            {(activeTool === "draw" || activeTool === "eraser") && (
              <div
                className="note-draw-layer"
                onPointerDown={handleDrawStart}
                onPointerMove={handleDrawMove}
                onPointerUp={handleDrawEnd}
                onPointerCancel={handleDrawEnd}
              />
            )}
          </article>
        </div>

        <footer className="note-bottom-bar">
          <div className="note-toolbar">
            <button
              className={`note-tool ${
                activeTool === "draw" ? "note-tool-active" : ""
              }`}
              onClick={() => chooseTool("draw")}
              type="button"
            >
              <span className="note-tool-icon note-pen-icon">✎</span>
              <span>Draw</span>
            </button>

            <button
              className="note-tool"
              onClick={() => chooseTool("photo")}
              type="button"
            >
              <span className="note-tool-icon">▧<small>+</small></span>
              <span>Photo</span>
            </button>

            <button
              className={`note-tool ${
                activePanel === "stickers" ? "note-tool-active" : ""
              }`}
              onClick={() => chooseTool("stickers")}
              type="button"
            >
              <span className="note-tool-icon">✿</span>
              <span>Stickers</span>
            </button>

            <button
              className={`note-tool ${
                activePanel === "quotes" ? "note-tool-active" : ""
              }`}
              onClick={() => chooseTool("quotes")}
              type="button"
            >
              <span className="note-tool-icon">❝</span>
              <span>Quotes</span>
            </button>

            <button
              className={`note-tool ${
                activeTool === "eraser" ? "note-tool-active" : ""
              }`}
              onClick={() => chooseTool("eraser")}
              type="button"
            >
              <span className="note-tool-icon">⌫</span>
              <span>Eraser</span>
            </button>

            <button
              className="note-tool"
              onClick={() => chooseTool("undo-drawing")}
              disabled={!canUndoDrawing}
              type="button"
            >
              <span className="note-tool-icon">↶</span>
              <span>Undo line</span>
            </button>
          </div>

          <div className="note-bottom-right">
            {selectedObject && (
              <button
                className="note-delete-button"
                onClick={deleteSelected}
                type="button"
              >
                Delete selected
              </button>
            )}
            <span className="note-draft-status">
              <span /> draft
            </span>
          </div>
        </footer>
      </section>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="note-hidden-file"
        onChange={handlePhoto}
      />

      {activePanel && (
        <aside
          className={`note-tool-panel note-panel-${activePanel}`}
          aria-label={`${activePanel} tools`}
        >
          <div className="note-panel-heading">
            <div>
              <span className="note-panel-eyebrow">YAPBOOK STUDIO</span>
              <h2>
                {activePanel === "stickers"
                  ? "add some personality"
                  : activePanel === "quotes"
                    ? "little words, big feelings"
                    : "your colour palette"}
              </h2>
            </div>

            <button
              type="button"
              className="note-panel-close"
              onClick={() => setActivePanel("")}
              aria-label="Close panel"
            >
              ×
            </button>
          </div>

          {activePanel === "stickers" && (
            <>
              <div className="note-sticker-grid">
                {stickerOptions.map((sticker) => (
                  <button
                    type="button"
                    className="note-sticker-option"
                    key={sticker}
                    onClick={() => addObject("sticker", { emoji: sticker })}
                  >
                    {sticker}
                  </button>
                ))}
              </div>

              <div className="note-custom-sticker">
                <input
                  value={customSticker}
                  onChange={(event) => setCustomSticker(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") addCustomSticker();
                  }}
                  placeholder="your own emoji or text..."
                  maxLength={18}
                />
                <button type="button" onClick={addCustomSticker}>
                  + Add
                </button>
              </div>
            </>
          )}

          {activePanel === "quotes" && (
            <div className="note-quote-options">
              {quoteTypes.map((quote) => (
                <button
                  type="button"
                  key={quote.type}
                  className={`note-quote-option note-quote-option-${quote.type}`}
                  onClick={() => addQuote(quote)}
                >
                  <span className="note-quote-option-icon">{quote.icon}</span>
                  <span>
                    <strong>{quote.label}</strong>
                    <small>{quote.text}</small>
                  </span>
                  <span className="note-quote-option-plus">+</span>
                </button>
              ))}
              <p className="note-panel-hint">
                Add one, then click its text to edit it. Drag the corner to resize.
              </p>
            </div>
          )}

          {activePanel === "draw" && (
            <div className="note-draw-settings">
              <label className="note-field-label" htmlFor="note-brush-size">
                Brush size <strong>{brushSize}px</strong>
              </label>

              <input
                id="note-brush-size"
                className="note-brush-size"
                type="range"
                min="2"
                max="18"
                value={brushSize}
                onChange={(event) =>
                  setBrushSize(Number(event.target.value))
                }
              />

              <label className="note-field-label" htmlFor="note-colour-spectrum">
                Drag to choose a colour
              </label>

              <input
                id="note-colour-spectrum"
                className="note-colour-spectrum"
                type="range"
                min="0"
                max="360"
                value={Number(brushColor.match(/hsl\((\d+)/)?.[1] ?? 335)}
                onChange={(event) =>
                  setBrushColor(`hsl(${event.target.value}, 90%, 62%)`)
                }
                aria-label="Colour spectrum"
              />

              <div className="note-current-colour">
                <span style={{ background: brushColor }} />
                <span>Selected ink</span>
                <input
                  type="color"
                  value={
                    brushColor.startsWith("#")
                      ? brushColor
                      : "#ff6b9d"
                  }
                  onChange={(event) => setBrushColor(event.target.value)}
                  aria-label="Custom brush colour"
                />
              </div>

              <button
                type="button"
                className="note-panel-action"
                onClick={() => setActiveTool("draw")}
              >
                <span>✎</span> Use pen
              </button>

              <button
                type="button"
                className="note-panel-action note-panel-action-muted"
                onClick={() => setActiveTool("eraser")}
              >
                <span>⌫</span> Erase individual strokes
              </button>

              <p className="note-panel-hint">
                Undo removes your last drawn line. The eraser removes strokes
                you touch, without affecting photos or writing.
              </p>
            </div>
          )}
        </aside>
      )}
    </main>
  );
}

export default NoteEditor;