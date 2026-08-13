import { Loader2 } from 'lucide-react';

export default function AdminEditModal({ editandoParticipante, setEditandoParticipante, salvarEdicao, salvandoId }: any) {
  if (!editandoParticipante) return null;

  return (
    <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div className="bg-zinc-900 border border-zinc-800/80 p-6 md:p-8 rounded-[2rem] max-w-md w-full space-y-6 shadow-2xl relative">
        <div>
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">Editar Participante</h2>
          <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mt-1">Alterar dados do formulário</p>
        </div>
        
        <form onSubmit={salvarEdicao} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Nome Completo</label>
            <input type="text" value={editandoParticipante.nome || ''} onChange={e => setEditandoParticipante({ ...editandoParticipante, nome: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-emerald-500 transition-colors" required />
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">WhatsApp (Telefone)</label>
            <input type="text" value={editandoParticipante.telefone || ''} onChange={e => setEditandoParticipante({ ...editandoParticipante, telefone: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-emerald-500 transition-colors" required />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">CPF</label>
            <input type="text" value={editandoParticipante.cpf || ''} onChange={e => setEditandoParticipante({ ...editandoParticipante, cpf: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-emerald-500 transition-colors" placeholder="CPF Pendente" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Contato de Emergência (SOS)</label>
            <input type="text" value={editandoParticipante.contato_emergencia || ''} onChange={e => setEditandoParticipante({ ...editandoParticipante, contato_emergencia: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-emerald-500 transition-colors" placeholder="Não informado" />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setEditandoParticipante(null)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest border border-zinc-700 transition-all">Cancelar</button>
            <button type="submit" disabled={salvandoId === editandoParticipante.id} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
              {salvandoId === editandoParticipante.id ? <Loader2 size={14} className="animate-spin" /> : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}