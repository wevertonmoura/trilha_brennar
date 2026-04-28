import { createClient } from '@supabase/supabase-js';

// Instancia o Supabase fora para otimizar as requisições
const supabase = createClient(
  'https://moqhjiesavnivkancxpz.supabase.co', 
  process.env.SUPABASE_SERVICE_KEY // Certifique-se de que esta chave (Service Role) esteja na Vercel
);

export default async function handler(req, res) {
  // O Mercado Pago envia notificações via POST
  try {
    // Pegamos o ID do pagamento enviado pelo Mercado Pago
    const paymentId = req.query.id || req.query['data.id'] || req.body?.data?.id;
    
    if (!paymentId) {
      // Retornamos 200 mesmo sem ID para o MP não ficar tentando reenviar algo vazio
      return res.status(200).send('ID não encontrado na requisição');
    }

    // Consultamos o status real do pagamento no Mercado Pago
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` }
    });
    
    const paymentData = await mpResponse.json();

    // Se o pagamento foi aprovado
    if (paymentData.status === 'approved') {
      // O external_reference é o e-mail que configuramos no gerar-pix.js
      const emailPagador = paymentData.external_reference; 
      
      if (emailPagador) {
        // Atualizamos a tabela 'inscricao_trilha' (confirme se este é o nome da sua tabela no Supabase)
        const { error } = await supabase
          .from('inscricao_trilha')
          .update({ pago: true })
          .eq('email', emailPagador);

        if (error) {
          console.error("Erro ao atualizar Supabase:", error);
          return res.status(500).send('Erro ao atualizar banco de dados');
        } else {
          console.log("Banco atualizado com SUCESSO para:", emailPagador);
        }
      }
    }
    
    // Respondemos ao Mercado Pago que recebemos a info
    return res.status(200).send('Webhook processado com sucesso');

  } catch (error) { 
    console.error("Erro no Webhook:", error); 
    return res.status(500).send('Erro interno no servidor');
  }
}