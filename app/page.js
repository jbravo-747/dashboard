"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import dashboardData from "@/data/dashboard-data.json";
import {
  LayoutDashboard, TrendingUp, Target, Building2,
  Users, Eye, MessageSquare, Zap, Award
} from "lucide-react";

// ── Platform SVG icons ────────────────────────────────────────────────────────
function PlatformIcon({ platform, size = 16 }) {
  const p = { width: size, height: size, fill: "currentColor", viewBox: "0 0 24 24", "aria-hidden": true };
  if (platform?.includes("Facebook"))
    return <svg {...p}><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>;
  if (platform?.includes("Twitter") || platform?.includes("/X"))
    return <svg {...p}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.258 5.622 5.867-5.622h.039zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>;
  if (platform?.includes("Instagram"))
    return <svg {...p}><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>;
  if (platform?.includes("LinkedIn"))
    return <svg {...p}><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>;
  if (platform?.includes("TikTok"))
    return <svg {...p}><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg>;
  if (platform?.includes("YouTube"))
    return <svg {...p}><path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" /></svg>;
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const METRICS = {
  followers: "Seguidores",
  reach: "Impresiones / visualizaciones",
  interactions: "Interacciones",
  engagement: "Engagement estimado"
};

const METRIC_ICONS = { followers: Users, reach: Eye, interactions: MessageSquare, engagement: Zap };

const fmt = new Intl.NumberFormat("es-MX");

function compact(value) {
  const n = Number(value || 0);
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
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
  return points.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
}

function parseNumeric(str) {
  if (!str) return null;
  const s = str.toString().trim();
  const mM = s.match(/([\d,.]+)M/i);
  if (mM) return parseFloat(mM[1].replace(/,/g, "")) * 1_000_000;
  const mK = s.match(/([\d,.]+)k/i);
  if (mK) return parseFloat(mK[1].replace(/,/g, "")) * 1_000;
  const stripped = s.replace(/[^0-9.]/g, "");
  const n = parseFloat(stripped);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function getPlatformColor(platform) {
  const s = dashboardData.weekly.series;
  const key = Object.keys(s).find((k) => platform?.includes(k.replace(" / X", "/X").replace("/X", "")));
  return s[key]?.color || "#39cbf7";
}

// ── Hooks ─────────────────────────────────────────────────────────────────────
function useInView() {
  const [inView, setInView] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const id = requestAnimationFrame(() => setInView(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return [inView, ref];
}

function useCountUp(target, duration = 1300) {
  const [value, setValue] = useState(0);
  const [inView, ref] = useInView(0.15);
  useEffect(() => {
    if (!inView || !target) return;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - p) ** 3;
      setValue(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
      else setValue(target);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration]);
  return [value, ref];
}

// ── SVG path ─────────────────────────────────────────────────────────────────
function AnimatedPath({ d, color, strokeWidth = 2.5, ...rest }) {
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    />
  );
}

// ── Section banner ────────────────────────────────────────────────────────────
function SectionBanner({ icon: Icon, label, title, subtitle }) {
  const [inView, ref] = useInView(0.05);
  return (
    <div ref={ref} className={`section-banner${inView ? " visible" : ""}`}>
      <div className="section-banner-icon"><Icon size={20} /></div>
      <div className="section-banner-text">
        <span className="section-banner-label">{label}</span>
        <h2 className="section-banner-title">{title}</h2>
        {subtitle && <p className="section-banner-sub">{subtitle}</p>}
      </div>
    </div>
  );
}

function SectionTitle({ eyebrow, title, actions }) {
  return (
    <div className="section-title">
      <div>
        {eyebrow && <p>{eyebrow}</p>}
        <h3>{title}</h3>
      </div>
      {actions && <div className="actions">{actions}</div>}
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ item, index }) {
  const ICONS = [Users, TrendingUp, Eye, MessageSquare, Zap, Award];
  const Icon = ICONS[index % ICONS.length];

  const raw = item.value?.toString() || "";
  const target = parseNumeric(raw);
  const [count, ref] = useCountUp(target ?? 0, 1400);

  let displayValue = raw;
  if (target !== null && count > 0) {
    const prefix = raw.startsWith("+") ? "+" : raw.startsWith("-") ? "-" : "";
    if (raw.toUpperCase().includes("M") || target >= 1_000_000) {
      displayValue = `${prefix}${(count / 1_000_000).toFixed(1)}M`;
    } else {
      displayValue = `${prefix}${fmt.format(count)}`;
    }
  }

  return (
    <article className="stat-card" ref={ref}>
      <div className="stat-card-icon"><Icon size={15} /></div>
      <span>{item.label}</span>
      <strong>{displayValue}</strong>
      <small>{item.detail}</small>
    </article>
  );
}

// ── Data table ────────────────────────────────────────────────────────────────
function DataTable({ columns, rows }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>{columns.map((col) => <th key={col.key || col.label}>{col.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={`${row.platform || row.name || "row"}-${ri}`}>
              {columns.map((col) => (
                <td key={col.key || col.label}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Platform cell with icon ───────────────────────────────────────────────────
function PlatformCell({ platform }) {
  const color = getPlatformColor(platform);
  return (
    <span className="platform-cell" style={{ "--p-color": color }}>
      <span className="platform-badge" style={{ color }}><PlatformIcon platform={platform} size={13} /></span>
      {platform}
    </span>
  );
}

// ── Line chart with interactive tooltip ──────────────────────────────────────
function LineChart({ metric }) {
  const W = 920, H = 360;
  const pad = { l: 64, r: 22, t: 22, b: 52 };
  const weeks = dashboardData.weekly.weeks;
  const series = Object.entries(dashboardData.weekly.series).map(([platform, vals]) => ({
    platform, color: vals.color,
    values: vals[metric].map((v) => (v === null ? null : Number(v)))
  }));
  const allVals = series.flatMap((s) => s.values).filter((v) => v !== null && Number.isFinite(v));
  const min = metric === "engagement" ? 0 : Math.min(...allVals) * 0.96;
  const max = Math.max(...allVals) * 1.06;
  const x0 = pad.l, x1 = W - pad.r, y0 = H - pad.b, y1 = pad.t;

  const [hoverIdx, setHoverIdx] = useState(null);

  const wx = (i) => scale(i, 0, weeks.length - 1, x0, x1);
  const vy = (v) => scale(v, min, max, y0, y1);

  const MetricIcon = METRIC_ICONS[metric] || TrendingUp;

  return (
    <div className="chart-shell" style={{ position: "relative" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Evolución semanal de ${METRICS[metric]}`}
        style={{ cursor: "crosshair" }}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const relX = (e.clientX - rect.left) / rect.width * W;
          let nearest = 0, minD = Infinity;
          weeks.forEach((_, i) => { const d = Math.abs(wx(i) - relX); if (d < minD) { minD = d; nearest = i; } });
          setHoverIdx(nearest);
        }}
        onMouseLeave={() => setHoverIdx(null)}
      >
        {/* Grid lines + Y labels */}
        {[0, 1, 2, 3, 4].map((tick) => {
          const y = scale(tick, 0, 4, y0, y1);
          const val = scale(tick, 0, 4, min, max);
          return (
            <g key={tick}>
              <line x1={x0} x2={x1} y1={y} y2={y} className="grid-line" />
              <text x={x0 - 10} y={y + 4} textAnchor="end" className="axis-label">
                {metric === "engagement" ? percent(val) : compact(val)}
              </text>
            </g>
          );
        })}

        {/* Hover guide line */}
        {hoverIdx !== null && (
          <line
            x1={wx(hoverIdx)} x2={wx(hoverIdx)}
            y1={y1} y2={y0}
            stroke="#39cbf7" strokeWidth="1.5"
            strokeDasharray="4 4" opacity="0.5"
          />
        )}

        {/* Series */}
        {series.map((s, si) => {
          const points = s.values
            .map((v, i) => v === null ? null : { x: wx(i), y: vy(v) })
            .filter(Boolean);
          const last = points[points.length - 1];
          const hoverVal = hoverIdx !== null ? s.values[hoverIdx] : null;
          return (
            <g key={s.platform}>
              <AnimatedPath d={pathFor(points)} color={s.color} strokeWidth="2.5" />
              {last && <circle cx={last.x} cy={last.y} r="4" fill={s.color} stroke="#fff" strokeWidth="2" />}
              {hoverVal !== null && (
                <circle cx={wx(hoverIdx)} cy={vy(hoverVal)} r="7" fill={s.color} stroke="#fff" strokeWidth="2.5"
                  style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.22))", transition: "cy 0.1s" }} />
              )}
            </g>
          );
        })}

        {/* X axis labels */}
        {[0, Math.floor((weeks.length - 1) / 2), weeks.length - 1].map((i) => (
          <text key={i} x={wx(i)} y={H - 16} textAnchor="middle" className="axis-label">{weeks[i]}</text>
        ))}
      </svg>

      {/* Tooltip */}
      {hoverIdx !== null && (
        <div className="chart-tooltip" style={{ left: `${((wx(hoverIdx) / W) * 100).toFixed(1)}%` }}>
          <p className="tooltip-week"><MetricIcon size={12} /> {weeks[hoverIdx]}</p>
          {series.map((s) => {
            const v = s.values[hoverIdx];
            if (v === null) return null;
            return (
              <div key={s.platform} className="tooltip-row">
                <span className="tooltip-dot" style={{ background: s.color }} />
                <span className="tooltip-platform">{s.platform}</span>
                <strong className="tooltip-val">
                  {metric === "engagement" ? percent(v) : compact(v)}
                </strong>
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="legend">
        {series.map((s) => (
          <span key={s.platform}><b style={{ backgroundColor: s.color }} />{s.platform}</span>
        ))}
      </div>
    </div>
  );
}

// ── Bar chart — animated + interactive hover ──────────────────────────────────
function BarChart({ rows, valueKey, labelKey = "platform", highlight = "IMCO", suffix = "" }) {
  const [hoverIdx, setHoverIdx] = useState(null);
  const W = 820, H = 360;
  const pad = { l: 188, r: 108, t: 24, b: 24 };
  const values = rows.map((r) => Number(r[valueKey] || 0));
  const min = Math.min(0, ...values);
  const max = Math.max(...values) * 1.12 || 1;
  const barH = Math.max(26, (H - pad.t - pad.b - (rows.length - 1) * 14) / rows.length);

  const hoveredRow = hoverIdx !== null ? rows[hoverIdx] : null;
  const hoveredColor = hoveredRow
    ? (hoveredRow.name === highlight || hoveredRow.platform === highlight ? "#39cbf7" : hoveredRow.color || "#718096")
    : null;

  return (
    <div className="chart-shell compact-chart" style={{ position: "relative" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Gráfica de barras"
        style={{ cursor: "default" }}
        onMouseLeave={() => setHoverIdx(null)}
      >
        {rows.map((row, i) => {
          const raw = Number(row[valueKey] || 0);
          const y = pad.t + i * (barH + 14);
          const zeroX = scale(0, min, max, pad.l, W - pad.r);
          const valX = scale(raw, min, max, pad.l, W - pad.r);
          const x = Math.min(zeroX, valX);
          const fullW = Math.max(2, Math.abs(valX - zeroX));
          const isHighlight = row.name === highlight || row.platform === highlight;
          const isHovered = hoverIdx === i;
          const isDimmed = hoverIdx !== null && !isHovered;
          const color = isHighlight ? "#39cbf7" : (row.color || "#718096");

          const barTooNarrow = Math.abs(valX - zeroX) < 60;
          const labelX = barTooNarrow ? zeroX + 12 : (raw >= 0 ? valX + 12 : valX - 12);
          const labelAnchor = barTooNarrow ? "start" : (raw >= 0 ? "start" : "end");

          return (
            <g
              key={`${row[labelKey]}-${i}`}
              onMouseEnter={() => setHoverIdx(i)}
              style={{ cursor: "pointer" }}
            >
              {/* invisible hit-zone for smoother hover */}
              <rect x={pad.l - 16} y={y - 6} width={W - pad.l + 16} height={barH + 12} fill="transparent" />
              {/* hover highlight bg */}
              {isHovered && (
                <rect x={4} y={y - 6} width={W - 8} height={barH + 12} rx="7"
                  fill="rgba(8,127,122,0.07)" />
              )}
              <text
                x={pad.l - 14}
                y={y + barH * 0.65}
                textAnchor="end"
                className="bar-label"
                fontWeight={isHighlight || isHovered ? "700" : "500"}
                fill={isHighlight ? "#39cbf7" : isHovered ? "#17202f" : "#334155"}
                style={{ opacity: isDimmed ? 0.45 : 1, transition: "opacity 0.18s" }}
              >
                {row[labelKey]}
              </text>
              <rect
                x={x} y={y}
                width={fullW}
                height={barH}
                rx="6"
                fill={color}
                style={{
                  opacity: isDimmed ? 0.35 : 1,
                  filter: isHovered ? "brightness(1.15) drop-shadow(0 3px 10px rgba(0,0,0,0.2))" : "none",
                  transition: "opacity 0.18s, filter 0.18s",
                }}
              />
              <text
                x={labelX}
                y={y + barH * 0.65}
                textAnchor={labelAnchor}
                className="value-label"
                fontWeight={isHovered ? "800" : "650"}
                fill={isHovered ? "#17202f" : "#334155"}
                style={{
                  opacity: isDimmed ? 0.35 : 1,
                  transition: "opacity 0.18s",
                }}
              >
                {valueKey === "pct" ? percent(raw) : `${compact(raw)}${suffix}`}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {hoveredRow && (
        <div className="bar-tooltip">
          <span className="tooltip-dot" style={{ background: hoveredColor }} />
          <span className="bar-tooltip-label">{hoveredRow[labelKey]}</span>
          <strong className="bar-tooltip-val">
            {valueKey === "pct"
              ? percent(Number(hoveredRow[valueKey]))
              : `${compact(Number(hoveredRow[valueKey]))}${suffix}`}
          </strong>
        </div>
      )}
    </div>
  );
}

// ── Mini monthly chart ────────────────────────────────────────────────────────
function MiniMonthlyChart({ source, mode }) {
  const [inView, ref] = useInView(0.1);
  const [hoverIdx, setHoverIdx] = useState(null);
  const W = 680, H = 260;
  const pad = { l: 58, r: 18, t: 18, b: 42 };
  const all = source.rows.flatMap((r) => r.values).filter((v) => v !== null);
  const max = Math.max(...all, ...source.rows.map((r) => r.goal || 0)) * 1.14 || 1;
  const x0 = pad.l, x1 = W - pad.r, y0 = H - pad.b, y1 = pad.t;
  const validIndexes = source.months
    .map((_, i) => i)
    .filter((i) => source.rows.some((row) => row.values[i] !== null));
  const activeIdx = hoverIdx ?? validIndexes[validIndexes.length - 1] ?? 0;
  const activeMonth = source.months[activeIdx];
  const hoveredRows = source.rows
    .map((row) => ({ row, value: row.values[activeIdx] }))
    .filter(({ value }) => value !== null);
  const wx = (i) => scale(i, 0, source.months.length - 1, x0, x1);
  const vy = (v) => scale(v, 0, max, y0, y1);

  return (
    <div className="chart-shell mini" ref={ref} style={{ position: "relative" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={mode}
        style={{ cursor: validIndexes.length > 1 ? "crosshair" : "default" }}
        onMouseMove={(e) => {
          if (!validIndexes.length) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const relX = ((e.clientX - rect.left) / rect.width) * W;
          let nearest = validIndexes[0];
          let minD = Infinity;
          validIndexes.forEach((i) => {
            const d = Math.abs(wx(i) - relX);
            if (d < minD) {
              minD = d;
              nearest = i;
            }
          });
          setHoverIdx(nearest);
        }}
        onMouseLeave={() => setHoverIdx(null)}
      >
        {[0, 1, 2, 3].map((tick) => (
          <line key={tick} x1={x0} x2={x1}
            y1={scale(tick, 0, 3, y0, y1)} y2={scale(tick, 0, 3, y0, y1)}
            className="grid-line" />
        ))}
        {validIndexes.length > 0 && (
          <line
            x1={wx(activeIdx)}
            x2={wx(activeIdx)}
            y1={y1}
            y2={y0}
            stroke="#39cbf7"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.45"
          />
        )}
        {source.rows.map((row) => {
          const platform = row.platform.replace(" / X", "/X");
          const color = dashboardData.weekly.series[platform]?.color || "#334155";
          const points = row.values
            .map((v, i) => v === null ? null : {
              x: wx(i),
              y: vy(v)
            })
            .filter(Boolean);
          const activeValue = row.values[activeIdx];
          return (
            <g key={row.platform}>
              {points.length > 1 && (
                <AnimatedPath d={pathFor(points)} color={color} strokeWidth="2.2" />
              )}
              {points.map((point, i) => {
                const monthIdx = validIndexes[i];
                const isActive = monthIdx === activeIdx;
                return (
                  <circle
                    key={`${row.platform}-${monthIdx}`}
                    cx={point.x}
                    cy={point.y}
                    r={isActive ? 5.5 : 3.2}
                    fill={color}
                    stroke="#fff"
                    strokeWidth={isActive ? 2.2 : 1.6}
                    style={{
                      opacity: hoverIdx === null || isActive ? 1 : 0.82,
                      filter: isActive ? "drop-shadow(0 2px 6px rgba(0,0,0,0.22))" : "none",
                      transition: "r 0.14s, opacity 0.14s, cy 0.14s"
                    }}
                  />
                );
              })}
              {activeValue !== null && (
                <circle
                  cx={wx(activeIdx)}
                  cy={vy(activeValue)}
                  r="8"
                  fill={color}
                  opacity="0.12"
                />
              )}
            </g>
          );
        })}
        {source.months.map((m, i) => i % 2 === 0
          ? <text key={m} x={wx(i)} y={H - 14} textAnchor="middle" className="axis-label">{m}</text>
          : null
        )}
        <text x={x0 - 8} y={y1 + 4} textAnchor="end" className="axis-label">{compact(max)}</text>
        <text x={x0 - 8} y={y0 + 4} textAnchor="end" className="axis-label">0</text>
      </svg>
      {hoveredRows.length > 0 && (
        <div className="chart-tooltip mini-tooltip" style={{ left: `${((wx(activeIdx) / W) * 100).toFixed(1)}%` }}>
          <p className="tooltip-week">{activeMonth}</p>
          {hoveredRows.map(({ row, value }) => {
            const platform = row.platform.replace(" / X", "/X");
            const color = dashboardData.weekly.series[platform]?.color || "#334155";
            return (
              <div key={row.platform} className="tooltip-row">
                <span className="tooltip-dot" style={{ background: color }} />
                <span className="tooltip-platform">{row.platform}</span>
                <strong className="tooltip-val">{compact(value)}</strong>
              </div>
            );
          })}
        </div>
      )}
      <div className="legend mini-legend">
        {source.rows.map((row) => {
          const platform = row.platform.replace(" / X", "/X");
          const color = dashboardData.weekly.series[platform]?.color || "#334155";
          const isActive = hoveredRows.some(({ row: hoveredRow }) => hoveredRow.platform === row.platform);
          return (
            <span key={row.platform} style={{ opacity: isActive ? 1 : 0.7 }}>
              <b style={{ backgroundColor: color }} />
              {row.platform}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ── Fade-in wrapper ───────────────────────────────────────────────────────────
function FadeIn({ children, delay = 0 }) {
  const [inView, ref] = useInView(0.05);
  return (
    <div ref={ref} style={{
      opacity: 1,
      transform: inView ? "translateY(0)" : "translateY(12px)",
      transition: `transform 0.5s ease ${delay}s`
    }}>
      {children}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
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
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <header className="hero">
        <div className="hero-top">
          <div className="hero-signal">
            <Zap size={13} />
            <span>Señal clave</span>
            <p>Instagram y TikTok aceleran el crecimiento · Newsletter necesita atención</p>
          </div>
          <nav>
            <a href="#resumen"><LayoutDashboard size={13} />Resumen</a>
            <a href="#evolucion"><TrendingUp size={13} />Evolución</a>
            <a href="#metas"><Target size={13} />Metas</a>
            <a href="#sector"><Building2 size={13} />Sector</a>
          </nav>
        </div>
        <div className="hero-body">
          <p className="kicker">IMCO · Redes y Comunicación · 2026</p>
          <h1>Dashboard ejecutivo de crecimiento, alcance y desempeño por plataforma</h1>
          <p className="lead">Análisis del 29 de diciembre de 2025 al 10 de mayo de 2026 — 19 semanas de actividad y comparativo de think tanks.</p>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECCIÓN 1: RESUMEN */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <SectionBanner
        icon={LayoutDashboard}
        label="Sección 1"
        title="Resumen general"
        subtitle="Métricas clave, visión por plataforma y alertas del período"
      />

      <section id="resumen" className="stats-grid">
        {dashboardData.cards.map((item, i) => (
          <FadeIn key={item.label} delay={i * 0.06}>
            <StatCard item={item} index={i} />
          </FadeIn>
        ))}
      </section>

      <section className="split">
        <FadeIn delay={0.05}>
          <article className="panel executive-panel">
            <SectionTitle eyebrow="Lectura" title="Resumen ejecutivo" />
            <p>{dashboardData.analysis.executive}</p>
          </article>
        </FadeIn>
        <FadeIn delay={0.12}>
          <article className="panel alert-panel">
            <SectionTitle eyebrow="Alerta" title="Newsletter" />
            <p>{dashboardData.analysis.newsletterAlert}</p>
          </article>
        </FadeIn>
      </section>

      <FadeIn>
        <section className="panel">
          <SectionTitle eyebrow="Portafolio" title="Visión general por plataforma" />
          <DataTable
            rows={dashboardData.analysis.overview}
            columns={[
              { label: "Plataforma", render: (r) => <PlatformCell platform={r.platform} /> },
              { label: "Inicio", key: "start" },
              { label: "Fin", key: "end" },
              { label: "Crecimiento", key: "growth" },
              { label: "% crec.", key: "growthPct" },
              { label: "ER prom.", key: "er" }
            ]}
          />
        </section>
      </FadeIn>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECCIÓN 2: EVOLUCIÓN */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <SectionBanner
        icon={TrendingUp}
        label="Sección 2"
        title="Evolución temporal"
        subtitle="Tendencias semanales por métrica e impresiones acumuladas"
      />

      <section id="evolucion">
        <FadeIn>
          <article className="panel">
            <SectionTitle
              eyebrow="Semanal"
              title="Evolución por métrica"
              actions={
                <select value={metric} onChange={(e) => setMetric(e.target.value)} aria-label="Seleccionar métrica">
                  {Object.entries(METRICS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              }
            />
            <LineChart metric={metric} />
          </article>
        </FadeIn>
      </section>

      <FadeIn delay={0.05}>
        <section className="panel">
          <SectionTitle eyebrow="Acumulado · 19 semanas" title="Impresiones por plataforma" />
          <BarChart rows={sortedReach} valueKey="reach" />
        </section>
      </FadeIn>

      <section className="insights-grid">
        {dashboardData.analysis.findings.map((item, i) => {
          const color = getPlatformColor(item.platform);
          return (
            <FadeIn key={item.platform} delay={i * 0.07}>
              <article className="panel insight" style={{ "--insight-color": color, height: "100%" }}>
                <div className="insight-header">
                  <span className="insight-icon" style={{ color, background: `${color}18` }}>
                    <PlatformIcon platform={item.platform} size={15} />
                  </span>
                  <h3>{item.platform}</h3>
                </div>
                <p>{item.text}</p>
              </article>
            </FadeIn>
          );
        })}
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECCIÓN 3: METAS */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <SectionBanner
        icon={Target}
        label="Sección 3"
        title="Progreso hacia metas 2026"
        subtitle="Proyección de seguidores, alcance real vs. meta y tendencias mensuales"
      />

      <section id="metas" className="split">
        <FadeIn>
          <article className="panel">
            <SectionTitle eyebrow="Seguidores" title="Progreso hacia metas" />
            <DataTable
              rows={dashboardData.analysis.goals}
              columns={[
                { label: "Plataforma", render: (r) => <PlatformCell platform={r.platform} /> },
                { label: "Crec/sem", key: "weeklyGrowth" },
                { label: "Proy. 2026", key: "projection" },
                { label: "Meta", key: "goal" },
                {
                  label: "Cumple",
                  render: (r) => {
                    const ok = r.status.startsWith("Si") || r.status.startsWith("Sí");
                    return <span className={ok ? "pill ok" : "pill warn"}>{r.status}</span>;
                  }
                }
              ]}
            />
          </article>
        </FadeIn>
        <FadeIn delay={0.1}>
          <article className="panel">
            <SectionTitle eyebrow="Alcance" title="Real vs. meta proporcional" />
            <DataTable
              rows={dashboardData.analysis.reachGoals}
              columns={[
                { label: "Plataforma", render: (r) => <PlatformCell platform={r.platform} /> },
                { label: "19 semanas", key: "actual" },
                { label: "Meta acum.", key: "accGoal" },
                {
                  label: "% logro",
                  render: (r) => {
                    const pct = parseFloat(r.achievement) || 0;
                    const ok = pct >= 100;
                    return (
                      <div className="progress-cell">
                        <div className="progress-track">
                          <div className="progress-fill" style={{ width: `${Math.min(pct, 100)}%`, background: ok ? "#05724f" : "#b75f16" }} />
                        </div>
                        <span className={ok ? "pill ok" : "pill warn"}>{r.achievement}</span>
                      </div>
                    );
                  }
                }
              ]}
            />
          </article>
        </FadeIn>
      </section>

      <section className="split">
        <FadeIn>
          <article className="panel">
            <SectionTitle eyebrow="Mensual" title="Seguidores" />
            <MiniMonthlyChart source={dashboardData.followersMonthly} mode="Seguidores mensuales" />
          </article>
        </FadeIn>
        <FadeIn delay={0.1}>
          <article className="panel">
            <SectionTitle eyebrow="Mensual" title="Alcance 2026" />
            <MiniMonthlyChart source={dashboardData.reachTracking} mode="Alcance mensual" />
          </article>
        </FadeIn>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECCIÓN 4: ANÁLISIS COMPETITIVO */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <SectionBanner
        icon={Building2}
        label="Sección 4"
        title="Análisis competitivo"
        subtitle="Comparativo de IMCO frente a think tanks del sector"
      />

      <section id="sector" className="split wide-left">
        <FadeIn>
          <article className="panel">
            <SectionTitle
              eyebrow="Think tanks"
              title="Comparativo competitivo"
              actions={
                <select value={competitive} onChange={(e) => setCompetitive(e.target.value)} aria-label="Seleccionar red social">
                  {Object.keys(dashboardData.competitive).map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              }
            />
            <BarChart rows={competitiveRows} valueKey="pct" labelKey="name" />
          </article>
        </FadeIn>
        <FadeIn delay={0.1}>
          <article className="panel executive-panel">
            <SectionTitle eyebrow="Narrativa" title="Lectura competitiva" />
            <p>{dashboardData.analysis.competitive}</p>
          </article>
        </FadeIn>
      </section>

      <FadeIn>
        <section className="panel recommendations">
          <SectionTitle eyebrow="Acción" title="Observaciones y recomendaciones" />
          <ol className="rec-list">
            {dashboardData.analysis.recommendations.map((item, i) => (
              <li key={i} className="rec-item">
                <span className="rec-num">{i + 1}</span>
                <span className="rec-text">{item.replace(/^\d+\.\s*/, "")}</span>
              </li>
            ))}
          </ol>
        </section>
      </FadeIn>

      <footer>
        <span>Fuente: KPIs_Redes_Coms_Reporte_semanal_2026_analizado.xlsx</span>
        <span>Versión Next.js · Dashboard IMCO 2026</span>
      </footer>
    </main>
  );
}
