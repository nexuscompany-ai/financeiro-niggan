import type { NextApiRequest, NextApiResponse } from 'next'

type ResponseData = {
  success: boolean
  message: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  return res.status(200).json({
    success: true,
    message: 'API de IA será implementada em breve. Use o formulário manual para adicionar transações.',
  })
}
