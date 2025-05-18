import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "langchain/output_parsers";
import { z } from "zod";

// 1. LLM 설정
const llm = new ChatOllama({
  model: "llama3.2:1b",
});

// 2. 단순 문자열 출력 파서 사용
const stringPrompt = new PromptTemplate({
  template:
    "What is the capital of {country}? Return the name of the city only.",
  inputVariables: ["country"],
});

const stringOutputParser = new StringOutputParser();

async function getCapitalSimple(country: string) {
  const prompt = await stringPrompt.format({ country });
  const response = await llm.invoke(prompt);

  const parsed = await stringOutputParser.parse(
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
      : JSON.stringify(response),
  );

  console.log("🟢 단순 파싱 결과:", parsed);
  return parsed;
}

// 3. 구조화된 출력 (zod)
const countrySchema = z.object({
  capital: z.string().describe("The capital of the country"),
  population: z.number().describe("The population of the country"),
  language: z.string().describe("The language of the country"),
  currency: z.string().describe("The currency of the country"),
});

const structuredOutputParser =
  StructuredOutputParser.fromZodSchema(countrySchema);

const structuredPrompt = new PromptTemplate({
  template: `
Give the following information about {country}:
- Capital
- Population
- Language
- Currency

Return it in JSON format, and return the JSON dictionary only.
{format_instructions}
`,
  inputVariables: ["country"],
  partialVariables: {
    format_instructions: structuredOutputParser.getFormatInstructions(),
  },
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
    const parsed = await structuredOutputParser.parse(cleaned);
    console.log("🟡 구조화된 파싱 결과:", parsed);
    return parsed;
  } catch (e) {
    console.error("❌ 파싱 실패:", e);
    console.log("🔍 원본 응답:", cleaned);
  }
}

// 실행 예시
(async () => {
  await getCapitalSimple("France");

  const countryDetail = await getCountryDetail("France");
  console.log("Capital:", countryDetail?.capital);
})();
