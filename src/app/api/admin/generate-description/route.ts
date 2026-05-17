import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

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

const SYSTEM_PROMPT = `You are a professional Nigerian marketplace copywriter. Your job is to write product descriptions for classified ads on iList (a Nigerian classified ads platform).

Rules:
- Write in a Nigerian marketplace-friendly tone (clear, honest, persuasive)
- NEVER include scam/spam words: "urgent", "click here", "limited offer", "guaranteed", "100%", "miracle", "magic", "cash now", "wire transfer", "Western Union"
- Use proper English with Nigerian context
- Format with bullet points (•) for features
- Keep descriptions factual and honest
- Include relevant keywords for SEO
- Price should be mentioned naturally
- Location context (Nigeria, states, LGAs) should be referenced if provided`;

async function generateWithAI(prompt: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
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
    console.error('OpenAI API error:', error);
    if (response.status === 401) {
      throw new Error('Invalid OpenAI API key. Add a valid OPENAI_API_KEY to .env.local');
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
      prompt = `Write a professional, attractive, and SEO-friendly product description for a Nigerian classified ad.\n\n`;
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
    prompt += `\nFormat the response as:
• A catchy first line
• A detailed 2-3 paragraph description with bullet points for key features
• A call-to-action at the end

Do NOT use markdown headers. Use plain text with bullet points (•).`;
  }

  return prompt;
}

export async function POST(request: NextRequest) {
  try {
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY not configured' },
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
