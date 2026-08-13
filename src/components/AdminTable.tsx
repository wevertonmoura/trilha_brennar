import { Search, ShieldAlert, Download, Eye, Loader2, Clock, Check, Pencil, MessageCircle, Trash2 } from 'lucide-react';

export default function AdminTable({
  abaAtual, busca, setBusca, exportarPlanilha, exportarPlanilhaCompleta,
  filtroStatus, setFiltroStatus, adminDataLength, totalPagos, dadosFiltrados,
  loading, aprovarPagamentoManual, aprovandoId, setEditandoParticipante,
  chamarNoWhatsApp, excluirParticipante, excluindoId
}: any) {
  return (
    <div className="bg-zinc-900/60 backdrop-blur-xl rounded-[2.5rem] border border-zinc-800/80 overflow-hidden shadow-2xl">
      <div className="p-6 md:p-8 border-b border-zinc-800/80 bg-zinc-900/40 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto flex-1">
          <div className="bg-zinc-800/50 p-3 rounded-xl border border-zinc-700/50"><Search size={20} className="text-emerald-500" /></div>
          <input 
            type="text" 
            placeholder="Pesquisar por nome ou WhatsApp..." 
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="bg-transparent border-none outline-none text-base md:text-lg font-bold text-white w-full placeholder:text-zinc-600 focus:ring-0"
          />
        </div>
        
        {abaAtual === 'inscricoes' && (
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-4 md:mt-0">
            <button onClick={exportarPlanilha} className="w-full sm:w-auto bg-red-500/10 hover:bg-red-500/20 text-red-500 px-6 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all border border-red-500/30">
              <ShieldAlert size={18} /> Lista SOS
            </button>
            <button onClick={exportarPlanilhaCompleta} className="w-full sm:w-auto bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 px-6 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all border border-emerald-500/30">
              <Download size={18} /> Baixar Dados Pagantes
            </button>
          </div>
        )}
      </div>

      {abaAtual === 'inscricoes' && (
        <div className="px-6 md:px-8 py-4 bg-zinc-900/20 border-b border-zinc-800/50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-zinc-950/60 p-1 rounded-xl border border-zinc-800/60">
            <button type="button" onClick={() => setFiltroStatus('todos')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${filtroStatus === 'todos' ? 'bg-zinc-800 text-white border border-zinc-700 shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}>Todos ({adminDataLength})</button>
            <button type="button" onClick={() => setFiltroStatus('pagos')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${filtroStatus === 'pagos' ? 'bg-emerald-500 text-zinc-950 font-black shadow-lg shadow-emerald-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'}`}><Eye size={14} /> Só Pagantes ({totalPagos})</button>
            <button type="button" onClick={() => setFiltroStatus('pendentes')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${filtroStatus === 'pendentes' ? 'bg-zinc-800 text-white border border-zinc-700 shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}>Pendentes ({adminDataLength - totalPagos})</button>
          </div>
          <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Mostrando {dadosFiltrados.length} participante(s) na lista abaixo</div>
        </div>
      )}

      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-emerald-500" size={32} /></div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-zinc-950/50 text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">
              <tr>
                <th className="p-6 whitespace-nowrap">{abaAtual === 'inscricoes' ? 'Participante & Doc' : 'Inscrito na Lista VIP'}</th>
                <th className="p-6 whitespace-nowrap">Contato</th>
                <th className="p-6 whitespace-nowrap text-right">Status & Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50 text-sm">
              {dadosFiltrados.map((p: any, i: number) => (
                <tr key={p.id || i} className="hover:bg-zinc-800/30 transition-all duration-300 group">
                  <td className="p-6">
                    <div className="font-black text-white text-base tracking-tight mb-1 group-hover:text-emerald-400 transition-colors">{p.nome}</div>
                    <div className="flex flex-col gap-2 items-start">
                      {abaAtual === 'inscricoes' ? (
                        <span className="text-[10px] bg-zinc-950 text-zinc-500 px-2 py-1 rounded font-mono uppercase border border-zinc-800">
                          {p.cpf ? `CPF: ${p.cpf}` : 'CPF Pendente'}
                        </span>
                      ) : (
                        <span className="text-[10px] bg-zinc-950 text-emerald-500 px-2 py-1 rounded font-bold uppercase border border-emerald-500/30">
                          Origem: {p.interesse || 'Edição Anterior'}
                        </span>
                      )}
                      
                      {p.created_at && (
                        <span className="text-[10px] text-zinc-500 flex items-center gap-1 font-bold uppercase tracking-widest mt-1">
                          <Clock size={12} className="text-emerald-500/50" />
                          {new Date(p.created_at).toLocaleDateString('pt-BR')} às {new Date(p.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="p-6">
                    <div className="font-bold text-zinc-300 mb-1">{p.telefone}</div>
                    {abaAtual === 'inscricoes' && (
                      <div className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full inline-block"></span> 
                        SOS: <span className="text-zinc-400">{p.contato_emergencia || 'N/A'}</span>
                      </div>
                    )}
                  </td>

                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {abaAtual === 'inscricoes' ? (
                        <>
                          {p.pago ? (
                            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                              <span className="text-[10px] font-black text-emerald-400 tracking-widest uppercase mt-[1px]">Pago</span>
                            </div>
                          ) : (
                            <>
                              <button onClick={() => aprovarPagamentoManual(p.id)} disabled={aprovandoId === p.id} className="bg-zinc-800 hover:bg-emerald-600 hover:text-white text-zinc-400 p-2 rounded-full transition-colors border border-zinc-700 hover:border-emerald-500 group-hover:opacity-100 opacity-60 flex items-center justify-center" title="Aprovar Manualmente">
                                {aprovandoId === p.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                              </button>
                              <div className="inline-flex items-center gap-2 bg-zinc-800/80 border border-zinc-700/80 px-4 py-2 rounded-full">
                                <span className="w-2 h-2 bg-zinc-500 rounded-full"></span>
                                <span className="text-[10px] font-black text-zinc-400 tracking-widest uppercase mt-[1px]">Pendente</span>
                              </div>
                            </>
                          )}
                          <button onClick={() => setEditandoParticipante({ ...p })} className="bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-zinc-400 p-2 rounded-full transition-colors border border-zinc-700 hover:border-amber-400 group-hover:opacity-100 opacity-60 flex items-center justify-center ml-2" title="Editar Registro">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => chamarNoWhatsApp(p.telefone, false, p.nome)} className="bg-zinc-800 hover:bg-[#25D366] hover:text-white text-zinc-400 p-2 rounded-full transition-colors border border-zinc-700 hover:border-[#25D366] group-hover:opacity-100 opacity-60 flex items-center justify-center ml-2" title="Enviar mensagem no WhatsApp">
                            <MessageCircle size={16} />
                          </button>
                          <button onClick={() => excluirParticipante(p.id, p.nome)} disabled={excluindoId === p.id} className="bg-zinc-800 hover:bg-red-600 hover:text-white text-zinc-400 p-2 rounded-full transition-colors border border-zinc-700 hover:border-red-500 group-hover:opacity-100 opacity-60 flex items-center justify-center ml-2" title="Excluir Participante">
                            {excluindoId === p.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                          </button>
                        </>
                      ) : (
                        <button onClick={() => chamarNoWhatsApp(p.telefone, true, p.nome)} className="bg-zinc-800 hover:bg-[#25D366] hover:text-white text-zinc-400 px-4 py-2 rounded-xl transition-colors border border-zinc-700 hover:border-[#25D366] flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                          <MessageCircle size={16} /> Avisar Trilha Nova
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {!loading && dadosFiltrados.length === 0 && (
          <div className="p-24 text-center flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800 text-zinc-700">
              <Search size={24} />
            </div>
            <p className="text-zinc-500 font-black uppercase text-xs tracking-widest">
              {abaAtual === 'inscricoes' ? 'Nenhum participante encontrado neste filtro' : 'A Lista VIP está vazia no momento'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}