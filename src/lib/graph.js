export function vertexName(index, total) {
  if (total <= 26) {
    return String.fromCharCode(65 + index);
  }

  return String(index);
}

function normalizeEdge(u, v) {
  return u < v ? [u, v] : [v, u];
}

export function formatEdge([u, v], total = 26) {
  return `${vertexName(u, total)}-${vertexName(v, total)}`;
}

export function edgeKey([u, v]) {
  const [a, b] = normalizeEdge(u, v);
  return `${a}-${b}`;
}

export function modelToEdgeText(model) {
  return model.edges.join('\n');
}

export function buildMatrix(total, edges) {
  return Array.from({ length: total }, (_, row) =>
    Array.from({ length: total }, (_, col) =>
      edges.some(([u, v]) => (u === row && v === col) || (u === col && v === row)) ? 1 : 0,
    ),
  );
}

export function generateRandomEdges() {
  const edges = [];
  const total = Math.floor(Math.random() * 6) + 5;
  const probability = 0.32;

  for (let i = 0; i < total - 1; i += 1) {
    edges.push([i, i + 1]);
  }

  for (let i = 0; i < total; i += 1) {
    for (let j = i + 2; j < total; j += 1) {
      if (Math.random() < probability) {
        edges.push([i, j]);
      }
    }
  }

  return edges.map((edge) => formatEdge(edge, total)).join('\n');
}

export function parseEdgeText(text) {
  const errors = [];
  const edgesByKey = new Map();
  let highestVertex = -1;
  const entries = text
    .split(/\n|,/)
    .map((entry) => entry.trim())
    .filter(Boolean);

  entries.forEach((entry) => {
    try {
      const parts = entry.split(/\s*-\s*|\s+/).filter(Boolean);
      if (parts.length !== 2) {
        throw new Error(`Aresta invalida: "${entry}". Use o formato A-B.`);
      }

      const u = parseVertexToken(parts[0]);
      const v = parseVertexToken(parts[1]);

      if (u === v) {
        errors.push(`Laco ignorado: "${entry}".`);
        return;
      }

      const [a, b] = normalizeEdge(u, v);
      highestVertex = Math.max(highestVertex, a, b);
      edgesByKey.set(`${a}-${b}`, [a, b]);
    } catch (error) {
      errors.push(error.message);
    }
  });

  return { edges: [...edgesByKey.values()], errors, total: highestVertex + 1 };
}

function parseVertexToken(token) {
  const cleaned = token.trim().toUpperCase();
  if (/^[A-Z]$/.test(cleaned)) {
    return cleaned.charCodeAt(0) - 65;
  }

  if (/^V?\d+$/.test(cleaned)) {
    return Number(cleaned.replace('V', ''));
  }

  throw new Error(`Vertice invalido: "${token}". Use letras como A-B ou indices como 0-1.`);
}
