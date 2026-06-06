import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://moqhjiesavnivkancxpz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Método não permitido' });

  const { senha } = req.body;

  if (senha !== '85113257@we') {
    return res.status(403).json({ error: 'Acesso negado. Senha incorreta.' });
  }

  try {
    // 1. Busca a galera da edição antiga (Lista 1)
    const { data: listaAntiga, error: err1 } = await supabase
      .from('lista_espera')
      .select('*');

    // 2. Busca a galera da nova edição (Lista 2)
    const { data: listaNova, error: err2 } = await supabase
      .from('lista_espera_2')
      .select('*');

    if (err1 || err2) throw err1 || err2;

    // 3. Junta as duas listas numa só
    const listaCompleta = [...(listaAntiga || []), ...(listaNova || [])];

    // 4. Organiza a tabela por ordem de chegada (data)
    listaCompleta.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    return res.status(200).json(listaCompleta);
  } catch (error) {
    console.error("Erro no Servidor:", error);
    return res.status(500).json({ error: error.message || 'Erro ao buscar lista VIP' });
  }
}