import type { NextApiRequest, NextApiResponse } from 'next'

type ResponseData = {
  success: boolean
  message?: string
  transaction?: any
  error?: string
}

const CATEGORIES = {
  income: ['Salário', 'TikTok Shop', 'Contratos', 'Freelancer', 'Outros'],
  expense: ['Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Lazer', 'Educação', 'Outros'],
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  const { message } = req.body

  if (!message) {
    return res.status(400).json({ success: false, error: 'Message is required' })
  }

  try {
    // Chamada à API Anthropic (Mia)
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: `Você é Mia, uma assistente financeira inteligente. Seu trabalho é analisar mensagens do usuário Felipe sobre transações financeiras e extrair informações estruturadas.

Categorias de renda: ${CATEGORIES.income.join(', ')}
Categorias de despesa: ${CATEGORIES.expense.join(', ')}

Quando o usuário escrever algo como:
- "gastei 50 em comida" → expense, 50, Alimentação
- "recebi 100 de freelancer" → income, 100, Freelancer
- "pagamento de 1500" → income, 1500, Salário (padrão)
- "gastei no transporte" → expense, amount (do contexto), Transporte

Responda APENAS em JSON válido com este formato:
{
  "type": "income" | "expense",
  "amount": número,
  "category": string,
  "description": "descrição completa",
  "confidence": número de 0 a 1
}

Se não conseguir extrair uma transação válida, responda:
{
  "type": null,
  "error": "descrição do problema"
}`,
        messages: [
          {
            role: 'user',
            content: message,
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }

    const data = await response.json()
    const content = data.content[0]?.text

    if (!content) {
      return res.status(500).json({ success: false, error: 'No response from AI' })
    }

    // Parse resposta JSON da IA
    const transaction = JSON.parse(content)

    if (!transaction.type) {
      return res.status(400).json({
        success: false,
        error: transaction.error || 'Could not parse transaction',
      })
    }

    return res.status(200).json({
      success: true,
      transaction: {
        ...transaction,
        date: new Date().toISOString().split('T')[0],
        processed: true,
      },
    })
  } catch (error) {
    console.error('Mia API error:', error)
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    })
  }
}
