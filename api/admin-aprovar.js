import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://moqhjiesavnivkancxpz.supabase.co', 
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { senha, id } = req.body;

    // 🚀 Senha fixa igual aos outros
    if (!senha || senha !== '85113257@we') {
      return res.status(401).json({ error: 'Senha administrativa incorreta' });
    }

    if (!id) {
      return res.status(400).json({ error: 'ID não fornecido' });
    }

    const { error } = await supabase
      .from('inscricao_trilha')
      .update({ pago: true })
      .eq('id', id);

    if (error) {
      console.error("Erro Supabase:", error);
      return res.status(400).json({ error: 'Erro ao atualizar no banco' });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("Erro interno:", err);
    return res.status(500).json({ error: 'Erro interno' });
  }
}