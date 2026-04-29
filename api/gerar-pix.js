export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  const { valor, email, nome, cpf } = req.body;

  // Tratando o nome para enviar primeiro e último nome separadamente
  const nomePartes = nome.trim().split(" ");
  const firstName = nomePartes[0];
  const lastName = nomePartes.length > 1 ? nomePartes.slice(1).join(" ") : "Invasor";

  // IMPORTANTE: Atualize para o link real da Vercel deste novo projeto da Brennand
  // Exemplo: https://trilha-brennand.vercel.app/api/webhook
  const webhookUrl = 'https://trilha-brennar.vercel.app/api/webhook';
  try {
    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `pix-brennand-${Date.now()}` 
      },
      body: JSON.stringify({
        transaction_amount: Number(valor),
        description: `Trilha Cachoeira do Brennand - ${nome}`, // Texto que aparece no extrato do cliente
        payment_method_id: 'pix',
        payer: {
          email: email,
          first_name: firstName,
          last_name: lastName,
          identification: {
            type: 'CPF',
            number: cpf 
          }
        },
        external_reference: email, // Usado pelo seu webhook para liberar o ingresso no banco de dados
        notification_url: webhookUrl 
      })
    });

    const data = await response.json();

    if (data.id) { 
      res.status(200).json(data);
    } else {
      console.error("Erro do Mercado Pago:", data);
      res.status(400).json({ error: 'Erro na API do Mercado Pago', details: data });
    }

  } catch (error) {
    console.error("Erro no Servidor:", error);
    res.status(500).json({ error: 'Erro interno ao gerar PIX' });
  }
}