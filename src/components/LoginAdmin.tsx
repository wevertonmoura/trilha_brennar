import { Lock, AlertCircle, ChevronRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginAdmin({ senhaAdmin, setSenhaAdmin, handleLoginAdmin, erroLoginAdmin, setTelaAtual }: any) {
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