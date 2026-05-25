export function calculateWarRoom(total, edges) {
  const pending = edges.map((edge) => [...edge]);
  const coverage = new Set();
  const coveredEdges = [];
  const steps = [];

  while (pending.length > 0) {
    const before = pending.map((edge) => [...edge]);
    const coveredBeforeEdges = coveredEdges.map((edge) => [...edge]);
    const coveredVerticesBefore = [...coverage].sort((a, b) => a - b);
    let bestVertex = -1;
    let bestCoverage = -1;

    for (let vertex = 0; vertex < total; vertex += 1) {
      const count = pending.filter(([u, v]) => u === vertex || v === vertex).length;
      if (count > bestCoverage) {
        bestCoverage = count;
        bestVertex = vertex;
      }
    }

    const coveredNow = pending.filter(([u, v]) => u === bestVertex || v === bestVertex);
    const remaining = pending.filter(([u, v]) => u !== bestVertex && v !== bestVertex);

    coverage.add(bestVertex);
    steps.push({
      number: steps.length + 1,
      vertex: bestVertex,
      coveredCount: bestCoverage,
      before,
      coveredBeforeEdges,
      coveredVerticesBefore,
      coveredNow,
      remaining,
    });

    coveredEdges.push(...coveredNow.map((edge) => [...edge]));
    pending.splice(0, pending.length, ...remaining);
  }

  return {
    vertices: [...coverage].sort((a, b) => a - b),
    steps,
  };
}
