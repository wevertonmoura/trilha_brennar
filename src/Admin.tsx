import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, ShieldAlert, Ticket, Hourglass } from 'lucide-react';

// IMPORTAÇÃO DOS COMPONENTES
import AdminMetrics from './components/AdminMetrics';
import AdminTable from './components/AdminTable';
import AdminEditModal from './components/AdminEditModal';

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
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ senha })
        });
        const data = await res.json();
        if (data && !data.error) {
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
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ senha })
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
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ senha, id })
      });
      if (res.ok) {
        setAdminData(prevData => prevData.map(item => item.id === id ? { ...item, pago: true } : item));
      } else {
        throw new Error("Acesso negado");
      }
    } catch (err) { alert("Erro ao aprovar manualmente."); } 
    finally { setAprovandoId(null); }
  };

  const excluirParticipante = async (id: string, nome: string) => {
    if (!window.confirm(`Tem certeza que deseja EXCLUIR permanentemente a inscrição de ${nome}?`)) return;
    setExcluindoId(id);
    try {
      const res = await fetch('/api/admin-excluir', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ senha, id })
      });
      if (res.ok) {
        setAdminData(prevData => prevData.filter(item => item.id !== id));
      } else {
        throw new Error("Acesso negado");
      }
    } catch (err) { alert("Erro ao excluir participante."); console.error(err); } 
    finally { setExcluindoId(null); }
  };

  const salvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editandoParticipante) return;
    setSalvandoId(editandoParticipante.id);
    try {
      const res = await fetch('/api/admin-editar', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senha, id: editandoParticipante.id, nome: editandoParticipante.nome, telefone: editandoParticipante.telefone, cpf: editandoParticipante.cpf, contato_emergencia: editandoParticipante.contato_emergencia })
      });
      if (res.ok) {
        setAdminData(prevData => prevData.map(item => item.id === editandoParticipante.id ? editandoParticipante : item));
        setEditandoParticipante(null); 
      } else {
        throw new Error("Erro do servidor ao salvar");
      }
    } catch (err) { alert("Erro ao atualizar dados do participante."); console.error(err); } 
    finally { setSalvandoId(null); }
  };

  const chamarNoWhatsApp = (telefone: string, isEspera: boolean = false, nomePessoa: string = '') => {
    let numeroFormatado = telefone.replace(/\D/g, ''); 
    if (numeroFormatado.length === 10 || numeroFormatado.length === 11) numeroFormatado = '55' + numeroFormatado;

    let textoMensagem = '';
    
    if (isEspera) {
      const primeiroNome = (nomePessoa || '').split(' ')[0];
      textoMensagem = `Fala ${primeiroNome}! 🌟 VOCÊ TEM PRIORIDADE! 🌟\n\nTudo bem? Você ficou na nossa lista de espera da última vez, então viemos te avisar em primeira mão: as inscrições para a trilha da Cachoeira do Brennand acabaram de abrir! 🤫\n\n🗓️ Data: 13 de Setembro (Domingo)\n💰 Valor: R$ 55 (Individual) ou R$ 100 (Casadinha)\n✅ Incluso: Guias, medalha, café da manhã e banho de cachoeira!\n\nCorre no site e já garante o seu lugar antes que a gente divulgue no Instagram e acabe tudo de novo:\n\n👉 Acesse o site aqui:\nhttps://trilha-brennar.vercel.app/\n\nNos vemos na trilha! ⛰️🔥`;
    } else {
      const grupo = adminData.filter(p => p.telefone === telefone);
      if (grupo.length === 0) return;
      const titularObj = grupo.find(p => p.cpf && p.cpf.trim() !== '') || grupo[0];
      const acompanhantes = grupo.filter(p => p.id !== titularObj.id).map(p => p.nome.split(' ')[0]);
      const titular = titularObj.nome.split(' ')[0];

      let saudacao = acompanhantes.length > 0 ? `Fala, ${titular} e ${acompanhantes.join(' e ')}!` : `Fala, ${titular}!`;
      let parteAcompanhante = acompanhantes.length > 0 ? `\n\n(Como vocês compraram em grupo, *enviei o link abaixo para o(s) acompanhante(s)*: ${acompanhantes.join(', ')}. Não esqueçam de compartilhar com eles!)` : "";

      textoMensagem = `${saudacao} Aqui é da organização do Vem Para Trilha. Passando para agradecer pela sua inscrição! A sua compra para a Cachoeira do Brennand foi CONFIRMADA com sucesso! ✅\n\n🚨 ATENÇÃO: A nossa aventura será no dia 13/09!\n\n🇧🇷 *TRILHA TEMÁTICA:*\nVamos no clima de aventura e conexão com a natureza! 💛💚\n\n📲 *PASSO OBRIGATÓRIO (GRUPO OFICIAL):*\nEntre agora no grupo oficial da trilha para receber o ponto de encontro e os horários finais:\n👉 https://chat.whatsapp.com/C7tsQCDzq0y6WZTnklNGmM${parteAcompanhante}\n\n⚠️ *AVISO IMPORTANTE - ZERO PENETRAS:*\nFaremos uma chamada nominal e detalhada pela lista de pagantes antes de iniciar a trilha. Só fará o percurso quem estiver com o nome na lista. Por favor, *não levem pessoas sem ingresso (penetras)* para evitar constrangimentos e não passar vergonha na hora, beleza?\n\nNos vemos na trilha! Bora simbora lavar a alma! 💦🎒`;
    }
    
    window.open(`https://wa.me/${numeroFormatado}?text=${encodeURIComponent(textoMensagem)}`, '_blank');
  };

  const exportarPlanilha = () => {
    const personasConfirmadas = adminData.filter(p => p.pago === true);
    const csvContent = ["Nome Completo;Contato de Emergência", ...personasConfirmadas.map(p => `"${p.nome}";"${p.contato_emergencia || 'Não informado'}"`)].join('\n');
    baixarArquivo(csvContent, `Lista_Emergencia_Trilha_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.csv`);
  };

  const exportarPlanilhaCompleta = () => {
    const personasConfirmadas = adminData.filter(p => p.pago === true);
    const csvContent = ["Nome Completo;WhatsApp;CPF;Contato de Emergência", ...personasConfirmadas.map(p => `"${p.nome}";"${p.telefone}";"${p.cpf || 'Não informado'}";"${p.contato_emergencia || 'Não informado'}"`)].join('\n');
    baixarArquivo(csvContent, `Vem_Para_Trilha_Pagantes_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.csv`);
  };

  const baixarArquivo = (content: string, filename: string) => {
    const blob = new Blob(["\uFEFF" + content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // === NOVO CÁLCULO INTELIGENTE DE ARRECADAÇÃO ===
  const pagos = adminData.filter(p => p.pago);
  const totalPagos = pagos.length;
  
  const calcularArrecadadoExato = () => {
    let total = 0;
    const grupos: Record<string, number> = {};
    
    // Agrupa quantas pessoas compraram no mesmo número de telefone
    pagos.forEach(p => {
      if (!grupos[p.telefone]) grupos[p.telefone] = 0;
      grupos[p.telefone]++;
    });

    // Aplica a regra da casadinha para cada grupo
    Object.values(grupos).forEach(qtd => {
      const pares = Math.floor(qtd / 2);
      const avulsos = qtd % 2;
      total += (pares * 100) + (avulsos * 55);
    });

    return total;
  };

  const arrecadado = calcularArrecadadoExato();
  // ===============================================

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
          <button onClick={() => setAbaAtual('inscricoes')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${abaAtual === 'inscricoes' ? 'bg-emerald-500 text-zinc-950 shadow-md' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}>
            <Ticket size={16} /> Inscrições
          </button>
          <button onClick={() => setAbaAtual('espera')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${abaAtual === 'espera' ? 'bg-emerald-500 text-zinc-950 shadow-md' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}>
            <Hourglass size={16} /> Lista VIP
          </button>
        </div>

        {/* MÉTRICAS (SÓ APARECEM NA ABA DE INSCRIÇÕES) */}
        {abaAtual === 'inscricoes' && (
          <AdminMetrics totalPagos={totalPagos} arrecadado={arrecadado} totalGerado={adminData.length} formatarMoeda={formatarMoeda} />
        )}

        {/* TABELA DE DADOS, FILTROS E BUSCA */}
        <AdminTable 
          abaAtual={abaAtual} busca={busca} setBusca={setBusca} exportarPlanilha={exportarPlanilha}
          exportarPlanilhaCompleta={exportarPlanilhaCompleta} filtroStatus={filtroStatus} setFiltroStatus={setFiltroStatus}
          adminDataLength={adminData.length} totalPagos={totalPagos} dadosFiltrados={dadosFiltrados} loading={loading}
          aprovarPagamentoManual={aprovarPagamentoManual} aprovandoId={aprovandoId} setEditandoParticipante={setEditandoParticipante}
          chamarNoWhatsApp={chamarNoWhatsApp} excluirParticipante={excluirParticipante} excluindoId={excluindoId}
        />
      </div>

      {/* MODAL DE EDIÇÃO */}
      <AdminEditModal 
        editandoParticipante={editandoParticipante} 
        setEditandoParticipante={setEditandoParticipante} 
        salvarEdicao={salvarEdicao} 
        salvandoId={salvandoId} 
      />
    </div>
  );
};

export default Admin;