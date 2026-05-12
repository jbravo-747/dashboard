import json
import math
from pathlib import Path

import pandas as pd


BASE = Path(__file__).resolve().parent
EXCEL = BASE / "KPIs_Redes_Coms_Reporte_semanal_2026_analizado.xlsx"
OUT = BASE / "dashboard_imco.html"
DATA_OUT = BASE / "data" / "dashboard-data.json"

PLATFORMS = {
    "Facebook": {
        "followers": "Núm de seguidores",
        "reach": "Impresiones (views)",
        "interactions": "Interacciones (Reactions, comments and shares)",
        "color": "#2563eb",
    },
    "Twitter/X": {
        "source": "Twitter",
        "followers": "Followers totales",
        "reach": "Impresiones",
        "interactions": "Interacciones (Likes, shares and follows)",
        "color": "#111827",
    },
    "Instagram": {
        "followers": "Número de followers",
        "reach": "Impresiones (views)",
        "interactions": "Interacciones totales (likes)",
        "extra_reach": "Reel (views)",
        "color": "#db2777",
    },
    "LinkedIn": {
        "followers": "Total de seguidores",
        "reach": "Impresiones totales",
        "interactions": "Reacciones totales",
        "color": "#0f766e",
    },
    "TikTok": {
        "followers": "Número de seguidores",
        "reach": "Visualizaciones",
        "interactions": "Me gusta",
        "color": "#7c3aed",
    },
}


def clean_num(value):
    if pd.isna(value):
        return None
    if isinstance(value, str):
        value = value.replace(",", "").replace("+", "").replace("%", "").strip()
        if not value:
            return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def fmt_int(value):
    if value is None or (isinstance(value, float) and math.isnan(value)):
        return "N/D"
    return f"{int(round(value)):,}"


def fmt_pct(value, digits=1):
    if value is None or (isinstance(value, float) and math.isnan(value)):
        return "N/D"
    return f"{value:.{digits}f}%"


def rows_between(df, start, end=None):
    first = df.index[df.iloc[:, 0].eq(start)]
    if first.empty:
        return pd.DataFrame()
    start_i = first[0] + 1
    if end:
        last = df.index[df.iloc[:, 0].eq(end)]
        end_i = last[0] if not last.empty else len(df)
    else:
        end_i = len(df)
    return df.iloc[start_i:end_i]


def get_week_columns(df):
    cols = []
    for c in df.columns[1:]:
        name = str(c)
        if "Diferencia" in name or name.startswith("Unnamed"):
            continue
        cols.append(c)
    return cols


def row_values(df, label, cols):
    match = df.index[df.iloc[:, 0].astype(str).str.strip().eq(label)]
    if match.empty:
        return []
    row = df.loc[match[0], cols]
    return [clean_num(v) for v in row.tolist()]


def extract_analysis():
    raw = pd.read_excel(EXCEL, sheet_name="Análisis", header=None)
    lines = []
    for _, row in raw.iterrows():
        vals = [str(v).strip() for v in row.tolist() if pd.notna(v)]
        lines.append(vals)

    executive = lines[3][0]
    overview = []
    for row in lines[7:12]:
        overview.append(
            {
                "platform": row[0],
                "start": row[1],
                "end": row[2],
                "growth": row[3],
                "growthPct": row[4],
                "er": row[5],
            }
        )

    findings = []
    for row in lines[14:19]:
        findings.append({"platform": row[0], "text": row[1]})

    goal_rows = []
    for row in lines[23:28]:
        goal_rows.append(
            {
                "platform": row[0],
                "weeklyGrowth": row[1],
                "projection": row[2],
                "goal": row[3],
                "status": row[4],
            }
        )

    reach_goal_rows = []
    for row in lines[32:37]:
        reach_goal_rows.append(
            {
                "platform": row[0],
                "actual": row[1],
                "monthlyGoal": row[2],
                "accGoal": row[3],
                "achievement": row[4],
            }
        )

    recommendations = [lines[i][0] for i in range(96, 102) if i < len(lines) and lines[i]]
    newsletter_alert = lines[93][0]
    competitive = lines[73][0]

    return {
        "executive": executive,
        "overview": overview,
        "findings": findings,
        "goals": goal_rows,
        "reachGoals": reach_goal_rows,
        "recommendations": recommendations,
        "newsletterAlert": newsletter_alert,
        "competitive": competitive,
    }


def extract_weekly():
    df = pd.read_excel(EXCEL, sheet_name="Reporte semanal 2026")
    week_cols = get_week_columns(df)
    labels = [str(c) for c in week_cols]
    series = {}
    summaries = []

    for display, cfg in PLATFORMS.items():
        source = cfg.get("source", display)
        block = rows_between(df, source, next_platform_after(df, source))
        if block.empty:
            block = df

        followers = row_values(block, cfg["followers"], week_cols)
        reach = row_values(block, cfg["reach"], week_cols)
        if cfg.get("extra_reach"):
            extra = row_values(block, cfg["extra_reach"], week_cols)
            reach = [sum(v for v in pair if v is not None) or None for pair in zip(reach, extra)]
        interactions = row_values(block, cfg["interactions"], week_cols)
        engagement = [
            (i / r * 100) if i is not None and r and r > 0 else None
            for i, r in zip(interactions, reach)
        ]

        valid_followers = [v for v in followers if v is not None]
        valid_reach = [v for v in reach if v is not None]
        valid_interactions = [v for v in interactions if v is not None]
        valid_er = [v for v in engagement if v is not None]

        start = valid_followers[0] if valid_followers else None
        end = valid_followers[-1] if valid_followers else None
        growth = (end - start) if start is not None and end is not None else None
        growth_pct = (growth / start * 100) if start else None
        total_reach = sum(valid_reach)
        total_interactions = sum(valid_interactions)
        avg_er = sum(valid_er) / len(valid_er) if valid_er else None

        summaries.append(
            {
                "platform": display,
                "start": start,
                "end": end,
                "growth": growth,
                "growthPct": growth_pct,
                "reach": total_reach,
                "interactions": total_interactions,
                "er": avg_er,
                "color": cfg["color"],
            }
        )
        series[display] = {
            "followers": followers,
            "reach": reach,
            "interactions": interactions,
            "engagement": engagement,
            "color": cfg["color"],
        }

    return {"weeks": labels, "series": series, "summaries": summaries}


def next_platform_after(df, source):
    order = ["Facebook", "Twitter", "Instagram", "LinkedIn", "TikTok", "Youtube", "Newsletter"]
    try:
        pos = order.index(source)
    except ValueError:
        return None
    return order[pos + 1] if pos + 1 < len(order) else None


def extract_monthly_followers():
    df = pd.read_excel(EXCEL, sheet_name="Seguimiento seguidores")
    months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
    rows = df.iloc[:5]
    out = []
    for _, row in rows.iterrows():
        platform = row["Red social"]
        values = [clean_num(row.get(m)) for m in months]
        out.append({"platform": platform, "values": values})
    return {"months": months, "rows": out}


def extract_reach_tracking():
    df = pd.read_excel(EXCEL, sheet_name="Seguimiento alcance")
    months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
    rows = df.iloc[:5]
    out = []
    for _, row in rows.iterrows():
        platform = row["Red social"]
        values_2026 = [clean_num(row.get(m)) for m in months]
        goal = clean_num(row.get("Meta de alcance mensual"))
        out.append({"platform": platform, "goal": goal, "values": values_2026})
    return {"months": months, "rows": out}


def extract_competitive():
    df = pd.read_excel(EXCEL, sheet_name="Otros Think Tanks")
    date_cols = [c for c in df.columns if "Diferencia" not in str(c)]
    platforms = {}
    current = None
    for _, row in df.iterrows():
        first = row.iloc[0]
        second = row.iloc[1]
        if pd.isna(first) and isinstance(second, str):
            current = second.strip()
            platforms[current] = []
            continue
        if current and pd.notna(first):
            start = clean_num(row.get("20 de enero"))
            end = clean_num(row.get("30 de marzo"))
            if start is not None and end is not None:
                change = end - start
                pct = change / start * 100 if start else None
                platforms[current].append(
                    {
                        "name": str(first).strip(),
                        "start": start,
                        "end": end,
                        "change": change,
                        "pct": pct,
                    }
                )
    return platforms


def build_data():
    weekly = extract_weekly()
    total_followers = sum(s["end"] or 0 for s in weekly["summaries"])
    total_growth = sum(s["growth"] or 0 for s in weekly["summaries"])
    total_reach = sum(s["reach"] or 0 for s in weekly["summaries"])
    total_interactions = sum(s["interactions"] or 0 for s in weekly["summaries"])
    top_growth = max(weekly["summaries"], key=lambda x: x["growthPct"] or -999)
    top_er = max(weekly["summaries"], key=lambda x: x["er"] or -999)

    return {
        "analysis": extract_analysis(),
        "weekly": weekly,
        "followersMonthly": extract_monthly_followers(),
        "reachTracking": extract_reach_tracking(),
        "competitive": extract_competitive(),
        "cards": [
            {"label": "Seguidores actuales", "value": fmt_int(total_followers), "detail": "5 redes principales"},
            {"label": "Crecimiento neto", "value": f"+{fmt_int(total_growth)}", "detail": "29 dic 2025 a 10 may 2026"},
            {"label": "Impresiones acumuladas", "value": fmt_int(total_reach), "detail": "aprox. 19 semanas"},
            {"label": "Interacciones", "value": fmt_int(total_interactions), "detail": "interacciones / reacciones / likes"},
            {"label": "Mayor crecimiento", "value": top_growth["platform"], "detail": fmt_pct(top_growth["growthPct"])},
            {"label": "Mayor engagement", "value": top_er["platform"], "detail": fmt_pct(top_er["er"])},
        ],
    }


HTML = """<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Dashboard IMCO · Redes y Comunicación 2026</title>
  <style>
    :root {
      --bg: #f6f7fb;
      --panel: #ffffff;
      --text: #172033;
      --muted: #64748b;
      --line: #d9e0ea;
      --accent: #0f766e;
      --accent-2: #c2410c;
      --shadow: 0 10px 30px rgba(15, 23, 42, .07);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    * { box-sizing: border-box; }
    body { margin: 0; background: var(--bg); color: var(--text); }
    header {
      padding: 22px 28px 14px;
      background: #ffffff;
      border-bottom: 1px solid var(--line);
      position: sticky;
      top: 0;
      z-index: 5;
    }
    .topbar { display: flex; gap: 18px; align-items: center; justify-content: space-between; flex-wrap: wrap; }
    h1 { margin: 0; font-size: 24px; line-height: 1.15; letter-spacing: 0; }
    .subtitle { margin: 6px 0 0; color: var(--muted); font-size: 14px; }
    nav { display: flex; gap: 8px; flex-wrap: wrap; }
    nav a {
      color: var(--text);
      text-decoration: none;
      border: 1px solid var(--line);
      padding: 8px 10px;
      border-radius: 8px;
      font-size: 13px;
      background: #fff;
    }
    main { padding: 24px 28px 38px; max-width: 1480px; margin: 0 auto; }
    section { margin-bottom: 28px; }
    h2 { font-size: 18px; margin: 0 0 14px; letter-spacing: 0; }
    .grid { display: grid; gap: 14px; }
    .cards { grid-template-columns: repeat(6, minmax(150px, 1fr)); }
    .two { grid-template-columns: minmax(0, 1.2fr) minmax(360px, .8fr); }
    .three { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .card, .panel {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      box-shadow: var(--shadow);
    }
    .card { padding: 14px; min-height: 104px; display: flex; flex-direction: column; justify-content: space-between; }
    .card span { color: var(--muted); font-size: 12px; text-transform: uppercase; letter-spacing: .06em; }
    .card strong { font-size: 26px; line-height: 1.1; margin-top: 8px; }
    .card em { color: var(--muted); font-style: normal; font-size: 13px; margin-top: 8px; }
    .panel { padding: 18px; min-width: 0; }
    .executive { font-size: 15px; line-height: 1.55; margin: 0; color: #273449; }
    .toolbar { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-bottom: 12px; }
    select, button {
      font: inherit;
      border: 1px solid var(--line);
      background: #fff;
      color: var(--text);
      border-radius: 8px;
      padding: 8px 10px;
      min-height: 38px;
    }
    button { cursor: pointer; }
    button.active { background: var(--text); color: #fff; border-color: var(--text); }
    .chart { width: 100%; height: 330px; display: block; }
    .chart.small { height: 250px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { text-align: left; padding: 10px 8px; border-bottom: 1px solid var(--line); vertical-align: top; }
    th { color: var(--muted); font-size: 12px; text-transform: uppercase; letter-spacing: .05em; }
    tbody tr:hover { background: #f8fafc; }
    .pill { display: inline-flex; align-items: center; min-height: 24px; padding: 3px 8px; border-radius: 999px; background: #eef2ff; color: #3730a3; font-size: 12px; }
    .warn { background: #fff7ed; border-color: #fed7aa; color: #9a3412; }
    .ok { background: #ecfdf5; color: #047857; }
    .findings { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; }
    .finding { border-left: 4px solid var(--accent); padding: 0 0 0 12px; min-height: 150px; }
    .finding h3 { margin: 0 0 8px; font-size: 15px; }
    .finding p { margin: 0; color: #475569; font-size: 13px; line-height: 1.45; }
    .recs { margin: 0; padding-left: 18px; color: #334155; line-height: 1.5; }
    .recs li { margin: 8px 0; }
    .legend { display: flex; gap: 12px; flex-wrap: wrap; color: var(--muted); font-size: 12px; }
    .dot { width: 10px; height: 10px; display: inline-block; border-radius: 50%; margin-right: 6px; }
    footer { color: var(--muted); font-size: 12px; padding-top: 8px; }
    @media (max-width: 1180px) {
      .cards { grid-template-columns: repeat(3, minmax(160px, 1fr)); }
      .two, .three, .findings { grid-template-columns: 1fr; }
    }
    @media (max-width: 720px) {
      header, main { padding-left: 16px; padding-right: 16px; }
      .cards { grid-template-columns: 1fr 1fr; }
      .card strong { font-size: 22px; }
      h1 { font-size: 21px; }
      table { font-size: 12px; }
      th, td { padding: 8px 6px; }
    }
  </style>
</head>
<body>
  <header>
    <div class="topbar">
      <div>
        <h1>Dashboard IMCO · Redes y Comunicación 2026</h1>
        <p class="subtitle">Análisis del 29 de diciembre de 2025 al 10 de mayo de 2026 · 19 semanas</p>
      </div>
      <nav>
        <a href="#resumen">Resumen</a>
        <a href="#evolucion">Evolución</a>
        <a href="#metas">Metas</a>
        <a href="#sector">Sector</a>
        <a href="#recomendaciones">Recomendaciones</a>
      </nav>
    </div>
  </header>
  <main>
    <section id="resumen">
      <div class="grid cards" id="cards"></div>
    </section>

    <section class="grid two">
      <div class="panel">
        <h2>Lectura Ejecutiva</h2>
        <p class="executive" id="executive"></p>
      </div>
      <div class="panel warn">
        <h2>Alerta Newsletter</h2>
        <p class="executive" id="newsletterAlert"></p>
      </div>
    </section>

    <section>
      <h2>Visión General Por Plataforma</h2>
      <div class="panel">
        <table id="overview"></table>
      </div>
    </section>

    <section id="evolucion" class="grid two">
      <div class="panel">
        <div class="toolbar">
          <h2 style="margin-right:auto;margin-bottom:0">Evolución Semanal</h2>
          <select id="metricSelect">
            <option value="followers">Seguidores</option>
            <option value="reach">Impresiones / visualizaciones</option>
            <option value="interactions">Interacciones</option>
            <option value="engagement">Engagement estimado</option>
          </select>
        </div>
        <svg class="chart" id="lineChart" role="img" aria-label="Evolución semanal por plataforma"></svg>
        <div class="legend" id="lineLegend"></div>
      </div>
      <div class="panel">
        <h2>Impresiones Acumuladas</h2>
        <svg class="chart" id="barChart" role="img" aria-label="Impresiones acumuladas por plataforma"></svg>
      </div>
    </section>

    <section class="findings" id="findings"></section>

    <section id="metas" class="grid two">
      <div class="panel">
        <h2>Progreso Hacia Metas De Seguidores</h2>
        <table id="goals"></table>
      </div>
      <div class="panel">
        <h2>Alcance Real Vs Meta Proporcional</h2>
        <table id="reachGoals"></table>
      </div>
    </section>

    <section class="grid two">
      <div class="panel">
        <h2>Seguimiento Mensual De Seguidores</h2>
        <svg class="chart small" id="monthlyFollowers"></svg>
      </div>
      <div class="panel">
        <h2>Alcance 2026 Vs Meta Mensual</h2>
        <svg class="chart small" id="monthlyReach"></svg>
      </div>
    </section>

    <section id="sector" class="grid two">
      <div class="panel">
        <div class="toolbar">
          <h2 style="margin-right:auto;margin-bottom:0">Comparativo Sector Think Tank</h2>
          <select id="competitiveSelect"></select>
        </div>
        <svg class="chart small" id="competitiveChart"></svg>
      </div>
      <div class="panel">
        <h2>Lectura Competitiva</h2>
        <p class="executive" id="competitiveText"></p>
      </div>
    </section>

    <section id="recomendaciones">
      <div class="panel">
        <h2>Observaciones Y Recomendaciones</h2>
        <ol class="recs" id="recommendations"></ol>
      </div>
    </section>
    <footer>Fuente: KPIs_Redes_Coms_Reporte_semanal_2026_analizado.xlsx. Dashboard generado localmente.</footer>
  </main>

  <script id="dashboard-data" type="application/json">__DATA__</script>
  <script>
    const data = JSON.parse(document.getElementById('dashboard-data').textContent);
    const $ = (id) => document.getElementById(id);
    const fmt = new Intl.NumberFormat('es-MX');
    const colors = Object.fromEntries(data.weekly.summaries.map(d => [d.platform, d.color]));

    function n(v) { return v === null || Number.isNaN(v) ? 'N/D' : fmt.format(Math.round(v)); }
    function pct(v) { return v === null || Number.isNaN(v) ? 'N/D' : v.toFixed(1) + '%'; }
    function esc(v) { return String(v ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

    function renderCards() {
      $('cards').innerHTML = data.cards.map(c => `<div class="card"><span>${esc(c.label)}</span><strong>${esc(c.value)}</strong><em>${esc(c.detail)}</em></div>`).join('');
      $('executive').textContent = data.analysis.executive;
      $('newsletterAlert').textContent = data.analysis.newsletterAlert;
      $('competitiveText').textContent = data.analysis.competitive;
    }

    function renderTable(id, columns, rows) {
      const thead = `<thead><tr>${columns.map(c => `<th>${esc(c.label)}</th>`).join('')}</tr></thead>`;
      const tbody = `<tbody>${rows.map(row => `<tr>${columns.map(c => `<td>${c.render ? c.render(row) : esc(row[c.key])}</td>`).join('')}</tr>`).join('')}</tbody>`;
      $(id).innerHTML = thead + tbody;
    }

    function renderOverview() {
      renderTable('overview', [
        {label:'Plataforma', key:'platform'},
        {label:'Inicio', key:'start'},
        {label:'Fin', key:'end'},
        {label:'Crecimiento', key:'growth'},
        {label:'% crec.', key:'growthPct'},
        {label:'ER prom.', key:'er'}
      ], data.analysis.overview);
    }

    function chartBox(svg) {
      const w = svg.clientWidth || 800;
      const h = svg.clientHeight || 320;
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      svg.innerHTML = '';
      return {w,h,p:{l:54,r:18,t:18,b:44}};
    }

    function scale(value, inMin, inMax, outMin, outMax) {
      if (inMax === inMin) return (outMin + outMax) / 2;
      return outMin + (value - inMin) * (outMax - outMin) / (inMax - inMin);
    }

    function linePath(points) {
      return points.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    }

    function addText(svg, x, y, text, anchor='start', size=11, fill='#64748b') {
      const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t.setAttribute('x', x); t.setAttribute('y', y); t.setAttribute('text-anchor', anchor);
      t.setAttribute('font-size', size); t.setAttribute('fill', fill); t.textContent = text;
      svg.appendChild(t);
      return t;
    }

    function renderLineChart() {
      const metric = $('metricSelect').value;
      const svg = $('lineChart');
      const {w,h,p} = chartBox(svg);
      const weeks = data.weekly.weeks;
      const series = Object.entries(data.weekly.series).map(([platform, values]) => ({platform, values: values[metric].map(v => v === null ? null : Number(v))}));
      const all = series.flatMap(s => s.values).filter(v => v !== null && Number.isFinite(v));
      const min = metric === 'engagement' ? 0 : Math.min(...all) * .96;
      const max = Math.max(...all) * 1.06;
      const x0 = p.l, x1 = w - p.r, y0 = h - p.b, y1 = p.t;
      for (let i=0;i<5;i++) {
        const y = scale(i, 0, 4, y0, y1);
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x0); line.setAttribute('x2', x1); line.setAttribute('y1', y); line.setAttribute('y2', y);
        line.setAttribute('stroke', '#e5e7eb'); svg.appendChild(line);
        const val = scale(i, 0, 4, min, max);
        addText(svg, x0-8, y+4, metric === 'engagement' ? pct(val) : compact(val), 'end');
      }
      series.forEach(s => {
        const pts = s.values.map((v,i) => v === null ? null : ({x: scale(i,0,weeks.length-1,x0,x1), y: scale(v,min,max,y0,y1)})).filter(Boolean);
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', linePath(pts)); path.setAttribute('fill', 'none'); path.setAttribute('stroke', colors[s.platform] || '#334155');
        path.setAttribute('stroke-width', 2.6); path.setAttribute('stroke-linecap', 'round'); path.setAttribute('stroke-linejoin', 'round');
        svg.appendChild(path);
      });
      [0, Math.floor((weeks.length-1)/2), weeks.length-1].forEach(i => addText(svg, scale(i,0,weeks.length-1,x0,x1), h-16, weeks[i], 'middle', 10));
      $('lineLegend').innerHTML = series.map(s => `<span><i class="dot" style="background:${colors[s.platform]}"></i>${esc(s.platform)}</span>`).join('');
    }

    function compact(v) {
      if (Math.abs(v) >= 1000000) return (v/1000000).toFixed(1) + 'M';
      if (Math.abs(v) >= 1000) return (v/1000).toFixed(0) + 'k';
      return Math.round(v);
    }

    function renderBarChart(svgId, rows, valueKey, labelKey='platform', colorFn=null) {
      const svg = $(svgId);
      const {w,h,p} = chartBox(svg);
      const vals = rows.map(r => Number(r[valueKey] ?? 0));
      const max = Math.max(...vals) * 1.12;
      const gap = 12;
      const barH = Math.max(22, (h - p.t - p.b - gap*(rows.length-1)) / rows.length);
      rows.forEach((r,i) => {
        const y = p.t + i*(barH+gap);
        const bw = scale(Number(r[valueKey] || 0), 0, max, 0, w-p.l-p.r-86);
        const rect = document.createElementNS('http://www.w3.org/2000/svg','rect');
        rect.setAttribute('x', p.l); rect.setAttribute('y', y); rect.setAttribute('width', bw); rect.setAttribute('height', barH);
        rect.setAttribute('rx', 5); rect.setAttribute('fill', colorFn ? colorFn(r, i) : (r.color || colors[r.platform] || '#0f766e'));
        svg.appendChild(rect);
        addText(svg, p.l-8, y+barH*.65, r[labelKey], 'end', 11, '#334155');
        addText(svg, p.l+bw+8, y+barH*.65, compact(Number(r[valueKey] || 0)), 'start', 11, '#334155');
      });
    }

    function renderBars() {
      renderBarChart('barChart', [...data.weekly.summaries].sort((a,b) => b.reach-a.reach), 'reach');
    }

    function renderFindings() {
      $('findings').innerHTML = data.analysis.findings.map(f => `<div class="panel finding"><h3>${esc(f.platform)}</h3><p>${esc(f.text)}</p></div>`).join('');
    }

    function renderGoals() {
      renderTable('goals', [
        {label:'Plataforma', key:'platform'},
        {label:'Crec/sem', key:'weeklyGrowth'},
        {label:'Proy. fin 2026', key:'projection'},
        {label:'Meta', key:'goal'},
        {label:'Cumple', render:r => `<span class="pill ${r.status.startsWith('Sí') ? 'ok' : 'warn'}">${esc(r.status)}</span>`}
      ], data.analysis.goals);
      renderTable('reachGoals', [
        {label:'Plataforma', key:'platform'},
        {label:'19 semanas', key:'actual'},
        {label:'Meta mensual', key:'monthlyGoal'},
        {label:'Meta acum.', key:'accGoal'},
        {label:'% logro', render:r => `<span class="pill ${parseFloat(r.achievement) >= 100 ? 'ok' : 'warn'}">${esc(r.achievement)}</span>`}
      ], data.analysis.reachGoals);
    }

    function renderMonthly(svgId, source, mode) {
      const svg = $(svgId);
      const {w,h,p} = chartBox(svg);
      const months = source.months;
      const rows = source.rows;
      const all = rows.flatMap(r => r.values).filter(v => v !== null);
      const max = Math.max(...all) * 1.12;
      const x0=p.l, x1=w-p.r, y0=h-p.b, y1=p.t;
      rows.forEach(r => {
        const pts = r.values.map((v,i) => v === null ? null : ({x:scale(i,0,months.length-1,x0,x1),y:scale(v,0,max,y0,y1)})).filter(Boolean);
        if (pts.length < 2) return;
        const path = document.createElementNS('http://www.w3.org/2000/svg','path');
        path.setAttribute('d', linePath(pts)); path.setAttribute('fill','none'); path.setAttribute('stroke', colors[r.platform] || '#334155'); path.setAttribute('stroke-width',2.4);
        svg.appendChild(path);
      });
      months.forEach((m,i) => { if (i % 2 === 0) addText(svg, scale(i,0,months.length-1,x0,x1), h-16, m, 'middle', 10); });
      addText(svg, x0-8, y1+4, compact(max), 'end');
      addText(svg, x0-8, y0+4, '0', 'end');
    }

    function renderCompetitive() {
      const sel = $('competitiveSelect');
      const names = Object.keys(data.competitive);
      sel.innerHTML = names.map(n => `<option value="${esc(n)}">${esc(n)}</option>`).join('');
      const draw = () => renderBarChart('competitiveChart', [...data.competitive[sel.value]].sort((a,b) => b.pct-a.pct), 'pct', 'name', r => r.name === 'IMCO' ? '#0f766e' : '#94a3b8');
      sel.addEventListener('change', draw);
      draw();
    }

    function renderRecommendations() {
      $('recommendations').innerHTML = data.analysis.recommendations.map(r => `<li>${esc(r)}</li>`).join('');
    }

    renderCards();
    renderOverview();
    renderLineChart();
    renderBars();
    renderFindings();
    renderGoals();
    renderMonthly('monthlyFollowers', data.followersMonthly);
    renderMonthly('monthlyReach', data.reachTracking);
    renderCompetitive();
    renderRecommendations();
    $('metricSelect').addEventListener('change', renderLineChart);
    window.addEventListener('resize', () => {
      renderLineChart(); renderBars(); renderMonthly('monthlyFollowers', data.followersMonthly); renderMonthly('monthlyReach', data.reachTracking); renderCompetitive();
    });
  </script>
</body>
</html>
"""


def main():
    data = build_data()
    DATA_OUT.parent.mkdir(exist_ok=True)
    DATA_OUT.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    OUT.write_text(HTML.replace("__DATA__", json.dumps(data, ensure_ascii=False)), encoding="utf-8")
    print(f"Dashboard creado: {OUT}")
    print(f"Datos Next.js creados: {DATA_OUT}")


if __name__ == "__main__":
    main()
