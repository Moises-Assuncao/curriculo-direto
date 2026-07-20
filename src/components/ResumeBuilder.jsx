import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Plus, Trash2, Download, CheckCircle2, User, FileText,
  Briefcase, GraduationCap, Award, Languages as LanguagesIcon,
  ChevronDown, ChevronUp, Sparkles, FolderKanban, HeartHandshake,
  Cloud, CloudOff, Loader2, RotateCcw, LogOut
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

const initialData = {
  contato: { nome: "", cargo: "", email: "", telefone: "", cidade: "", linkedin: "", portfolio: "" },
  resumo: "",
  experiencias: [emptyExperience()],
  formacoes: [emptyEducation()],
  cursos: [],
  projetos: [],
  voluntariado: [],
  habilidades: "",
  idiomas: [],
};

const TEMPLATES = [
  { id: "classico", nome: "Clássico", desc: "Serifada, formal, ideal para vagas tradicionais" },
  { id: "moderno", nome: "Moderno", desc: "Sans-serif, um leve toque de cor, direto ao ponto" },
  { id: "compacto", nome: "Compacto", desc: "Espaçamento reduzido, cabe mais em uma página" },
];

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

// ---------- RESUME RENDER (ATS-safe: coluna única, sem tabelas/imagens) ----------
function Resume({ data, template }) {
  const { contato, resumo, experiencias, formacoes, cursos, projetos, voluntariado, habilidades, idiomas } = data;
  const skillsList = habilidades.split(",").map(s => s.trim()).filter(Boolean);

  const styles = {
    classico: {
      font: "Georgia, 'Times New Roman', serif", accent: "#12181F",
      headingCase: "uppercase", headingSize: "12.5px", nameSize: "26px",
      lineHeight: "1.5", align: "center", rule: "1px solid #12181F",
    },
    moderno: {
      font: "Arial, Helvetica, sans-serif", accent: "#1F6F5C",
      headingCase: "uppercase", headingSize: "12px", nameSize: "25px",
      lineHeight: "1.45", align: "left", rule: "2px solid #1F6F5C",
    },
    compacto: {
      font: "Arial, Helvetica, sans-serif", accent: "#1F6F5C",
      headingCase: "uppercase", headingSize: "11px", nameSize: "22px",
      lineHeight: "1.3", align: "left", rule: "1px solid #C7CCC3",
    },
  }[template];

  const gap = template === "compacto" ? "10px" : "16px";

  const H = ({ children }) => (
    <div style={{
      fontSize: styles.headingSize, letterSpacing: "0.08em", textTransform: styles.headingCase,
      fontWeight: 700, color: styles.accent, borderBottom: styles.rule,
      paddingBottom: "3px", marginBottom: "8px", marginTop: gap,
    }}>
      {children}
    </div>
  );

  return (
    <div style={{
      fontFamily: styles.font, color: "#1A1A1A", lineHeight: styles.lineHeight,
      fontSize: template === "compacto" ? "12.5px" : "13.5px",
      padding: "40px 44px", background: "#FFFFFF", width: "100%",
      minHeight: "1000px", boxSizing: "border-box",
    }}>
      <div style={{ textAlign: styles.align, marginBottom: "6px" }}>
        <div style={{ fontSize: styles.nameSize, fontWeight: 700, color: styles.accent }}>
          {contato.nome || "Seu Nome"}
        </div>
        {contato.cargo && <div style={{ fontSize: "14px", color: "#4A4F49", marginTop: "2px" }}>{contato.cargo}</div>}
        <div style={{ fontSize: "11.5px", color: "#4A4F49", marginTop: "6px" }}>
          {[contato.cidade, contato.telefone, contato.email, contato.linkedin, contato.portfolio].filter(Boolean).join("  |  ")}
        </div>
      </div>

      {resumo && (<><H>Resumo Profissional</H><p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{resumo}</p></>)}

      {experiencias.some(e => e.cargo || e.empresa) && (
        <>
          <H>Experiência Profissional</H>
          {experiencias.filter(e => e.cargo || e.empresa).map(e => (
            <div key={e.id} style={{ marginBottom: gap }}>
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
        </>
      )}

      {formacoes.some(f => f.curso || f.instituicao) && (
        <>
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
        </>
      )}

      {projetos.some(p => p.nome) && (
        <>
          <H>Projetos</H>
          {projetos.filter(p => p.nome).map(p => (
            <div key={p.id} style={{ marginBottom: "8px" }}>
              <div style={{ fontWeight: 700 }}>{p.nome}{p.link ? `  —  ${p.link}` : ""}</div>
              {p.descricao && <div style={{ fontSize: "12.5px" }}>{p.descricao}</div>}
            </div>
          ))}
        </>
      )}

      {cursos.some(c => c.nome) && (
        <>
          <H>Cursos e Certificações</H>
          {cursos.filter(c => c.nome).map(c => (
            <div key={c.id} style={{ marginBottom: "4px", display: "flex", justifyContent: "space-between" }}>
              <span>{c.nome}{c.instituicao ? ` — ${c.instituicao}` : ""}</span>
              {c.ano && <span style={{ fontSize: "11.5px", color: "#4A4F49" }}>{c.ano}</span>}
            </div>
          ))}
        </>
      )}

      {voluntariado.some(v => v.cargo || v.organizacao) && (
        <>
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
        </>
      )}

      {skillsList.length > 0 && (<><H>Habilidades</H><p style={{ margin: 0 }}>{skillsList.join("  •  ")}</p></>)}

      {idiomas.some(l => l.idioma) && (
        <>
          <H>Idiomas</H>
          <p style={{ margin: 0 }}>{idiomas.filter(l => l.idioma).map(l => `${l.idioma} (${l.nivel})`).join("  •  ")}</p>
        </>
      )}
    </div>
  );
}

export default function ResumeBuilder({ user }) {
  const [data, setData] = useState(initialData);
  const [template, setTemplate] = useState("moderno");
  const [openSection, setOpenSection] = useState("contato");
  const [mobileView, setMobileView] = useState("form");
  const [saveState, setSaveState] = useState("loading"); // loading | saved | saving | offline
  const skipNextSave = useRef(true);
  const saveTimer = useRef(null);

  // Carrega o currículo salvo do usuário logado
  useEffect(() => {
    (async () => {
      try {
        const saved = await loadResume(user.uid);
        if (saved) {
          if (saved.data) setData(saved.data);
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

  // Salva automaticamente (com debounce) no Firestore, vinculado ao uid
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

  const resetAll = async () => {
    if (!window.confirm("Isso vai apagar todos os dados salvos deste currículo. Continuar?")) return;
    setData(initialData);
    setTemplate("moderno");
    try { await saveResume(user.uid, { data: initialData, template: "moderno" }); } catch (err) {}
  };

  const atsChecks = useMemo(() => ([
    "Layout de coluna única, sem tabelas ou caixas de texto",
    "Fontes padrão (Arial/Georgia) legíveis por qualquer sistema",
    "Sem ícones, imagens ou gráficos no conteúdo do texto",
    "Títulos de seção em formato reconhecido pelos ATS",
  ]), []);

  const handlePrint = () => window.print();

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
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
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
          <div className="flex items-center gap-3">
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
          <div className="bg-white border border-[#E3E6E1] rounded-lg p-4">
            <div className="text-sm font-semibold text-[#12181F] mb-3 flex items-center gap-1.5">
              <Sparkles size={15} className="text-[#1F6F5C]" /> Escolha o layout
            </div>
            <div className="grid grid-cols-3 gap-2">
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
          </div>

          <Section icon={User} title="Dados pessoais" open={openSection === "contato"} onToggle={() => toggle("contato")}>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nome completo" value={data.contato.nome} onChange={e => setContato("nome", e.target.value)} />
              <Field label="Cargo desejado" value={data.contato.cargo} onChange={e => setContato("cargo", e.target.value)} placeholder="Ex: Analista de Dados" />
              <Field label="E-mail" value={data.contato.email} onChange={e => setContato("email", e.target.value)} />
              <Field label="Telefone" value={data.contato.telefone} onChange={e => setContato("telefone", e.target.value)} />
              <Field label="Cidade" value={data.contato.cidade} onChange={e => setContato("cidade", e.target.value)} />
              <Field label="LinkedIn" value={data.contato.linkedin} onChange={e => setContato("linkedin", e.target.value)} placeholder="linkedin.com/in/..." />
              <Field label="Portfólio / Site" value={data.contato.portfolio} onChange={e => setContato("portfolio", e.target.value)} placeholder="seusite.com" />
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

        <div className={`${mobileView === "form" ? "hidden lg:block" : ""}`}>
          <div id="no-print" className="bg-white border border-[#E3E6E1] rounded-lg p-4 mb-4">
            <div className="text-sm font-semibold text-[#12181F] mb-2.5">Compatibilidade com ATS</div>
            <div className="space-y-1.5">
              {atsChecks.map((c, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-[#4A4F49]">
                  <CheckCircle2 size={14} className="text-[#1F6F5C] shrink-0 mt-0.5" />
                  {c}
                </div>
              ))}
            </div>
          </div>
          <div className="lg:sticky lg:top-[90px]">
            <div id="print-area" className="bg-white border border-[#E3E6E1] rounded-lg shadow-sm overflow-hidden">
              <Resume data={data} template={template} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
