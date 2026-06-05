// api/admin-espera.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://moqhjiesavnivkancxpz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Método não permitido' });

  const { senha } = req.body;

  // Verificação de segurança com a sua senha mestre
  if (senha !== '85113257@we') {
    return res.status(403).json({ error: 'Acesso negado. Senha incorreta.' });
  }

  try {
    // Busca a lista de espera da NOVA tabela (lista_espera_2)
    const { data, error } = await supabase
      .from('lista_espera_2')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error) {
    console.error("Erro no Servidor:", error);
    return res.status(500).json({ error: error.message || 'Erro ao buscar lista VIP' });
  }
}