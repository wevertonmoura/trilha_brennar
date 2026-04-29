import { createClient } from '@supabase/supabase-js';

// 🚀 Lendo a chave segura direto da Vercel (o GitHub não vai bloquear isso!)
const supabase = createClient(
  'https://moqhjiesavnivkancxpz.supabase.co', 
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { senha } = req.body;

    // 🚀 Senha administrativa "chumbada" para garantir o seu acesso
    if (!senha || senha !== '85113257@we') {
      return res.status(401).json({ error: 'Senha administrativa incorreta' });
    }

    const { data, error } = await supabase
      .from('inscricao_trilha')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Erro Supabase:", error);
      return res.status(400).json({ error: 'Erro ao buscar dados no banco' });
    }

    return res.status(200).json(data);

  } catch (err) {
    console.error("Erro interno:", err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
}