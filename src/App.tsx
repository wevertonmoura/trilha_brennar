
import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Trophy, ChevronRight, Clock, Ticket, AlertTriangle, Mountain, Droplets, Coffee, Loader2, AlertCircle, ShieldCheck, Plus, Trash2, Waves, Info, QrCode, CheckCircle, X, Maximize2, Users, ArrowRight, Lock, ArrowLeft, Copy, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import Admin from './Admin'; 

// === CONFIGURAÇÃO DO SUPABASE ===
const supabaseUrl = 'https://moqhjiesavnivkancxpz.supabase.co';
const supabaseKey = 'sb_publishable_X5iKQonjycmsEMfeePTsyg_OkKp5ts-';
const supabase = createClient(supabaseUrl, supabaseKey);

const TrilhaBrennand = () => {
  // === ESTADOS DO SISTEMA ===
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [vagasEsgotadas, setVagasEsgotadas] = useState(false);
  
  // === ESTADOS DA LISTA DE ESPERA ===
  const [nomeEspera, setNomeEspera] = useState('');
  const [telefoneEspera, setTelefoneEspera] = useState('');
  const [esperaLoading, setEsperaLoading] = useState(false);
  const [esperaSucesso, setEsperaSucesso] = useState(false);

  const [telaAtual, setTelaAtual] = useState<'formulario' | 'pix' | 'login_admin' | 'admin'>('formulario');
  const [statusPagamento, setStatusPagamento] = useState<'pendente' | 'pago'>('pendente');
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const [senhaAdmin, setSenhaAdmin] = useState('');
  const [erroLoginAdmin, setErroLoginAdmin] = useState('');

  // === CARTEIRA DE INGRESSOS VIRTUAL ===
  const [meusIngressos, setMeusIngressos] = useState<any[]>([]);

  // === VALORES E CASADINHA ===
  const valorIndividual = 30; 
  const valorCasadinha = 50;
  const taxaPix = 0.50;
  const calcularValorBase = (qtd: number) => {
    const pares = Math.floor(qtd / 2);
    const avulsos = qtd % 2;
    return (pares * valorCasadinha) + (avulsos * valorIndividual);
  };

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const [qrCodePix, setQrCodePix] = useState(''); 
  const [qrCodeImg, setQrCodeImg] = useState(''); 
  const [copiado, setCopiado] = useState(false);
  const [tempoRestante, setTempoRestante] = useState(900); 
  const [participants, setParticipants] = useState([
    { name: '', email: '', phone: '', emergency_name: '', emergency_phone: '', cpf: '' }
  ]);

  const scenarioImages = ["/foto1.jpg", "/foto2.jpg", "/foto3.jpg", "/foto4.jpg"];

  // === CHECAR LIMITE DE 50 VAGAS PAGAS ===
  useEffect(() => {
    const verificarVagasDisponiveis = async () => {
      try {
        const { count, error } = await supabase
          .from('inscricao_trilha')
          .select('*', { count: 'exact', head: true })
          .eq('pago', true);

        if (error) throw error;
        if (count !== null && count >= 72) {
          setVagasEsgotadas(true);
        }
      } catch (err) {
        console.error("Erro ao checar limite de vagas:", err);
      }
    };
    verificarVagasDisponiveis();
  }, []);

  useEffect(() => {
    const carteiraSalva = localStorage.getItem('@trilhabrennand:carteira');
    if (carteiraSalva) {
      const ingressos = JSON.parse(carteiraSalva);
      setMeusIngressos(ingressos);
      setTelaAtual('pix');
      setStatusPagamento('pago');
    }
  }, []);

  const comprarMaisIngressos = () => {
    setParticipants([{ name: '', email: '', phone: '', emergency_name: '', emergency_phone: '', cpf: '' }]);
    setPaymentId(null);
    setStatusPagamento('pendente');
    setTelaAtual('formulario');
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      setTelaAtual('login_admin'); 
    }
  }, []);

  const handleLoginAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (senhaAdmin === '85113257@we') { 
      setTelaAtual('admin');
      setErroLoginAdmin('');
    } else {
      setErroLoginAdmin('Senha incorreta. Acesso negado!');
    }
  };

  useEffect(() => {
    let timer: any;
    if (telaAtual === 'pix' && statusPagamento === 'pendente' && tempoRestante > 0) {
      timer = setInterval(() => setTempoRestante(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [telaAtual, statusPagamento, tempoRestante]);

  const formatarTempo = (segundos: number) => {
    const m = Math.floor(segundos / 60).toString().padStart(2, '0');
    const s = (segundos % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    let intervalo: any;
    if (paymentId && statusPagamento === 'pendente' && telaAtual === 'pix') {
      intervalo = setInterval(async () => {
        try {
          const res = await fetch(`/api/checar-pagamento?paymentId=${paymentId}`);
          const data = await res.json();
          
          if (data.status === 'approved') {
            setStatusPagamento('pago');
            setMeusIngressos(prev => {
              const novaCarteira = [...prev, ...participants];
              localStorage.setItem('@trilhabrennand:carteira', JSON.stringify(novaCarteira));
              return novaCarteira;
            });
            clearInterval(intervalo);
          }
        } catch (err) {
          console.error("Erro ao checar status:", err);
        }
      }, 3000);
    }
    return () => clearInterval(intervalo);
  }, [paymentId, statusPagamento, telaAtual, participants]);

  const removeParticipant = (index: number) => {
    const newParticipants = [...participants];
    newParticipants.splice(index, 1);
    setParticipants(newParticipants);
  };

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
      v = v.replace(/(\d{3})(\d)/, "$1.$2");
      v = v.replace(/(\d{3})(\d)/, "$1.$2");
      v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
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

  // === FUNÇÃO DA LISTA DE ESPERA ===
  const handleListaEspera = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nomeEspera.trim().length < 3) {
      setErrorMsg("Por favor, informe seu nome completo.");
      return;
    }
    if (telefoneEspera.replace(/\D/g, '').length < 10) {
      setErrorMsg("Por favor, informe um WhatsApp válido.");
      return;
    }
    
    setEsperaLoading(true);
    setErrorMsg('');

    try {
      const { error } = await supabase.from('lista_espera').insert([
        { 
          nome: nomeEspera, 
          telefone: telefoneEspera, 
          interesse: 'Edição 2 (Junho)' 
        }
      ]);

      if (error) throw error;
      setEsperaSucesso(true);
    } catch (err) {
      console.error(err);
      setErrorMsg("Erro ao salvar. Tente novamente ou chame no WhatsApp.");
    } finally {
      setEsperaLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    for (let i = 0; i < participants.length; i++) {
      const p = participants[i];
      if (p.name.trim().length < 3) { setErrorMsg(i === 0 ? "Preencha o Nome do Titular." : `Preencha o nome do Acompanhante ${i}.`); return; }
      
      if (i === 0) {
        if (p.phone.replace(/\D/g, '').length < 10) { setErrorMsg("WhatsApp incompleto no Titular."); return; }
        if (p.cpf.replace(/\D/g, '').length < 11) { setErrorMsg("CPF incompleto no Titular."); return; }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(p.email)) { setErrorMsg("Digite um e-mail válido para o Titular."); return; }
        if (p.emergency_name.trim().length < 2 || p.emergency_phone.replace(/\D/g, '').length < 10) { 
          setErrorMsg("Preencha o Nome e o Telefone de Emergência."); return; 
        }
      }
    }

    if (!termsAccepted) { setErrorMsg("Aceite o termo de responsabilidade e regras de cancelamento."); return; }

    setLoading(true);
    setErrorMsg('');

    try {
      const mainEmail = participants[0].email;
      const cpfPrincipal = participants[0].cpf.replace(/\D/g, '');
await supabase
        .from('inscricao_trilha')
        .delete()
        .eq('telefone', participants[0].phone)
        .eq('pago', false);

      const promises = participants.map((p, idx) => 
        supabase.from('inscricao_trilha').insert([{ 
          nome: p.name, 
          email: mainEmail, 
          telefone: participants[0].phone,
          cpf: idx === 0 ? cpfPrincipal : '', 
          contato_emergencia: `${participants[0].emergency_name} - ${participants[0].emergency_phone}`,
          pago: false 
        }])
      );
      
      const valorBase = calcularValorBase(participants.length);
      const valorTotal = Number((valorBase + taxaPix).toFixed(2)); 
      
      const resultados = await Promise.all(promises);
      for (const res of resultados) {
        if (res.error) throw new Error("Erro ao salvar. Verifique a configuração do banco de dados.");
      }
      
      const response = await fetch('/api/gerar-pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valor: valorTotal, email: mainEmail, nome: participants[0].name, cpf: cpfPrincipal })
      });

      const mpData = await response.json();

      if (mpData.point_of_interaction?.transaction_data) {
        setQrCodePix(mpData.point_of_interaction.transaction_data.qr_code);
        setQrCodeImg(mpData.point_of_interaction.transaction_data.qr_code_base64);
        setPaymentId(mpData.id); 
        setTelaAtual('pix');
        setTempoRestante(900); 
      } else {
        throw new Error("CPF inválido ou não autorizado. Verifique os dados e tente novamente.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const copiarPix = () => {
    navigator.clipboard.writeText(qrCodePix);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000); 
  };

  if (telaAtual === 'login_admin') {
    return (
      <div className="min-h-screen bg-zinc-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-900/10 blur-[120px] rounded-full pointer-events-none"></div>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }} className="w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-xl border border-zinc-200 p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 bg-zinc-50 border border-zinc-200 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                <Lock size={28} className="text-emerald-500" />
              </div>
              <h2 className="text-2xl font-black text-zinc-900 uppercase italic tracking-tighter">Acesso Restrito</h2>
              <p className="text-zinc-500 text-[10px] uppercase tracking-widest mt-1 font-bold">Painel de Gestão</p>
            </div>
            <form onSubmit={handleLoginAdmin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Senha Mestre</label>
                <input type="password" autoFocus placeholder="••••••••••••" value={senhaAdmin} onChange={(e) => setSenhaAdmin(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-5 py-4 text-zinc-900 text-center text-lg font-mono tracking-[0.2em] outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner" />
              </div>
              {erroLoginAdmin && <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold p-3 rounded-lg flex items-center justify-center gap-2 animate-in shake"><AlertCircle size={16} /> {erroLoginAdmin}</div>}
              <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2">Desbloquear Cofre <ChevronRight size={16} /></button>
            </form>
            <button onClick={() => setTelaAtual('formulario')} className="w-full mt-6 text-zinc-500 hover:text-zinc-900 text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"><ArrowLeft size={12} /> Voltar para a Inscrição</button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (telaAtual === 'admin') {
    return <Admin senha={senhaAdmin} formatarMoeda={formatarMoeda} fecharAdmin={() => setTelaAtual('formulario')} />;
  }

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
          <div className="lg:col-span-2 space-y-16">
            <section>
              <h2 className="text-2xl font-black uppercase italic mb-6 border-b border-zinc-300 pb-2 text-zinc-900">Descrição do evento</h2>
              <div className="space-y-6 text-zinc-700 text-lg leading-relaxed">
                <p className="text-zinc-900 font-bold italic">Natureza, Aventura e Boas Energias! Vem com a gente!</p>
                <p>O grupo <span className="text-emerald-600 font-bold">invasores</span> convida você para um percurso incrível de <strong>6 KM</strong> de total imersão na natureza, explorando as rotas da belíssima Cachoeira do Brennand.</p>
                <p>Esta é a oportunidade perfeita para sair da rotina e superar seus propios limites. Nossa trilha foi planejada para ser segura, acompanhada por guias experientes, e o grande prêmio é o nosso tradicional banho de cachoeira para lavar a alma!</p>
              </div>
              <div className="mt-10">
                <h2 className="text-xl font-black uppercase italic mb-6 text-zinc-900 tracking-widest">Explore o Cenário</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {scenarioImages.map((img, i) => (
                    <motion.div key={i} whileHover={{ scale: 1.05 }} className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group shadow-md border border-zinc-200 bg-white" onClick={() => setSelectedImg(img)}>
                      <img src={img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Maximize2 className="text-white" size={24} /></div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="col-span-full"><h2 className="text-2xl font-black uppercase italic mb-6 border-b border-zinc-300 pb-2 text-zinc-900">Sobre o evento</h2></div>
              <InfoRow icon={<Calendar />} title="Data" text="31 de Maio de 2026" />
              <InfoRow icon={<Clock />} title="Horário" text="07:00 às 12:00" />
              <a href="https://maps.app.goo.gl/fy1R962DJBY4HkWY8" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity"><InfoRow icon={<MapPin className="text-emerald-600" />} title="Localização" text="Cachoeira do Brennand - PE" /></a>
              <InfoRow icon={<Trophy />} title="Investimento" text={`A partir de R$ ${valorIndividual},00`} />
            </section>

            <section>
              <h2 className="text-2xl font-black uppercase italic mb-6 border-b border-zinc-300 pb-2 text-zinc-900">INCLUSO NO VALOR</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                <CheckItem icon={<Coffee />} text="Café da Manhã Incluso" />
                <CheckItem icon={<Users />} text="Guias Experientes" />
                <CheckItem icon={<Trophy />} text="Medalha de Participação" />
                <CheckItem icon={<Waves className="text-blue-500" />} text="Banho de Cachoeira" />
              </div>

              <h2 className="text-2xl font-black uppercase italic mb-6 border-b border-zinc-300 pb-2 text-zinc-900">O QUE LEVAR? (RECOMENDAÇÕES)</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CheckItem icon={<Droplets />} text="Água (pelo menos 1,5 litro)" />
                <CheckItem icon={<ShieldCheck />} text="Protetor solar e repelente" />
                <CheckItem icon={<Waves />} text="Roupa de banho e toalha" />
                <CheckItem icon={<Info />} text="Boné ou chapéu" />
                <CheckItem icon={<Mountain />} text="Calçados confortáveis para trilha" />
                <CheckItem icon={<Trash2 />} text="Sacola para seu lixo" />
              </div>
            </section>
          </div>

          <div className="lg:col-span-1 mt-10 lg:mt-0">
            <section id="inscricao" className="lg:sticky lg:top-8 bg-white border border-zinc-200 rounded-[2.5rem] p-6 md:p-10 shadow-2xl">
              {telaAtual === 'formulario' ? (
                <>
                  <div className="text-center mb-10">
                    <h2 className="text-4xl font-black uppercase italic tracking-tighter text-zinc-900">INSCRIÇÃO</h2>
                    {!vagasEsgotadas && (
                      <div className="flex flex-col gap-1 mt-2">
                        <p className="text-emerald-600 text-sm font-bold tracking-widest uppercase">Individual: R$ 30,00</p>
                        <p className="text-pink-500 text-xs font-black tracking-widest uppercase animate-pulse">🔥 Casadinha: 2 pessoas por R$ 50,00</p>
                      </div>
                    )}
                  </div>
                  
                  {meusIngressos.length > 0 && !vagasEsgotadas && (
                    <button onClick={() => { setTelaAtual('pix'); setStatusPagamento('pago'); }} className="w-full mb-8 bg-zinc-50 hover:bg-zinc-100 border border-emerald-500/30 text-emerald-600 p-4 rounded-2xl font-bold flex items-center justify-center gap-2 uppercase tracking-widest text-xs transition-all shadow-sm">
                      <Ticket size={18} /> Ver meus {meusIngressos.length} Ingressos Salvos
                    </button>
                  )}

                  {vagasEsgotadas ? (
                    <div className="bg-gradient-to-b from-red-50 to-white border border-red-200 p-8 rounded-[2rem] text-center shadow-inner mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <AlertTriangle size={48} className="mx-auto mb-4 text-red-500 animate-pulse" />
                      <h3 className="text-2xl font-black uppercase tracking-widest mb-2 text-red-600">Lote Esgotado!</h3>
                      <p className="text-sm font-bold text-zinc-700 leading-relaxed mb-6">
                        A demanda foi gigante e as vagas para o dia 31/05 acabaram! Mas não se preocupe, estamos organizando a <strong className="text-emerald-600">Edição 2 (Junho)</strong>.
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
                              <input 
                                type="text" 
                                placeholder="Seu Nome Completo" 
                                value={nomeEspera}
                                onChange={e => setNomeEspera(e.target.value)}
                                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-4 py-3 focus:border-emerald-500 outline-none font-bold text-sm text-zinc-900 transition-all placeholder-zinc-400"
                              />
                              <input 
                                type="tel" 
                                placeholder="Seu WhatsApp" 
                                value={telefoneEspera}
                                onChange={e => {
                                  let v = e.target.value.replace(/\D/g, ""); 
                                  if (v.length > 11) v = v.slice(0, 11); 
                                  if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`; 
                                  if (v.length > 10) v = `${v.slice(0, 10)}-${v.slice(10)}`; 
                                  setTelefoneEspera(v);
                                }}
                                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-4 py-3 focus:border-emerald-500 outline-none font-bold text-sm text-zinc-900 transition-all placeholder-zinc-400"
                              />
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
                      {participants.map((participant, index) => (
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
                                    <input 
                                      type="text" 
                                      placeholder="Nome do SOS"
                                      value={participant.emergency_name}
                                      onChange={e => updateParticipant(index, 'emergency_name', e.target.value)}
                                      className="w-full bg-white border border-zinc-300 rounded-xl px-4 py-3 focus:border-emerald-500 outline-none font-bold text-sm text-zinc-900 transition-all shadow-sm"
                                    />
                                    <input 
                                      type="tel" 
                                      placeholder="(81) 99999-9999"
                                      value={participant.emergency_phone}
                                      onChange={e => updateParticipant(index, 'emergency_phone', e.target.value)}
                                      className="w-full bg-white border border-zinc-300 rounded-xl px-4 py-3 focus:border-emerald-500 outline-none font-bold text-sm text-zinc-900 transition-all shadow-sm"
                                    />
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
              ) : (
                <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500">
                  {statusPagamento === 'pago' ? (
                    <div className="py-2 space-y-6 animate-in fade-in zoom-in duration-500">
                      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                        <CheckCircle size={32} className="text-emerald-500" />
                      </div>
                      <h2 className="text-2xl font-black uppercase italic text-zinc-900">Pagamento Confirmado!</h2>
                      <div className="space-y-8 text-left w-full max-w-md mx-auto pb-4">
                        {meusIngressos.map((p, index) => (
                          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: index * 0.2 }} key={index} className="relative bg-white rounded-[2rem] overflow-hidden shadow-2xl border border-zinc-200">
                            <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 relative overflow-hidden">
                               <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
                               <div className="flex justify-between items-start relative z-10">
                                 <div>
                                   <p className="text-emerald-100 text-[10px] font-black uppercase tracking-[0.3em] mb-1">ingresso</p>
                                   <h3 className="text-white text-2xl font-black italic tracking-tighter uppercase">Trilha Cachoeira do Brennand</h3>
                                 </div>
                                 <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/30 text-white">
                                   <span className="font-mono text-xs font-bold">#{String(index + 1).padStart(3, '0')}</span>
                                 </div>
                               </div>
                            </div>
                            <div className="relative h-8 bg-white flex items-center">
                              <div className="absolute -left-4 w-8 h-8 bg-zinc-50 rounded-full border-r border-zinc-200"></div>
                              <div className="w-full border-t-2 border-dashed border-zinc-200 mx-6"></div>
                              <div className="absolute -right-4 w-8 h-8 bg-zinc-50 rounded-full border-l border-zinc-200"></div>
                            </div>
                            <div className="p-6 pt-2 pb-8 bg-white relative">
                              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none text-emerald-900">
                                <Mountain size={140} />
                              </div>
                              <div className="space-y-6 relative z-10">
                                <div>
                                  <p className="text-[10px] uppercase text-zinc-400 font-bold tracking-[0.2em] mb-1">{index === 0 ? 'Titular' : 'Acompanhante'}</p>
                                  <p className="text-zinc-900 font-black text-xl uppercase tracking-tight truncate">{p.name}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
                                  <div>
                                    <p className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest mb-1 flex items-center gap-1"><Calendar size={10}/> Data</p>
                                    <p className="text-zinc-800 font-bold text-sm">31 Mai 2026</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest mb-1 flex items-center gap-1"><Clock size={10}/> Partida</p>
                                    <p className="text-zinc-800 font-bold text-sm">07:00 AM</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                      <div className="space-y-3 mt-8">
                        <button onClick={comprarMaisIngressos} className="flex items-center justify-center gap-2 w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 p-4 rounded-xl font-bold uppercase tracking-widest transition-all text-[10px] border border-zinc-300"><Plus size={16}/> Comprar para outra pessoa</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-2"><QrCode className="text-emerald-600 w-10 h-10" /></div>
                        <h2 className="text-2xl font-black uppercase italic tracking-tighter text-zinc-900">Escaneie o PIX</h2>
                      </div>
                      {qrCodeImg && (
                        <div className="flex justify-center my-6"><div className="bg-white p-3 rounded-2xl border-4 border-emerald-100 shadow-md"><img src={`data:image/jpeg;base64,${qrCodeImg}`} alt="PIX" className="w-48 h-48 rounded-lg" /></div></div>
                      )}
                      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
                        <p className="text-xs font-bold uppercase text-zinc-500 tracking-widest mb-2">Valor total</p>
                        <p className="text-5xl font-black text-zinc-900 tracking-tighter">R$ {formatarMoeda(calcularValorBase(participants.length) + taxaPix)}</p>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 bg-zinc-50 p-2 pl-4 rounded-xl border border-zinc-200">
                          <span className="text-xs font-mono text-zinc-600 truncate w-full text-left">{qrCodePix}</span>
                          <button onClick={copiarPix} className={`px-4 py-3 rounded-lg text-xs font-bold flex items-center gap-2 shrink-0 transition-all ${copiado ? 'bg-emerald-500 text-white' : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-800'}`}>{copiado ? <CheckCircle size={14} /> : <Copy size={14} />} {copiado ? 'Copiado!' : 'Copiar'}</button>
                        </div>
                        {tempoRestante > 0 ? (
                          <div className="flex flex-col items-center justify-center gap-2 mt-4">
                            <p className="text-[10px] uppercase tracking-widest text-emerald-600 font-bold animate-pulse">Aguardando pagamento...</p>
                            <div className="flex items-center gap-2 text-2xl font-mono bg-white px-4 py-2 rounded-xl border border-zinc-200 text-zinc-900 shadow-sm"><Clock size={20} className="text-emerald-500" /><span>{formatarTempo(tempoRestante)}</span></div>
                            <p className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold">Tempo para expirar</p>
                          </div>
                        ) : (
                          <div className="text-red-600 font-bold text-xs mt-4 bg-red-50 p-4 rounded-xl border border-red-200">Tempo expirado! Recarregue a página e tente novamente.</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <footer className="bg-white pt-12 pb-6 border-t border-zinc-200 relative overflow-hidden mt-12">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-1 bg-gradient-to-r from-transparent via-emerald-200 to-transparent blur-sm"></div>
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

const InfoRow = ({ icon, title, text }: any) => (
  <div className="flex items-start gap-5">
    <div className="mt-1 text-emerald-500">{icon}</div>
    <div><h4 className="text-[10px] font-black uppercase text-zinc-900 tracking-widest mb-1">{title}</h4><p className="text-zinc-900 font-bold text-xl leading-tight">{text}</p></div>
  </div>
);

const CheckItem = ({ text, icon }: any) => (
  <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
    <span className="text-emerald-500 shrink-0">{icon}</span><span className="text-xs font-bold text-zinc-900">{text}</span>
  </div>
);

export default TrilhaBrennand;