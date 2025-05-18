import * as dotenv from "dotenv";
dotenv.config();

import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { PromptTemplate } from "@langchain/core/prompts";
import { LLMChain } from "langchain/chains";

const model = new ChatOllama({
  baseUrl: "http://localhost:11434", // ollama 로컬 서버
  model: "llama3.2:1b", // 설치한 모델 이름
  temperature: 0.7,
});

const prompt = new PromptTemplate({
  template: "다음 질문에 답하세요: {question}",
  inputVariables: ["question"],
});

const chain = new LLMChain({ llm: model, prompt });

async function main() {
  const res = await chain.invoke({ question: "대한민국의 수도는 어디인가요?" });
  console.log(res.text);
}

main();
