import { AlertTriangle, CheckCircle, AlertCircle, Loader2, Send, Trash2, Plus, ChevronRight } from 'lucide-react';

export default function Formulario({
  vagasEsgotadas,
  esperaSucesso,
  handleListaEspera,
  nomeEspera,
  setNomeEspera,
  telefoneEspera,
  setTelefoneEspera,
  errorMsg,
  esperaLoading,
  handleSubmit,
  participants,
  updateParticipant,
  removeParticipant,
  addParticipant,
  termsAccepted,
  setTermsAccepted,
  loading,
  calcularValorBase,
  taxaPix,
  formatarMoeda
}: any) {
  return (
    <>
      <div className="text-center mb-10">
        <h2 className="text-4xl font-black uppercase italic tracking-tighter text-zinc-900">INSCRIÇÃO</h2>
        {!vagasEsgotadas && (
          <div className="flex flex-col gap-1 mt-2">
            <p className="text-emerald-600 text-sm font-bold tracking-widest uppercase">Individual: R$ 55,00</p>
            <p className="text-pink-500 text-xs font-black tracking-widest uppercase animate-pulse">🔥 Casadinha: 2 pessoas por R$ 100,00</p>
          </div>
        )}
      </div>

      {vagasEsgotadas ? (
        <div className="bg-gradient-to-b from-red-50 to-white border border-red-200 p-8 rounded-[2rem] text-center shadow-inner mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <AlertTriangle size={48} className="mx-auto mb-4 text-red-500 animate-pulse" />
          <h3 className="text-2xl font-black uppercase tracking-widest mb-2 text-red-600">Lote Esgotado!</h3>
          <p className="text-sm font-bold text-zinc-700 leading-relaxed mb-6">
            A demanda foi gigante e as vagas acabaram! Mas não se preocupe, estamos organizando a <strong className="text-emerald-600">Próxima Edição</strong>.
          </p>
          
          {esperaSucesso ? (
            <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl animate-in zoom-in">
              <CheckCircle className="text-emerald-500 mx-auto mb-2" size={32} />
              <p className="text-emerald-800 font-bold text-sm uppercase tracking-widest">Tudo Certo!</p>
              <p className="text-emerald-600/80 text-xs mt-1">Você está na Lista VIP. Fique de olho no seu WhatsApp.</p>
            </div>
          ) : (
            <form onSubmit={handleListaEspera} className="space-y-4 text-left">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-zinc-200">
                <h4 className="text-[10px] font-black uppercase text-zinc-500 mb-4 tracking-widest text-center">Entre na Lista de Espera VIP</h4>
                <div className="space-y-3">
                  <input type="text" placeholder="Seu Nome Completo" value={nomeEspera} onChange={e => setNomeEspera(e.target.value)} className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-4 py-3 focus:border-emerald-500 outline-none font-bold text-sm text-zinc-900 transition-all placeholder-zinc-400" />
                  <input type="tel" placeholder="Seu WhatsApp" value={telefoneEspera} onChange={e => {
                      let v = e.target.value.replace(/\D/g, ""); 
                      if (v.length > 11) v = v.slice(0, 11); 
                      if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`; 
                      if (v.length > 10) v = `${v.slice(0, 10)}-${v.slice(10)}`; 
                      setTelefoneEspera(v);
                    }} className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-4 py-3 focus:border-emerald-500 outline-none font-bold text-sm text-zinc-900 transition-all placeholder-zinc-400" />
                </div>
                {errorMsg && <div className="mt-3 text-red-500 text-[10px] font-bold flex items-center gap-1"><AlertCircle size={12}/> {errorMsg}</div>}
                <button disabled={esperaLoading} className="w-full mt-4 bg-zinc-900 hover:bg-zinc-800 text-white font-black py-4 rounded-xl shadow-lg transition-all uppercase tracking-widest flex items-center justify-center gap-2 text-xs">
                  {esperaLoading ? <Loader2 className="animate-spin" size={16} /> : <>Garantir Prioridade <Send size={14} /></>}
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {participants.map((participant: any, index: number) => (
            <div key={index} className="p-6 rounded-3xl bg-zinc-50 border border-zinc-200 relative shadow-inner">
              {index > 0 && (
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs font-black uppercase text-zinc-500 tracking-widest">Acompanhante {index}</span>
                  <button type="button" onClick={() => removeParticipant(index)} className="text-zinc-400 hover:text-red-500 transition-colors p-1"><Trash2 size={18} /></button>
                </div>
              )}
              <div className="grid grid-cols-1 gap-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-zinc-500 ml-1">
                    {index === 0 ? "Nome Completo (Titular)" : "Nome do Acompanhante"}
                  </label>
                  <input type="text" value={participant.name} onChange={e => updateParticipant(index, 'name', e.target.value)} className="w-full bg-white border border-zinc-300 rounded-xl px-4 py-3 focus:border-emerald-500 outline-none font-bold text-sm text-zinc-900 transition-all shadow-sm placeholder-zinc-400" placeholder="Ex: João Silva" />
                </div>
                
                {index === 0 && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-zinc-500 ml-1">WhatsApp</label>
                      <input type="tel" value={participant.phone} onChange={e => updateParticipant(index, 'phone', e.target.value)} className="w-full bg-white border border-zinc-300 rounded-xl px-4 py-3 focus:border-emerald-500 outline-none font-bold text-sm text-zinc-900 transition-all shadow-sm placeholder-zinc-400" placeholder="(81) 99999-9999" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-zinc-500 ml-1">CPF</label>
                      <input type="text" required value={participant.cpf} onChange={e => updateParticipant(index, 'cpf', e.target.value)} className="w-full bg-white border border-zinc-300 rounded-xl px-4 py-3 focus:border-emerald-500 outline-none font-bold text-sm text-zinc-900 transition-all shadow-sm placeholder-zinc-400" placeholder="000.000.000-00" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-zinc-500 ml-1">E-mail</label>
                      <input type="email" value={participant.email} onChange={e => updateParticipant(index, 'email', e.target.value)} className="w-full bg-white border border-zinc-300 rounded-xl px-4 py-3 focus:border-emerald-500 outline-none font-bold text-sm text-zinc-900 transition-all shadow-sm placeholder-zinc-400" placeholder="seu@gmail.com" />
                    </div>
                    <div className="space-y-1 mt-2">
                      <label className="text-[10px] font-black uppercase text-zinc-500 ml-1">Contato de Emergência (SOS)</label>
                      <div className="grid grid-cols-2 gap-3">
                        <input type="text" placeholder="Nome do SOS" value={participant.emergency_name} onChange={e => updateParticipant(index, 'emergency_name', e.target.value)} className="w-full bg-white border border-zinc-300 rounded-xl px-4 py-3 focus:border-emerald-500 outline-none font-bold text-sm text-zinc-900 transition-all shadow-sm" />
                        <input type="tel" placeholder="(81) 99999-9999" value={participant.emergency_phone} onChange={e => updateParticipant(index, 'emergency_phone', e.target.value)} className="w-full bg-white border border-zinc-300 rounded-xl px-4 py-3 focus:border-emerald-500 outline-none font-bold text-sm text-zinc-900 transition-all shadow-sm" />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
          <button type="button" onClick={addParticipant} className="w-full py-4 border-2 border-dashed border-zinc-300 rounded-2xl text-zinc-500 font-bold hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest"><Plus size={16} /> Adicionar Acompanhante (+ Ingresso)</button>
          
          <div className="flex items-start gap-3 pt-6 border-t border-zinc-200">
            <input type="checkbox" id="terms" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} className="mt-1 h-5 w-5 accent-emerald-500 cursor-pointer rounded border-zinc-300" />
            <label htmlFor="terms" className="text-[11px] text-zinc-500 font-bold leading-relaxed cursor-pointer select-none">
              Aceito o Termo de Responsabilidade (declaro estar em boas condições de saúde) e estou ciente de que a inscrição é pessoal e intransferível.
            </label>
          </div>
          
          {errorMsg && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-[10px] font-bold flex items-center gap-2"><AlertCircle size={14}/> {errorMsg}</div>}
          
          <button disabled={loading} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-5 rounded-2xl shadow-lg shadow-emerald-500/30 transition-all uppercase tracking-widest flex items-center justify-center gap-3 text-sm mt-4">
            {loading ? <Loader2 className="animate-spin" /> : <>Finalizar Compra (R$ {formatarMoeda(calcularValorBase(participants.length) + taxaPix)}) <ChevronRight size={20} /></>}
          </button>
        </form>
      )}
    </>
  );
}