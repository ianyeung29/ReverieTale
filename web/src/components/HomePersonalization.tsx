"use client";

import { useEffect, useState } from "react";
import { COMPANION_GENDER_OPTIONS, type CompanionGender } from "@/lib/gender";

export function HomePersonalization() {
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState<CompanionGender[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/profile").then(async (res) => res.ok ? res.json() : null).then((profile) => {
      if (profile && !Array.isArray(profile.companionGenderPreferences)) setVisible(true);
    }).catch(() => {});
  }, []);

  if (!visible) return null;
  async function save(preferences: CompanionGender[]) {
    if (!preferences.length || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ companionGenderPreferences: preferences }) });
      if (res.ok) window.location.reload();
    } finally { setSaving(false); }
  }

  return (
    <section style={S.wrap} aria-label="Personalize discovery">
      <div><p style={S.eyebrow}>Make this feed yours</p><h2 style={S.title}>Who are you into?</h2><p style={S.copy}>Choose who appears first in your companion feed. You can change this later.</p></div>
      <div style={S.choices}>
        {COMPANION_GENDER_OPTIONS.map((option) => {
          const active = selected.includes(option.value);
          return <button key={option.value} type="button" className="rv-chip" style={{ ...S.choice, ...(active ? S.choiceOn : {}) }} onClick={() => setSelected((current) => active ? current.filter((value) => value !== option.value) : [...current, option.value])}>{option.label}</button>;
        })}
      </div>
      <div style={S.actions}><button className="rv-btn" style={{ ...S.save, opacity: selected.length && !saving ? 1 : 0.55 }} disabled={!selected.length || saving} onClick={() => save(selected)}>{saving ? "Saving..." : "Personalize my feed"}</button><button type="button" style={S.everyone} onClick={() => save(COMPANION_GENDER_OPTIONS.map((option) => option.value))}>Show me everyone</button></div>
    </section>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: { margin: "24px 0 4px", padding: "20px", borderRadius: 14, border: "1px solid #49374F", background: "linear-gradient(110deg, rgba(212,106,139,.16), rgba(233,160,107,.1))" },
  eyebrow: { margin: 0, color: "#E9A06B", fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", fontWeight: 700 },
  title: { margin: "6px 0 4px", color: "#F4EAF0", fontFamily: "Georgia, serif", fontSize: 24 },
  copy: { margin: 0, color: "#CBBBD0", fontSize: 14, lineHeight: 1.5 },
  choices: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 15 },
  choice: { background: "#231A2B", color: "#D9CBDE", border: "1px solid #4A3A50", borderRadius: 999, padding: "7px 12px", cursor: "pointer", fontSize: 13 },
  choiceOn: { color: "#1A1220", fontWeight: 700, background: "linear-gradient(100deg,#E9A06B,#D46A8B)", borderColor: "transparent" },
  actions: { display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", marginTop: 15 },
  save: { background: "#F4EAF0", color: "#1A1220", border: 0, borderRadius: 9, padding: "10px 13px", cursor: "pointer", fontSize: 13.5, fontWeight: 700 },
  everyone: { background: "transparent", color: "#E9A06B", border: 0, padding: 0, cursor: "pointer", fontSize: 13, fontWeight: 650 },
};
