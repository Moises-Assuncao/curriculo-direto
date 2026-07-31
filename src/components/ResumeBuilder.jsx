import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Plus, Trash2, Download, CheckCircle2, User, FileText,
  Briefcase, GraduationCap, Award, Languages as LanguagesIcon,
  ChevronDown, ChevronUp, Sparkles, FolderKanban, HeartHandshake,
  Cloud, CloudOff, Loader2, RotateCcw, LogOut, GripVertical,
  ImagePlus, X, AlertTriangle, Palette
} from "lucide-react";
import { loadResume, saveResume, signOutUser } from "../firebase";

const uid = () => Math.random().toString(36).slice(2, 10);

const emptyExperience = () => ({
  id: uid(), cargo: "", empresa: "", local: "",
  inicio: "", fim: "", atual: false, descricao: "",
});
const emptyEducation = () => ({
  id: uid(), curso: "", instituicao: "", local: "", inicio: "", fim: "",
});
const emptyCourse = () => ({ id: uid(), nome: "", instituicao: "", ano: "" });
const emptyLanguage = () => ({ id: uid(), idioma: "", nivel: "Intermediário" });
const emptyProject = () => ({ id: uid(), nome: "", descricao: "", link: "" });
const emptyVolunteer = () => ({ id: uid(), cargo: "", organizacao: "", inicio: "", fim: "", descricao: "" });

const DEFAULT_SECTION_ORDER = [
  "resumo", "experiencia", "formacao", "projetos", "cursos", "voluntariado", "habilidades", "idiomas",
];

const SECTION_LABELS = {
  resumo: "Resumo Profissional",
  experiencia: "Experiência Profissional",
  formacao: "Formação Acadêmica",
  projetos: "Projetos",
  cursos: "Cursos e Certificações",
  voluntariado: "Experiência Voluntária",
  habilidades: "Habilidades",
  idiomas: "Idiomas",
};

const initialData = {
  contato: { nome: "", cargo: "", email: "", telefone: "", cidade: "", linkedin: "", portfolio: "", foto: "", cnhPossui: false, cnh: "" },
  resumo: "",
  experiencias: [emptyExperience()],
  formacoes: [emptyEducation()],
  cursos: [],
  projetos: [],
  voluntariado: [],
  habilidades: "",
  idiomas: [],
  sectionOrder: DEFAULT_SECTION_ORDER,
  accentColor: "",
};

const ACCENT_PRESETS = [
  { nome: "Verde", cor: "#1F6F5C" },
  { nome: "Azul", cor: "#1D4ED8" },
  { nome: "Grafite", cor: "#12181F" },
  { nome: "Vinho", cor: "#8E2C42" },
  { nome: "Roxo", cor: "#5B3A9E" },
  { nome: "Laranja", cor: "#C2540A" },
];

// layout: "single" (uma coluna, mais seguro pra ATS) | "sidebar" (duas colunas)
// photo: "none" | "header" (ao lado do nome) | "sidebar" (centralizada na barra lateral)
const TEMPLATES = [
  { id: "classico", nome: "Clássico", desc: "Serifada, formal, tradicional", layout: "single", photo: "none", defaultAccent: "#12181F", atsWarning: false },
  { id: "moderno", nome: "Moderno", desc: "Sans-serif, direto ao ponto", layout: "single", photo: "none", defaultAccent: "#1F6F5C", atsWarning: false },
  { id: "compacto", nome: "Compacto", desc: "Espaçamento reduzido, cabe mais", layout: "single", photo: "none", defaultAccent: "#1F6F5C", atsWarning: false },
  { id: "perfil", nome: "Perfil", desc: "Foto ao lado do nome", layout: "single", photo: "header", defaultAccent: "#1F6F5C", atsWarning: true },
  { id: "executivo", nome: "Executivo", desc: "Barra lateral escura, foto centralizada", layout: "sidebar", photo: "sidebar", defaultAccent: "#12181F", atsWarning: true },
  { id: "criativo", nome: "Criativo", desc: "Barra lateral colorida, visual moderno", layout: "sidebar", photo: "sidebar", defaultAccent: "#1F6F5C", atsWarning: true },
];

const PLACEHOLDER_DATA = {
  contato: {
    nome: "Preencha seu nome aqui",
    cargo: "Preencha o cargo desejado aqui",
    email: "seuemail@exemplo.com",
    telefone: "(00) 00000-0000",
    cidade: "Sua cidade, UF",
    linkedin: "linkedin.com/in/seu-perfil",
    portfolio: "",
    foto: "",
    cnhPossui: false,
    cnh: "",
  },
  resumo: "Preencha aqui um resumo curto sobre sua trajetória, seus pontos fortes e o que você busca profissionalmente.",
  experiencias: [{
    id: "placeholder-exp",
    cargo: "Preencha seu cargo aqui",
    empresa: "Preencha o nome da empresa aqui",
    local: "Cidade, UF",
    inicio: "Jan 2023",
    fim: "",
    atual: true,
    descricao: "Preencha aqui suas atividades, uma por linha\nDê preferência pra resultados e números\nComo neste exemplo",
  }],
  formacoes: [{
    id: "placeholder-edu",
    curso: "Preencha seu curso aqui",
    instituicao: "Preencha a instituição aqui",
    local: "Cidade, UF",
    inicio: "2021",
    fim: "2024",
  }],
  cursos: [{ id: "placeholder-curso", nome: "Preencha um curso ou certificação aqui", instituicao: "Instituição", ano: "2024" }],
  projetos: [],
  voluntariado: [],
  habilidades: "Preencha suas habilidades aqui, separadas por vírgula",
  idiomas: [{ id: "placeholder-idioma", idioma: "Preencha um idioma aqui", nivel: "Intermediário" }],
};

function isResumeEmpty(data) {
  const c = data.contato;
  const contatoVazio = !c.nome && !c.cargo && !c.email && !c.telefone && !c.cidade && !c.linkedin && !c.portfolio && !c.cnhPossui;
  return (
    contatoVazio &&
    !data.resumo &&
    data.experiencias.every((e) => !e.cargo && !e.empresa && !e.descricao) &&
    data.formacoes.every((f) => !f.curso && !f.instituicao) &&
    data.cursos.length === 0 &&
    data.projetos.length === 0 &&
    data.voluntariado.length === 0 &&
    !data.habilidades &&
    data.idiomas.length === 0
  );
}

function Section({ icon: Icon, title, children, open, onToggle }) {
  return (
    <div className="border border-[#E3E6E1] rounded-lg bg-white overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#F6F7F5] transition-colors"
      >
        <span className="flex items-center gap-2.5 font-semibold text-[#12181F]">
          <Icon size={17} className="text-[#1F6F5C]" />
          {title}
        </span>
        {open ? <ChevronUp size={18} className="text-[#6B7268]" /> : <ChevronDown size={18} className="text-[#6B7268]" />}
      </button>
      {open && <div className="px-4 pb-4 pt-1 space-y-3">{children}</div>}
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <label className="block text-sm">
      <span className="block mb-1 text-[#4A4F49] font-medium">{label}</span>
      <input
        {...props}
        className="w-full rounded-md border border-[#D7DBD3] px-3 py-2 text-sm text-[#12181F] outline-none focus:border-[#1F6F5C] focus:ring-1 focus:ring-[#1F6F5C] transition-colors"
      />
    </label>
  );
}

function TextArea({ label, ...props }) {
  return (
    <label className="block text-sm">
      <span className="block mb-1 text-[#4A4F49] font-medium">{label}</span>
      <textarea
        {...props}
        className="w-full rounded-md border border-[#D7DBD3] px-3 py-2 text-sm text-[#12181F] outline-none focus:border-[#1F6F5C] focus:ring-1 focus:ring-[#1F6F5C] transition-colors resize-y"
      />
    </label>
  );
}

function RemovableCard({ children, onRemove, label }) {
  return (
    <div className="relative border border-[#E3E6E1] rounded-md p-3 bg-[#FBFCFA] space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-[#8A9187] font-semibold">{label}</span>
        <button onClick={onRemove} className="text-[#B4483B] hover:text-[#8f382e] p-1 rounded" title="Remover">
          <Trash2 size={15} />
        </button>
      </div>
      {children}
    </div>
  );
}

function fmtRange(inicio, fim, atual) {
  const i = inicio || "—";
  const f = atual ? "Atual" : (fim || "—");
  return `${i} – ${f}`;
}

function resizeImageToBase64(file, maxSize = 320, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// ---------- SEÇÕES DO CURRÍCULO (renderizadas na ordem escolhida) ----------
function buildSectionRenderers(data, H) {
  const { experiencias, formacoes, cursos, projetos, voluntariado, habilidades, idiomas, resumo } = data;
  const skillsList = habilidades.split(",").map(s => s.trim()).filter(Boolean);

  return {
    resumo: () => resumo && (
      <div key="resumo">
        <H>Resumo Profissional</H>
        <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{resumo}</p>
      </div>
    ),
    experiencia: () => experiencias.some(e => e.cargo || e.empresa) && (
      <div key="experiencia">
        <H>Experiência Profissional</H>
        {experiencias.filter(e => e.cargo || e.empresa).map(e => (
          <div key={e.id} style={{ marginBottom: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
              <span>{e.cargo}{e.empresa ? ` — ${e.empresa}` : ""}</span>
              <span style={{ fontWeight: 400, fontSize: "11.5px", color: "#4A4F49", whiteSpace: "nowrap", marginLeft: "8px" }}>
                {fmtRange(e.inicio, e.fim, e.atual)}
              </span>
            </div>
            {e.local && <div style={{ fontSize: "11.5px", color: "#6B7268" }}>{e.local}</div>}
            {e.descricao && (
              <ul style={{ margin: "4px 0 0", paddingLeft: "18px" }}>
                {e.descricao.split("\n").filter(Boolean).map((line, i) => (
                  <li key={i} style={{ marginBottom: "2px" }}>{line.replace(/^[-•]\s*/, "")}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    ),
    formacao: () => formacoes.some(f => f.curso || f.instituicao) && (
      <div key="formacao">
        <H>Formação Acadêmica</H>
        {formacoes.filter(f => f.curso || f.instituicao).map(f => (
          <div key={f.id} style={{ marginBottom: "8px", display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontWeight: 700 }}>{f.curso}</div>
              <div style={{ fontSize: "11.5px", color: "#6B7268" }}>{f.instituicao}{f.local ? ` — ${f.local}` : ""}</div>
            </div>
            <div style={{ fontSize: "11.5px", color: "#4A4F49", whiteSpace: "nowrap", marginLeft: "8px" }}>
              {fmtRange(f.inicio, f.fim, false)}
            </div>
          </div>
        ))}
      </div>
    ),
    projetos: () => projetos.some(p => p.nome) && (
      <div key="projetos">
        <H>Projetos</H>
        {projetos.filter(p => p.nome).map(p => (
          <div key={p.id} style={{ marginBottom: "8px" }}>
            <div style={{ fontWeight: 700 }}>{p.nome}{p.link ? `  —  ${p.link}` : ""}</div>
            {p.descricao && <div style={{ fontSize: "12.5px" }}>{p.descricao}</div>}
          </div>
        ))}
      </div>
    ),
    cursos: () => cursos.some(c => c.nome) && (
      <div key="cursos">
        <H>Cursos e Certificações</H>
        {cursos.filter(c => c.nome).map(c => (
          <div key={c.id} style={{ marginBottom: "4px", display: "flex", justifyContent: "space-between" }}>
            <span>{c.nome}{c.instituicao ? ` — ${c.instituicao}` : ""}</span>
            {c.ano && <span style={{ fontSize: "11.5px", color: "#4A4F49" }}>{c.ano}</span>}
          </div>
        ))}
      </div>
    ),
    voluntariado: () => voluntariado.some(v => v.cargo || v.organizacao) && (
      <div key="voluntariado">
        <H>Experiência Voluntária</H>
        {voluntariado.filter(v => v.cargo || v.organizacao).map(v => (
          <div key={v.id} style={{ marginBottom: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
              <span>{v.cargo}{v.organizacao ? ` — ${v.organizacao}` : ""}</span>
              <span style={{ fontWeight: 400, fontSize: "11.5px", color: "#4A4F49", whiteSpace: "nowrap", marginLeft: "8px" }}>
                {fmtRange(v.inicio, v.fim, false)}
              </span>
            </div>
            {v.descricao && <div style={{ fontSize: "12.5px" }}>{v.descricao}</div>}
          </div>
        ))}
      </div>
    ),
    habilidades: () => skillsList.length > 0 && (
      <div key="habilidades">
        <H>Habilidades</H>
        <p style={{ margin: 0 }}>{skillsList.join("  •  ")}</p>
      </div>
    ),
    idiomas: () => idiomas.some(l => l.idioma) && (
      <div key="idiomas">
        <H>Idiomas</H>
        <p style={{ margin: 0 }}>{idiomas.filter(l => l.idioma).map(l => `${l.idioma} (${l.nivel})`).join("  •  ")}</p>
      </div>
    ),
  };
}

// ---------- RENDER DO CURRÍCULO ----------
function Resume({ data, templateId }) {
  const template = TEMPLATES.find(t => t.id === templateId) || TEMPLATES[1];
  const accent = data.accentColor || template.defaultAccent;
  const { contato } = data;
  const cnhLabel = contato.cnhPossui && contato.cnh ? `CNH ${contato.cnh}` : "";
  const order = (data.sectionOrder && data.sectionOrder.length ? data.sectionOrder : DEFAULT_SECTION_ORDER)
    .filter(k => DEFAULT_SECTION_ORDER.includes(k));

  const baseFont = templateId === "classico" ? "Georgia, 'Times New Roman', serif" : "Arial, Helvetica, sans-serif";
  const headingSize = templateId === "compacto" ? "11px" : "12px";
  const nameSize = templateId === "classico" ? "26px" : "24px";
  const lineHeight = templateId === "compacto" ? "1.3" : "1.45";
  const fontSize = templateId === "compacto" ? "12.5px" : "13.5px";

  const H = ({ children }) => (
    <div style={{
      fontSize: headingSize, letterSpacing: "0.08em", textTransform: "uppercase",
      fontWeight: 700, color: accent, borderBottom: `2px solid ${accent}`,
      paddingBottom: "3px", marginBottom: "8px", marginTop: "16px",
    }}>
      {children}
    </div>
  );

  const renderers = buildSectionRenderers(data, H);
  const sidebarKeys = ["habilidades", "idiomas"];
  const mainKeys = order.filter(k => !sidebarKeys.includes(k));

  const Photo = ({ size }) => contato.foto ? (
    <img src={contato.foto} alt="Foto" style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
  ) : null;

  const ContactLine = ({ color }) => (
    <div style={{ fontSize: "11.5px", color: color || "#4A4F49" }}>
      {[contato.cidade, contato.telefone, contato.email, contato.linkedin, contato.portfolio, cnhLabel].filter(Boolean).map((item, i, arr) => (
        <div key={i} style={{ marginBottom: i < arr.length - 1 ? "2px" : 0 }}>{item}</div>
      ))}
    </div>
  );

  if (template.layout === "sidebar") {
    const isDark = templateId === "executivo";
    const sidebarBg = isDark ? "#12181F" : accent;
    const sidebarText = "#FFFFFF";
    return (
      <div style={{ fontFamily: baseFont, display: "flex", minHeight: "1000px", fontSize, lineHeight, color: "#1A1A1A" }}>
        <div style={{ width: "34%", background: sidebarBg, color: sidebarText, padding: "36px 22px", boxSizing: "border-box" }}>
          {contato.foto && (
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
              <Photo size={92} />
            </div>
          )}
          <div style={{ fontSize: "19px", fontWeight: 700, textAlign: "center", marginBottom: "2px" }}>{contato.nome || "Seu Nome"}</div>
          {contato.cargo && <div style={{ fontSize: "12px", textAlign: "center", opacity: 0.85, marginBottom: "14px" }}>{contato.cargo}</div>}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.25)", paddingTop: "12px" }}>
            <ContactLine color="rgba(255,255,255,0.9)" />
          </div>
          {["habilidades", "idiomas"].map(k => order.includes(k) && (
            <div key={k} style={{ marginTop: "18px" }}>
              <div style={{ fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700, borderBottom: "1px solid rgba(255,255,255,0.35)", paddingBottom: "3px", marginBottom: "6px" }}>
                {SECTION_LABELS[k]}
              </div>
              <div style={{ fontSize: "12px", opacity: 0.95 }}>
                {k === "habilidades"
                  ? data.habilidades.split(",").map(s => s.trim()).filter(Boolean).map((s, i) => <div key={i} style={{ marginBottom: "3px" }}>{s}</div>)
                  : data.idiomas.filter(l => l.idioma).map((l, i) => <div key={i} style={{ marginBottom: "3px" }}>{l.idioma} — {l.nivel}</div>)
                }
              </div>
            </div>
          ))}
        </div>
        <div className="resume-sheet-main" style={{ flex: 1, padding: "36px 30px", boxSizing: "border-box" }}>
          {mainKeys.map(k => renderers[k] && renderers[k]())}
        </div>
      </div>
    );
  }

  // layout "single" (com ou sem foto no cabeçalho)
  return (
    <div className="resume-sheet-main" style={{
      fontFamily: baseFont, color: "#1A1A1A", lineHeight, fontSize,
      padding: "40px 44px", background: "#FFFFFF", width: "100%",
      minHeight: "1000px", boxSizing: "border-box",
    }}>
      {template.photo === "header" ? (
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "8px" }}>
          <Photo size={72} />
          <div>
            <div style={{ fontSize: nameSize, fontWeight: 700, color: accent }}>{contato.nome || "Seu Nome"}</div>
            {contato.cargo && <div style={{ fontSize: "14px", color: "#4A4F49", marginTop: "2px" }}>{contato.cargo}</div>}
            <div style={{ fontSize: "11.5px", color: "#4A4F49", marginTop: "4px" }}>
              {[contato.cidade, contato.telefone, contato.email, contato.linkedin, contato.portfolio, cnhLabel].filter(Boolean).join("  |  ")}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: templateId === "classico" ? "center" : "left", marginBottom: "6px" }}>
          <div style={{ fontSize: nameSize, fontWeight: 700, color: accent }}>{contato.nome || "Seu Nome"}</div>
          {contato.cargo && <div style={{ fontSize: "14px", color: "#4A4F49", marginTop: "2px" }}>{contato.cargo}</div>}
          <div style={{ fontSize: "11.5px", color: "#4A4F49", marginTop: "6px" }}>
            {[contato.cidade, contato.telefone, contato.email, contato.linkedin, contato.portfolio, cnhLabel].filter(Boolean).join("  |  ")}
          </div>
        </div>
      )}

      {order.map(k => renderers[k] && renderers[k]())}
    </div>
  );
}

// ---------- LISTA DE REORDENAÇÃO (arrastar e soltar via Pointer Events) ----------
// Pointer Events funcionam igual pra mouse (notebook) e toque (celular/tablet) —
// a API antiga de HTML5 Drag and Drop não é bem suportada em touch no Safari/iOS.
function SectionOrderList({ order, onChange }) {
  const [draggingKey, setDraggingKey] = useState(null);
  const itemRefs = useRef(new Map());
  const orderRef = useRef(order);
  orderRef.current = order;

  const handlePointerDown = (e, key) => {
    e.preventDefault();
    setDraggingKey(key);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
  };

  const handlePointerMove = (e) => {
    if (!draggingKey) return;
    const y = e.clientY;
    const current = orderRef.current;
    const draggedIndex = current.indexOf(draggingKey);

    for (let i = 0; i < current.length; i++) {
      const key = current[i];
      if (key === draggingKey) continue;
      const node = itemRefs.current.get(key);
      if (!node) continue;
      const rect = node.getBoundingClientRect();
      const mid = rect.top + rect.height / 2;

      if (draggedIndex < i && y > mid) {
        const next = [...current];
        next.splice(draggedIndex, 1);
        next.splice(i, 0, draggingKey);
        onChange(next);
        break;
      }
      if (draggedIndex > i && y < mid) {
        const next = [...current];
        next.splice(draggedIndex, 1);
        next.splice(i, 0, draggingKey);
        onChange(next);
        break;
      }
    }
  };

  const endDrag = () => setDraggingKey(null);

  return (
    <div className="space-y-1.5">
      {order.map((key) => (
        <div
          key={key}
          ref={(el) => itemRefs.current.set(key, el)}
          className={`flex items-center gap-2 bg-[#FBFCFA] border rounded-md px-3 py-2 text-sm text-[#12181F] transition-shadow ${
            draggingKey === key ? "border-[#1F6F5C] shadow-md opacity-70" : "border-[#E3E6E1]"
          }`}
        >
          <button
            type="button"
            onPointerDown={(e) => handlePointerDown(e, key)}
            onPointerMove={handlePointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            style={{ touchAction: "none" }}
            className="cursor-grab active:cursor-grabbing p-1 -m-1 text-[#B4B9AE]"
            aria-label="Arrastar para reordenar"
          >
            <GripVertical size={15} />
          </button>
          {SECTION_LABELS[key]}
        </div>
      ))}
      <p className="text-xs text-[#8A9187] pt-1">
        Segure o ícone e arraste pra reordenar — funciona no notebook e no celular. Nos modelos com barra lateral
        (Executivo, Criativo), Habilidades e Idiomas ficam fixos na lateral.
      </p>
    </div>
  );
}

export default function ResumeBuilder({ user }) {
  const [data, setData] = useState(initialData);
  const [template, setTemplate] = useState("moderno");
  const [openSection, setOpenSection] = useState("contato");
  const [mobileView, setMobileView] = useState("form");
  const [saveState, setSaveState] = useState("loading");
  const [fileName, setFileName] = useState("");
  const [photoError, setPhotoError] = useState("");
  const skipNextSave = useRef(true);
  const saveTimer = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const saved = await loadResume(user.uid);
        if (saved) {
          if (saved.data) setData(d => ({ ...initialData, ...saved.data, sectionOrder: saved.data.sectionOrder?.length ? saved.data.sectionOrder : DEFAULT_SECTION_ORDER }));
          if (saved.template) setTemplate(saved.template);
        }
        setSaveState("saved");
      } catch (err) {
        console.error(err);
        setSaveState("offline");
      } finally {
        setTimeout(() => { skipNextSave.current = false; }, 300);
      }
    })();
  }, [user.uid]);

  useEffect(() => {
    if (skipNextSave.current) return;
    setSaveState("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await saveResume(user.uid, { data, template });
        setSaveState("saved");
      } catch (err) {
        console.error(err);
        setSaveState("offline");
      }
    }, 700);
    return () => clearTimeout(saveTimer.current);
  }, [data, template, user.uid]);

  const toggle = (name) => setOpenSection(openSection === name ? "" : name);
  const setContato = (field, value) => setData(d => ({ ...d, contato: { ...d.contato, [field]: value } }));
  const updateList = (key, id, field, value) =>
    setData(d => ({ ...d, [key]: d[key].map(item => item.id === id ? { ...item, [field]: value } : item) }));
  const addItem = (key, factory) => setData(d => ({ ...d, [key]: [...d[key], factory()] }));
  const removeItem = (key, id) => setData(d => ({ ...d, [key]: d[key].filter(item => item.id !== id) }));

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError("");
    if (!file.type.startsWith("image/")) {
      setPhotoError("Selecione um arquivo de imagem.");
      return;
    }
    try {
      const base64 = await resizeImageToBase64(file);
      setContato("foto", base64);
    } catch (err) {
      setPhotoError("Não foi possível carregar essa imagem.");
    }
  };

  const resetAll = async () => {
    if (!window.confirm("Isso vai apagar todos os dados salvos deste currículo. Continuar?")) return;
    setData(initialData);
    setTemplate("moderno");
    try { await saveResume(user.uid, { data: initialData, template: "moderno" }); } catch (err) {}
  };

  const showingPlaceholder = isResumeEmpty(data);
  const previewData = showingPlaceholder
    ? { ...PLACEHOLDER_DATA, accentColor: data.accentColor, sectionOrder: data.sectionOrder }
    : data;

  const atsChecks = useMemo(() => {
    const tpl = TEMPLATES.find(t => t.id === template);
    if (!tpl || !tpl.atsWarning) {
      return [
        "Layout de coluna única, sem tabelas ou caixas de texto",
        "Fontes padrão (Arial/Georgia) legíveis por qualquer sistema",
        "Sem ícones, imagens ou gráficos no conteúdo do texto",
        "Títulos de seção em formato reconhecido pelos ATS",
      ];
    }
    return null;
  }, [template]);

  const currentTemplate = TEMPLATES.find(t => t.id === template);

  const handlePrint = () => {
    const previous = document.title;
    const cleaned = fileName.trim().replace(/[\\/:*?"<>|]/g, "");
    const finalName = cleaned || `curriculo-${Math.floor(1000 + Math.random() * 9000)}`;
    document.title = finalName;
    const restore = () => {
      document.title = previous;
      window.removeEventListener("afterprint", restore);
    };
    window.addEventListener("afterprint", restore);
    window.print();
  };

  const SaveIndicator = () => {
    const map = {
      loading: { icon: Loader2, text: "Carregando...", cls: "text-[#8A9187] animate-spin" },
      saving: { icon: Loader2, text: "Salvando...", cls: "text-[#8A9187] animate-spin" },
      saved: { icon: Cloud, text: "Salvo na nuvem", cls: "text-[#1F6F5C]" },
      offline: { icon: CloudOff, text: "Erro ao salvar", cls: "text-[#B4483B]" },
    };
    const { icon: Icon, text, cls } = map[saveState];
    return (
      <span className="hidden sm:flex items-center gap-1.5 text-xs text-[#6B7268]">
        <Icon size={13} className={cls} /> {text}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#F6F7F5]">
      <header id="no-print" className="border-b border-[#E3E6E1] bg-white sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-5 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#1F6F5C] flex items-center justify-center">
              <FileText size={17} className="text-white" />
            </div>
            <div>
              <div style={{ fontFamily: "Fraunces, serif" }} className="text-lg font-bold text-[#12181F] leading-tight">
                Currículo Direto
              </div>
              <div className="text-[11px] text-[#8A9187] leading-tight">sem enrolação, passa no ATS</div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <SaveIndicator />
            {user.photoURL && (
              <img src={user.photoURL} alt={user.displayName || "Usuário"} className="w-7 h-7 rounded-full" referrerPolicy="no-referrer" />
            )}
            <button onClick={resetAll} className="text-[#6B7268] hover:text-[#B4483B] p-2 rounded-md transition-colors" title="Limpar tudo">
              <RotateCcw size={15} />
            </button>
            <button onClick={signOutUser} className="text-[#6B7268] hover:text-[#B4483B] p-2 rounded-md transition-colors" title="Sair">
              <LogOut size={15} />
            </button>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Nome do arquivo (opcional)"
              className="w-40 sm:w-52 rounded-md border border-[#D7DBD3] px-2.5 py-2 text-xs text-[#12181F] outline-none focus:border-[#1F6F5C]"
            />
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-[#1F6F5C] hover:bg-[#195a4a] text-white text-sm font-semibold px-4 py-2 rounded-md transition-colors"
            >
              <Download size={16} /> Baixar PDF
            </button>
          </div>
        </div>
      </header>

      <div id="no-print" className="lg:hidden flex border-b border-[#E3E6E1] bg-white sticky top-[65px] z-10">
        {["form", "preview"].map(v => (
          <button
            key={v}
            onClick={() => setMobileView(v)}
            className={`flex-1 py-2.5 text-sm font-semibold ${mobileView === v ? "text-[#1F6F5C] border-b-2 border-[#1F6F5C]" : "text-[#8A9187]"}`}
          >
            {v === "form" ? "Editar" : "Visualizar"}
          </button>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-5 py-6 grid lg:grid-cols-[1fr_1.1fr] gap-6">
        <div id="no-print" className={`space-y-4 ${mobileView === "preview" ? "hidden lg:block" : ""}`}>
          {/* Template picker */}
          <div className="bg-white border border-[#E3E6E1] rounded-lg p-4">
            <div className="text-sm font-semibold text-[#12181F] mb-3 flex items-center gap-1.5">
              <Sparkles size={15} className="text-[#1F6F5C]" /> Escolha o layout
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TEMPLATES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={`text-left px-3 py-2.5 rounded-md border text-xs transition-colors ${
                    template === t.id ? "border-[#1F6F5C] bg-[#EEF5F2] ring-1 ring-[#1F6F5C]" : "border-[#E3E6E1] hover:border-[#C7CCC3]"
                  }`}
                >
                  <div className="font-semibold text-[#12181F]">{t.nome}</div>
                  <div className="text-[#8A9187] mt-0.5 leading-snug">{t.desc}</div>
                </button>
              ))}
            </div>
            {currentTemplate?.atsWarning && (
              <div className="flex items-start gap-2 mt-3 bg-[#FFF4E5] text-[#7A5A00] text-xs rounded-md p-2.5">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                Modelos com foto ou barra lateral são mais bonitos, mas alguns sistemas de ATS têm mais dificuldade
                pra ler colunas e imagens. Pra vagas que usam ATS de forma rígida, prefira Clássico, Moderno ou Compacto.
              </div>
            )}
          </div>

          {/* Personalização: cor + ordem das seções */}
          <div className="bg-white border border-[#E3E6E1] rounded-lg p-4 space-y-4">
            <div>
              <div className="text-sm font-semibold text-[#12181F] mb-2.5 flex items-center gap-1.5">
                <Palette size={15} className="text-[#1F6F5C]" /> Cor de destaque
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {ACCENT_PRESETS.map(p => (
                  <button
                    key={p.cor}
                    title={p.nome}
                    onClick={() => setData(d => ({ ...d, accentColor: p.cor }))}
                    style={{ background: p.cor }}
                    className={`w-7 h-7 rounded-full border-2 ${data.accentColor === p.cor ? "border-[#12181F]" : "border-transparent"}`}
                  />
                ))}
                <input
                  type="color"
                  value={data.accentColor || currentTemplate?.defaultAccent || "#1F6F5C"}
                  onChange={(e) => setData(d => ({ ...d, accentColor: e.target.value }))}
                  className="w-8 h-8 rounded-md border border-[#D7DBD3] cursor-pointer bg-transparent"
                  title="Cor personalizada"
                />
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-[#12181F] mb-2.5">Ordem das seções</div>
              <SectionOrderList order={data.sectionOrder} onChange={(next) => setData(d => ({ ...d, sectionOrder: next }))} />
            </div>
          </div>

          <Section icon={User} title="Dados pessoais" open={openSection === "contato"} onToggle={() => toggle("contato")}>
            <div className="flex items-center gap-3">
              {data.contato.foto ? (
                <div className="relative">
                  <img src={data.contato.foto} alt="Foto de perfil" className="w-16 h-16 rounded-full object-cover border border-[#E3E6E1]" />
                  <button onClick={() => setContato("foto", "")} className="absolute -top-1 -right-1 bg-white border border-[#E3E6E1] rounded-full p-0.5 text-[#B4483B]">
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <label className="w-16 h-16 rounded-full border-2 border-dashed border-[#D7DBD3] flex items-center justify-center cursor-pointer text-[#8A9187] hover:border-[#1F6F5C] hover:text-[#1F6F5C] transition-colors">
                  <ImagePlus size={20} />
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
              )}
              <div className="text-xs text-[#8A9187]">
                Foto opcional — usada só nos modelos Perfil, Executivo e Criativo.
                {photoError && <div className="text-[#B4483B] mt-1">{photoError}</div>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nome completo" value={data.contato.nome} onChange={e => setContato("nome", e.target.value)} />
              <Field label="Cargo desejado" value={data.contato.cargo} onChange={e => setContato("cargo", e.target.value)} placeholder="Ex: Analista de Dados" />
              <Field label="E-mail" value={data.contato.email} onChange={e => setContato("email", e.target.value)} />
              <Field label="Telefone" value={data.contato.telefone} onChange={e => setContato("telefone", e.target.value)} />
              <Field label="Cidade" value={data.contato.cidade} onChange={e => setContato("cidade", e.target.value)} />
              <Field label="LinkedIn" value={data.contato.linkedin} onChange={e => setContato("linkedin", e.target.value)} placeholder="linkedin.com/in/..." />
              <Field label="Portfólio / Site" value={data.contato.portfolio} onChange={e => setContato("portfolio", e.target.value)} placeholder="seusite.com" />
              <label className="flex items-center gap-2 text-sm text-[#4A4F49] col-span-2 pt-1">
                <input
                  type="checkbox"
                  checked={data.contato.cnhPossui}
                  onChange={(e) => {
                    setContato("cnhPossui", e.target.checked);
                    if (!e.target.checked) setContato("cnh", "");
                  }}
                />
                Eu possuo CNH (opcional)
              </label>
              {data.contato.cnhPossui && (
                <label className="block text-sm">
                  <span className="block mb-1 text-[#4A4F49] font-medium">Categoria da CNH</span>
                  <select
                    value={data.contato.cnh}
                    onChange={(e) => setContato("cnh", e.target.value)}
                    className="w-full rounded-md border border-[#D7DBD3] px-3 py-2 text-sm text-[#12181F] outline-none focus:border-[#1F6F5C]"
                  >
                    <option value="">Selecione</option>
                    {["A", "B", "AB", "C", "D", "E"].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>
              )}
            </div>
          </Section>

          <Section icon={FileText} title="Resumo profissional" open={openSection === "resumo"} onToggle={() => toggle("resumo")}>
            <TextArea label="Resumo (2–4 linhas)" rows={4} value={data.resumo}
              onChange={e => setData(d => ({ ...d, resumo: e.target.value }))}
              placeholder="Profissional com X anos de experiência em..." />
          </Section>

          <Section icon={Briefcase} title="Experiência profissional" open={openSection === "exp"} onToggle={() => toggle("exp")}>
            {data.experiencias.map((e, idx) => (
              <RemovableCard key={e.id} label={`Experiência ${idx + 1}`} onRemove={() => removeItem("experiencias", e.id)}>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Cargo" value={e.cargo} onChange={ev => updateList("experiencias", e.id, "cargo", ev.target.value)} />
                  <Field label="Empresa" value={e.empresa} onChange={ev => updateList("experiencias", e.id, "empresa", ev.target.value)} />
                  <Field label="Local" value={e.local} onChange={ev => updateList("experiencias", e.id, "local", ev.target.value)} />
                  <div className="flex gap-2">
                    <Field label="Início" placeholder="Jan 2022" value={e.inicio} onChange={ev => updateList("experiencias", e.id, "inicio", ev.target.value)} />
                    <Field label="Fim" placeholder="Dez 2023" disabled={e.atual} value={e.fim} onChange={ev => updateList("experiencias", e.id, "fim", ev.target.value)} />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-xs text-[#4A4F49]">
                  <input type="checkbox" checked={e.atual} onChange={ev => updateList("experiencias", e.id, "atual", ev.target.checked)} />
                  Trabalho atual
                </label>
                <TextArea label="Atividades (uma por linha)" rows={3} value={e.descricao}
                  onChange={ev => updateList("experiencias", e.id, "descricao", ev.target.value)}
                  placeholder={"Liderei equipe de 5 pessoas...\nAumentei vendas em 20%..."} />
              </RemovableCard>
            ))}
            <button onClick={() => addItem("experiencias", emptyExperience)} className="flex items-center gap-1.5 text-sm text-[#1F6F5C] font-semibold hover:underline">
              <Plus size={15} /> Adicionar experiência
            </button>
          </Section>

          <Section icon={GraduationCap} title="Formação acadêmica" open={openSection === "edu"} onToggle={() => toggle("edu")}>
            {data.formacoes.map((f, idx) => (
              <RemovableCard key={f.id} label={`Formação ${idx + 1}`} onRemove={() => removeItem("formacoes", f.id)}>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Curso" value={f.curso} onChange={ev => updateList("formacoes", f.id, "curso", ev.target.value)} />
                  <Field label="Instituição" value={f.instituicao} onChange={ev => updateList("formacoes", f.id, "instituicao", ev.target.value)} />
                  <Field label="Local" value={f.local} onChange={ev => updateList("formacoes", f.id, "local", ev.target.value)} />
                  <div className="flex gap-2">
                    <Field label="Início" placeholder="2019" value={f.inicio} onChange={ev => updateList("formacoes", f.id, "inicio", ev.target.value)} />
                    <Field label="Fim" placeholder="2023" value={f.fim} onChange={ev => updateList("formacoes", f.id, "fim", ev.target.value)} />
                  </div>
                </div>
              </RemovableCard>
            ))}
            <button onClick={() => addItem("formacoes", emptyEducation)} className="flex items-center gap-1.5 text-sm text-[#1F6F5C] font-semibold hover:underline">
              <Plus size={15} /> Adicionar formação
            </button>
          </Section>

          <Section icon={FolderKanban} title="Projetos" open={openSection === "projetos"} onToggle={() => toggle("projetos")}>
            {data.projetos.map((p, idx) => (
              <RemovableCard key={p.id} label={`Projeto ${idx + 1}`} onRemove={() => removeItem("projetos", p.id)}>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Nome do projeto" value={p.nome} onChange={ev => updateList("projetos", p.id, "nome", ev.target.value)} />
                  <Field label="Link (opcional)" value={p.link} onChange={ev => updateList("projetos", p.id, "link", ev.target.value)} placeholder="github.com/..." />
                </div>
                <TextArea label="Descrição" rows={2} value={p.descricao}
                  onChange={ev => updateList("projetos", p.id, "descricao", ev.target.value)}
                  placeholder="O que foi feito, ferramentas usadas, resultado..." />
              </RemovableCard>
            ))}
            <button onClick={() => addItem("projetos", emptyProject)} className="flex items-center gap-1.5 text-sm text-[#1F6F5C] font-semibold hover:underline">
              <Plus size={15} /> Adicionar projeto
            </button>
          </Section>

          <Section icon={Award} title="Cursos e certificações" open={openSection === "cursos"} onToggle={() => toggle("cursos")}>
            {data.cursos.map((c, idx) => (
              <RemovableCard key={c.id} label={`Curso ${idx + 1}`} onRemove={() => removeItem("cursos", c.id)}>
                <div className="grid grid-cols-3 gap-2">
                  <Field label="Nome" value={c.nome} onChange={ev => updateList("cursos", c.id, "nome", ev.target.value)} />
                  <Field label="Instituição" value={c.instituicao} onChange={ev => updateList("cursos", c.id, "instituicao", ev.target.value)} />
                  <Field label="Ano" value={c.ano} onChange={ev => updateList("cursos", c.id, "ano", ev.target.value)} />
                </div>
              </RemovableCard>
            ))}
            <button onClick={() => addItem("cursos", emptyCourse)} className="flex items-center gap-1.5 text-sm text-[#1F6F5C] font-semibold hover:underline">
              <Plus size={15} /> Adicionar curso
            </button>
          </Section>

          <Section icon={HeartHandshake} title="Experiência voluntária" open={openSection === "vol"} onToggle={() => toggle("vol")}>
            {data.voluntariado.map((v, idx) => (
              <RemovableCard key={v.id} label={`Voluntariado ${idx + 1}`} onRemove={() => removeItem("voluntariado", v.id)}>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Cargo/Função" value={v.cargo} onChange={ev => updateList("voluntariado", v.id, "cargo", ev.target.value)} />
                  <Field label="Organização" value={v.organizacao} onChange={ev => updateList("voluntariado", v.id, "organizacao", ev.target.value)} />
                  <Field label="Início" placeholder="2022" value={v.inicio} onChange={ev => updateList("voluntariado", v.id, "inicio", ev.target.value)} />
                  <Field label="Fim" placeholder="2023" value={v.fim} onChange={ev => updateList("voluntariado", v.id, "fim", ev.target.value)} />
                </div>
                <TextArea label="Descrição" rows={2} value={v.descricao} onChange={ev => updateList("voluntariado", v.id, "descricao", ev.target.value)} />
              </RemovableCard>
            ))}
            <button onClick={() => addItem("voluntariado", emptyVolunteer)} className="flex items-center gap-1.5 text-sm text-[#1F6F5C] font-semibold hover:underline">
              <Plus size={15} /> Adicionar voluntariado
            </button>
          </Section>

          <Section icon={Sparkles} title="Habilidades" open={openSection === "skills"} onToggle={() => toggle("skills")}>
            <TextArea label="Separe por vírgula" rows={2} value={data.habilidades}
              onChange={e => setData(d => ({ ...d, habilidades: e.target.value }))}
              placeholder="Excel, Gestão de projetos, Python, Comunicação" />
          </Section>

          <Section icon={LanguagesIcon} title="Idiomas" open={openSection === "idiomas"} onToggle={() => toggle("idiomas")}>
            {data.idiomas.map((l, idx) => (
              <RemovableCard key={l.id} label={`Idioma ${idx + 1}`} onRemove={() => removeItem("idiomas", l.id)}>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Idioma" value={l.idioma} onChange={ev => updateList("idiomas", l.id, "idioma", ev.target.value)} />
                  <label className="block text-sm">
                    <span className="block mb-1 text-[#4A4F49] font-medium">Nível</span>
                    <select value={l.nivel} onChange={ev => updateList("idiomas", l.id, "nivel", ev.target.value)}
                      className="w-full rounded-md border border-[#D7DBD3] px-3 py-2 text-sm text-[#12181F] outline-none focus:border-[#1F6F5C]">
                      {["Básico", "Intermediário", "Avançado", "Fluente", "Nativo"].map(n => <option key={n}>{n}</option>)}
                    </select>
                  </label>
                </div>
              </RemovableCard>
            ))}
            <button onClick={() => addItem("idiomas", emptyLanguage)} className="flex items-center gap-1.5 text-sm text-[#1F6F5C] font-semibold hover:underline">
              <Plus size={15} /> Adicionar idioma
            </button>
          </Section>
        </div>

        {/* PREVIEW */}
        <div id="preview-col" className={`${mobileView === "form" ? "hidden lg:block" : ""}`}>
          <div id="no-print" className="bg-white border border-[#E3E6E1] rounded-lg p-4 mb-4">
            <div className="text-sm font-semibold text-[#12181F] mb-2.5">Compatibilidade com ATS</div>
            {atsChecks ? (
              <div className="space-y-1.5">
                {atsChecks.map((c, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-[#4A4F49]">
                    <CheckCircle2 size={14} className="text-[#1F6F5C] shrink-0 mt-0.5" />
                    {c}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-start gap-2 text-xs text-[#7A5A00]">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                Este modelo usa foto e/ou colunas — visual mais rico, porém com compatibilidade reduzida em alguns ATS.
              </div>
            )}
          </div>
          <div className="lg:sticky lg:top-[90px]">
            {showingPlaceholder && (
              <div id="no-print" className="flex items-center gap-2 bg-[#EEF5F2] text-[#1F6F5C] text-xs font-medium rounded-t-lg border border-b-0 border-[#D7E7E1] px-3 py-2">
                <Sparkles size={13} />
                Isto é um exemplo de como o modelo fica. Comece a preencher o formulário pra ver seu currículo de verdade.
              </div>
            )}
            <div id="print-area" className={`bg-white border border-[#E3E6E1] shadow-sm overflow-hidden ${showingPlaceholder ? "rounded-b-lg" : "rounded-lg"}`}>
              <Resume data={previewData} templateId={template} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
