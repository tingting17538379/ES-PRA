/* Intro doors, isometric board wrap, and original neon robot billboard.
   Wraps existing game functions without changing rules. */
(function () {
  const cfg = Object.assign({
    level: "01",
    title: "結構挑戰",
    subtitle: "請引導機器人取得寶藏。"
  }, window.NEON_BOARD || {});

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function robotSvg(prefix, facing) {
    // Original "Lumo"-style bot: capsule head, visor with two dots,
    // offset crystal antenna, hover ring. Not a light-Bot copy.
    const f = facing || "front";
    return `<svg viewBox="0 0 80 110" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="${prefix}-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#3a4a66"/>
          <stop offset="55%" stop-color="#1a2438"/>
          <stop offset="100%" stop-color="#0a101c"/>
        </linearGradient>
        <linearGradient id="${prefix}-head" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#4a5c78"/>
          <stop offset="100%" stop-color="#152033"/>
        </linearGradient>
        <filter id="${prefix}-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.6" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      ${f === "front" ? robotFront(prefix) : ""}
      ${f === "back" ? robotBack(prefix) : ""}
      ${f === "right" ? robotSide(prefix, false) : ""}
      ${f === "left" ? robotSide(prefix, true) : ""}
    </svg>`;
  }

  function hoverRing(cx, cy, rx, ry) {
    return `
      <ellipse cx="${cx}" cy="${cy + 3}" rx="${rx + 2}" ry="${ry + 1.2}" fill="currentColor" opacity="0.18"/>
      <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="currentColor" stroke-width="2.4"/>
      <ellipse cx="${cx}" cy="${cy}" rx="${rx * 0.58}" ry="${ry * 0.55}" fill="#0a1020" stroke="currentColor" stroke-width="1.2" opacity="0.85"/>
      <circle cx="${cx - rx * 0.45}" cy="${cy}" r="1.6" fill="#a3e635"/>
      <circle cx="${cx + rx * 0.45}" cy="${cy}" r="1.6" fill="#a3e635"/>
    `;
  }

  function antenna(x1, y1, x2, y2) {
    return `
      <path d="M${x1} ${y1} Q${(x1 + x2) / 2 - 4} ${(y1 + y2) / 2 - 2} ${x2} ${y2}"
            fill="none" stroke="#9aa8c2" stroke-width="2.2" stroke-linecap="round"/>
      <polygon points="${x2},${y2 - 5.2} ${x2 + 4.2},${y2} ${x2},${y2 + 5.2} ${x2 - 4.2},${y2}"
               fill="#a3e635" stroke="#d9f99d" stroke-width="0.6" filter="url()"/>
    `;
  }

  function robotFront(p) {
    return `<g>
      ${hoverRing(40, 100, 24, 7.5)}
      <!-- stubby legs / pads -->
      <rect x="26" y="88" width="10" height="8" rx="3" fill="#151c2c" stroke="#2a354c" stroke-width="1"/>
      <rect x="44" y="88" width="10" height="8" rx="3" fill="#151c2c" stroke="#2a354c" stroke-width="1"/>
      <!-- body -->
      <rect x="22" y="50" width="36" height="40" rx="12" fill="url(#${p}-body)" stroke="#5b6d88" stroke-width="1.4"/>
      <rect x="26" y="54" width="28" height="16" rx="6" fill="#0c1424" opacity="0.5"/>
      <!-- chest gem -->
      <polygon points="40,62 44.5,68 40,74 35.5,68" fill="#a3e635" stroke="#ecfccb" stroke-width="0.7"/>
      <!-- arm nubs -->
      <rect x="14" y="60" width="10" height="16" rx="5" fill="url(#${p}-body)" stroke="#5b6d88" stroke-width="1.2"/>
      <rect x="56" y="60" width="10" height="16" rx="5" fill="url(#${p}-body)" stroke="#5b6d88" stroke-width="1.2"/>
      <!-- neck -->
      <rect x="35" y="45" width="10" height="7" rx="2" fill="#1b2436"/>
      <!-- head capsule -->
      <rect x="20" y="12" width="40" height="36" rx="16" fill="url(#${p}-head)" stroke="#7b8da8" stroke-width="1.5"/>
      <!-- ear vents -->
      <rect x="16" y="24" width="5" height="12" rx="2" fill="#121a2a" stroke="#5b6d88" stroke-width="1"/>
      <rect x="59" y="24" width="5" height="12" rx="2" fill="#121a2a" stroke="#5b6d88" stroke-width="1"/>
      ${antenna(26, 16, 14, 4)}
      <!-- visor + eyes -->
      <rect x="26" y="24" width="28" height="16" rx="8" fill="#020617" stroke="currentColor" stroke-width="1.6"/>
      <circle cx="34.5" cy="32" r="3.6" fill="currentColor"/>
      <circle cx="45.5" cy="32" r="3.6" fill="currentColor"/>
      <circle cx="33.4" cy="30.8" r="1.1" fill="#fff" opacity="0.9"/>
      <circle cx="44.4" cy="30.8" r="1.1" fill="#fff" opacity="0.9"/>
    </g>`;
  }

  function robotBack(p) {
    return `<g>
      ${hoverRing(40, 100, 24, 7.5)}
      <rect x="26" y="88" width="10" height="8" rx="3" fill="#151c2c" stroke="#2a354c" stroke-width="1"/>
      <rect x="44" y="88" width="10" height="8" rx="3" fill="#151c2c" stroke="#2a354c" stroke-width="1"/>
      <rect x="22" y="50" width="36" height="40" rx="12" fill="url(#${p}-body)" stroke="#5b6d88" stroke-width="1.4"/>
      <!-- back panel -->
      <rect x="29" y="58" width="22" height="24" rx="5" fill="#0c1424" stroke="#3a4a62" stroke-width="1"/>
      <line x1="33" y1="64" x2="47" y2="64" stroke="currentColor" stroke-width="1.4" opacity="0.7"/>
      <line x1="33" y1="70" x2="47" y2="70" stroke="currentColor" stroke-width="1.4" opacity="0.5"/>
      <line x1="33" y1="76" x2="47" y2="76" stroke="currentColor" stroke-width="1.4" opacity="0.4"/>
      <rect x="14" y="60" width="10" height="16" rx="5" fill="url(#${p}-body)" stroke="#5b6d88" stroke-width="1.2"/>
      <rect x="56" y="60" width="10" height="16" rx="5" fill="url(#${p}-body)" stroke="#5b6d88" stroke-width="1.2"/>
      <rect x="35" y="45" width="10" height="7" rx="2" fill="#1b2436"/>
      <rect x="20" y="12" width="40" height="36" rx="16" fill="url(#${p}-head)" stroke="#7b8da8" stroke-width="1.5"/>
      <rect x="16" y="24" width="5" height="12" rx="2" fill="#121a2a" stroke="#5b6d88" stroke-width="1"/>
      <rect x="59" y="24" width="5" height="12" rx="2" fill="#121a2a" stroke="#5b6d88" stroke-width="1"/>
      ${antenna(26, 16, 14, 4)}
      <!-- rear crest, no visor -->
      <rect x="34" y="26" width="12" height="8" rx="3" fill="#0c1424" stroke="currentColor" stroke-width="1.2"/>
      <circle cx="40" cy="30" r="2" fill="#a3e635"/>
    </g>`;
  }

  function robotSide(p, flipLeft) {
    const inner = `
      ${hoverRing(40, 100, 20, 7)}
      <rect x="${flipLeft ? 36 : 34}" y="88" width="12" height="8" rx="3" fill="#151c2c" stroke="#2a354c" stroke-width="1"/>
      <rect x="28" y="50" width="26" height="40" rx="11" fill="url(#${p}-body)" stroke="#5b6d88" stroke-width="1.4"/>
      <polygon points="41,62 45,68 41,74 37,68" fill="#a3e635"/>
      <rect x="22" y="62" width="8" height="14" rx="4" fill="url(#${p}-body)" stroke="#5b6d88" stroke-width="1.1"/>
      <rect x="36" y="45" width="8" height="7" rx="2" fill="#1b2436"/>
      <rect x="26" y="12" width="30" height="36" rx="15" fill="url(#${p}-head)" stroke="#7b8da8" stroke-width="1.5"/>
      ${antenna(38, 14, 30, 3)}
      <!-- visor on the facing side (right in unflipped) -->
      <rect x="36" y="24" width="16" height="16" rx="8" fill="#020617" stroke="currentColor" stroke-width="1.6"/>
      <circle cx="46" cy="32" r="3.4" fill="currentColor"/>
      <circle cx="45" cy="30.8" r="1.1" fill="#fff" opacity="0.9"/>
    `;
    if (!flipLeft) return `<g>${inner}</g>`;
    return `<g transform="translate(80,0) scale(-1,1)">${inner}</g>`;
  }

  function facingName(dir) {
    // 0 up → back, 1 right, 2 down → front, 3 left
    return ["back", "right", "front", "left"][dir] || "front";
  }

  function installRobot(character, dir, prefix) {
    if (!character) return;
    character.dataset.facing = String(dir);
    let wrap = character.querySelector(":scope > .robot");
    if (!wrap) {
      wrap = document.createElement("span");
      wrap.className = "robot";
      character.appendChild(wrap);
    }
    const face = facingName(dir);
    if (wrap.dataset.face !== face) {
      wrap.dataset.face = face;
      wrap.innerHTML = robotSvg(prefix + "-" + face + "-" + Math.random().toString(36).slice(2, 6), face);
    }
    return wrap;
  }

  function currentDir() {
    try {
      if (typeof gameState !== "undefined" && gameState && typeof gameState.playerDirection === "number") {
        return gameState.playerDirection;
      }
    } catch (e) {}
    const badge = document.querySelector(".direction-indicator");
    const map = { "⬆️": 0, "➡️": 1, "⬇️": 2, "⬅️": 3 };
    const key = badge && badge.textContent.trim();
    if (key && map[key] !== undefined) return map[key];
    return 2;
  }

  let hasRun = false;

  function visualDir() {
    // At start and after reset, face the camera so the front is visible.
    // Once a run starts, use the real facing. Game rules / playerDirection unchanged.
    const logical = currentDir();
    try {
      if (typeof gameState !== "undefined" && gameState) {
        if (gameState.isExecuting || gameState.gameEnded || hasRun) return logical;
      }
    } catch (e) {}
    if (hasRun) return logical;
    return 2; // front
  }

  function styleCells() {
    document.querySelectorAll(".maze-cell").forEach((cell) => {
      const m = cell.id && cell.id.match(/^cell-(\d+)-(\d+)$/);
      if (!m) return;
      const r = +m[1], c = +m[2];
      cell.style.setProperty("--r", String(r));
      cell.style.setProperty("--c", String(c));
      cell.style.zIndex = String(10 + r + c);
    });
  }

  let lastCellId = null;

  function spriteLayer() {
    const container = document.querySelector(".maze-container");
    if (!container) return null;
    let layer = container.querySelector(":scope > .sprite-layer");
    if (!layer) {
      layer = document.createElement("div");
      layer.className = "sprite-layer";
      container.appendChild(layer);
    }
    return layer;
  }

  function tileAnchor(cell) {
    const container = document.querySelector(".maze-container");
    if (!container || !cell) return null;
    const crect = container.getBoundingClientRect();
    const trect = cell.getBoundingClientRect();
    return {
      x: trect.left + trect.width / 2 - crect.left,
      y: trect.top + trect.height / 2 - crect.top,
      z: (parseInt(cell.style.zIndex, 10) || 0)
    };
  }

  function placeSprite(el, cell, extraZ) {
    const layer = spriteLayer();
    const a = tileAnchor(cell);
    if (!layer || !a || !el) return;
    if (el.parentElement !== layer) layer.appendChild(el);
    el.style.left = a.x + "px";
    el.style.top = a.y + "px";
    el.style.zIndex = String(20 + a.z + (extraZ || 0));
    el.dataset.tile = cell.id;
  }

  function syncSprites() {
    const layer = spriteLayer();
    if (!layer) return;
    // character + direction stay together
    const character = document.querySelector(".character");
    if (character) {
      const cell = document.getElementById(character.dataset.tile || "") || character.parentElement;
      const realCell = (cell && cell.classList.contains("maze-cell"))
        ? cell
        : document.getElementById(character.dataset.tile);
      const c = realCell || document.querySelector(".maze-cell");
      if (c) {
        // remember owning cell before moving out of the grid
        if (character.parentElement && character.parentElement.classList.contains("maze-cell")) {
          character.dataset.tile = character.parentElement.id;
        }
        const owner = document.getElementById(character.dataset.tile) || c;
        placeSprite(character, owner, 5);
        const badge = document.querySelector(".direction-indicator");
        if (badge) {
          if (badge.parentElement && badge.parentElement.classList.contains("maze-cell")) {
            // will be placed below
          }
          placeSprite(badge, owner, 6);
          // sit just above the robot's head
          const a = tileAnchor(owner);
          if (a) {
            badge.style.left = a.x + "px";
            badge.style.top = a.y + "px";
            badge.style.marginLeft = "0";
            badge.style.marginTop = "0";
            const botH = (character && character.offsetHeight) ? character.offsetHeight : 126;
            badge.style.transform = "translate(-50%, calc(-" + botH + "px - 8px))";
          }
        }
      }
    }
    document.querySelectorAll(".treasure").forEach((tr) => {
      if (tr.parentElement && tr.parentElement.classList.contains("maze-cell")) {
        tr.dataset.tile = tr.parentElement.id;
      }
      const cell = document.getElementById(tr.dataset.tile);
      if (cell) placeSprite(tr, cell, 3);
    });
    document.querySelectorAll(".trap-img").forEach((img) => {
      if (img.parentElement && img.parentElement.classList.contains("maze-cell")) {
        img.dataset.tile = img.parentElement.id;
      }
      const cell = document.getElementById(img.dataset.tile);
      if (cell) placeSprite(img, cell, 3);
    });
  }

  function afterPlayerUpdate() {
    const character = document.querySelector(".character");
    if (!character) return;
    // If it's still in a cell, record the cell id (game just (re)created it)
    if (character.parentElement && character.parentElement.classList.contains("maze-cell")) {
      character.dataset.tile = character.parentElement.id;
    }
    const cellId = character.dataset.tile;
    const dir = currentDir();
    const wrap = installRobot(character, visualDir(), "bot");
    if (wrap && lastCellId && cellId && lastCellId !== cellId && typeof gameState !== "undefined" && gameState.isExecuting && !reduced) {
      wrap.classList.remove("hop");
      void wrap.offsetWidth;
      wrap.classList.add("hop");
      wrap.addEventListener("animationend", () => wrap.classList.remove("hop"), { once: true });
    }
    lastCellId = cellId || lastCellId;
    syncSprites();
  }

  function trackDuring(ms) {
    const t0 = performance.now();
    function tick(now) {
      syncSprites();
      if (now - t0 < ms) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function wrapGameFns() {
    if (typeof initMaze === "function") {
      const orig = initMaze;
      initMaze = function () {
        const layer = document.querySelector(".sprite-layer");
        if (layer) layer.innerHTML = "";
        orig.apply(this, arguments);
        styleCells();
        lastCellId = null;
        afterPlayerUpdate();
        syncSprites();
      };
    }
    if (typeof updatePlayerPosition === "function") {
      const orig = updatePlayerPosition;
      updatePlayerPosition = function () {
        orig.apply(this, arguments);
        afterPlayerUpdate();
      };
    }
    if (typeof showResult === "function") {
      const orig = showResult;
      showResult = function (success, message) {
        orig.apply(this, arguments);
        const pos = typeof TREASURE_POS !== "undefined" ? TREASURE_POS : null;
        if (!pos) return;
        const cell = document.getElementById(`cell-${pos.x}-${pos.y}`);
        if (cell) cell.classList.toggle("goal-lit", !!success);
      };
    }
    if (typeof executeSequence === "function") {
      const orig = executeSequence;
      executeSequence = function () {
        hasRun = true;
        const ret = orig.apply(this, arguments);
        afterPlayerUpdate();
        return ret;
      };
    }
    if (typeof resetGame === "function") {
      const orig = resetGame;
      resetGame = function () {
        document.querySelectorAll(".maze-cell.goal-lit").forEach((c) => c.classList.remove("goal-lit"));
        lastCellId = null;
        hasRun = false;
        orig.apply(this, arguments);
        afterPlayerUpdate();
      };
    }
  }

  function wrapBoard() {
    const grid = document.getElementById("mazeGrid");
    if (!grid || grid.closest(".maze-scene")) return;
    const container = grid.parentElement; // .maze-container
    const stage = document.createElement("div");
    stage.className = "maze-stage";
    const scene = document.createElement("div");
    scene.className = "maze-scene pre-enter";
    scene.id = "mazeScene";
    const platform = document.createElement("div");
    platform.className = "maze-platform";
    platform.setAttribute("aria-hidden", "true");
    container.appendChild(stage);
    stage.appendChild(scene);
    scene.appendChild(platform);
    scene.appendChild(grid);
  }

  function buildIntro() {
    const overlay = document.createElement("div");
    overlay.id = "introOverlay";
    overlay.className = "intro-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-label", "關卡開始");
    overlay.innerHTML = `
      <div class="intro-door intro-door-left" aria-hidden="true"></div>
      <div class="intro-door intro-door-right" aria-hidden="true"></div>
      <div class="intro-panel">
        <div class="intro-bot">${robotSvg("intro", "front")}</div>
        <div class="intro-level">LEVEL ${cfg.level}</div>
        <div class="intro-title">${cfg.title}</div>
        <p class="intro-sub">${cfg.subtitle}</p>
        <div class="intro-prompt">點擊或按空白鍵開始 ▶</div>
      </div>
    `;
    document.body.appendChild(overlay);

    let opened = false;
    function openIntro() {
      if (opened) return;
      opened = true;
      const scene = document.getElementById("mazeScene");
      if (reduced) {
        overlay.classList.add("is-opening", "is-done");
        if (scene) {
          scene.classList.remove("pre-enter");
        }
        setTimeout(() => overlay.remove(), 400);
        return;
      }
      overlay.classList.add("is-opening");
      if (scene) {
        setTimeout(() => {
          scene.classList.remove("pre-enter");
          scene.classList.add("entering");
          trackDuring(900);
        }, 280);
      }
      setTimeout(() => {
        overlay.classList.add("is-done");
        setTimeout(() => overlay.remove(), 240);
      }, 900);
    }

    overlay.addEventListener("click", openIntro);
    overlay.addEventListener("touchend", (e) => {
      e.preventDefault();
      openIntro();
    }, { passive: false });
    window.addEventListener("keydown", (e) => {
      if (opened) return;
      if (e.code === "Space" || e.code === "Enter" || e.key === " ") {
        e.preventDefault();
        openIntro();
      }
    });
  }

  // Expose for the design sheet
  window.NEON_ROBOT_SVG = robotSvg;

  // Wrap game fns immediately (this script loads after they are defined,
  // and before DOMContentLoaded, so initMaze runs already-wrapped).
  wrapGameFns();
  function updateCardCount() {
    const el = document.querySelector(".card-count");
    const area = document.getElementById("sequenceArea");
    if (!el) return;
    const n = area ? area.querySelectorAll(".sequence-token").length : 0;
    const host = document.querySelector(".game-container");
    const limit = host && host.getAttribute("data-card-limit");
    el.textContent = limit ? ("已用 " + n + "/" + limit) : ("已用 " + n);
    el.hidden = false;
  }

  function fitBoard() {
    const container = document.querySelector(".maze-container");
    if (!container) return;
    const cw = container.clientWidth;
    const ch = container.clientHeight;
    if (cw < 40 || ch < 40) return;
    // Design size at --cell 80: projected board ~500×440 (incl. robot)
    const scale = Math.min(1.55, (cw * 0.88) / 500, (ch * 0.88) / 440);
    const cell = Math.max(44, Math.round(80 * scale));
    container.style.setProperty("--cell", cell + "px");
    const grid = document.getElementById("mazeGrid");
    if (grid) grid.style.setProperty("--cell", cell + "px");
  }

  function start() {
    if (!document.getElementById("mazeGrid")) return;
    wrapBoard();
    spriteLayer();
    buildIntro();
    updateCardCount();
    const area = document.getElementById("sequenceArea");
    if (area && window.MutationObserver) {
      new MutationObserver(updateCardCount).observe(area, { childList: true, subtree: true });
    }
    const onFit = () => { fitBoard(); syncSprites(); };
    window.addEventListener("resize", onFit);
    if (window.ResizeObserver) {
      const c = document.querySelector(".maze-container");
      if (c) new ResizeObserver(onFit).observe(c);
    }
    fitBoard();
    requestAnimationFrame(() => { fitBoard(); syncSprites(); });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
