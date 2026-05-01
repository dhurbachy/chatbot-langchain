import "dotenv/config";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import readline from "readline";

// 1. Initialize the Model with Stable Free Tier Settings
const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash", // Use the most widely supported free model
  apiKey: process.env.GOOGLE_API_KEY,
  maxOutputTokens: 2048,
});

// 2. Define the Template
const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful assistant."],
  new MessagesPlaceholder("chat_history"),
  ["human", "{input}"],
]);

// 3. Create the Chain
const chain = prompt.pipe(model).pipe(new StringOutputParser());

// 4. In-memory Conversation History
let chatHistory = [
  new HumanMessage("My name is Alex."),
  new AIMessage("Nice to meet you, Alex!"),
];

// 5. Chat Function
async function chat(userInput) {
  try {
    const response = await chain.invoke({
      chat_history: chatHistory,
      input: userInput,
    });

    chatHistory.push(new HumanMessage(userInput));
    chatHistory.push(new AIMessage(response));

    return response;
  } catch (error) {
    // Basic error handling for common API issues
    if (error.status === 429) {
      return "Error: Quota exceeded. Please wait a minute before trying again.";
    }
    return `Error: ${error.message}`;
  }
}

//6. Terminal Interface Setup
const rl=readline.createInterface({
    input:process.stdin,
    output:process.stdout
});

async function startInteractiveChat(){
    console.log("\n========================================");
  console.log("  🤖 CHATBOT STARTED");
  console.log("  (Type 'exit' or 'quit' to stop)");
  console.log("========================================\n");
  const ask=()=>{
    rl.question("you: ",async(userInput)=>{
        if (userInput.toLowerCase() === "exit" || userInput.toLowerCase() === "quit") {
        console.log("\nGoodbye!");
        rl.close();
        return;
      }

      const response = await chat(userInput);
      console.log(`\nChatbot: ${response}\n`);

      ask(); // Recursive call to keep the chat going
    })
  };
  ask();
}

// // Example Execution
// console.log("Starting chatbot...");
// const output = await chat("What is my name?");
// console.log("Chatbot:", output);
startInteractiveChat();
