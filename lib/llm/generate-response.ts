import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function generateResponse(userPrompt: string, model: string): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('Missing LLM API key. Please configure your environment variables.')
  }

  const message = await client.messages.create({
    model,
    max_tokens: 1024,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const block = message.content[0]
  return block.type === 'text' ? block.text : ''
}
