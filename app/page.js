"use client";

import { useMemo, useState } from "react";
import dashboardData from "@/data/dashboard-data.json";

const METRICS = {
  followers: "Seguidores",
  reach: "Impresiones / visualizaciones",
  interactions: "Interacciones",
  engagement: "Engagement estimado"
};

const fmt = new Intl.NumberFormat("es-MX");

function compact(value) {
  const n = Number(value || 0);
  if (Math.abs(n) >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(0)}k`;
  return fmt.format(Math.round(n));
}

function percent(value, digits = 1) {
  return `${Number(value || 0).toFixed(digits)}%`;
}

function scale(value, inMin, inMax, outMin, outMax) {
  if (inMax === inMin) return (outMin + outMax) / 2;
  return outMin + ((value - inMin) * (outMax - outMin)) / (inMax - inMin);
}

function pathFor(points) {
  return points.map((p, index) => `${index ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
}

function SectionTitle({ eyebrow, title, actions }) {
  return (
    <div className="section-title">
      <div>
        {eyebrow ? <p>{eyebrow}</p> : null}
        <h2>{title}</h2>
      </div>
      {actions ? <div className="actions">{actions}</div> : null}
    </div>
  );
}

function StatCard({ item, index }) {
  return (
    <article className="stat-card">
      <span>{item.label}</span>
      <strong>{item.value}</strong>
      <small>{item.detail}</small>
      <i aria-hidden="true">{String(index + 1).padStart(2, "0")}</i>
    </article>
  );
}

function DataTable({ columns, rows }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>{columns.map((column) => <th key={column.key || column.label}>{column.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`${row.platform || row.name || "row"}-${rowIndex}`}>
              {columns.map((column) => (
                <td key={column.key || column.label}>
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LineChart({ metric }) {
  const width = 920;
  const height = 360;
  const padding = { left: 64, right: 22, top: 22, bottom: 52 };
  const weeks = dashboardData.weekly.weeks;
  const series = Object.entries(dashboardData.weekly.series).map(([platform, values]) => ({
    platform,
    color: values.color,
    values: values[metric].map((value) => (value === null ? null : Number(value)))
  }));
  const allValues = series.flatMap((item) => item.values).filter((value) => value !== null && Number.isFinite(value));
  const min = metric === "engagement" ? 0 : Math.min(...allValues) * 0.96;
  const max = Math.max(...allValues) * 1.06;
  const x0 = padding.left;
  const x1 = width - padding.right;
  const y0 = height - padding.bottom;
  const y1 = padding.top;

  return (
    <div className="chart-shell">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Evolucion semanal de ${METRICS[metric]}`}>
        {[0, 1, 2, 3, 4].map((tick) => {
          const y = scale(tick, 0, 4, y0, y1);
          const value = scale(tick, 0, 4, min, max);
          return (
            <g key={tick}>
              <line x1={x0} x2={x1} y1={y} y2={y} className="grid-line" />
              <text x={x0 - 10} y={y + 4} textAnchor="end" className="axis-label">
                {metric === "engagement" ? percent(value) : compact(value)}
              </text>
            </g>
          );
        })}

        {series.map((item) => {
          const points = item.values
            .map((value, index) => value === null ? null : ({
              x: scale(index, 0, weeks.length - 1, x0, x1),
              y: scale(value, min, max, y0, y1)
            }))
            .filter(Boolean);
          const last = points[points.length - 1];
          return (
            <g key={item.platform}>
              <path d={pathFor(points)} fill="none" stroke={item.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              {last ? <circle cx={last.x} cy={last.y} r="4.5" fill={item.color} stroke="#fff" strokeWidth="2" /> : null}
            </g>
          );
        })}

        {[0, Math.floor((weeks.length - 1) / 2), weeks.length - 1].map((index) => (
          <text key={index} x={scale(index, 0, weeks.length - 1, x0, x1)} y={height - 18} textAnchor="middle" className="axis-label">
            {weeks[index]}
          </text>
        ))}
      </svg>
      <div className="legend">
        {series.map((item) => (
          <span key={item.platform}><b style={{ backgroundColor: item.color }} />{item.platform}</span>
        ))}
      </div>
    </div>
  );
}

function BarChart({ rows, valueKey, labelKey = "platform", highlight = "IMCO", suffix = "" }) {
  const width = 760;
  const height = 330;
  const padding = { left: 172, right: 82, top: 20, bottom: 20 };
  const values = rows.map((row) => Number(row[valueKey] || 0));
  const min = Math.min(0, ...values);
  const max = Math.max(...values) * 1.12 || 1;
  const barHeight = Math.max(20, (height - padding.top - padding.bottom - (rows.length - 1) * 12) / rows.length);

  return (
    <div className="chart-shell compact-chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Grafica de barras">
        {rows.map((row, index) => {
          const raw = Number(row[valueKey] || 0);
          const y = padding.top + index * (barHeight + 12);
          const zeroX = scale(0, min, max, padding.left, width - padding.right);
          const valueX = scale(raw, min, max, padding.left, width - padding.right);
          const x = Math.min(zeroX, valueX);
          const barWidth = Math.max(2, Math.abs(valueX - zeroX));
          const color = row.name === highlight || row.platform === highlight ? "#087f7a" : row.color || "#718096";
          return (
            <g key={`${row[labelKey]}-${index}`}>
              <text x={padding.left - 12} y={y + barHeight * 0.65} textAnchor="end" className="bar-label">{row[labelKey]}</text>
              <rect x={x} y={y} width={barWidth} height={barHeight} rx="5" fill={color} />
              <text x={raw >= 0 ? valueX + 10 : valueX - 10} y={y + barHeight * 0.65} textAnchor={raw >= 0 ? "start" : "end"} className="value-label">
                {valueKey === "pct" ? percent(raw) : `${compact(raw)}${suffix}`}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function MiniMonthlyChart({ source, mode }) {
  const width = 680;
  const height = 260;
  const padding = { left: 58, right: 18, top: 18, bottom: 42 };
  const all = source.rows.flatMap((row) => row.values).filter((value) => value !== null);
  const max = Math.max(...all, ...source.rows.map((row) => row.goal || 0)) * 1.14 || 1;
  const x0 = padding.left;
  const x1 = width - padding.right;
  const y0 = height - padding.bottom;
  const y1 = padding.top;

  return (
    <div className="chart-shell mini">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={mode}>
        {[0, 1, 2, 3].map((tick) => {
          const y = scale(tick, 0, 3, y0, y1);
          return <line key={tick} x1={x0} x2={x1} y1={y} y2={y} className="grid-line" />;
        })}
        {source.rows.map((row) => {
          const platform = row.platform.replace(" / X", "/X");
          const color = dashboardData.weekly.series[platform]?.color || "#334155";
          const points = row.values
            .map((value, index) => value === null ? null : ({
              x: scale(index, 0, source.months.length - 1, x0, x1),
              y: scale(value, 0, max, y0, y1)
            }))
            .filter(Boolean);
          return points.length > 1 ? (
            <path key={row.platform} d={pathFor(points)} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
          ) : null;
        })}
        {source.months.map((month, index) => index % 2 === 0 ? (
          <text key={month} x={scale(index, 0, source.months.length - 1, x0, x1)} y={height - 16} textAnchor="middle" className="axis-label">{month}</text>
        ) : null)}
        <text x={x0 - 8} y={y1 + 4} textAnchor="end" className="axis-label">{compact(max)}</text>
        <text x={x0 - 8} y={y0 + 4} textAnchor="end" className="axis-label">0</text>
      </svg>
    </div>
  );
}

export default function DashboardPage() {
  const [metric, setMetric] = useState("reach");
  const [competitive, setCompetitive] = useState(Object.keys(dashboardData.competitive)[0]);

  const sortedReach = useMemo(
    () => [...dashboardData.weekly.summaries].sort((a, b) => b.reach - a.reach),
    []
  );
  const competitiveRows = useMemo(
    () => [...dashboardData.competitive[competitive]].sort((a, b) => b.pct - a.pct),
    [competitive]
  );

  return (
    <main>
      <header className="hero">
        <nav>
          <a href="#resumen">Resumen</a>
          <a href="#evolucion">Evolucion</a>
          <a href="#metas">Metas</a>
          <a href="#sector">Sector</a>
        </nav>
        <div className="hero-grid">
          <div>
            <p className="kicker">IMCO | Redes y Comunicacion 2026</p>
            <h1>Dashboard ejecutivo de crecimiento, alcance y desempeno por plataforma</h1>
            <p className="lead">Analisis del 29 de diciembre de 2025 al 10 de mayo de 2026, con 19 semanas de actividad y comparativo de think tanks.</p>
          </div>
          <aside>
            <span>Senal clave</span>
            <strong>Instagram y TikTok aceleran el crecimiento; newsletter necesita atencion.</strong>
          </aside>
        </div>
      </header>

      <section id="resumen" className="stats-grid">
        {dashboardData.cards.map((item, index) => <StatCard key={item.label} item={item} index={index} />)}
      </section>

      <section className="split">
        <article className="panel executive-panel">
          <SectionTitle eyebrow="Lectura" title="Resumen ejecutivo" />
          <p>{dashboardData.analysis.executive}</p>
        </article>
        <article className="panel alert-panel">
          <SectionTitle eyebrow="Riesgo" title="Newsletter" />
          <p>{dashboardData.analysis.newsletterAlert}</p>
        </article>
      </section>

      <section className="panel">
        <SectionTitle eyebrow="Portafolio" title="Vision general por plataforma" />
        <DataTable
          rows={dashboardData.analysis.overview}
          columns={[
            { label: "Plataforma", key: "platform" },
            { label: "Inicio", key: "start" },
            { label: "Fin", key: "end" },
            { label: "Crecimiento", key: "growth" },
            { label: "% crec.", key: "growthPct" },
            { label: "ER prom.", key: "er" }
          ]}
        />
      </section>

      <section id="evolucion" className="split wide-left">
        <article className="panel">
          <SectionTitle
            eyebrow="Semanal"
            title="Evolucion por metrica"
            actions={
              <select value={metric} onChange={(event) => setMetric(event.target.value)} aria-label="Seleccionar metrica">
                {Object.entries(METRICS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            }
          />
          <LineChart metric={metric} />
        </article>
        <article className="panel">
          <SectionTitle eyebrow="Acumulado" title="Impresiones por plataforma" />
          <BarChart rows={sortedReach} valueKey="reach" />
        </article>
      </section>

      <section className="insights-grid">
        {dashboardData.analysis.findings.map((item) => (
          <article className="panel insight" key={item.platform}>
            <h3>{item.platform}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </section>

      <section id="metas" className="split">
        <article className="panel">
          <SectionTitle eyebrow="Seguidores" title="Progreso hacia metas" />
          <DataTable
            rows={dashboardData.analysis.goals}
            columns={[
              { label: "Plataforma", key: "platform" },
              { label: "Crec/sem", key: "weeklyGrowth" },
              { label: "Proy. 2026", key: "projection" },
              { label: "Meta", key: "goal" },
              { label: "Cumple", render: (row) => <span className={row.status.startsWith("Si") || row.status.startsWith("Sí") ? "pill ok" : "pill warn"}>{row.status}</span> }
            ]}
          />
        </article>
        <article className="panel">
          <SectionTitle eyebrow="Alcance" title="Real vs meta proporcional" />
          <DataTable
            rows={dashboardData.analysis.reachGoals}
            columns={[
              { label: "Plataforma", key: "platform" },
              { label: "19 semanas", key: "actual" },
              { label: "Meta mensual", key: "monthlyGoal" },
              { label: "Meta acum.", key: "accGoal" },
              { label: "% logro", render: (row) => <span className={parseFloat(row.achievement) >= 100 ? "pill ok" : "pill warn"}>{row.achievement}</span> }
            ]}
          />
        </article>
      </section>

      <section className="split">
        <article className="panel">
          <SectionTitle eyebrow="Mensual" title="Seguidores" />
          <MiniMonthlyChart source={dashboardData.followersMonthly} mode="seguidores mensuales" />
        </article>
        <article className="panel">
          <SectionTitle eyebrow="Mensual" title="Alcance 2026" />
          <MiniMonthlyChart source={dashboardData.reachTracking} mode="alcance mensual" />
        </article>
      </section>

      <section id="sector" className="split wide-left">
        <article className="panel">
          <SectionTitle
            eyebrow="Think tanks"
            title="Comparativo competitivo"
            actions={
              <select value={competitive} onChange={(event) => setCompetitive(event.target.value)} aria-label="Seleccionar red social">
                {Object.keys(dashboardData.competitive).map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
            }
          />
          <BarChart rows={competitiveRows} valueKey="pct" labelKey="name" />
        </article>
        <article className="panel executive-panel">
          <SectionTitle eyebrow="Narrativa" title="Lectura competitiva" />
          <p>{dashboardData.analysis.competitive}</p>
        </article>
      </section>

      <section className="panel recommendations">
        <SectionTitle eyebrow="Accion" title="Observaciones y recomendaciones" />
        <ol>
          {dashboardData.analysis.recommendations.map((item) => <li key={item}>{item.replace(/^\d+\.\s*/, "")}</li>)}
        </ol>
      </section>

      <footer>Fuente: KPIs_Redes_Coms_Reporte_semanal_2026_analizado.xlsx. Version Next.js creada localmente.</footer>
    </main>
  );
}
