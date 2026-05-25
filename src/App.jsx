import { useMemo, useState } from 'react';
import presetModels from './data/modelos.json';
import {
  buildMatrix,
  edgeKey,
  formatEdge,
  generateRandomEdges,
  modelToEdgeText,
  parseEdgeText,
  vertexName,
} from './lib/graph';
import { calculateWarRoom } from './lib/warRoom';

const DEFAULT_EDGE_TEXT = modelToEdgeText(presetModels[0]);

function GraphCanvas({ total, edges, selectedVertices }) {
  const positions = useMemo(() => {
    const centerX = 320;
    const centerY = 230;
    const radius = total <= 2 ? 90 : 165;

    return Array.from({ length: total }, (_, index) => {
      const angle = (2 * Math.PI * index) / total - Math.PI / 2;
      return {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });
  }, [total]);

  if (total === 0) {
    return (
      <div className="graph-canvas empty-graph">
        Informe uma lista de arestas para desenhar o grafo.
      </div>
    );
  }

  return (
    <svg className="graph-canvas" viewBox="0 0 640 460" role="img" aria-label="Desenho do grafo">
      {edges.map(([u, v]) => (
        <line
          className="edge"
          key={`${u}-${v}`}
          x1={positions[u].x}
          y1={positions[u].y}
          x2={positions[v].x}
          y2={positions[v].y}
        />
      ))}

      {positions.map((position, index) => {
        const isSelected = selectedVertices.includes(index);
        return (
          <g key={index}>
            <circle
              className={isSelected ? 'vertex vertex-selected' : 'vertex'}
              cx={position.x}
              cy={position.y}
              r="24"
            />
            <text className="vertex-label" x={position.x} y={position.y + 6}>
              {vertexName(index, total)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function StepGraph({ total, edges, step }) {
  const positions = useMemo(() => {
    const centerX = 220;
    const centerY = 150;
    const radius = total <= 2 ? 64 : 104;

    return Array.from({ length: total }, (_, index) => {
      const angle = (2 * Math.PI * index) / total - Math.PI / 2;
      return {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });
  }, [total]);

  const coveredBeforeKeys = new Set(step.coveredBeforeEdges.map(edgeKey));
  const coveredNowKeys = new Set(step.coveredNow.map(edgeKey));
  const coveredBeforeVertices = new Set(step.coveredVerticesBefore);

  return (
    <div className="step-visual">
      <svg className="step-graph" viewBox="0 0 440 300" role="img" aria-label={`Visual do passo ${step.number}`}>
        {edges.map(([u, v]) => {
          const key = edgeKey([u, v]);
          const className = coveredNowKeys.has(key)
            ? 'step-edge step-edge-current'
            : coveredBeforeKeys.has(key)
              ? 'step-edge step-edge-before'
              : 'step-edge';

          return (
            <line
              className={className}
              key={key}
              x1={positions[u].x}
              y1={positions[u].y}
              x2={positions[v].x}
              y2={positions[v].y}
            />
          );
        })}

        {positions.map((position, index) => {
          const className =
            index === step.vertex
              ? 'step-vertex step-vertex-current'
              : coveredBeforeVertices.has(index)
                ? 'step-vertex step-vertex-before'
                : 'step-vertex';

          return (
            <g key={index}>
              <circle className={className} cx={position.x} cy={position.y} r="18" />
              <text className="step-vertex-label" x={position.x} y={position.y + 5}>
                {vertexName(index, total)}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="step-legend" aria-hidden="true">
        <span>
          <i className="legend-current" /> Coberto agora
        </span>
        <span>
          <i className="legend-before" /> Coberto antes
        </span>
        <span>
          <i className="legend-pending" /> Ainda pendente
        </span>
      </div>
    </div>
  );
}

function App() {
  const [edgeText, setEdgeText] = useState(DEFAULT_EDGE_TEXT);

  const graph = useMemo(() => {
    const parsed = parseEdgeText(edgeText);
    const edges = parsed.edges.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    if (parsed.total > 30) {
      return {
        total: 0,
        edges: [],
        matrix: [],
        errors: ['Use no maximo 30 vertices para manter a visualizacao legivel.'],
      };
    }

    return {
      total: parsed.total,
      edges,
      matrix: buildMatrix(parsed.total, edges),
      errors: parsed.errors,
    };
  }, [edgeText]);

  const result = useMemo(() => {
    if (graph.errors.length > 0 || graph.total === 0) {
      return { vertices: [], steps: [] };
    }

    return calculateWarRoom(graph.total, graph.edges);
  }, [graph]);

  const selectedVertexNames = result.vertices.map((vertex) => vertexName(vertex, graph.total));

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <h1>War Room Grafos</h1>
          <p>
            War Room e um ambiente de analise para identificar pontos criticos de uma rede e
            decidir quais vertices devem ser monitorados para cobrir todas as conexoes do grafo.
          </p>
          <p>
            A metodologia gulosa escolhe, a cada passo, o vertice que cobre mais arestas ainda
            pendentes ate que toda a rede esteja coberta.
          </p>
        </div>
        <div className="hero-card">
          <span>Vertex Cover</span>
          <strong>{selectedVertexNames.length || 0}</strong>
          <small>vertices monitorados</small>
        </div>
      </section>

      <section className="layout">
        <aside className="panel">
          <div className="section-heading">
            <p className="eyebrow">Entrada</p>
            <h2>Informacoes do grafo</h2>
          </div>

          <div className="sample-buttons">
            <button type="button" onClick={() => setEdgeText(generateRandomEdges())}>
              Criar aleatorio
            </button>
          </div>

          <label className="field">
            <span>Lista de arestas</span>
            <textarea
              value={edgeText}
              onChange={(event) => setEdgeText(event.target.value)}
              spellCheck="false"
              rows="12"
              placeholder={'A-B\nB-C\nC-D'}
            />
          </label>

          <div className="preset-section">
            <h3>Modelos prontos</h3>
            <div className="sample-buttons">
              {presetModels.map((model) => (
                <button key={model.name} type="button" onClick={() => setEdgeText(modelToEdgeText(model))}>
                  {model.name}
                </button>
              ))}
            </div>
          </div>

          {graph.errors.length > 0 && (
            <div className="alert">
              {graph.errors.map((error) => (
                <p key={error}>{error}</p>
              ))}
            </div>
          )}
        </aside>

        <section className="content-stack">
          <section className="panel graph-panel">
            <div className="section-heading">
              <p className="eyebrow">Visualizacao</p>
              <h2>Desenho do grafo</h2>
            </div>
            <GraphCanvas total={graph.total} edges={graph.edges} selectedVertices={result.vertices} />
          </section>

          <section className="stats-grid">
            <article className="stat-card">
              <span>Vertices</span>
              <strong>{graph.total}</strong>
            </article>
            <article className="stat-card">
              <span>Arestas</span>
              <strong>{graph.edges.length}</strong>
            </article>
            <article className="stat-card">
              <span>Cobertura</span>
              <strong>{selectedVertexNames.join(', ') || '-'}</strong>
            </article>
          </section>

          <section className="panel">
            <div className="section-heading">
              <p className="eyebrow">War Room</p>
              <h2>Calculo passo a passo</h2>
            </div>

            {result.steps.length === 0 ? (
              <p className="empty-state">Nao ha arestas para cobrir.</p>
            ) : (
              <div className="steps">
                {result.steps.map((step) => (
                  <article className="step-card" key={step.number}>
                    <div className="step-content">
                      <div>
                        <h3>Passo {step.number}</h3>
                        <p>
                          Vertice escolhido:{' '}
                          <strong>{vertexName(step.vertex, graph.total)}</strong> cobre{' '}
                          <strong>{step.coveredCount}</strong> aresta(s).
                        </p>
                        <dl>
                          <div>
                            <dt>Arestas pendentes</dt>
                            <dd>{step.before.map((edge) => formatEdge(edge, graph.total)).join(', ')}</dd>
                          </div>
                          <div>
                            <dt>Cobertas agora</dt>
                            <dd>{step.coveredNow.map((edge) => formatEdge(edge, graph.total)).join(', ')}</dd>
                          </div>
                          <div>
                            <dt>Cobertas antes</dt>
                            <dd>
                              {step.coveredBeforeEdges.length
                                ? step.coveredBeforeEdges
                                    .map((edge) => formatEdge(edge, graph.total))
                                    .join(', ')
                                : 'Nenhuma'}
                            </dd>
                          </div>
                          <div>
                            <dt>Restantes</dt>
                            <dd>
                              {step.remaining.length
                                ? step.remaining.map((edge) => formatEdge(edge, graph.total)).join(', ')
                                : 'Nenhuma'}
                            </dd>
                          </div>
                        </dl>
                      </div>

                      <StepGraph total={graph.total} edges={graph.edges} step={step} />
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="panel">
            <div className="section-heading">
              <p className="eyebrow">Dados</p>
              <h2>Matriz de adjacencia</h2>
            </div>
            <div className="matrix-wrap">
              <table>
                <thead>
                  <tr>
                    <th></th>
                    {graph.matrix.map((_, index) => (
                      <th key={index}>{vertexName(index, graph.total)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {graph.matrix.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      <th>{vertexName(rowIndex, graph.total)}</th>
                      {row.map((value, colIndex) => (
                        <td key={`${rowIndex}-${colIndex}`}>{value}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </section>
      </section>
    </main>
  );
}

export default App;
