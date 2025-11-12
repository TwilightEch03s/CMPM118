import dotenv from "dotenv";
dotenv.config();

import readline from "readline";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";

// --- Tools ---
// Multiplication
const multiply = tool(
  ({ a, b }) => {
    return a * b;
  },
  {
    name: "multiply",
    description: "Multiply two numbers",
    schema: z.object({
      a: z.number(),
      b: z.number(),
    }),
  }
);

// Division
const divide = tool(
  ({ a, b }) => {
    if (b === 0) {
      throw new Error("Cannot divide by zero");
    }
    return a / b;
  },
  {
    name: "divide",
    description: "Divide two numbers",
    schema: z.object({
      a: z.number(),
      b: z.number(),
    }),
  }
);
// Addition
const add = tool(
  ({ a, b }) => {
    return a + b;
  },
  {
    name: "add",
    description: "Add two numbers",
    schema: z.object({
      a: z.number(),
      b: z.number(),
    }),
  }
);
// Subtraction
const subtract = tool(
  ({ a, b }) => {
    return a - b;
  },
  {
    name: "subtract",
    description: "Subtract second number from first number",
    schema: z.object({ a: z.number(), b: z.number() }),
  }
);

// LLM and Tools Binding
const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0,
});

const llmWithTools = model.bindTools([add, subtract, multiply, divide]);

const systemTemplate = `You are an AI calculator. You can add, subtract, multiply, or divide numbers.`;
const promptTemplate = ChatPromptTemplate.fromMessages([
  ["system", systemTemplate],
  ["user", "{userInput}"],
]);

const readInput = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Example

const example = async () => {
  console.log("\nExample: Multiply Tool Usage");

  const response = await llmWithTools.invoke("What is 12 multiplied by 9?");
  console.log("AI Response:", response.content);

  if (response.tool_calls?.length) {
    console.log("Tool Called:", response.tool_calls[0].name);
    console.log("Tool Args:", response.tool_calls[0].args);
  } else {
    console.log("No tools were used.");
  }
  console.log("——————————————\n");
};

// --- Chat Loop ---

const chat = () => {
  readInput.question("You: ", async (userInput) => {
    const promptValue = await promptTemplate.invoke({ userInput });
    const response = await llmWithTools.invoke(promptValue);

    console.log("AI:", response.content);

    if (response.tool_calls?.length) {
      console.log("Used Tool:", response.tool_calls[0].name);
      console.log("Tool Args:", response.tool_calls[0].args);
    }

    console.log("——————————————");
    chat();
  });
};

// --- Start Program ---

console.log("AI Calculator");
await example();
chat();
