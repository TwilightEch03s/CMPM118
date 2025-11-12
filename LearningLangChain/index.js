import { config } from "dotenv";
config();

import readline from "readline";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0,
});

console.log("You are chatting with an AI rental girlfriend");

const systemTemplate = "You are chatting with your girlfriend";
const promptTemplate = ChatPromptTemplate.fromMessages([
  ["system", systemTemplate],
  ["user", "{userInput}"],
]);

const readInput = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const chat = () => {
  readInput.question("You: ", (userInput) => {
    promptTemplate.invoke({ userInput }).then((promptValue) => {
      model.invoke(promptValue).then((response) => {
        console.log("AI:", response.content);
        chat();
      });
    });
  });
};

chat();
