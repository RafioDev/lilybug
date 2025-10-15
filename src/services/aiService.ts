import OpenAI from 'openai'
import type { ChatAction } from './chatActionService'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // We'll handle this properly
})

export interface AIParseResult {
  action: ChatAction
  confidence: number
  reasoning: string
}

export const aiService = {
  async parseNaturalLanguage(
    userInput: string,
    babyName?: string
  ): Promise<AIParseResult> {
    try {
      const systemPrompt = `You are an AI assistant for a baby tracking app. Your job is to parse natural language input from parents and convert it into structured actions.

The app can track these types of activities:
- FEEDING: bottle feeding, breastfeeding (left, right, both), with optional quantities in ml or oz
- SLEEP: naps and sleep sessions, with optional duration
- DIAPER: wet, dirty, or both types of diaper changes
- PUMPING: breast pumping sessions with optional quantities

Parse the user's input and respond with a JSON object containing:
{
  "action": {
    "type": "create_entry" | "search" | "none",
    "entryType": "feeding" | "sleep" | "diaper" | "pumping" | undefined,
    "feedingType": "bottle" | "breast_left" | "breast_right" | "both" | undefined,
    "diaperType": "wet" | "dirty" | "both" | undefined,
    "quantity": number | undefined (in ml),
    "duration": number | undefined (in minutes),
    "startTime": ISO string | undefined,
    "endTime": ISO string | undefined,
    "notes": string | undefined
  },
  "confidence": number (0-1),
  "reasoning": "Brief explanation of how you interpreted the input"
}

Guidelines:
- Convert oz to ml (1 oz = 29.5735 ml)
- For relative times like "30 minutes ago", calculate the actual time
- If duration is mentioned for sleep, calculate end time
- Default to "create_entry" for most inputs unless clearly asking a question
- Use high confidence (0.8+) for clear commands, lower for ambiguous ones
- If the baby's name is mentioned, include it in notes if relevant

Current time: ${new Date().toISOString()}
Baby name: ${babyName || 'the baby'}`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userInput },
        ],
        temperature: 0.1,
        max_tokens: 500,
      })

      const responseContent = completion.choices[0]?.message?.content
      if (!responseContent) {
        throw new Error('No response from OpenAI')
      }

      // Parse the JSON response
      const parsed = JSON.parse(responseContent) as AIParseResult

      // Validate the response structure
      if (!parsed.action || typeof parsed.confidence !== 'number') {
        throw new Error('Invalid response structure from OpenAI')
      }

      return parsed
    } catch (error) {
      console.error('Error parsing with OpenAI:', error)

      // Fallback to basic parsing if OpenAI fails
      return {
        action: { type: 'none' },
        confidence: 0.1,
        reasoning:
          'Failed to parse with AI, please try rephrasing your request',
      }
    }
  },

  async generateResponse(
    action: ChatAction,
    success: boolean,
    babyName?: string
  ): Promise<string> {
    try {
      const systemPrompt = `You are a friendly AI assistant for a baby tracking app. Generate a brief, encouraging response to confirm what action was taken or explain what went wrong.

Guidelines:
- Keep responses short and friendly (1-2 sentences max)
- Use emojis appropriately
- Mention the baby's name if provided
- For successful actions, confirm what was logged
- For failures, suggest what the user can try instead
- Sound natural and conversational, not robotic

Baby name: ${babyName || 'your baby'}`

      const userPrompt = success
        ? `Successfully logged: ${JSON.stringify(action)}`
        : `Failed to process: ${JSON.stringify(action)}`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 100,
      })

      return completion.choices[0]?.message?.content || 'Action completed!'
    } catch (error) {
      console.error('Error generating response with OpenAI:', error)

      // Fallback response
      if (success) {
        return `✅ Got it! I've logged that for ${babyName || 'your baby'}.`
      } else {
        return `❌ Sorry, I had trouble with that request. Could you try rephrasing it?`
      }
    }
  },

  // Helper method to check if OpenAI is configured
  isConfigured(): boolean {
    return (
      !!import.meta.env.VITE_OPENAI_API_KEY &&
      import.meta.env.VITE_OPENAI_API_KEY !== 'your_openai_api_key_here'
    )
  },
}
