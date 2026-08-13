import { CheckCircle, Mountain, Calendar, Clock, Plus, QrCode, Copy } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Pagamento({
  statusPagamento,
  meusIngressos,
  comprarMaisIngressos,
  qrCodeImg,
  qrCodePix,
  calcularValorBase,
  participants,
  taxaPix,
  formatarMoeda,
  copiarPix,
  copiado,
  tempoRestante,
  formatarTempo
}: any) {
  return (
    <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500">
      {statusPagamento === 'pago' ? (
        <div className="py-2 space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <CheckCircle size={32} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black uppercase italic text-zinc-900">Pagamento Confirmado!</h2>
          <div className="space-y-8 text-left w-full max-w-md mx-auto pb-4">
            {meusIngressos.map((p: any, index: number) => (
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
                        <p className="text-zinc-800 font-bold text-sm">06 Set 2026</p>
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
  );
}