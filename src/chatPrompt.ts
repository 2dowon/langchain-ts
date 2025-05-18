import { ChatOllama } from "@langchain/community/chat_models/ollama";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  PromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import { LLMChain } from "langchain/chains";

// 1. LLM 초기화
const llm = new ChatOllama({
  baseUrl: "http://localhost:11434",
  model: "llama3.2:1b",
  temperature: 0.7,
});

// 2. 기본 PromptTemplate 예시
export async function runPromptTemplate() {
  const prompt = new PromptTemplate({
    template:
      "What is the capital of {country}? Return the name of the city only",
    inputVariables: ["country"],
  });

  const chain = new LLMChain({ llm, prompt });
  const res = await chain.invoke({ country: "France" });
  console.log("[PromptTemplate 결과]", res.text);
}

// 3. 메시지 리스트 직접 사용
export async function runMessageList() {
  const messages = [
    new SystemMessage("You are a helpful assistant!"),
    new HumanMessage("What is the capital of France?"),
    new AIMessage("The capital of France is Paris."),
    new HumanMessage("What is the capital of Germany?"),
    new AIMessage("The capital of Germany is Berlin."),
    new HumanMessage("What is the capital of Italy?"),
  ];

  const res = await llm.invoke(messages);
  console.log("[Message List 결과]", res.content);
}

// 4. ChatPromptTemplate 사용
export async function runChatPromptTemplate() {
  const chatPrompt = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate("You are a helpful assistant!"),
    HumanMessagePromptTemplate.fromTemplate(
      "What is the capital of {country}?",
    ),
  ]);

  const chain = new LLMChain({ llm, prompt: chatPrompt });
  const res = await chain.invoke({ country: "France" });

  console.log("[ChatPromptTemplate 결과]", res.text);
}

// 실행
(async () => {
  await runPromptTemplate();
  await runMessageList();
  await runChatPromptTemplate();
})();
