import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

interface GenerateRequest {
  title: string;
  description?: string;
  category?: string;
  subcategory?: string;
  price?: string | number;
  condition?: string;
  brand?: string;
  location?: string;
  features?: string[];
  mode: 'improve' | 'shorter' | 'professional' | 'selling_points' | 'translate' | 'generate';
  language?: string;
}

const SYSTEM_PROMPT = `You are a Nigerian vendor writing a product ad for WhatsApp broadcasts and Facebook marketplace. Write exactly like real Nigerian dealers — short, punchy, conversational, and trustworthy.

Style examples:
- "Sharp clean iPhone 17 Pro Max 256GB available for sale. Direct UK used, everything working perfectly. Face ID, battery health and camera all intact. Comes with charger and receipt. Neat like new. DM if interested."
- "Brand new sealed Apple iPhone 17 Pro Max 256GB available. Factory unlock, untouched seal, complete accessories intact. Very clean and original device. No hidden fault, buy and use immediately. Serious buyers only please."

Rules:
- Write like a real Nigerian dealer talking to a customer — natural, not robotic
- Start with the product name and key condition (e.g. "Sharp clean", "Brand new sealed", "Direct UK used", "Nigerian version")
- Mention key specs briefly — storage, color, dual SIM, battery health, etc.
- Keep it short — 3-6 sentences max, no long paragraphs
- NEVER include scam words: "urgent", "click here", "limited offer", "guaranteed", "100%", "miracle", "magic", "cash now", "wire transfer", "Western Union"
- End with a natural call-to-action: "DM if interested", "Serious buyers only please", "Call/WhatsApp for more info", "Available for inspection"
- No markdown, no bullet points structure — just plain conversational text
- Auto-include the category naturally (e.g. "phone", "shoe", "bag", "car")
- Auto-generate relevant specs naturally in the flow`;

async function generateWithAI(prompt: string): Promise<string> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Groq API error:', error);
    if (response.status === 401) {
      throw new Error('Invalid Groq API key. Add a valid GROQ_API_KEY to .env.local');
    }
    throw new Error(`AI generation failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

function buildPrompt(request: GenerateRequest): string {
  const { title, description, category, subcategory, price, condition, brand, location, features, mode } = request;

  let prompt = '';

  switch (mode) {
    case 'improve':
      prompt = `Improve the following product description for a Nigerian classified ad. Make it more engaging, professional, and SEO-friendly while keeping all factual information intact.\n\n`;
      if (description) prompt += `Current description:\n${description}\n\n`;
      break;

    case 'shorter':
      prompt = `Rewrite the following product description to be shorter and more concise (2-3 sentences maximum). Keep the key selling points.\n\n`;
      if (description) prompt += `Current description:\n${description}\n\n`;
      break;

    case 'professional':
      prompt = `Rewrite the following product description with a more professional and formal tone suitable for a premium marketplace listing.\n\n`;
      if (description) prompt += `Current description:\n${description}\n\n`;
      break;

    case 'selling_points':
      prompt = `Add compelling selling points and key features to the following product description. Highlight what makes this item valuable.\n\n`;
      if (description) prompt += `Current description:\n${description}\n\n`;
      break;

    case 'translate':
      prompt = `Translate the following product description to ${request.language || 'Nigerian Pidgin English'} while keeping it appropriate for a Nigerian classified ad.\n\n`;
      if (description) prompt += `Current description:\n${description}\n\n`;
      break;

    default:
      prompt = `Write a Nigerian dealer-style product ad for this item. Include the category naturally and auto-generate relevant specs in the flow.\n\n`;
  }

  prompt += `Product Details:\n`;
  if (title) prompt += `• Title: ${title}\n`;
  if (category) prompt += `• Category: ${category}\n`;
  if (subcategory) prompt += `• Subcategory: ${subcategory}\n`;
  if (price) prompt += `• Price: ₦${typeof price === 'number' ? price.toLocaleString() : price}\n`;
  if (condition) prompt += `• Condition: ${condition}\n`;
  if (brand) prompt += `• Brand: ${brand}\n`;
  if (location) prompt += `• Location: ${location}\n`;
  if (features && features.length > 0) prompt += `• Features/Specs:\n${features.map(f => `  - ${f}`).join('\n')}\n`;

  if (mode === 'generate') {
    prompt += `\nIMPORTANT: Write it like a real Nigerian dealer advert. Natural, conversational, 3-6 sentences. Include the category and key specs naturally. No bullet points or structured format.`;
  }

  return prompt;
}

export async function POST(request: NextRequest) {
  try {
    if (!GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY not configured' },
        { status: 500 }
      );
    }

    const body: GenerateRequest = await request.json();

    if (!body.title && !body.description) {
      return NextResponse.json(
        { error: 'Title or description is required' },
        { status: 400 }
      );
    }

    const prompt = buildPrompt(body);
    const generatedText = await generateWithAI(prompt);

    return NextResponse.json({ text: generatedText });
  } catch (error: any) {
    console.error('Generate description error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate description' },
      { status: 500 }
    );
  }
}
