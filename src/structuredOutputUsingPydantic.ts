import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { PromptTemplate } from "@langchain/core/prompts";

// ✅ CountryDetail 타입 선언 (Pydantic 대체)
interface CountryDetail {
  capital: string;
  population: number;
  language: string;
  currency: string;
}

// ✅ LLM 설정
const llm = new ChatOllama({
  baseUrl: "http://localhost:11434",
  model: "llama3.2:1b",
  temperature: 0.7,
});

// ✅ 명시적인 JSON 예시로 유도
const structuredPrompt = new PromptTemplate({
  template: `
You are a helpful assistant that only responds in valid JSON.

Give the following information about {country}:
- Capital
- Population (number only)
- Language
- Currency

⚠️ Only output a raw JSON object. No explanations, no markdown, no schema.

Example:
{{
  "capital": "Berlin",
  "population": 83000000,
  "language": "German",
  "currency": "Euro"
}}
`,
  inputVariables: ["country"],
});

async function getCountryDetail(country: string) {
  const prompt = await structuredPrompt.format({ country });

  const response = await llm.invoke(prompt);

  const raw =
    typeof response === "string"
      ? response
      : typeof response.content === "string"
      ? response.content
      : Array.isArray(response.content)
      ? response.content
          .map((c) =>
            typeof c === "string" ? c : (c as { text: string }).text,
          )
          .join("")
      : JSON.stringify(response);

  const cleaned = raw.replace(/```json|```/g, "").trim();

  try {
    const parsed: CountryDetail = JSON.parse(cleaned);
    console.log("🟡 전체 객체:", parsed);
    console.log("🏙️ 수도:", parsed.capital);
    return parsed;
  } catch (e) {
    console.error("❌ JSON 파싱 실패:", e);
    console.log("🔍 LLM 응답:", cleaned);
  }
}

// 실행
(async () => {
  const countryDetail = await getCountryDetail("France");
  if (countryDetail) {
    console.log("수도는:", countryDetail.capital);
    console.log("인구:", countryDetail.population);
    console.log("언어:", countryDetail.language);
    console.log("통화:", countryDetail.currency);
  }
})();
