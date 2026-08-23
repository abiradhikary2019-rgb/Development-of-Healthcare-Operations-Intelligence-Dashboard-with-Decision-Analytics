import React, { useState, useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, LabelList
} from "recharts";
import {
  Activity, Users, Clock, DollarSign, Stethoscope, FlaskConical,
  ShieldCheck, ChevronDown, HeartPulse
} from "lucide-react";

const C = {
  bg: "#0A1420",
  panel: "#101D2E",
  panel2: "#0D1826",
  border: "#1E3348",
  borderSoft: "#16273A",
  teal: "#2DD4BF",
  tealDim: "#134E48",
  amber: "#F5A623",
  amberDim: "#4A3410",
  coral: "#E8604C",
  coralDim: "#4A211A",
  blue: "#5B9BD5",
  violet: "#9B8CF2",
  text: "#E8EEF3",
  textMid: "#93A5B8",
  textDim: "#5B6C7E",
};

/* ---- Aggregated from 1787466187910_healthcare_dataset.csv: 10,000 patient records, Oct 2018 - Oct 2023 ---- */

const MONTHLY_ADMISSIONS = [
  { m: "Nov 21", n: 183 }, { m: "Dec 21", n: 180 }, { m: "Jan 22", n: 162 }, { m: "Feb 22", n: 167 },
  { m: "Mar 22", n: 178 }, { m: "Apr 22", n: 171 }, { m: "May 22", n: 156 }, { m: "Jun 22", n: 174 },
  { m: "Jul 22", n: 151 }, { m: "Aug 22", n: 151 }, { m: "Sep 22", n: 175 }, { m: "Oct 22", n: 207 },
  { m: "Nov 22", n: 150 }, { m: "Dec 22", n: 159 }, { m: "Jan 23", n: 164 }, { m: "Feb 23", n: 150 },
  { m: "Mar 23", n: 161 }, { m: "Apr 23", n: 150 }, { m: "May 23", n: 157 }, { m: "Jun 23", n: 146 },
  { m: "Jul 23", n: 173 }, { m: "Aug 23", n: 186 }, { m: "Sep 23", n: 155 }, { m: "Oct 23", n: 174 },
];

const CONDITIONS = [
  { name: "Diabetes", count: 1623, avgBilling: 26060, avgLOS: 15.6, abnormalRate: 33.1 },
  { name: "Obesity", count: 1628, avgBilling: 25721, avgLOS: 15.4, abnormalRate: 34.5 },
  { name: "Asthma", count: 1708, avgBilling: 25417, avgLOS: 15.5, abnormalRate: 36.5 },
  { name: "Cancer", count: 1703, avgBilling: 25539, avgLOS: 15.5, abnormalRate: 33.9 },
  { name: "Hypertension", count: 1688, avgBilling: 25198, avgLOS: 15.4, abnormalRate: 35.7 },
  { name: "Arthritis", count: 1650, avgBilling: 25188, avgLOS: 16.0, abnormalRate: 33.6 },
];

const ADMISSION_TYPES = [
  { name: "Urgent", count: 3391, avgBilling: 25961 },
  { name: "Emergency", count: 3367, avgBilling: 24709 },
  { name: "Elective", count: 3242, avgBilling: 25892 },
];

const AGE_GROUPS = [
  { name: "18–29", count: 1903 },
  { name: "30–44", count: 2211 },
  { name: "45–59", count: 2225 },
  { name: "60–74", count: 2215 },
  { name: "75+", count: 1446 },
];

const TEST_RESULTS = [
  { name: "Abnormal", value: 3456, color: C.coral },
  { name: "Inconclusive", value: 3277, color: C.amber },
  { name: "Normal", value: 3267, color: C.teal },
];

const INSURANCE = [
  { name: "Cigna", count: 2040, avgBilling: 25657 },
  { name: "Blue Cross", count: 2032, avgBilling: 25653 },
  { name: "Aetna", count: 2025, avgBilling: 25838 },
  { name: "UnitedHealthcare", count: 1978, avgBilling: 25405 },
  { name: "Medicare", count: 1925, avgBilling: 25003 },
];

function fmtCurrency(v) { return `$${Math.round(v).toLocaleString()}`; }

function CustomTooltip({ active, payload, label, unit = "" }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 12px",
      fontSize: 12, color: C.text, fontFamily: "'JetBrains Mono', monospace"
    }}>
      <div style={{ color: C.textMid, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || p.fill, display: "flex", gap: 8, justifyContent: "space-between" }}>
          <span>{p.name}</span><span>{p.value}{unit}</span>
        </div>
      ))}
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px", flex: "1 1 150px", minWidth: 150, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: accent }} />
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, marginLeft: 4 }}>
        <Icon size={15} color={accent} />
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12.5, letterSpacing: "0.06em", textTransform: "uppercase", color: C.textMid }}>{label}</span>
      </div>
      <div style={{ marginLeft: 4, fontFamily: "'JetBrains Mono', monospace", fontSize: 26, fontWeight: 600, color: C.text }}>{value}</div>
      {sub && <div style={{ marginLeft: 4, marginTop: 4, fontSize: 11.5, color: C.textDim }}>{sub}</div>}
    </div>
  );
}

export default function HealthcareDashboard() {
  const [conditionFilter, setConditionFilter] = useState("All conditions");
  const options = ["All conditions", ...CONDITIONS.map((c) => c.name)];

  const activeConditions = useMemo(
    () => conditionFilter === "All conditions" ? CONDITIONS : CONDITIONS.filter((c) => c.name === conditionFilter),
    [conditionFilter]
  );

  const totalPatients = CONDITIONS.reduce((s, c) => s + c.count, 0);
  const totalAbnormal = TEST_RESULTS.find((t) => t.name === "Abnormal").value;
  const totalTests = TEST_RESULTS.reduce((s, t) => s + t.value, 0);

  return (
    <div style={{ background: C.bg, color: C.text, minHeight: "100vh", fontFamily: "'Inter', sans-serif", padding: "24px 28px 40px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        select.hd { background: ${C.panel2}; color: ${C.text}; border: 1px solid ${C.border}; border-radius: 6px;
          padding: 7px 30px 7px 12px; font-size: 13px; font-family: 'Inter', sans-serif; appearance: none; cursor: pointer; outline: none; }
        select.hd:focus { border-color: ${C.teal}; }
        .ptitle { font-family: 'Barlow Condensed', sans-serif; font-size: 15px; font-weight: 600; letter-spacing: 0.03em; text-transform: uppercase; color: ${C.textMid}; }
        table.pt { width: 100%; border-collapse: collapse; font-size: 13px; }
        table.pt th { text-align: left; font-family: 'Barlow Condensed', sans-serif; font-size: 12px; letter-spacing: 0.05em;
          text-transform: uppercase; color: ${C.textDim}; padding: 8px 12px; border-bottom: 1px solid ${C.border}; font-weight: 600; }
        table.pt td { padding: 10px 12px; border-bottom: 1px solid ${C.borderSoft}; color: ${C.text}; }
        table.pt tr:last-child td { border-bottom: none; }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <HeartPulse size={22} color={C.teal} />
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 26, margin: 0, textTransform: "uppercase", letterSpacing: "0.02em" }}>
              Healthcare Patient Analytics
            </h1>
          </div>
          <p style={{ color: C.textMid, fontSize: 13, margin: "6px 0 0 32px" }}>
            10,000 patient records · admissions Oct 2018 – Oct 2023
          </p>
        </div>
        <div style={{ position: "relative" }}>
          <select className="hd" value={conditionFilter} onChange={(e) => setConditionFilter(e.target.value)}>
            {options.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          <ChevronDown size={14} color={C.textMid} style={{ position: "absolute", right: 10, top: 9, pointerEvents: "none" }} />
        </div>
      </div>

      {/* KPI Row */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <KpiCard icon={Users} label="Total patients" value="10,000" sub="Oct 2018 – Oct 2023" accent={C.blue} />
        <KpiCard icon={Clock} label="Avg length of stay" value="15.6d" sub="range 1–30 days" accent={C.teal} />
        <KpiCard icon={DollarSign} label="Avg billing amount" value="$25,517" sub="per admission" accent={C.amber} />
        <KpiCard icon={Stethoscope} label="Avg patient age" value="51.5" sub="range 18–85 years" accent={C.violet} />
        <KpiCard icon={FlaskConical} label="Abnormal test rate" value={`${((totalAbnormal / totalTests) * 100).toFixed(1)}%`} sub={`${totalAbnormal.toLocaleString()} of ${totalTests.toLocaleString()} tests`} accent={C.coral} />
        <KpiCard icon={ShieldCheck} label="Insurance providers" value="5" sub="Cigna leads at 20.4% share" accent={C.blue} />
      </div>

      {/* Row: Admissions trend + Test results */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 18px" }}>
          <div className="ptitle" style={{ marginBottom: 14 }}>Monthly admissions — last 24 months</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={MONTHLY_ADMISSIONS} margin={{ left: -10, right: 10, top: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="admFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.teal} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={C.teal} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={C.borderSoft} vertical={false} />
              <XAxis dataKey="m" tick={{ fill: C.textDim, fontSize: 10.5 }} axisLine={{ stroke: C.border }} tickLine={false} interval={2} />
              <YAxis tick={{ fill: C.textDim, fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="n" name="Admissions" stroke={C.teal} strokeWidth={2} fill="url(#admFill)" />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ fontSize: 11, color: C.textDim, marginTop: 4 }}>Admissions run steady month to month, with a mild peak in October each year.</div>
        </div>

        <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 18px" }}>
          <div className="ptitle" style={{ marginBottom: 14 }}>Diagnostic test outcomes</div>
          <ResponsiveContainer width="100%" height={190}>
            <PieChart>
              <Pie data={TEST_RESULTS} dataKey="value" nameKey="name" innerRadius={50} outerRadius={78} paddingAngle={3}>
                {TEST_RESULTS.map((t, i) => <Cell key={i} fill={t.color} stroke={C.panel} strokeWidth={2} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
            {TEST_RESULTS.map((t, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6, color: C.textMid }}>
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: t.color, display: "inline-block" }} />{t.name}
                </span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", color: C.text }}>{t.value.toLocaleString()} ({((t.value / totalTests) * 100).toFixed(1)}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row: Admission type + Age groups */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 18px" }}>
          <div className="ptitle" style={{ marginBottom: 14 }}>Admission type — volume &amp; avg billing</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ADMISSION_TYPES} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
              <CartesianGrid stroke={C.borderSoft} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: C.textDim, fontSize: 11.5 }} axisLine={{ stroke: C.border }} tickLine={false} />
              <YAxis tick={{ fill: C.textDim, fontSize: 11 }} axisLine={false} tickLine={false} width={34} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: C.borderSoft }} />
              <Bar dataKey="count" name="Patients" fill={C.blue} radius={[4, 4, 0, 0]} barSize={46}>
                <LabelList dataKey="count" position="top" style={{ fill: C.textMid, fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 16, fontSize: 11.5, color: C.textDim, marginTop: 4 }}>
            {ADMISSION_TYPES.map((a) => <span key={a.name}>{a.name}: {fmtCurrency(a.avgBilling)} avg</span>)}
          </div>
        </div>

        <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 18px" }}>
          <div className="ptitle" style={{ marginBottom: 14 }}>Patients by age group</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={AGE_GROUPS} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
              <CartesianGrid stroke={C.borderSoft} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: C.textDim, fontSize: 11.5 }} axisLine={{ stroke: C.border }} tickLine={false} />
              <YAxis tick={{ fill: C.textDim, fontSize: 11 }} axisLine={false} tickLine={false} width={34} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: C.borderSoft }} />
              <Bar dataKey="count" name="Patients" fill={C.violet} radius={[4, 4, 0, 0]} barSize={40}>
                <LabelList dataKey="count" position="top" style={{ fill: C.textMid, fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ fontSize: 11.5, color: C.textDim, marginTop: 4 }}>Ages 45–74 make up the largest share of admissions.</div>
        </div>
      </div>

      {/* Row: Condition detail table + Insurance */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 18px" }}>
          <div className="ptitle" style={{ marginBottom: 12 }}>Medical condition summary — {conditionFilter}</div>
          <table className="pt">
            <thead>
              <tr>
                <th>Condition</th>
                <th>Patients</th>
                <th>Avg billing</th>
                <th>Avg LOS</th>
                <th>Abnormal rate</th>
              </tr>
            </thead>
            <tbody>
              {activeConditions.map((c) => (
                <tr key={c.name}>
                  <td style={{ fontWeight: 500 }}>{c.name}</td>
                  <td style={{ fontFamily: "'JetBrains Mono', monospace" }}>{c.count.toLocaleString()}</td>
                  <td style={{ fontFamily: "'JetBrains Mono', monospace" }}>{fmtCurrency(c.avgBilling)}</td>
                  <td style={{ fontFamily: "'JetBrains Mono', monospace" }}>{c.avgLOS}d</td>
                  <td style={{ fontFamily: "'JetBrains Mono', monospace", color: c.abnormalRate >= 35 ? C.coral : C.textMid }}>{c.abnormalRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 18px" }}>
          <div className="ptitle" style={{ marginBottom: 14 }}>Patients by insurance provider</div>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={INSURANCE} layout="vertical" margin={{ left: 10, right: 30, top: 4, bottom: 4 }}>
              <CartesianGrid stroke={C.borderSoft} horizontal={false} />
              <XAxis type="number" tick={{ fill: C.textDim, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: C.textMid, fontSize: 11.5 }} axisLine={false} tickLine={false} width={100} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: C.borderSoft }} />
              <Bar dataKey="count" name="Patients" fill={C.amber} radius={[0, 4, 4, 0]} barSize={16}>
                <LabelList dataKey="count" position="right" style={{ fill: C.textMid, fontSize: 10.5, fontFamily: "'JetBrains Mono', monospace" }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ textAlign: "center", color: C.textDim, fontSize: 11.5, marginTop: 8 }}>
        Source: 1787466187910_healthcare_dataset.csv — 10,000 patient admission records, Oct 2018 through Oct 2023
      </div>
    </div>
  );
}
