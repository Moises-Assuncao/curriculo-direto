import React, { useEffect, useState } from "react";
import { FileText, Plus, Trash2, Pencil, LogOut, Loader2 } from "lucide-react";
import { listResumes, createResume, deleteResumeItem, renameResumeItem, signOutUser } from "../firebase";

function fmtDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return "";
  }
}

export default function Dashboard({ user, onOpen }) {
  const [items, setItems] = useState(null);
  const [creating, setCreating] = useState(false);

  const refresh = async () => {
    const list = await listResumes(user.uid);
    setItems(list);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.uid]);

  const handleCreate = async () => {
    const nome = window.prompt("Nome desse currículo:", "Novo currículo");
    if (nome === null) return;
    setCreating(true);
    try {
      const item = await createResume(user.uid, nome.trim() || "Novo currículo");
      onOpen(item.id);
    } finally {
      setCreating(false);
    }
  };

  const handleRename = async (item) => {
    const nome = window.prompt("Novo nome pra esse currículo:", item.nome);
    if (nome === null || !nome.trim()) return;
    await renameResumeItem(user.uid, item.id, nome.trim());
    refresh();
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Apagar o currículo "${item.nome}"? Essa ação não pode ser desfeita.`)) return;
    await deleteResumeItem(user.uid, item.id);
    refresh();
  };

  return (
    <div className="min-h-screen bg-[#F6F7F5]">
      <header className="border-b border-[#E3E6E1] bg-white sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#1F6F5C] flex items-center justify-center">
              <FileText size={17} className="text-white" />
            </div>
            <span style={{ fontFamily: "Fraunces, serif" }} className="text-lg font-bold text-[#12181F]">
              Currículo Direto
            </span>
          </div>
          <div className="flex items-center gap-3">
            {user.photoURL && (
              <img src={user.photoURL} alt={user.displayName || "Usuário"} className="w-7 h-7 rounded-full" referrerPolicy="no-referrer" />
            )}
            <button onClick={signOutUser} className="text-[#6B7268] hover:text-[#B4483B] p-2 rounded-md transition-colors" title="Sair">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-5 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 style={{ fontFamily: "Fraunces, serif" }} className="text-2xl font-bold text-[#12181F]">
            Meus currículos
          </h1>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="flex items-center gap-2 bg-[#1F6F5C] hover:bg-[#195a4a] text-white text-sm font-semibold px-4 py-2 rounded-md transition-colors disabled:opacity-60"
          >
            {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            Novo currículo
          </button>
        </div>

        {items === null && (
          <div className="flex items-center justify-center py-24 text-[#8A9187]">
            <Loader2 size={20} className="animate-spin" />
          </div>
        )}

        {items && items.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-[#E3E6E1] rounded-xl">
            <p className="text-[#6B7268] mb-4">Você ainda não tem nenhum currículo.</p>
            <button onClick={handleCreate} className="text-[#1F6F5C] font-semibold hover:underline">
              Criar o primeiro
            </button>
          </div>
        )}

        {items && items.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => onOpen(item.id)}
                className="cursor-pointer text-left bg-white border border-[#E3E6E1] rounded-xl p-5 hover:border-[#1F6F5C] hover:shadow-md transition-all group"
              >
                <div className="w-9 h-9 rounded-lg bg-[#EEF5F2] flex items-center justify-center mb-4">
                  <FileText size={17} className="text-[#1F6F5C]" />
                </div>
                <div className="font-semibold text-[#12181F] mb-1 truncate">{item.nome || "Sem nome"}</div>
                <div className="text-xs text-[#8A9187] mb-4">
                  {item.atualizadoEm ? `Editado em ${fmtDate(item.atualizadoEm)}` : "Ainda não editado"}
                </div>
                <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRename(item); }}
                    className="text-xs text-[#6B7268] hover:text-[#1F6F5C] flex items-center gap-1"
                  >
                    <Pencil size={12} /> Renomear
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
                    className="text-xs text-[#6B7268] hover:text-[#B4483B] flex items-center gap-1"
                  >
                    <Trash2 size={12} /> Apagar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
