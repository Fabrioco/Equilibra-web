import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAi = new GoogleGenerativeAI(apiKey || "");

// Usando gemini-1.5-flash que é a versão mais leve e rápida para o seu app
const model = genAi.getGenerativeModel({ model: "gemini-2.5-flash" });

async function listModels() {
  const url = `https://generativelanguage.googleapis.com/v1/models?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  console.log("Modelos disponíveis para esta chave:", data);
}

export default async function processTransaction(text: string) {
  const prompt = `Atue como um extrator de dados financeiros. 
  Converta a frase: "${text}" para um objeto JSON estritamente no formato:
  {
    "type": "INCOME" ou "EXPENSE",
    "title": string,
    "amount": number,
    "category": string,
    "date": "YYYY-MM-DD",
    "recurrence": "FIXED", "INSTALLMENT" ou "ONE_TIME",
    "totalInstallment": number ou null
  }
  Retorne apenas o JSON puro, sem blocos de código ou markdown.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    // Limpeza robusta: remove marcações de markdown se a IA ignorar o comando
    const cleanText = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Erro detalhado:", error);
    throw error;
  }
}
