import React, { useState, useEffect } from "react";
import {
  FileText, ArrowRight, UploadCloud, Target, CheckCircle2,
  Palette, LayoutTemplate, Cloud, ShieldCheck, Sparkles,
  GraduationCap, HeartHandshake, Quote, FileDown,
} from "lucide-react";

const STEPS = [
  {
    n: "01",
    icon: UploadCloud,
    titulo: "Preencha suas informações",
    desc: "Nome, experiências, formação, cursos e habilidades — direto no formulário, sem complicação.",
  },
  {
    n: "02",
    icon: Palette,
    titulo: "Escolha o visual",
    desc: "Vários modelos prontos, cor de destaque e ordem das seções do seu jeito.",
  },
  {
    n: "03",
    icon: CheckCircle2,
    titulo: "Baixe em PDF",
    desc: "Currículo pronto, com nome de arquivo à sua escolha, pronto pra enviar pras vagas.",
  },
];

const FEATURES = [
  { icon: ShieldCheck, titulo: "Pronto pro ATS", desc: "Modelos pensados pra passar pelos sistemas automáticos de triagem." },
  { icon: LayoutTemplate, titulo: "Vários modelos", desc: "De clássico e discreto a moderno com foto e cor." },
  { icon: Cloud, titulo: "Salvo na nuvem", desc: "Entre com sua conta Google e continue de onde parou, em qualquer aparelho." },
  { icon: Sparkles, titulo: "100% seu", desc: "Personalize cores e a ordem das seções do jeito que fizer sentido pra sua vaga." },
];

function FillingStage() {
  return (
    <div>
      <div className="mb-3.5">
        <div className="text-[10px] font-medium text-[#8A9187] mb-1">Nome completo</div>
        <div className="h-2.5 bg-[#EEF5F2] rounded overflow-hidden">
          <div className="h-full bg-[#1F6F5C]/70 rounded animate-grow" style={{ animationDelay: "0s" }} />
        </div>
      </div>
      <div className="mb-3.5">
        <div className="text-[10px] font-medium text-[#8A9187] mb-1">Cargo desejado</div>
        <div className="h-2.5 bg-[#EEF5F2] rounded w-2/3 overflow-hidden">
          <div className="h-full bg-[#1F6F5C]/70 rounded animate-grow" style={{ animationDelay: "0.15s" }} />
        </div>
      </div>
      <div>
        <div className="text-[10px] font-medium text-[#8A9187] mb-1">Experiência profissional</div>
        <div className="h-2 bg-[#EEF5F2] rounded mb-1.5 overflow-hidden">
          <div className="h-full bg-[#C9A227]/70 rounded animate-grow" style={{ animationDelay: "0.3s" }} />
        </div>
        <div className="h-2 bg-[#EEF5F2] rounded mb-1.5 overflow-hidden">
          <div className="h-full bg-[#C9A227]/70 rounded animate-grow" style={{ animationDelay: "0.45s" }} />
        </div>
        <div className="h-2 bg-[#EEF5F2] rounded w-4/5 overflow-hidden">
          <div className="h-full bg-[#C9A227]/70 rounded animate-grow" style={{ animationDelay: "0.6s" }} />
        </div>
      </div>
    </div>
  );
}

function PreviewStage() {
  return (
    <div>
      <div className="h-3.5 bg-[#12181F] rounded w-2/3 mb-1.5 animate-fade-in" style={{ animationDelay: "0s" }} />
      <div className="h-2 bg-[#D7DBD3] rounded w-1/3 mb-3 animate-fade-in" style={{ animationDelay: "0.1s" }} />
      <div className="h-px bg-[#1F6F5C] w-full mb-3 animate-fade-in" style={{ animationDelay: "0.2s" }} />
      <div className="h-2 bg-[#EEF5F2] rounded mb-1.5 animate-fade-in" style={{ animationDelay: "0.3s" }} />
      <div className="h-2 bg-[#EEF5F2] rounded mb-1.5 w-11/12 animate-fade-in" style={{ animationDelay: "0.4s" }} />
      <div className="h-2 bg-[#EEF5F2] rounded mb-4 w-4/5 animate-fade-in" style={{ animationDelay: "0.5s" }} />
      <div className="h-2 bg-[#1F6F5C]/40 rounded w-1/4 mb-2 animate-fade-in" style={{ animationDelay: "0.6s" }} />
      <div className="h-2 bg-[#EEF5F2] rounded mb-1.5 animate-fade-in" style={{ animationDelay: "0.7s" }} />
      <div className="h-2 bg-[#EEF5F2] rounded w-3/4 animate-fade-in" style={{ animationDelay: "0.8s" }} />
    </div>
  );
}

function ExportStage() {
  return (
    <div className="flex flex-col items-center justify-center h-full pt-2">
      <div className="w-16 h-16 rounded-xl bg-[#EEF5F2] flex items-center justify-center mb-4 animate-fade-in">
        <FileDown size={28} className="text-[#1F6F5C]" />
      </div>
      <div className="h-2.5 bg-[#D7DBD3] rounded w-2/3 mb-2 animate-fade-in" style={{ animationDelay: "0.15s" }} />
      <div className="h-2 bg-[#EEF5F2] rounded w-1/2 mb-5 animate-fade-in" style={{ animationDelay: "0.3s" }} />
      <div className="flex items-center gap-2 text-[#1F6F5C] text-sm font-semibold animate-fade-in" style={{ animationDelay: "0.5s" }}>
        <CheckCircle2 size={16} /> Currículo baixado
      </div>
    </div>
  );
}

const DEMO_LABELS = ["01 · PREENCHENDO", "02 · PRÉ-VISUALIZANDO", "03 · EXPORTANDO"];

function DemoCard() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStage((s) => (s + 1) % 3), 3200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative bg-white border border-[#E3E6E1] rounded-2xl shadow-[0_20px_50px_-20px_rgba(18,24,31,0.25)] p-6 pb-10 w-full max-w-sm h-[420px] overflow-hidden">
      <div className="absolute -top-3 left-6 bg-[#1F6F5C] text-white text-[11px] font-semibold px-3 py-1 rounded-full tracking-wide">
        {DEMO_LABELS[stage]}
      </div>

      <div key={stage} className="mt-3">
        {stage === 0 && <FillingStage />}
        {stage === 1 && <PreviewStage />}
        {stage === 2 && <ExportStage />}
      </div>

      <div className="absolute bottom-5 left-0 right-0 flex items-center justify-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === stage ? "w-6 bg-[#1F6F5C]" : "w-1.5 bg-[#E3E6E1]"}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function Home({ onStart }) {
  return (
    <div className="min-h-screen bg-[#F6F7F5]" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <header className="border-b border-[#E3E6E1] bg-white/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#1F6F5C] flex items-center justify-center">
              <FileText size={17} className="text-white" />
            </div>
            <span style={{ fontFamily: "Fraunces, serif" }} className="text-lg font-bold text-[#12181F]">
              Currículo Direto
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-7 text-sm text-[#4A4F49] font-medium">
            <a href="#como-funciona" className="hover:text-[#1F6F5C] transition-colors">Como funciona</a>
            <a href="#recursos" className="hover:text-[#1F6F5C] transition-colors">Recursos</a>
            <a href="#sobre" className="hover:text-[#1F6F5C] transition-colors">Sobre</a>
          </nav>
          <button
            onClick={onStart}
            className="bg-[#1F6F5C] hover:bg-[#195a4a] text-white text-sm font-semibold px-4 py-2 rounded-md transition-colors"
          >
            Entrar com Google
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 pt-16 pb-20 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 bg-[#EEF5F2] text-[#1F6F5C] text-xs font-semibold px-3 py-1.5 rounded-full border border-[#D7E7E1] mb-6">
            <Sparkles size={12} /> Feito por você · pronto pro ATS
          </span>
          <h1 style={{ fontFamily: "Fraunces, serif" }} className="text-[2.75rem] leading-[1.08] sm:text-6xl sm:leading-[1.05] font-bold text-[#12181F] mb-6">
            Seu currículo,<br />
            <span className="text-[#1F6F5C]">sem enrolação.</span>
          </h1>
          <p className="text-base sm:text-lg text-[#4A4F49] mb-8 max-w-md leading-relaxed">
            Preencha suas informações, escolha um modelo e baixe um currículo em PDF pensado
            pra ser lido tanto por recrutadores quanto pelos sistemas de ATS.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <button
              onClick={onStart}
              className="group flex items-center gap-2 bg-[#1F6F5C] hover:bg-[#195a4a] text-white font-semibold px-6 py-3.5 rounded-lg transition-colors"
            >
              Criar meu currículo grátis
              <ArrowRight size={17} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
            <span className="text-xs text-[#8A9187]">Sem cartão de crédito. Só sua conta Google.</span>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <DemoCard />
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="max-w-6xl mx-auto px-5 py-16 border-t border-[#E3E6E1]">
        <span className="text-xs font-semibold tracking-wide text-[#1F6F5C] uppercase">Como funciona</span>
        <h2 style={{ fontFamily: "Fraunces, serif" }} className="text-3xl sm:text-4xl font-bold text-[#12181F] mt-2 mb-12 max-w-xl">
          Do zero ao PDF em três passos.
        </h2>
        <div className="grid sm:grid-cols-3 gap-5">
          {STEPS.map(s => (
            <div key={s.n} className="bg-white border border-[#E3E6E1] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-[#B4B9AE] tracking-wide">{s.n}</span>
                <div className="w-9 h-9 rounded-lg bg-[#EEF5F2] flex items-center justify-center">
                  <s.icon size={17} className="text-[#1F6F5C]" />
                </div>
              </div>
              <div className="font-semibold text-[#12181F] mb-1.5">{s.titulo}</div>
              <p className="text-sm text-[#6B7268] leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recursos */}
      <section id="recursos" className="max-w-6xl mx-auto px-5 py-16 border-t border-[#E3E6E1]">
        <span className="text-xs font-semibold tracking-wide text-[#1F6F5C] uppercase">Recursos</span>
        <h2 style={{ fontFamily: "Fraunces, serif" }} className="text-3xl sm:text-4xl font-bold text-[#12181F] mt-2 mb-12 max-w-xl">
          Tudo que você precisa, sem enfeite demais.
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map(f => (
            <div key={f.titulo} className="p-5">
              <div className="w-10 h-10 rounded-lg bg-[#12181F] flex items-center justify-center mb-4">
                <f.icon size={18} className="text-white" />
              </div>
              <div className="font-semibold text-[#12181F] mb-1.5">{f.titulo}</div>
              <p className="text-sm text-[#6B7268] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sobre */}
      <section id="sobre" className="max-w-6xl mx-auto px-5 py-16 border-t border-[#E3E6E1]">
        <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-12 items-center">
          <div className="flex justify-center lg:justify-start">
            <div className="relative w-full max-w-xs">
              <div className="absolute -inset-3 rounded-[28px] bg-gradient-to-br from-[#1F6F5C] to-[#C9A227] opacity-15" />
              <div className="relative bg-white border border-[#E3E6E1] rounded-3xl p-3 shadow-[0_20px_50px_-20px_rgba(18,24,31,0.25)]">
                <img
                  src="/foto-criador.jpg"
                  alt="Foto do criador do Currículo Direto"
                  className="w-full aspect-square object-cover rounded-2xl"
                />
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-[#12181F] text-white text-xs font-semibold px-4 py-2 rounded-full whitespace-nowrap shadow-md">
                  Moisés Assunção — Criador
                </div>
              </div>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold tracking-wide text-[#1F6F5C] uppercase">Sobre o criador</span>
            <h2 style={{ fontFamily: "Fraunces, serif" }} className="text-3xl sm:text-4xl font-bold text-[#12181F] mt-2 mb-5 leading-tight">
              Feito por um estudante,<br className="hidden sm:block" /> não por uma empresa.
            </h2>

            <div className="relative bg-[#EEF5F2] border border-[#D7E7E1] rounded-xl p-5 mb-6">
              <Quote size={20} className="text-[#1F6F5C] opacity-40 mb-1.5" />
              <p style={{ fontFamily: "Fraunces, serif" }} className="text-[#12181F] font-medium leading-snug">
                Criei o Currículo Direto pra unir duas coisas: colocar em prática o que venho aprendendo
                na faculdade e ajudar quem trava exatamente onde eu já travei — no filtro automático antes
                de chegar a um recrutador de verdade.
              </p>
            </div>

            <div className="space-y-4 text-[#4A4F49] text-sm sm:text-base leading-relaxed mb-8">
              <p>
                Sou estudante de Análise e Desenvolvimento de Sistemas, e o Currículo Direto nasceu como um
                projeto pra por em prática o que eu vinha estudando — do zero, com login, banco de dados e
                tudo o que um site de verdade precisa.
              </p>
              <p>
                Mas o motivo não foi só técnico. Currículo bom que nunca chega a ser lido por causa de
                formatação errada é um problema real, e eu não queria construir só mais um gerador bonito —
                queria um que realmente ajudasse.
              </p>
              <p>
                Por isso o site é <strong className="text-[#12181F]">gratuito pra todo mundo</strong>, sem
                pegadinha nem plano pago escondido. A ideia é que qualquer pessoa consiga sair daqui com um
                currículo profissional — inclusive quem nunca fez um currículo antes e não sabe por onde começar.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { icon: GraduationCap, titulo: "Projeto de faculdade", desc: "Aprendizado colocado em prática, do início ao fim." },
                { icon: ShieldCheck, titulo: "Pensado pro ATS", desc: "Resolver um problema que eu mesmo já enfrentei." },
                { icon: HeartHandshake, titulo: "Sempre gratuito", desc: "Sem mensalidade, sem pegadinha, pra todo mundo." },
              ].map((f) => (
                <div key={f.titulo} className="border border-[#E3E6E1] rounded-lg p-4 bg-white">
                  <f.icon size={18} className="text-[#1F6F5C] mb-2" />
                  <div className="text-sm font-semibold text-[#12181F] mb-1">{f.titulo}</div>
                  <p className="text-xs text-[#8A9187] leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="max-w-6xl mx-auto px-5 pb-20">
        <div className="bg-[#12181F] rounded-2xl px-8 py-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.07]" style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }} />
          <div className="relative">
            <h2 style={{ fontFamily: "Fraunces, serif" }} className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Bora colocar seu currículo no ar?
            </h2>
            <p className="text-[#B4B9AE] mb-7 text-sm sm:text-base">Leva menos de 10 minutos pra ter um currículo pronto.</p>
            <button
              onClick={onStart}
              className="inline-flex items-center gap-2 bg-[#1F6F5C] hover:bg-[#25836e] text-white font-semibold px-6 py-3.5 rounded-lg transition-colors"
            >
              Entrar com Google e começar
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#E3E6E1] py-8">
        <div className="max-w-6xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8A9187]">
          <span>© {new Date().getFullYear()} Currículo Direto</span>
          <span>Feito pra passar pelo ATS e impressionar quem lê depois.</span>
        </div>
      </footer>
    </div>
  );
}
