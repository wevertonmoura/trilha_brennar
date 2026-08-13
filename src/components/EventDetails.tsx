import { Calendar, MapPin, Trophy, Clock, Mountain, Droplets, Coffee, ShieldCheck, Waves, Info, Maximize2, Users, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const InfoRow = ({ icon, title, text }: any) => (
  <div className="flex items-start gap-5">
    <div className="mt-1 text-emerald-500">{icon}</div>
    <div>
      <h4 className="text-[10px] font-black uppercase text-zinc-900 tracking-widest mb-1">{title}</h4>
      <p className="text-zinc-900 font-bold text-xl leading-tight">{text}</p>
    </div>
  </div>
);

const CheckItem = ({ text, icon }: any) => (
  <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
    <span className="text-emerald-500 shrink-0">{icon}</span>
    <span className="text-xs font-bold text-zinc-900">{text}</span>
  </div>
);

export default function EventDetails({ setSelectedImg, valorIndividual, scenarioImages }: any) {
  return (
    <div className="lg:col-span-2 space-y-16">
      <section>
        <h2 className="text-2xl font-black uppercase italic mb-6 border-b border-zinc-300 pb-2 text-zinc-900">Descrição do evento</h2>
        <div className="space-y-6 text-zinc-700 text-lg leading-relaxed">
          <p className="text-zinc-900 font-bold italic">Natureza, Aventura e Boas Energias! Vem com a gente!</p>
          <p>O grupo <span className="text-emerald-600 font-bold">Vem Para Trilha</span> convida você para um percurso incrível de total imersão na natureza, explorando as rotas da belíssima Cachoeira do Brennand.</p>
          <p>Esta é a oportunidade perfeita para sair da rotina e superar seus propios limites. Nossa trilha foi planejada para ser segura, acompanhada por guias experientes, e o grande prêmio é o nosso tradicional banho de cachoeira para lavar a alma!</p>
        </div>
        <div className="mt-10">
          <h2 className="text-xl font-black uppercase italic mb-6 text-zinc-900 tracking-widest">Explore o Cenário</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {scenarioImages.map((img: string, i: number) => (
              <motion.div key={i} whileHover={{ scale: 1.05 }} className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group shadow-md border border-zinc-200 bg-white" onClick={() => setSelectedImg(img)}>
                <img src={img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Maximize2 className="text-white" size={24} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="col-span-full"><h2 className="text-2xl font-black uppercase italic mb-6 border-b border-zinc-300 pb-2 text-zinc-900">Sobre o evento</h2></div>
        <InfoRow icon={<Calendar />} title="Data" text="06 de setembro de 2026" />
        <InfoRow icon={<Clock />} title="Horário" text="07:00 às 12:00" />
        <a href="https://maps.app.goo.gl/fy1R962DJBY4HkWY8" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
          <InfoRow icon={<MapPin className="text-emerald-600" />} title="Localização" text="Cachoeira do Brennand - PE" />
        </a>
        <InfoRow icon={<Trophy />} title="Investimento" text={`A partir de R$ ${valorIndividual},00`} />
      </section>

      <section>
        <h2 className="text-2xl font-black uppercase italic mb-6 border-b border-zinc-300 pb-2 text-zinc-900">INCLUSO NO VALOR</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <CheckItem icon={<Coffee />} text="Café da Manhã Coletivo" />
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
  );
}