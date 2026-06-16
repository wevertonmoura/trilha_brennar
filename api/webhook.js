import { createClient } from '@supabase/supabase-js';

// Instancia o Supabase fora para otimizar as requisições
const supabase = createClient(
  'https://moqhjiesavnivkancxpz.supabase.co', 
  process.env.SUPABASE_SERVICE_KEY // Chave com permissão total para deletar e atualizar
);

export default async function handler(req, res) {
  try {
    const paymentId = req.query.id || req.query['data.id'] || req.body?.data?.id;
    
    if (!paymentId) {
      return res.status(200).send('ID não encontrado na requisição');
    }

    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` }
    });
    
    const paymentData = await mpResponse.json();

    if (paymentData.status === 'approved') {
      const emailPagador = paymentData.external_reference; 
      
      if (emailPagador) {
        // 1. Busca todas as inscrições PENDENTES desse e-mail, da mais nova pra mais velha
        const { data: pendentes, error: fetchError } = await supabase
          .from('inscricao_edicao_2')
          .select('id, created_at')
          .eq('email', emailPagador)
          .eq('pago', false)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        if (pendentes && pendentes.length > 0) {
          // Pega o horário da inscrição mais recente (a que ele de fato pagou)
          const tempoMaisRecente = new Date(pendentes[0].created_at).getTime();
          
          const idsParaAprovar = [];
          const idsParaDeletar = [];

          // Separa o que é do lote atual (até 2 min de diferença) e o que é lixo (tentativas antigas)
          pendentes.forEach(p => {
            const diffDeTempo = tempoMaisRecente - new Date(p.created_at).getTime();
            // 120000 milissegundos = 2 minutos
            if (diffDeTempo <= 120000) {
              idsParaAprovar.push(p.id);
            } else {
              idsParaDeletar.push(p.id);
            }
          });

          // 2. Atualiza SÓ as inscrições da tentativa mais recente para pago: true
          if (idsParaAprovar.length > 0) {
            await supabase
              .from('inscricao_edicao_2')
              .update({ pago: true })
              .in('id', idsParaAprovar);
          }

          // 3. Limpa o banco de dados deletando as tentativas velhas/abandonadas
          if (idsParaDeletar.length > 0) {
            await supabase
              .from('inscricao_edicao_2')
              .delete()
              .in('id', idsParaDeletar);
          }

          console.log("Banco atualizado e limpo com SUCESSO para:", emailPagador);
        }
      }
    }
    
    return res.status(200).send('Webhook processado com sucesso');

  } catch (error) { 
    console.error("Erro no Webhook:", error); 
    return res.status(500).send('Erro interno no servidor');
  }
}