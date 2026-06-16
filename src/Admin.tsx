import { useState, useEffect } from 'react';
import { 
  UserCheck, DollarSign, Users, ArrowLeft, Loader2, Search, 
  ShieldAlert, Check, Download, Trash2, Clock, MessageCircle, Eye, Pencil, Ticket, Hourglass 
} from 'lucide-react';

const Admin = ({ senha, formatarMoeda, fecharAdmin }: any) => {
  const [abaAtual, setAbaAtual] = useState<'inscricoes' | 'espera'>('inscricoes');
  
  const [adminData, setAdminData] = useState<any[]>([]);
  const [listaEsperaData, setListaEsperaData] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'pagos' | 'pendentes'>('todos');
  const [aprovandoId, setAprovandoId] = useState<string | null>(null); 
  const [excluindoId, setExcluindoId] = useState<string | null>(null);

  const [editandoParticipante, setEditandoParticipante] = useState<any | null>(null);
  const [salvandoId, setSalvandoId] = useState<string | null>(null);

  useEffect(() => {
    carregarDados();
  }, [abaAtual]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      if (abaAtual === 'inscricoes') {
        const res = await fetch('/api/admin-listar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ senha })
        });
        const data = await res.json();
        if (data && !data.error) {
          // AQUI ESTÁ A CORREÇÃO: Remove duplicatas (mesmo nome e telefone) para não duplicar o pagamento
          const dadosLimpos = data.filter((pessoa: any, index: number, self: any[]) =>
            index === self.findIndex((t: any) => (
              t.nome.toLowerCase().trim() === pessoa.nome.toLowerCase().trim() && 
              t.telefone === pessoa.telefone
            ))
          );
          setAdminData(dadosLimpos);
        }
      } else {
        const res = await fetch('/api/admin-espera', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ senha })
        });
        const data = await res.json();
        if (data && !data.error) setListaEsperaData(data);
      }
    } catch (err) {
      console.error("Falha ao carregar dados:", err);
    }
    setLoading(false);
  };

  const aprovarPagamentoManual = async (id: string) => {
    setAprovandoId(id); 
    try {
      const res = await fetch('/api/admin-aprovar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senha, id })
      });
      if (res.ok) {
        setAdminData(prevData => prevData.map(item => item.id === id ? { ...item, pago: true } : item));
      } else {
        throw new Error("Acesso negado");
      }
    } catch (err) {
      alert("Erro ao aprovar manualmente.");
    } finally {
      setAprovandoId(null);
    }
  };

  const excluirParticipante = async (id: string, nome: string) => {
    if (!window.confirm(`Tem certeza que deseja EXCLUIR permanentemente a inscrição de ${nome}?`)) return;
    setExcluindoId(id);
    try {
      const res = await fetch('/api/admin-excluir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senha, id })
      });
      if (res.ok) {
        setAdminData(prevData => prevData.filter(item => item.id !== id));
      } else {
        throw new Error("Acesso negado");
      }
    } catch (err) {
      alert("Erro ao excluir participante.");
      console.error(err);
    } finally {
      setExcluindoId(null);
    }
  };

  const salvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editandoParticipante) return;
    setSalvandoId(editandoParticipante.id);
    try {
      const res = await fetch('/api/admin-editar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senha,
          id: editandoParticipante.id,
          nome: editandoParticipante.nome,
          telefone: editandoParticipante.telefone,
          cpf: editandoParticipante.cpf,
          contato_emergencia: editandoParticipante.contato_emergencia
        })
      });
      if (res.ok) {
        setAdminData(prevData => prevData.map(item => item.id === editandoParticipante.id ? editandoParticipante : item));
        setEditandoParticipante(null); 
      } else {
        throw new Error("Erro do servidor ao salvar");
      }
    } catch (err) {
      alert("Erro ao atualizar dados do participante.");
      console.error(err);
    } finally {
      setSalvandoId(null);
    }
  };

  const chamarNoWhatsApp = (telefone: string, isEspera: boolean = false, nomePessoa: string = '') => {
    let numeroFormatado = telefone.replace(/\D/g, ''); 
    if (numeroFormatado.length === 10 || numeroFormatado.length === 11) {
      numeroFormatado = '55' + numeroFormatado;
    }

    let textoMensagem = '';

    if (isEspera) {
      const primeiroNome = (nomePessoa || '').split(' ')[0];
      textoMensagem = `Fala ${primeiroNome}! 🌟 VOCÊ TEM PRIORIDADE! 🌟\n\nTudo bem? Você ficou na nossa lista de espera da última vez, então viemos te avisar em primeira mão: as inscrições para a trilha da Cachoeira do Brennand acabaram de abrir! 🤫\n\n🗓️ Data: 05 de Julho (Domingo)\n💰 Valor: R$ 35 (Individual) ou R$ 60 (Casadinha)\n✅ Incluso: Guias, medalha e banho de cachoeira!\n\nCorre no site e já garante o seu lugar antes que a gente divulgue no Instagram e acabe tudo de novo:\n\n👉 Acesse o site aqui:\nhttps://trilha-brennar.vercel.app/\n\nNos vemos na trilha! ⛰️🔥`;
    } else {
      const grupo = adminData.filter(p => p.telefone === telefone);
      if (grupo.length === 0) return;

      const titularObj = grupo.find(p => p.cpf && p.cpf.trim() !== '') || grupo[0];
      const titular = titularObj.nome.split(' ')[0];
      const acompanhantes = grupo.filter(p => p.id !== titularObj.id).map(p => p.nome.split(' ')[0]);

      let saudacao = "";
      if (acompanhantes.length > 0) {
        const nomesAcompanhantes = acompanhantes.join(' e ');
        saudacao = `Fala, ${titular} e ${nomesAcompanhantes}!`;
      } else {
        saudacao = `Fala, ${titular}!`;
      }
      
      textoMensagem = `${saudacao} Aqui é da organização do Vem Para Trilha. Passando para agradecer pela sua inscrição! A sua compra para a Cachoeira do Brennand foi CONFIRMADA com sucesso! ✅\n\nA nossa aventura já é no dia 05 de Julho! ⛰️🔥\n\nQueria te pedir um favor: manda aqui o seu @ do Instagram e uma foto sua bem massa para a gente preparar a sua arte de presença confirmada, beleza?\n\nAh, só para avisar: na semana da trilha vamos criar um grupo oficial no WhatsApp com todo mundo que vai participar para passar a localização exata, ponto de encontro e os últimos detalhes, beleza? Nos vemos lá! 🎒💦`;
    }
    
    window.open(`https://wa.me/${numeroFormatado}?text=${encodeURIComponent(textoMensagem)}`, '_blank');
  };

  const exportarPlanilha = () => {
    const personasConfirmadas = adminData.filter(p => p.pago === true);
    const headers = ["Nome Completo", "Contato de Emergência"];
    const csvRows = personasConfirmadas.map(p => [ `"${p.nome}"`, `"${p.contato_emergencia || 'Não informado'}"` ].join(';')); 
    const csvContent = [headers.join(';'), ...csvRows].join('\n');
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Lista_Emergencia_Trilha_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportarPlanilhaCompleta = () => {
    const personasConfirmadas = adminData.filter(p => p.pago === true);
    const headers = ["Nome Completo", "WhatsApp", "CPF", "Contato de Emergência"];
    const csvRows = personasConfirmadas.map(p => [ `"${p.nome}"`, `"${p.telefone}"`, `"${p.cpf || 'Não informado'}"`, `"${p.contato_emergencia || 'Não informado'}"` ].join(';')); 
    const csvContent = [headers.join(';'), ...csvRows].join('\n');
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Vem_Para_Trilha_Pagantes_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const pagos = adminData.filter(p => p.pago);
  const totalPagos = pagos.length;
  
  const calcularArrecadadoExato = () => {
    return totalPagos * 35;
  };

  const arrecadado = calcularArrecadadoExato();

  const dadosFiltrados = abaAtual === 'inscricoes' 
    ? adminData.filter(p => {
        const correspondeBusca = p.nome.toLowerCase().includes(busca.toLowerCase()) || p.telefone.includes(busca);
        if (filtroStatus === 'pagos') return correspondeBusca && p.pago;
        if (filtroStatus === 'pendentes') return correspondeBusca && !p.pago;
        return correspondeBusca;
      })
    : listaEsperaData.filter(p => (p.nome || '').toLowerCase().includes(busca.toLowerCase()) || (p.telefone || '').includes(busca));

  if (loading && abaAtual === 'inscricoes' && adminData.length === 0) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/20 blur-[100px] rounded-full"></div>
      <Loader2 className="animate-spin text-emerald-500 relative z-10" size={48} />
      <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest animate-pulse relative z-10">Carregando cofre...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8 font-sans relative overflow-hidden z-0">
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vh] bg-emerald-900/20 blur-[120px] rounded-full pointer-events-none -z-10"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40vw] h-[40vh] bg-zinc-800/40 blur-[120px] rounded-full pointer-events-none -z-10"></div>

      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* CABEÇALHO */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 p-6 md:p-8 rounded-[2rem] gap-6 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <ShieldAlert size={28} className="text-zinc-950" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Comando Central</h1>
              <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Vem Para Trilha • Edição Cachoeira do Brennand</p>
            </div>
          </div>
          <button onClick={fecharAdmin} className="w-full md:w-auto bg-zinc-800/80 hover:bg-zinc-700 text-white px-6 py-4 rounded-xl flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-widest transition-all border border-zinc-700 shadow-lg group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform"/> Voltar ao Site
          </button>
        </div>

        {/* CONTROLE DE ABAS */}
        <div className="flex bg-zinc-900/60 p-2 rounded-2xl border border-zinc-800/80 w-full md:w-fit mx-auto md:mx-0 shadow-lg backdrop-blur-md">
          <button 
            onClick={() => setAbaAtual('inscricoes')} 
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${abaAtual === 'inscricoes' ? 'bg-emerald-500 text-zinc-950 shadow-md' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
          >
            <Ticket size={16} /> Inscrições
          </button>
          <button 
            onClick={() => setAbaAtual('espera')} 
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${abaAtual === 'espera' ? 'bg-emerald-500 text-zinc-950 shadow-md' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
          >
            <Hourglass size={16} /> Lista VIP
          </button>
        </div>

        {/* CARDS (SÓ APARECEM NA ABA DE INSCRIÇÕES) */}
        {abaAtual === 'inscricoes' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-zinc-900/90 to-zinc-900/50 backdrop-blur-md p-8 rounded-[2rem] border border-zinc-800/50 shadow-xl flex items-center gap-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors"></div>
              <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20 shrink-0"><UserCheck size={32}/></div>
              <div>
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Confirmados</p>
                <h3 className="text-4xl font-black text-white tracking-tighter">{totalPagos}</h3>
              </div>
            </div>

            <div className="bg-gradient-to-br from-zinc-900/90 to-zinc-900/50 backdrop-blur-md p-8 rounded-[2rem] border border-zinc-800/50 shadow-xl flex items-center gap-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors"></div>
              <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20 shrink-0"><DollarSign size={32}/></div>
              <div>
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Arrecadado</p>
                <h3 className="text-4xl font-black text-white tracking-tighter">{formatarMoeda(arrecadado)}</h3>
              </div>
            </div>

            <div className="bg-gradient-to-br from-zinc-900/90 to-zinc-900/50 backdrop-blur-md p-8 rounded-[2rem] border border-zinc-800/50 shadow-xl flex items-center gap-6">
              <div className="w-16 h-16 bg-zinc-800/50 rounded-2xl flex items-center justify-center text-zinc-400 border border-zinc-700/50 shrink-0"><Users size={32}/></div>
              <div>
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Gerado</p>
                <h3 className="text-4xl font-black text-zinc-300 tracking-tighter">{adminData.length}</h3>
              </div>
            </div>
          </div>
        )}

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
                <button type="button" onClick={() => setFiltroStatus('todos')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${filtroStatus === 'todos' ? 'bg-zinc-800 text-white border border-zinc-700 shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}>Todos ({adminData.length})</button>
                <button type="button" onClick={() => setFiltroStatus('pagos')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${filtroStatus === 'pagos' ? 'bg-emerald-500 text-zinc-950 font-black shadow-lg shadow-emerald-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'}`}><Eye size={14} /> Só Pagantes ({totalPagos})</button>
                <button type="button" onClick={() => setFiltroStatus('pendentes')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${filtroStatus === 'pendentes' ? 'bg-zinc-800 text-white border border-zinc-700 shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}>Pendentes ({adminData.length - totalPagos})</button>
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
                  {dadosFiltrados.map((p, i) => (
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
      </div>

      {/* MODAL FLUTUANTE PARA EDIÇÃO DE PARTICIPANTE */}
      {editandoParticipante && (
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
      )}
    </div>
  );
};

export default Admin;