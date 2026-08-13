import { useState, useEffect } from 'react';
import { ChevronRight, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';

// === IMPORTAÇÃO DOS COMPONENTES ===
import Admin from './Admin'; 
import EventDetails from './components/EventDetails';
import LoginAdmin from './components/LoginAdmin';
import Formulario from './components/Formulario';
import Pagamento from './components/Pagamento';

const supabaseUrl = 'https://moqhjiesavnivkancxpz.supabase.co';
const supabaseKey = 'sb_publishable_X5iKQonjycmsEMfeePTsyg_OkKp5ts-';
const supabase = createClient(supabaseUrl, supabaseKey);

const TrilhaBrennand = () => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  
  const [vagasEsgotadas, setVagasEsgotadas] = useState(false); 
  const LIMITE_VAGAS = 30; 
  
  const [nomeEspera, setNomeEspera] = useState('');
  const [telefoneEspera, setTelefoneEspera] = useState('');
  const [esperaLoading, setEsperaLoading] = useState(false);
  const [esperaSucesso, setEsperaSucesso] = useState(false);

  const [telaAtual, setTelaAtual] = useState<'formulario' | 'pix' | 'login_admin' | 'admin'>('formulario');
  const [statusPagamento, setStatusPagamento] = useState<'pendente' | 'pago'>('pendente');
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const [senhaAdmin, setSenhaAdmin] = useState('');
  const [erroLoginAdmin, setErroLoginAdmin] = useState('');
  const [meusIngressos, setMeusIngressos] = useState<any[]>([]);

  const valorIndividual = 55; 
  const valorCasadinha = 100;
  const taxaPix = 0.50;
  
  const calcularValorBase = (qtd: number) => {
    const pares = Math.floor(qtd / 2);
    const avulsos = qtd % 2;
    return (pares * valorCasadinha) + (avulsos * valorIndividual);
  };

  const formatarMoeda = (valor: number) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const [qrCodePix, setQrCodePix] = useState(''); 
  const [qrCodeImg, setQrCodeImg] = useState(''); 
  const [copiado, setCopiado] = useState(false);
  const [tempoRestante, setTempoRestante] = useState(900); 
  const [participants, setParticipants] = useState([{ name: '', email: '', phone: '', emergency_name: '', emergency_phone: '', cpf: '' }]);

  const scenarioImages = ["/foto1.jpg", "/foto2.jpg", "/foto3.jpg", "/foto4.jpg"];

  // Efeito para verificar vagas ao carregar
  useEffect(() => {
    const verificarVagas = async () => {
      try {
        const { count, error } = await supabase.from('inscricao_edicao_2').select('*', { count: 'exact', head: true }).eq('pago', true);
        if (error) throw error;
        if (count !== null && count >= LIMITE_VAGAS) setVagasEsgotadas(true);
      } catch (err) { console.error("Erro ao verificar vagas:", err); }
    };
    verificarVagas();
  }, []);

  const comprarMaisIngressos = () => {
    setParticipants([{ name: '', email: '', phone: '', emergency_name: '', emergency_phone: '', cpf: '' }]);
    setPaymentId(null);
    setStatusPagamento('pendente');
    setTelaAtual('formulario');
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') setTelaAtual('login_admin');
  }, []);

  const handleLoginAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (senhaAdmin === '85113257@we') { setTelaAtual('admin'); setErroLoginAdmin(''); }
    else { setErroLoginAdmin('Senha incorreta. Acesso negado!'); }
  };

  useEffect(() => {
    let timer: any;
    if (telaAtual === 'pix' && statusPagamento === 'pendente' && tempoRestante > 0) {
      timer = setInterval(() => setTempoRestante(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [telaAtual, statusPagamento, tempoRestante]);

  const formatarTempo = (segundos: number) => `${Math.floor(segundos / 60).toString().padStart(2, '0')}:${(segundos % 60).toString().padStart(2, '0')}`;

  useEffect(() => {
    let intervalo: any;
    if (paymentId && statusPagamento === 'pendente' && telaAtual === 'pix') {
      intervalo = setInterval(async () => {
        try {
          const res = await fetch(`/api/checar-pagamento?paymentId=${paymentId}`);
          const data = await res.json();
          if (data.status === 'approved') {
            setStatusPagamento('pago');
            setMeusIngressos(participants);
            clearInterval(intervalo);
          }
        } catch (err) { console.error("Erro ao checar status:", err); }
      }, 3000);
    }
    return () => clearInterval(intervalo);
  }, [paymentId, statusPagamento, telaAtual, participants]);

  const removeParticipant = (index: number) => setParticipants(prev => prev.filter((_, i) => i !== index));
  const addParticipant = () => setParticipants([...participants, { name: '', email: '', phone: '', emergency_name: '', emergency_phone: '', cpf: '' }]);

  const updateParticipant = (index: number, field: string, value: string) => {
    const newParticipants = [...participants];
    if (field === 'phone' || field === 'emergency_phone') {
      let v = value.replace(/\D/g, ""); 
      if (v.length > 11) v = v.slice(0, 11); 
      if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`; 
      if (v.length > 10) v = `${v.slice(0, 10)}-${v.slice(10)}`; 
      newParticipants[index] = { ...newParticipants[index], [field]: v };
    } else if (field === 'cpf') {
      let v = value.replace(/\D/g, ""); 
      if (v.length > 11) v = v.slice(0, 11); 
      v = v.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
      newParticipants[index] = { ...newParticipants[index], [field]: v };
    } else {
      newParticipants[index] = { ...newParticipants[index], [field]: value };
    }
    setParticipants(newParticipants);
  };

  const scrollToForm = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById('inscricao')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleListaEspera = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nomeEspera.trim().length < 3) return setErrorMsg("Por favor, informe seu nome completo.");
    if (telefoneEspera.replace(/\D/g, '').length < 10) return setErrorMsg("Por favor, informe um WhatsApp válido.");
    
    setEsperaLoading(true); setErrorMsg('');
    try {
      const { error } = await supabase.from('lista_espera_2').insert([{ nome: nomeEspera, telefone: telefoneEspera, interesse: 'Próxima Edição' }]);
      if (error) throw error;
      setEsperaSucesso(true);
    } catch (err) { setErrorMsg("Erro ao salvar. Tente novamente ou chame no WhatsApp."); } 
    finally { setEsperaLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    for (let i = 0; i < participants.length; i++) {
      const p = participants[i];
      if (p.name.trim().length < 3) return setErrorMsg(i === 0 ? "Preencha o Nome do Titular." : `Preencha o nome do Acompanhante ${i}.`);
      if (i === 0) {
        if (p.phone.replace(/\D/g, '').length < 10) return setErrorMsg("WhatsApp incompleto no Titular.");
        if (p.cpf.replace(/\D/g, '').length < 11) return setErrorMsg("CPF incompleto no Titular.");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) return setErrorMsg("Digite um e-mail válido para o Titular.");
        if (p.emergency_name.trim().length < 2 || p.emergency_phone.replace(/\D/g, '').length < 10) return setErrorMsg("Preencha o Contato de Emergência.");
      }
    }

    if (!termsAccepted) return setErrorMsg("Aceite o termo de responsabilidade.");

    setLoading(true); setErrorMsg('');
    try {
      const mainEmail = participants[0].email;
      const cpfPrincipal = participants[0].cpf.replace(/\D/g, '');
      
      await supabase.from('inscricao_edicao_2').delete().eq('telefone', participants[0].phone).eq('pago', false);

      const promises = participants.map((p, idx) => 
        supabase.from('inscricao_edicao_2').insert([{ 
          nome: p.name, email: mainEmail, telefone: participants[0].phone,
          cpf: idx === 0 ? cpfPrincipal : '', 
          contato_emergencia: `${participants[0].emergency_name} - ${participants[0].emergency_phone}`, pago: false 
        }])
      );
      
      const valorBase = calcularValorBase(participants.length);
      const valorTotal = Number((valorBase + taxaPix).toFixed(2)); 
      
      const resultados = await Promise.all(promises);
      for (const res of resultados) { if (res.error) throw new Error("Erro ao salvar."); }
      
      const response = await fetch('/api/gerar-pix', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valor: valorTotal, email: mainEmail, nome: participants[0].name, cpf: cpfPrincipal })
      });

      const mpData = await response.json();
      if (mpData.point_of_interaction?.transaction_data) {
        setQrCodePix(mpData.point_of_interaction.transaction_data.qr_code);
        setQrCodeImg(mpData.point_of_interaction.transaction_data.qr_code_base64);
        setPaymentId(mpData.id); setTelaAtual('pix'); setTempoRestante(900); 
      } else throw new Error("CPF inválido ou não autorizado.");
    } catch (err: any) { setErrorMsg(err.message || "Erro de conexão."); } 
    finally { setLoading(false); }
  };

  const copiarPix = () => {
    navigator.clipboard.writeText(qrCodePix);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000); 
  };

  // RENDERIZAÇÃO DAS TELAS
  if (telaAtual === 'login_admin') return <LoginAdmin senhaAdmin={senhaAdmin} setSenhaAdmin={setSenhaAdmin} handleLoginAdmin={handleLoginAdmin} erroLoginAdmin={erroLoginAdmin} setTelaAtual={setTelaAtual} />;
  if (telaAtual === 'admin') return <Admin senha={senhaAdmin} formatarMoeda={formatarMoeda} fecharAdmin={() => setTelaAtual('formulario')} />;

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900 font-sans selection:bg-emerald-200 overflow-x-hidden">
      <AnimatePresence>
        {selectedImg && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 cursor-pointer" onClick={() => setSelectedImg(null)}>
            <button className="absolute top-6 right-6 text-white bg-white/10 p-2 rounded-full hover:bg-white/20 transition-all"><X size={32}/></button>
            <motion.img initial={{ scale: 0.9 }} animate={{ scale: 1 }} src={selectedImg} className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain" />
          </motion.div>
        )}
      </AnimatePresence>

      <section className="relative h-[60vh] md:h-[70vh] flex items-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="/foto1.jpg" alt="Cachoeira do Brennand" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        <div className="container mx-auto px-6 pb-12 relative z-10">
          <h1 className="text-4xl md:text-7xl font-black italic tracking-tighter mt-1 uppercase leading-none text-white drop-shadow-md">Trilha <br/> <span className="text-emerald-500"> Cachoeira do Brennand</span></h1>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8">
            <a href="#inscricao" onClick={scrollToForm} className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3 px-8 rounded-xl shadow-lg transition-all uppercase tracking-widest text-[10px]">Garantir Ingresso <ChevronRight size={14} /></a>
          </motion.div>
        </div>
      </section>

      <main className="container mx-auto px-4 md:px-6 py-12 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          
          <EventDetails setSelectedImg={setSelectedImg} valorIndividual={valorIndividual} scenarioImages={scenarioImages} />

          <div className="lg:col-span-1 mt-10 lg:mt-0">
            <section id="inscricao" className="lg:sticky lg:top-8 bg-white border border-zinc-200 rounded-[2.5rem] p-6 md:p-10 shadow-2xl">
              {telaAtual === 'formulario' ? (
                <Formulario 
                  vagasEsgotadas={vagasEsgotadas} esperaSucesso={esperaSucesso} handleListaEspera={handleListaEspera} 
                  nomeEspera={nomeEspera} setNomeEspera={setNomeEspera} telefoneEspera={telefoneEspera} 
                  setTelefoneEspera={setTelefoneEspera} errorMsg={errorMsg} esperaLoading={esperaLoading} 
                  handleSubmit={handleSubmit} participants={participants} updateParticipant={updateParticipant} 
                  removeParticipant={removeParticipant} addParticipant={addParticipant} termsAccepted={termsAccepted} 
                  setTermsAccepted={setTermsAccepted} loading={loading} calcularValorBase={calcularValorBase} 
                  taxaPix={taxaPix} formatarMoeda={formatarMoeda}
                />
              ) : (
                <Pagamento 
                  statusPagamento={statusPagamento} meusIngressos={meusIngressos} comprarMaisIngressos={comprarMaisIngressos}
                  qrCodeImg={qrCodeImg} qrCodePix={qrCodePix} calcularValorBase={calcularValorBase} participants={participants}
                  taxaPix={taxaPix} formatarMoeda={formatarMoeda} copiarPix={copiarPix} copiado={copiado}
                  tempoRestante={tempoRestante} formatarTempo={formatarTempo}
                />
              )}
            </section>
          </div>
        </div>
      </main>

      <footer className="bg-white pt-12 pb-6 border-t border-zinc-200 relative overflow-hidden mt-12">
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="flex flex-col items-center gap-4 border-t border-zinc-200 pt-6">
            <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">© 2026 Vem Para Trilha. Todos os direitos reservados.</p>
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="py-2 px-6 rounded-full bg-zinc-50 border border-zinc-200 text-emerald-600 font-bold text-[10px] uppercase tracking-widest hover:bg-zinc-100 hover:text-emerald-700 flex items-center gap-2 transition-colors shadow-sm">Voltar ao Topo <ArrowRight className="-rotate-90 w-3 h-3" /></button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TrilhaBrennand;