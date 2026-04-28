import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://moqhjiesavnivkancxpz.supabase.co', 
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  // Garante que só aceitamos POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { senha } = req.body;

    // Verifica a senha no ambiente seguro do servidor
    if (!senha || senha !== process.env.VITE_SENHA_ADMIN) {
      return res.status(401).json({ error: 'Senha administrativa incorreta' });
    }

    // Busca os dados no Supabase
    const { data, error } = await supabase
      .from('inscricao_trilha')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Erro Supabase:", error);
      return res.status(400).json({ error: 'Erro ao buscar dados no banco' });
    }

    // Retorna a lista de inscritos
    return res.status(200).json(data);

  } catch (err) {
    console.error("Erro interno:", err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
}