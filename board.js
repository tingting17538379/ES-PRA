/* Intro doors, isometric board wrap, and original neon robot billboard.
   Wraps existing game functions without changing rules. */
(function () {
  const cfg = Object.assign({
    level: "01",
    title: "結構挑戰",
    subtitle: "請引導機器人取得寶藏。"
  }, window.NEON_BOARD || {});

  // Optional: rotate the whole board so the robot's START facing points toward
  // the camera (NEON_BOARD.faceStart = true). viewTurns = number of 90° CW turns
  // applied on top of the default rotateZ(-45deg). Screen-facing index of a
  // logical dir d is (d + viewTurns) % 4 → [back(↖), right(↗), front(↘), left(↙)].
  let viewTurns = 0;
  function initViewTurns() {
    if (!cfg.faceStart) return;
    let d = 2;
    try {
      if (typeof gameState !== "undefined" && gameState && typeof gameState.playerDirection === "number") {
        d = gameState.playerDirection;
      }
    } catch (e) {}
    viewTurns = ((2 - d) % 4 + 4) % 4;
  }
  initViewTurns();
  const defaultTurns = viewTurns;
  const screenRel = !!(cfg.faceStart || cfg.viewRotate);
  const vt = () => ((viewTurns % 4) + 4) % 4;
  const SCREEN_ARROWS = ["↖️", "↗️", "↘️", "↙️"];

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (cfg.robotImages) {
    // preload facing art so turns never flash
    Object.values(cfg.robotImages).forEach((src) => { const im = new Image(); im.src = src; });
  }

  function robotSvg(prefix, facing) {
    // Original "Lumo"-style bot: capsule head, visor with two dots,
    // offset crystal antenna, hover ring. Not a light-Bot copy.
    const f = facing || "front";
    // Optional bitmap robot (NEON_BOARD.robotImages = {front, back, side}); side art faces right, left is mirrored.
    const ri = cfg.robotImages;
    if (ri && ri.frontRight && /^(front|back)-(left|right)$/.test(f)) {
      // diagonal (isometric 3/4) art: *-right drawn, *-left mirrored
      const src = f.indexOf("front") === 0 ? ri.frontRight : (ri.backRight || ri.frontRight);
      return `<img class="robot-img robot-img-diag robot-img-${f}" src="${src}" alt="" aria-hidden="true" draggable="false">`;
    }
    if (ri && ri.front) {
      const src = f === "front" ? ri.front : f === "back" ? (ri.back || ri.front) : (ri.side || ri.front);
      return `<img class="robot-img robot-img-${f}" src="${src}" alt="" aria-hidden="true" draggable="false">`;
    }
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

  // Screen-space facing for diagonal sprites: project the logical grid step of the
  // robot's real direction through the current 3D view (measured from tile rects).
  function diagFace() {
    const a = document.getElementById("cell-0-0");
    const r = document.getElementById("cell-1-0");
    const c = document.getElementById("cell-0-1");
    if (!a || !r || !c) return "front-right";
    const ctr = (el) => { const b = el.getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; };
    const p0 = ctr(a), pr = ctr(r), pc = ctr(c);
    const R = [pr[0] - p0[0], pr[1] - p0[1]], C = [pc[0] - p0[0], pc[1] - p0[1]];
    const step = [[-1, 0], [0, 1], [1, 0], [0, -1]][currentDir()] || [1, 0];
    const vx = step[0] * R[0] + step[1] * C[0];
    const vy = step[0] * R[1] + step[1] * C[1];
    return (vy > 0 ? "front" : "back") + "-" + (vx >= 0 ? "right" : "left");
  }

  let cheering = false; // goalBloom: robot turned to look up at the flower
  function installRobot(character, dir, prefix) {
    if (!character) return;
    if (cheering) return character.querySelector(":scope > .robot");
    character.dataset.facing = String(dir);
    let wrap = character.querySelector(":scope > .robot");
    if (!wrap) {
      wrap = document.createElement("span");
      wrap.className = "robot";
      character.appendChild(wrap);
    }
    const face = (cfg.robotImages && cfg.robotImages.frontRight) ? diagFace() : facingName(dir);
    if (wrap.dataset.face !== face) {
      if (wrap.dataset.face && cfg.robotImages && !reduced) {
        // soft clay "squash" when the bitmap robot changes facing
        wrap.classList.remove("turning");
        void wrap.offsetWidth;
        wrap.classList.add("turning");
        wrap.addEventListener("animationend", () => wrap.classList.remove("turning"), { once: true });
      }
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
    if (screenRel) return (logical + vt()) % 4; // true screen-relative view
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
    // with a rotated board, stack billboards by screen depth (lower on screen = nearer)
    const depth = screenRel ? Math.round(a.y / 4) : a.z;
    el.style.zIndex = String(20 + depth + (extraZ || 0));
    el.dataset.tile = cell.id;
  }

  function syncSprites() {
    const layer = spriteLayer();
    if (!layer) return;
    if (cfg.robotImages && cfg.robotImages.frontRight) {
      // keep diagonal facing in sync with the live view (intro drop-in, view rotation, resize)
      const ch = document.querySelector(".character");
      if (ch) installRobot(ch, visualDir(), "bot");
    }
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
    if (screenRel) {
      const badge = document.querySelector(".direction-indicator");
      if (badge) badge.textContent = SCREEN_ARROWS[(dir + vt()) % 4];
    }
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

  // Goal "bloom" (NEON_BOARD.goalBloom = { flower }): the goal sprite (e.g. a sapling)
  // squashes, swaps to the flower art and pops a few petals/sparkles.
  function bloomGoal() {
    const tr = document.querySelector(".sprite-layer .treasure") || document.querySelector(".treasure");
    if (!tr || tr.classList.contains("bloomed") || tr.classList.contains("bloom-grow")) return;
    const img = tr.querySelector("img");
    const pre = new Image();
    pre.src = cfg.goalBloom.flower;
    const swap = () => {
      if (img) { img.src = cfg.goalBloom.flower; img.alt = "花朵"; }
      tr.classList.remove("bloom-grow");
      tr.classList.add("bloomed");
      // robot turns to look up at the flower growing behind it, then hops for joy
      setTimeout(() => {
        const ch = document.querySelector(".sprite-layer .character") || document.querySelector(".character");
        const wrap = ch && ch.querySelector(":scope > .robot");
        const ri = cfg.robotImages || {};
        if (!wrap || !tr.classList.contains("bloomed")) return;
        cheering = true;
        if (ri.back) {
          wrap.dataset.face = "cheer";
          wrap.innerHTML = `<img class="robot-img robot-img-back robot-img-cheer" src="${ri.back}" alt="" aria-hidden="true" draggable="false">`;
        }
        if (!reduced) {
          wrap.classList.remove("hop", "turning", "cheer");
          void wrap.offsetWidth;
          wrap.classList.add("cheer");
        }
      }, reduced ? 0 : 650);
      const n = reduced ? 0 : 14;
      for (let i = 0; i < n; i++) {
        const p = document.createElement("span");
        p.className = "bloom-p" + (i % 3 === 0 ? " bloom-spark" : "");
        const ang = (Math.PI * 2 * i) / n + Math.random() * 0.5;
        const dist = 0.55 + Math.random() * 0.45;
        p.style.setProperty("--dx", (Math.cos(ang) * dist).toFixed(2));
        p.style.setProperty("--dy", (Math.sin(ang) * dist * 0.8 - 0.35).toFixed(2));
        p.style.animationDelay = (Math.random() * 120).toFixed(0) + "ms";
        tr.appendChild(p);
        p.addEventListener("animationend", () => p.remove(), { once: true });
      }
    };
    if (reduced) { swap(); return; }
    tr.classList.add("bloom-grow");
    setTimeout(swap, 380);
  }

  function wrapGameFns() {
    if (typeof initMaze === "function") {
      const orig = initMaze;
      initMaze = function () {
        cheering = false;
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
        if (success && cfg.goalBloom) bloomGoal();
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
        cheering = false;
        orig.apply(this, arguments);
        afterPlayerUpdate();
      };
    }
  }

  // ---------- Decorative surroundings (NEON_BOARD.decor = true) ----------
  // Stacked blocks + low-poly trees on a ring just outside the 4×4 grid.
  // Lives inside .maze-scene so it rotates with the board (incl. faceStart)
  // and is depth-sorted by the browser's 3D engine. No gameplay effect.
  const TREE_SVG = `<svg viewBox="0 0 60 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <ellipse cx="30" cy="96" rx="17" ry="4.5" fill="rgba(11,37,69,.28)"/>
    <rect x="25" y="70" width="10" height="26" rx="2" fill="#8a5a2b" stroke="#0b2545" stroke-width="3"/>
    <polygon points="30,30 54,76 6,76" fill="#2f9e44" stroke="#0b2545" stroke-width="3.2" stroke-linejoin="round"/>
    <polygon points="30,30 54,76 30,76" fill="#237a35"/>
    <polygon points="30,14 49,52 11,52" fill="#40c057" stroke="#0b2545" stroke-width="3.2" stroke-linejoin="round"/>
    <polygon points="30,14 49,52 30,52" fill="#2f9e44"/>
    <polygon points="30,3 43,29 17,29" fill="#69db7c" stroke="#0b2545" stroke-width="3.2" stroke-linejoin="round"/>
    <polygon points="30,3 43,29 30,29" fill="#40c057"/>
    <polygon points="30,30 54,76 6,76" fill="none" stroke="#0b2545" stroke-width="3.2" stroke-linejoin="round"/>
    <polygon points="30,14 49,52 11,52" fill="none" stroke="#0b2545" stroke-width="3.2" stroke-linejoin="round"/>
    <polygon points="30,3 43,29 17,29" fill="none" stroke="#0b2545" stroke-width="3.2" stroke-linejoin="round"/>
  </svg>`;

  // On phones the full ring would force tiny tiles, so use a compact ring:
  // only the far corner + the 2 nearest positions on each far edge, max 2 high.
  const compactDecor = () => !!cfg.decor && window.matchMedia("(max-width: 820px)").matches;
  let decorCompact = null;
  function buildDecor(scene, rzDeg) {
    if (!cfg.decor || !scene) return;
    const compact = compactDecor();
    decorCompact = compact;
    const N = (typeof MAZE_SIZE === "number") ? MAZE_SIZE : 4;
    const th = rzDeg * Math.PI / 180;
    const sn = Math.sin(th), cs = Math.cos(th);
    // screen-y of each side's outward normal (<0 → far side, away from viewer)
    const sideY = { top: -cs, bottom: cs, left: -sn, right: sn };
    const back = (k) => sideY[k] < -0.01;
    const layer = document.createElement("div");
    layer.className = "maze-decor";
    layer.setAttribute("aria-hidden", "true");
    const items = [];
    for (let r = -1; r <= N; r++) {
      for (let c = -1; c <= N; c++) {
        const sides = [];
        if (r === -1) sides.push("top");
        if (r === N) sides.push("bottom");
        if (c === -1) sides.push("left");
        if (c === N) sides.push("right");
        if (!sides.length) continue;
        const nb = sides.filter(back).length;
        const nf = sides.length - nb;
        if (nb === 0) continue;                       // front edges stay clear
        if (nb === 2) { items.push({ r, c, h: compact ? 2 : 3 }); continue; }   // far corner
        if (nf === 1) { if (!compact) items.push({ r, c, h: 2 }); continue; }   // side corners
        // along a far edge: distance from the far corner (1..N)
        const side = sides[0];
        const along = (side === "top" || side === "bottom") ? c : r;
        const farEnd = (side === "top" || side === "bottom") ? (back("left") ? 0 : N - 1) : (back("top") ? 0 : N - 1);
        const k = Math.abs(along - farEnd) + 1;
        const horiz = (side === "top" || side === "bottom");
        const pattern = horiz ? [2, "tree", 1, "tree"] : [2, 1, "tree", 1];
        if (compact && k > 2) continue;
        const v = pattern[(k - 1) % pattern.length];
        items.push(v === "tree" ? { r, c, tree: true } : { r, c, h: v });
      }
    }
    items.forEach((it) => {
      const el = document.createElement("div");
      el.style.setProperty("--r", String(it.r));
      el.style.setProperty("--c", String(it.c));
      if (it.tree) {
        el.className = "decor-tree";
        el.innerHTML = TREE_SVG;
      } else {
        el.className = "decor-cube";
        el.style.setProperty("--h", String(it.h));
        el.innerHTML = '<i class="df df-top"></i><i class="df df-side df-n"></i><i class="df df-side df-s"></i><i class="df df-side df-e"></i><i class="df df-side df-w"></i>';
      }
      layer.appendChild(el);
    });
    scene.appendChild(layer);
    scene.style.setProperty("--platform-pad", compact ? "calc(var(--cell, 80px) * 0.55 + 8px)" : "calc(var(--cell, 80px) + 12px)");
  }

  // ---------- View (camera) rotation (NEON_BOARD.viewRotate = true) ----------
  // Rotates the whole board 90° per step with a ~400ms transition. Purely visual:
  // game state is untouched, so it is allowed mid-run. Sprites re-anchor every
  // frame; robot view art + badge follow the on-screen direction.
  let rotating = false;
  function rotateView(delta, toDefault) {
    const scene = document.getElementById("mazeScene");
    if (!scene) return;
    if (toDefault) {
      let diff = ((defaultTurns - viewTurns) % 4 + 4) % 4; // 0..3
      if (diff === 3) diff = -1;
      delta = diff;
    }
    if (!delta) return;
    viewTurns += delta;
    scene.classList.remove("entering", "pre-enter");
    scene.classList.add("view-rotating");
    const decor = scene.querySelector(".maze-decor");
    if (decor) decor.classList.add("decor-hide");
    scene.style.setProperty("--rz", (-45 + 90 * viewTurns) + "deg");
    rotating = true;
    trackDuring(520);
    afterPlayerUpdate();
    clearTimeout(rotateView._t);
    rotateView._t = setTimeout(() => {
      rotating = false;
      scene.classList.remove("view-rotating");
      // rebuild decor so blocks/trees stay on the far edges for the new view
      const old = scene.querySelector(".maze-decor");
      if (old) old.remove();
      buildDecor(scene, -45 + 90 * viewTurns);
      const fresh = scene.querySelector(".maze-decor");
      if (fresh) {
        fresh.classList.add("decor-hide");
        void fresh.offsetWidth;
        setTimeout(() => fresh.classList.remove("decor-hide"), 20);
      }
      fitBoard();
      syncSprites();
      afterPlayerUpdate();
    }, 430);
  }

  function buildViewControls() {
    if (!cfg.viewRotate) return;
    const container = document.querySelector(".maze-container");
    if (!container || document.querySelector(".view-controls")) return;
    let block = container.parentElement;
    if (!block || !block.classList.contains("maze-block")) {
      block = document.createElement("div");
      block.className = "maze-block";
      container.parentElement.insertBefore(block, container);
      block.appendChild(container);
    }
    const box = document.createElement("div");
    box.className = "view-controls";
    box.setAttribute("role", "group");
    box.setAttribute("aria-label", "轉動視角");
    box.innerHTML = `
      <button type="button" class="view-btn" data-rot="-1" title="向左轉動視角 (Q)" aria-label="向左轉動視角">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.5 6.5A8 8 0 1 1 4.6 14" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/><path d="M2.6 3.8 8.6 4.2 7.9 10.2Z" fill="currentColor"/></svg>
      </button>
      <button type="button" class="view-btn view-btn-reset" data-rot="0" title="重置視角" aria-label="重置視角">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.2" fill="currentColor"/><path d="M12 2.5v4M12 17.5v4M2.5 12h4M17.5 12h4" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/></svg>
      </button>
      <button type="button" class="view-btn" data-rot="1" title="向右轉動視角 (E)" aria-label="向右轉動視角">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.5 6.5A8 8 0 1 0 19.4 14" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/><path d="M21.4 3.8 15.4 4.2 16.1 10.2Z" fill="currentColor"/></svg>
      </button>
      <span class="view-label">視角</span>`;
    box.addEventListener("click", (e) => {
      const b = e.target.closest(".view-btn");
      if (!b) return;
      const r = +b.dataset.rot;
      if (r === 0) rotateView(0, true); else rotateView(r);
    });
    block.appendChild(box);
    function placeViewControls() {
      const title = document.querySelector(".tokens-section .section-title");
      const mobile = window.matchMedia("(max-width: 820px)").matches;
      if (mobile && title) {
        if (box.parentElement !== title) title.appendChild(box);
      } else if (box.parentElement !== block) {
        block.appendChild(box);
      }
    }
    placeViewControls();
    window.addEventListener("resize", placeViewControls);
    window.addEventListener("keydown", (e) => {
      if (document.getElementById("introOverlay")) return;
      const t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const k = (e.key || "").toLowerCase();
      if (k === "q") { e.preventDefault(); rotateView(-1); }
      else if (k === "e") { e.preventDefault(); rotateView(1); }
    });
  }
  window.NEON_ROTATE_VIEW = rotateView;

  function wrapBoard() {
    const grid = document.getElementById("mazeGrid");
    if (!grid || grid.closest(".maze-scene")) return;
    const container = grid.parentElement; // .maze-container
    const stage = document.createElement("div");
    stage.className = "maze-stage";
    const scene = document.createElement("div");
    scene.className = "maze-scene pre-enter";
    if (screenRel) scene.style.setProperty("--rz", (-45 + 90 * viewTurns) + "deg");
    if (cfg.faceStart) container.classList.add("face-start");
    if (cfg.decor) container.classList.add("has-decor");
    scene.id = "mazeScene";
    const platform = document.createElement("div");
    platform.className = "maze-platform";
    platform.setAttribute("aria-hidden", "true");
    container.appendChild(stage);
    stage.appendChild(scene);
    scene.appendChild(platform);
    scene.appendChild(grid);
    buildDecor(scene, -45 + 90 * viewTurns);
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
    // faceStart puts the start tile at the far (top) corner, so the robot needs headroom above the board
    const cpt = compactDecor();
    // faceStart boards (no decor) use a measured footprint so the map fills the free space
    const designH = cfg.decor ? (cpt ? 560 : 800) : (cfg.faceStart ? (window.matchMedia("(max-width: 820px)").matches ? 470 : 560) : 440);
    const designW = cfg.decor ? (cpt ? 600 : 880) : (cfg.faceStart ? 545 : 500);
    const fill = cfg.decor ? (cpt ? 0.98 : 0.94) : (cfg.faceStart ? 0.97 : 0.88);
    const scale = Math.min(1.55, (cw * fill) / designW, (ch * fill) / designH);
    const cell = Math.max(cfg.decor ? 26 : 44, Math.round(80 * scale));
    container.style.setProperty("--cell", cell + "px");
    const grid = document.getElementById("mazeGrid");
    if (grid) grid.style.setProperty("--cell", cell + "px");
  }

  function start() {
    if (!document.getElementById("mazeGrid")) return;
    wrapBoard();
    spriteLayer();
    buildIntro();
    buildViewControls();
    updateCardCount();
    const area = document.getElementById("sequenceArea");
    if (area && window.MutationObserver) {
      new MutationObserver(updateCardCount).observe(area, { childList: true, subtree: true });
    }
    const onFit = () => {
      // switch between full / compact decor when crossing the phone breakpoint
      if (cfg.decor && decorCompact !== null && decorCompact !== compactDecor()) {
        const sc = document.getElementById("mazeScene");
        const old = sc && sc.querySelector(".maze-decor");
        if (old) old.remove();
        if (sc) buildDecor(sc, -45 + 90 * viewTurns);
      }
      fitBoard();
      syncSprites();
    };
    window.addEventListener("resize", onFit);
    if (window.ResizeObserver) {
      const c = document.querySelector(".maze-container");
      if (c) new ResizeObserver(onFit).observe(c);
    }
    function dockMobileBar() {
      const bar = document.querySelector("body.theme-light .status-area");
      if (!bar) return;
      const mobile = window.matchMedia("(max-width: 820px)").matches;
      if (!mobile || !window.visualViewport) {
        bar.style.transform = "";
        return;
      }
      const vv = window.visualViewport;
      const hidden = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      bar.style.transform = hidden ? ("translateY(" + (-hidden) + "px)") : "";
    }
    dockMobileBar();
    window.addEventListener("resize", dockMobileBar);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", dockMobileBar);
      window.visualViewport.addEventListener("scroll", dockMobileBar);
    }
    fitBoard();
    requestAnimationFrame(() => { fitBoard(); syncSprites(); dockMobileBar(); });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
