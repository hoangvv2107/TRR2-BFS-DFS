const svg = document.getElementById("graphSvg");
const modeButtons = {
  addIsland: document.getElementById("modeAddIsland"),
  addBridge: document.getElementById("modeAddBridge"),
  move: document.getElementById("modeMove"),
};
const runDFSBtn = document.getElementById("runDFSBtn");
const runBFSBtn = document.getElementById("runBFSBtn");
const playPauseBtn = document.getElementById("playPauseBtn");
const resetBtn = document.getElementById("resetBtn");
const generateMapBtn = document.getElementById("generateMapBtn");
const mapSelect = document.getElementById("mapSelect");
const speedSlowBtn = document.getElementById("speedSlowBtn");
const speedNormalBtn = document.getElementById("speedNormalBtn");
const speedFastBtn = document.getElementById("speedFastBtn");
const traceBody = document.getElementById("traceBody");

const statusBadge = document.getElementById("statusBadge");
const statText = document.getElementById("statText");
const connectivityText = document.getElementById("connectivityText");
const articulationText = document.getElementById("articulationText");
const bridgesText = document.getElementById("bridgesText");

const NODE_RADIUS = 22;

// Animation control variables
let traversalRunId = 0;
let traversalSpeed = 300; // milliseconds
let traversalPaused = false;

function setSpeedMode(mode) {
  speedSlowBtn.classList.remove("active");
  speedNormalBtn.classList.remove("active");
  speedFastBtn.classList.remove("active");

  if (mode === "slow") {
    traversalSpeed = 500;
    speedSlowBtn.classList.add("active");
    return;
  }

  if (mode === "fast") {
    traversalSpeed = 100;
    speedFastBtn.classList.add("active");
    return;
  }

  traversalSpeed = 300;
  speedNormalBtn.classList.add("active");
}

function setTraversalActive(active) {
  const panel = document.querySelector(".map-panel");
  if (panel) panel.classList.toggle("traversal-active", !!active);
}

const MAPS_DATA = [
  {
    name: "Map 1",
    nodes: [
      { id: 0, x: 150, y: 150 },
      { id: 1, x: 300, y: 100 },
      { id: 2, x: 450, y: 150 },
      { id: 3, x: 600, y: 100 },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
    ],
  },
  {
    name: "Map 2",
    nodes: [
      { id: 0, x: 150, y: 200 },
      { id: 1, x: 300, y: 150 },
      { id: 2, x: 450, y: 200 },
      { id: 3, x: 300, y: 300 },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [1, 3],
      [0, 3],
    ],
  },
  {
    name: "Map 3",
    nodes: [
      { id: 0, x: 200, y: 150 },
      { id: 1, x: 350, y: 100 },
      { id: 2, x: 500, y: 150 },
      { id: 3, x: 350, y: 280 },
      { id: 4, x: 200, y: 250 },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [1, 3],
      [3, 4],
      [4, 0],
    ],
  },
  {
    name: "Map 4",
    nodes: [
      { id: 0, x: 100, y: 200 },
      { id: 1, x: 250, y: 150 },
      { id: 2, x: 400, y: 200 },
      { id: 3, x: 400, y: 350 },
      { id: 4, x: 250, y: 400 },
      { id: 5, x: 100, y: 350 },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 0],
      [1, 5],
      [2, 4],
    ],
  },
  {
    name: "Map 5",
    nodes: [
      { id: 0, x: 150, y: 200 },
      { id: 1, x: 350, y: 100 },
      { id: 2, x: 550, y: 150 },
      { id: 3, x: 650, y: 300 },
      { id: 4, x: 350, y: 400 },
      { id: 5, x: 150, y: 350 },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 0],
      [0, 3],
    ],
  },
  {
    name: "Map 6",
    nodes: [
      { id: 0, x: 120, y: 180 },
      { id: 1, x: 300, y: 120 },
      { id: 2, x: 480, y: 180 },
      { id: 3, x: 600, y: 120 },
      { id: 4, x: 600, y: 300 },
      { id: 5, x: 300, y: 360 },
      { id: 6, x: 120, y: 300 },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [6, 0],
      [1, 5],
      [2, 4],
    ],
  },
  {
    name: "Map 7",
    nodes: [
      { id: 0, x: 100, y: 150 },
      { id: 1, x: 250, y: 100 },
      { id: 2, x: 400, y: 150 },
      { id: 3, x: 550, y: 100 },
      { id: 4, x: 700, y: 150 },
      { id: 5, x: 400, y: 300 },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [1, 5],
      [2, 5],
      [3, 5],
    ],
  },
  {
    name: "Map 8",
    nodes: [
      { id: 0, x: 150, y: 200 },
      { id: 1, x: 300, y: 100 },
      { id: 2, x: 450, y: 200 },
      { id: 3, x: 300, y: 350 },
      { id: 4, x: 150, y: 280 },
      { id: 5, x: 450, y: 280 },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [0, 4],
      [2, 5],
      [4, 3],
      [5, 3],
      [3, 1],
    ],
  },
  {
    name: "Map 9",
    nodes: [
      { id: 0, x: 200, y: 150 },
      { id: 1, x: 400, y: 150 },
      { id: 2, x: 600, y: 150 },
      { id: 3, x: 200, y: 300 },
      { id: 4, x: 400, y: 300 },
      { id: 5, x: 600, y: 300 },
      { id: 6, x: 400, y: 450 },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [0, 3],
      [1, 4],
      [2, 5],
      [3, 4],
      [4, 5],
      [4, 6],
    ],
  },
  {
    name: "Map 10",
    nodes: [
      { id: 0, x: 100, y: 200 },
      { id: 1, x: 250, y: 120 },
      { id: 2, x: 400, y: 100 },
      { id: 3, x: 550, y: 150 },
      { id: 4, x: 680, y: 120 },
      { id: 5, x: 250, y: 300 },
      { id: 6, x: 400, y: 350 },
      { id: 7, x: 100, y: 350 },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [1, 5],
      [5, 6],
      [6, 7],
      [7, 0],
      [2, 6],
    ],
  },
];

const state = {
  mode: "addIsland",
  nodes: [],
  edges: [],
  selectedNodeId: null,
  draggingNodeId: null,
  dragOffset: { x: 0, y: 0 },
  analysis: {
    articulation: new Set(),
    bridges: new Set(),
    isConnected: null,
  },
  traversal: {
    isRunning: false,
    algorithm: null, // "DFS" or "BFS"
    steps: [],
    currentStepIndex: 0,
    visited: new Set(),
    currentNode: null,
    currentEdge: null,
    stack: [],
    queue: [],
  },
};

function setMode(mode) {
  state.mode = mode;
  state.selectedNodeId = null;
  Object.entries(modeButtons).forEach(([key, btn]) => {
    if (key === mode) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
  render();
}

function svgPointFromEvent(event) {
  const rect = svg.getBoundingClientRect();
  const vb = svg.viewBox.baseVal;
  const x = ((event.clientX - rect.left) / rect.width) * vb.width;
  const y = ((event.clientY - rect.top) / rect.height) * vb.height;
  return { x, y };
}

function findNodeByPoint(point) {
  for (const node of state.nodes) {
    const dx = node.x - point.x;
    const dy = node.y - point.y;
    if (Math.hypot(dx, dy) <= NODE_RADIUS + 4) {
      return node;
    }
  }
  return null;
}

function edgeKey(a, b) {
  const x = Math.min(a, b);
  const y = Math.max(a, b);
  return `${x}-${y}`;
}

function edgeEndpoints(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const distance = Math.hypot(dx, dy);
  if (distance === 0) {
    return { x1: a.x, y1: a.y, x2: b.x, y2: b.y };
  }

  const offsetX = (dx / distance) * NODE_RADIUS;
  const offsetY = (dy / distance) * NODE_RADIUS;
  return {
    x1: a.x + offsetX,
    y1: a.y + offsetY,
    x2: b.x - offsetX,
    y2: b.y - offsetY,
  };
}

function hasEdge(a, b) {
  return state.edges.some(
    (e) => (e.a === a && e.b === b) || (e.a === b && e.b === a),
  );
}

function addNode(x, y) {
  const id = state.nodes.length
    ? Math.max(...state.nodes.map((n) => n.id)) + 1
    : 0;
  state.nodes.push({ id, x, y });
}

function addEdge(a, b) {
  if (a === b || hasEdge(a, b)) {
    return;
  }
  state.edges.push({ a, b });
}

function clearAnalysis() {
  state.analysis.articulation = new Set();
  state.analysis.bridges = new Set();
  state.analysis.isConnected = null;
}

function buildAdjacency() {
  const adj = new Map();
  state.nodes.forEach((n) => adj.set(n.id, []));
  state.edges.forEach((e) => {
    if (adj.has(e.a) && adj.has(e.b)) {
      adj.get(e.a).push(e.b);
      adj.get(e.b).push(e.a);
    }
  });
  return adj;
}

function analyzeGraph() {
  clearAnalysis();
  const n = state.nodes.length;
  if (n === 0) {
    updateStatus();
    return;
  }

  const ids = state.nodes.map((node) => node.id);
  const adj = buildAdjacency();

  // BFS to test connectivity.
  const visited = new Set();
  const q = [ids[0]];
  visited.add(ids[0]);
  while (q.length) {
    const u = q.shift();
    const neighbors = adj.get(u) || [];
    for (const v of neighbors) {
      if (!visited.has(v)) {
        visited.add(v);
        q.push(v);
      }
    }
  }
  state.analysis.isConnected = visited.size === n;

  // DFS (Tarjan) to find articulation points and bridges.
  const disc = new Map();
  const low = new Map();
  const parent = new Map();
  const articulation = new Set();
  const bridges = new Set();
  let time = 0;

  function dfs(u) {
    disc.set(u, time);
    low.set(u, time);
    time += 1;
    let childCount = 0;

    for (const v of adj.get(u) || []) {
      if (!disc.has(v)) {
        parent.set(v, u);
        childCount += 1;
        dfs(v);

        low.set(u, Math.min(low.get(u), low.get(v)));

        const isRoot = !parent.has(u);
        if (
          (isRoot && childCount > 1) ||
          (!isRoot && low.get(v) >= disc.get(u))
        ) {
          articulation.add(u);
        }

        if (low.get(v) > disc.get(u)) {
          bridges.add(edgeKey(u, v));
        }
      } else if (v !== parent.get(u)) {
        low.set(u, Math.min(low.get(u), disc.get(v)));
      }
    }
  }

  for (const id of ids) {
    if (!disc.has(id)) {
      dfs(id);
    }
  }

  state.analysis.articulation = articulation;
  state.analysis.bridges = bridges;
  updateStatus();
}

function updateStatus() {
  const islandCount = state.nodes.length;
  const edgeCount = state.edges.length;

  statText.textContent = `So dao: ${islandCount} | So cau: ${edgeCount}`;

  if (state.analysis.isConnected === null) {
    connectivityText.textContent = "Trang thai lien thong: Chua xac dinh";
    articulationText.textContent = "Chua co du lieu";
    bridgesText.textContent = "Chua co du lieu";
    statusBadge.className = "status-badge neutral";
    statusBadge.textContent = "Chua phan tich";
    return;
  }

  const connectedText = state.analysis.isConnected
    ? "Co (mot thanh phan lien thong)"
    : "Khong (nhieu thanh phan roi rac)";
  connectivityText.textContent = `Trang thai lien thong: ${connectedText}`;

  const articulationList = [...state.analysis.articulation].sort(
    (a, b) => a - b,
  );
  articulationText.textContent = articulationList.length
    ? articulationList.map((id) => `Dao ${id}`).join(", ")
    : "Khong co dinh cat";

  const bridgeList = [...state.analysis.bridges]
    .map((k) => {
      const [a, b] = k.split("-");
      return `(${a}-${b})`;
    })
    .sort();
  bridgesText.textContent = bridgeList.length
    ? bridgeList.join(", ")
    : "Khong co canh cau";

  const fragile =
    articulationList.length > 0 ||
    bridgeList.length > 0 ||
    !state.analysis.isConnected;
  if (fragile) {
    statusBadge.className = "status-badge warning";
    statusBadge.textContent = "Mang can gia co";
  } else {
    statusBadge.className = "status-badge good";
    statusBadge.textContent = "Mang ben vung";
  }
}

function resetGraph() {
  state.nodes = [];
  state.edges = [];
  state.selectedNodeId = null;
  clearAnalysis();
  updateStatus();
  render();
}

function loadSample(type) {
  resetGraph();
  if (type === "safe") {
    state.nodes = [
      { id: 0, x: 180, y: 160 },
      { id: 1, x: 320, y: 100 },
      { id: 2, x: 500, y: 140 },
      { id: 3, x: 620, y: 260 },
      { id: 4, x: 500, y: 390 },
      { id: 5, x: 300, y: 420 },
      { id: 6, x: 170, y: 300 },
    ];
    state.edges = [
      { a: 0, b: 1 },
      { a: 1, b: 2 },
      { a: 2, b: 3 },
      { a: 3, b: 4 },
      { a: 4, b: 5 },
      { a: 5, b: 6 },
      { a: 6, b: 0 },
      { a: 0, b: 5 },
      { a: 1, b: 6 },
      { a: 2, b: 4 },
    ];
  }

  if (type === "fragile") {
    state.nodes = [
      { id: 0, x: 140, y: 280 },
      { id: 1, x: 270, y: 180 },
      { id: 2, x: 390, y: 280 },
      { id: 3, x: 520, y: 200 },
      { id: 4, x: 640, y: 300 },
      { id: 5, x: 760, y: 230 },
      { id: 6, x: 390, y: 430 },
    ];
    state.edges = [
      { a: 0, b: 1 },
      { a: 1, b: 2 },
      { a: 2, b: 3 },
      { a: 3, b: 4 },
      { a: 4, b: 5 },
      { a: 2, b: 6 },
    ];
  }

  render();
}

function generateRandomMap(minNodes = 5, maxNodes = 10) {
  clearTrace();
  const n = Math.floor(Math.random() * (maxNodes - minNodes + 1)) + minNodes;
  const nodes = [];
  const padding = NODE_RADIUS + 20;
  for (let i = 0; i < n; i++) {
    const x = Math.floor(Math.random() * (900 - padding * 2)) + padding;
    const y = Math.floor(Math.random() * (560 - padding * 2)) + padding;
    nodes.push({ id: i, x, y });
  }

  // Create a connected backbone (random spanning tree)
  const edges = [];
  const order = nodes.map((v) => v.id);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  for (let i = 1; i < order.length; i++) {
    edges.push({ a: order[i - 1], b: order[i] });
  }

  // Add extra random edges
  const extraProb = 0.18; // chance to add each possible extra edge
  for (let a = 0; a < n; a++) {
    for (let b = a + 1; b < n; b++) {
      if (
        edges.some((e) => (e.a === a && e.b === b) || (e.a === b && e.b === a))
      )
        continue;
      if (Math.random() < extraProb) {
        edges.push({ a, b });
      }
    }
  }

  // Assign to state (ids start at 0)
  state.nodes = nodes;
  state.edges = edges;
  // Ensure next generated node ids won't conflict when adding more nodes interactively
  // (existing code assumes id based on max existing id)
  analyzeGraph();
  render();
}

function render() {
  svg.innerHTML = "";

  const nodeById = new Map(state.nodes.map((node) => [node.id, node]));

  for (const edge of state.edges) {
    const a = nodeById.get(edge.a);
    const b = nodeById.get(edge.b);
    if (!a || !b) {
      continue;
    }
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    const endpoints = edgeEndpoints(a, b);
    line.setAttribute("x1", endpoints.x1);
    line.setAttribute("y1", endpoints.y1);
    line.setAttribute("x2", endpoints.x2);
    line.setAttribute("y2", endpoints.y2);
    const key = edgeKey(edge.a, edge.b);
    const isBridge = state.analysis.bridges.has(key);
    const isTraversing =
      state.traversal.currentEdge &&
      ((state.traversal.currentEdge.a === edge.a &&
        state.traversal.currentEdge.b === edge.b) ||
        (state.traversal.currentEdge.a === edge.b &&
          state.traversal.currentEdge.b === edge.a));
    const classes = [
      "edge",
      isBridge ? "bridge" : "",
      isTraversing ? "traversing" : "",
    ]
      .filter(Boolean)
      .join(" ");
    line.setAttribute("class", classes);
    svg.appendChild(line);
  }

  for (const node of state.nodes) {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");

    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle",
    );
    circle.setAttribute("cx", node.x);
    circle.setAttribute("cy", node.y);
    circle.setAttribute("r", NODE_RADIUS);

    const selected =
      state.selectedNodeId === node.id && state.mode === "addBridge";
    const isCut = state.analysis.articulation.has(node.id);
    const isVisiting = state.traversal.currentNode === node.id;
    const isVisited = state.traversal.visited.has(node.id);
    const classes = [
      "node",
      isCut ? "cut" : "",
      selected ? "selected" : "",
      isVisiting ? "visiting" : "",
      isVisited ? "visited" : "",
    ]
      .filter(Boolean)
      .join(" ");
    g.setAttribute("class", `node-group ${classes}`);
    circle.setAttribute("class", classes);
    circle.dataset.nodeId = String(node.id);

    const label = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text",
    );
    label.setAttribute("x", node.x);
    label.setAttribute("y", node.y + 0.5);
    label.setAttribute("class", "node-label");
    label.textContent = String(node.id);

    g.appendChild(circle);
    g.appendChild(label);
    svg.appendChild(g);
  }

  if (state.selectedNodeId !== null && state.mode === "addBridge") {
    const selectedNode = nodeById.get(state.selectedNodeId);
    if (selectedNode) {
      const ring = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle",
      );
      ring.setAttribute("cx", selectedNode.x);
      ring.setAttribute("cy", selectedNode.y);
      ring.setAttribute("r", NODE_RADIUS + 8);
      ring.setAttribute("fill", "none");
      ring.setAttribute("stroke", "#1d4ed8");
      ring.setAttribute("stroke-width", "3");
      ring.setAttribute("stroke-dasharray", "6 5");
      svg.appendChild(ring);
    }
  }
}

svg.addEventListener("click", (event) => {
  const point = svgPointFromEvent(event);
  const node = findNodeByPoint(point);
  console.log("Click event:", {
    mode: state.mode,
    point,
    node,
    nodeCount: state.nodes.length,
  });

  if (state.mode === "addIsland") {
    if (!node) {
      addNode(point.x, point.y);
      clearAnalysis();
      updateStatus();
      render();
    }
    return;
  }

  if (state.mode === "addBridge") {
    if (!node) {
      state.selectedNodeId = null;
      render();
      return;
    }

    if (state.selectedNodeId === null) {
      state.selectedNodeId = node.id;
      render();
      return;
    }

    addEdge(state.selectedNodeId, node.id);
    state.selectedNodeId = null;
    clearAnalysis();
    updateStatus();
    render();
  }
});

svg.addEventListener("mousedown", (event) => {
  console.log("Mousedown:", { mode: state.mode });
  if (state.mode !== "move") {
    return;
  }
  const point = svgPointFromEvent(event);
  const node = findNodeByPoint(point);
  console.log("Found node on mousedown:", node);
  if (!node) {
    return;
  }

  state.draggingNodeId = node.id;
  state.dragOffset = {
    x: point.x - node.x,
    y: point.y - node.y,
  };
});

window.addEventListener("mousemove", (event) => {
  if (state.mode !== "move" || state.draggingNodeId === null) {
    return;
  }
  console.log("Dragging node:", state.draggingNodeId);
  const point = svgPointFromEvent(event);
  const node = state.nodes.find((n) => n.id === state.draggingNodeId);
  if (!node) {
    return;
  }

  node.x = Math.max(
    NODE_RADIUS,
    Math.min(900 - NODE_RADIUS, point.x - state.dragOffset.x),
  );
  node.y = Math.max(
    NODE_RADIUS,
    Math.min(560 - NODE_RADIUS, point.y - state.dragOffset.y),
  );
  render();
});

window.addEventListener("mouseup", () => {
  state.draggingNodeId = null;
});

modeButtons.addIsland.addEventListener("click", () => setMode("addIsland"));
modeButtons.addBridge.addEventListener("click", () => setMode("addBridge"));
modeButtons.move.addEventListener("click", () => setMode("move"));

resetBtn.addEventListener("click", () => {
  mapSelect.value = "";
  clearTrace();
  resetGraph();
});

mapSelect.addEventListener("change", () => {
  if (!mapSelect.value) {
    return;
  }
  clearTrace();
  if (mapSelect.value.startsWith("map")) {
    const mapIndex = parseInt(mapSelect.value.substring(3)) - 1;
    const mapData = MAPS_DATA[mapIndex];
    resetGraph();
    state.nodes = mapData.nodes.map((n) => ({ ...n }));
    state.edges = mapData.edges.map((e) => ({ a: e[0], b: e[1] }));
    analyzeGraph();
    render();
  } else {
    loadSample(mapSelect.value);
    analyzeGraph();
    render();
  }
});

speedSlowBtn.addEventListener("click", () => {
  setSpeedMode("slow");
});

speedNormalBtn.addEventListener("click", () => {
  setSpeedMode("normal");
});

speedFastBtn.addEventListener("click", () => {
  setSpeedMode("fast");
});

playPauseBtn.addEventListener("click", () => {
  traversalPaused = !traversalPaused;
  playPauseBtn.textContent = traversalPaused ? "Tiếp tục" : "Dừng";
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clearTrace() {
  traversalRunId++;
  state.traversal.isRunning = false;
  state.traversal.steps = [];
  state.traversal.currentStepIndex = 0;
  state.traversal.visited.clear();
  state.traversal.currentNode = null;
  state.traversal.currentEdge = null;
  state.traversal.stack = [];
  state.traversal.queue = [];
  traceBody.innerHTML = "";
  document.querySelector(".trace-section").classList.remove("is-visible");
  playPauseBtn.style.display = "none";
  playPauseBtn.textContent = "Dừng";
  traversalPaused = false;
  setTraversalActive(false);
  render();
}

function displayTraceStep(stepIndex) {
  if (stepIndex >= state.traversal.steps.length) return;

  traceBody.innerHTML = "";

  for (let i = 0; i <= stepIndex; i++) {
    const step = state.traversal.steps[i];
    const row = document.createElement("tr");
    if (i === stepIndex) {
      row.classList.add("active-step");
    }

    const cellStep = document.createElement("td");
    cellStep.textContent = i + 1;

    const cellAction = document.createElement("td");
    cellAction.textContent = step.action;

    const cellNode = document.createElement("td");
    cellNode.textContent = step.currentNode !== null ? step.currentNode : "-";

    const cellStack = document.createElement("td");
    cellStack.textContent =
      step.stack && step.stack.length > 0
        ? step.stack.join(", ")
        : step.queue && step.queue.length > 0
          ? step.queue.join(", ")
          : "-";
    cellStack.classList.add("wrap");

    const cellVisited = document.createElement("td");
    cellVisited.textContent =
      step.visited && step.visited.length > 0 ? step.visited.join(", ") : "-";
    cellVisited.classList.add("wrap");

    row.appendChild(cellStep);
    row.appendChild(cellAction);
    row.appendChild(cellNode);
    row.appendChild(cellStack);
    row.appendChild(cellVisited);
    traceBody.appendChild(row);
  }

  state.traversal.currentNode = state.traversal.steps[stepIndex].currentNode;
  state.traversal.currentEdge = state.traversal.steps[stepIndex].currentEdge;
  state.traversal.visited = new Set(state.traversal.steps[stepIndex].visited);
  render();
}

async function runDFSAnimation() {
  clearTrace();
  state.traversal.algorithm = "DFS";
  state.traversal.isRunning = true;
  playPauseBtn.style.display = "inline-block";
  document.querySelector(".trace-section").classList.add("is-visible");
  setTraversalActive(true);

  const currentRunId = traversalRunId;
  const adj = buildAdjacency();
  if (state.nodes.length === 0) return;

  const visited = new Set();
  const stack = [state.nodes[0].id];
  const steps = [];

  function dfsStep(u) {
    if (visited.has(u)) return;
    visited.add(u);

    // Visit node
    steps.push({
      action: `Thăm đỉnh ${u}`,
      currentNode: u,
      currentEdge: null,
      visited: [...visited],
      stack: [...stack],
    });

    const neighbors = adj.get(u) || [];
    for (const v of neighbors) {
      if (!visited.has(v)) {
        // Explore edge
        steps.push({
          action: `Duyệt cạnh ${u}-${v}`,
          currentNode: v,
          currentEdge: { a: u, b: v },
          visited: [...visited],
          stack: [...stack],
        });
        dfsStep(v);
      }
    }

    stack.pop();
  }

  dfsStep(state.nodes[0].id);
  state.traversal.steps = steps;

  for (let i = 0; i < state.traversal.steps.length; i++) {
    if (traversalRunId !== currentRunId) return;

    while (traversalPaused) {
      await sleep(100);
      if (traversalRunId !== currentRunId) return;
    }

    displayTraceStep(i);
    await sleep(traversalSpeed);
  }

  state.traversal.isRunning = false;
  setTraversalActive(false);
  playPauseBtn.style.display = "none";
}

async function runBFSAnimation() {
  clearTrace();
  state.traversal.algorithm = "BFS";
  state.traversal.isRunning = true;
  playPauseBtn.style.display = "inline-block";
  document.querySelector(".trace-section").classList.add("is-visible");
  setTraversalActive(true);

  const currentRunId = traversalRunId;
  const adj = buildAdjacency();
  if (state.nodes.length === 0) return;

  const visited = new Set();
  const queue = [state.nodes[0].id];
  visited.add(state.nodes[0].id);
  const steps = [];

  steps.push({
    action: `Khởi tạo Queue: [${state.nodes[0].id}]`,
    currentNode: state.nodes[0].id,
    currentEdge: null,
    visited: [...visited],
    queue: [...queue],
  });

  while (queue.length > 0) {
    if (traversalRunId !== currentRunId) return;

    const u = queue.shift();

    steps.push({
      action: `Lấy đỉnh ${u} từ Queue`,
      currentNode: u,
      currentEdge: null,
      visited: [...visited],
      queue: [...queue],
    });

    const neighbors = adj.get(u) || [];
    for (const v of neighbors) {
      if (!visited.has(v)) {
        visited.add(v);
        queue.push(v);

        steps.push({
          action: `Duyệt cạnh ${u}-${v}, thêm ${v} vào Queue`,
          currentNode: v,
          currentEdge: { a: u, b: v },
          visited: [...visited],
          queue: [...queue],
        });
      }
    }
  }

  state.traversal.steps = steps;

  for (let i = 0; i < state.traversal.steps.length; i++) {
    if (traversalRunId !== currentRunId) return;

    while (traversalPaused) {
      await sleep(100);
      if (traversalRunId !== currentRunId) return;
    }

    displayTraceStep(i);
    await sleep(traversalSpeed);
  }

  state.traversal.isRunning = false;
  setTraversalActive(false);
  playPauseBtn.style.display = "none";
}

runDFSBtn.addEventListener("click", () => {
  runDFSAnimation();
});

runBFSBtn.addEventListener("click", () => {
  runBFSAnimation();
});

if (generateMapBtn) {
  generateMapBtn.addEventListener("click", () => {
    generateRandomMap();
  });
}

// Initialize
setSpeedMode("normal");
updateStatus();
render();
