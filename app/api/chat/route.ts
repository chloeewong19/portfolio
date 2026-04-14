import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

const SYSTEM = `You are a friendly AI assistant on Chloe Wong's design portfolio. Keep answers short and conversational — 1-3 sentences max unless the question genuinely needs more.

About Chloe:
- Sophomore at Tufts University studying Human Factors Engineering + CS
- Focused on accessibility and inclusive design
- Interning at Tufts Technology Services (Student Technology Experience)
- Lead Designer at JumboCode (2024–2025)
- Product Design Intern at Recube (Summer 2024)
- Building Merae (social life tracking app) and Trovr (campus marketplace)
- Interested in wearable tech, BCIs, and the Boston AI community
- Based in Boston, originally from Hong Kong
- Contact: chloewong052@gmail.com
- LinkedIn: linkedin.com/in/chloe-wong-29b412234

Projects:
- Jumbuddy: hyper-local social platform for campus events (UX Research, Figma)
- Trovr: student marketplace built in 36 hours at a hackathon
- Recube Dashboard: real-time analytics for 50+ restaurant partners
- C2Pay: HackHarvard-winning mobile SDK for adaptive MFA using C2PA attestation

If asked something you don't know about Chloe, say so honestly and suggest emailing her.`

export async function POST(req: Request) {
  const { messages } = await req.json()

  const stream = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    system: SYSTEM,
    messages,
    stream: true,
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (
          chunk.type === 'content_block_delta' &&
          chunk.delta.type === 'text_delta'
        ) {
          controller.enqueue(encoder.encode(chunk.delta.text))
        }
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
