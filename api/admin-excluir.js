import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://moqhjiesavnivkancxpz.supabase.co', 
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Método inválido');
  
  try {
    const { senha, id } = req.body;

    // 1. Validação de segurança
    if (senha !== process.env.VITE_SENHA_ADMIN) {
      return res.status(401).json({ error: 'Acesso negado' });
    }

    // 2. Validação do ID
    if (!id) {
      return res.status(400).json({ error: 'ID do participante é obrigatório' });
    }

    // 3. Executa a exclusão
    const { error } = await supabase
      .from('inscricao_trilha')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Erro ao excluir no Supabase:", error);
      return res.status(400).json({ error: 'Erro ao excluir registro' });
    }
    
    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("Erro interno:", err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
}