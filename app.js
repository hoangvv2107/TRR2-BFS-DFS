const svg = document.getElementById("graphSvg");
const modeButtons = {
  addIsland: document.getElementById("modeAddIsland"),
  addBridge: document.getElementById("modeAddBridge"),
  move: document.getElementById("modeMove"),
};
const analyzeBtn = document.getElementById("analyzeBtn");
const resetBtn = document.getElementById("resetBtn");
const sampleSelect = document.getElementById("sampleSelect");

const statusBadge = document.getElementById("statusBadge");
const statText = document.getElementById("statText");
const connectivityText = document.getElementById("connectivityText");
const articulationText = document.getElementById("articulationText");
const bridgesText = document.getElementById("bridgesText");

const NODE_RADIUS = 22;

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
    line.setAttribute("x1", a.x);
    line.setAttribute("y1", a.y);
    line.setAttribute("x2", b.x);
    line.setAttribute("y2", b.y);
    const key = edgeKey(edge.a, edge.b);
    line.setAttribute(
      "class",
      state.analysis.bridges.has(key) ? "edge bridge" : "edge",
    );
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
    const className = `node${isCut ? " cut" : ""}${selected ? " selected" : ""}`;
    circle.setAttribute("class", className);
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
  if (state.mode !== "move") {
    return;
  }
  const point = svgPointFromEvent(event);
  const node = findNodeByPoint(point);
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

analyzeBtn.addEventListener("click", () => {
  analyzeGraph();
  render();
});

resetBtn.addEventListener("click", () => {
  sampleSelect.value = "";
  resetGraph();
});

sampleSelect.addEventListener("change", () => {
  if (!sampleSelect.value) {
    return;
  }
  loadSample(sampleSelect.value);
  analyzeGraph();
  render();
});

updateStatus();
render();
