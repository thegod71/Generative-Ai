import dotenv from "dotenv";
dotenv.config();
import OpenAI from "openai";
import readline from "node:readline/promises";
import { tavily } from "@tavily/core";
import NodeCache from "node-cache";

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const cache = new NodeCache({ stdTTL: 3600 }); // cache ka time set karte hai 1 ghanta

const main = async (msg, threadId) => {
  const baseMessages = [
    {
      role: "system",
      content: `You are a  smart presonal assistant who answers the asked questions. 
        You have access  to following tools:
        1. websearch ({query} : {query : string} //Search the latest information and realtime data on the internet.)
        `, // in this  we give instruction to the model how to respond to the user query
    },
  ];
  // to check ki given threadId ke liye cache me koi response hai ya nahi
  const messages = cache.get(threadId) ?? baseMessages;

  // user ka input ka liya use hoga

  messages.push({
    role: "user",
    content: msg,
  });
  while (true) {
    // to maintain the history of the message  like tool call ya tb tk chalaa ga jb tk llm tool calling band band na kr de

    const completion = await client.chat.completions.create({
      model: "openai/gpt-oss-20b",
      temperature: 0,
      messages: messages,
      tools: [
        {
          type: "function",
          function: {
            name: "webSearch",
            description:
              "Search the latest information and realtime data on the internet.",
            parameters: {
              // jo query may function ko pass karega uska structure define karte hai
              // JSON Schema object
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "The search query to perform search on.",
                },
              },
              required: ["query"],
            },
          },
        },
      ],
      tool_choice: "auto", // auto means model khud decide karega ki tool ka use karna hai ya nahi
    });

    messages.push(completion.choices[0].message); // jb llm na tool call kiya  hai wo hai
    const toolCalls = completion.choices[0].message.tool_calls;

    if (!toolCalls) {
      cache.set(threadId, messages); // cache me message history store kar dete hai
      console.log(cache);
      return completion.choices[0].message.content; // agar tool call nahi hai to direct answer de do
      // console.log(`Assistan: ${completion.choices[0].message.content}`);
      // break;
    }
    // jitna tool  hai sbko  itereatr kro
    for (const tool of toolCalls) {
      const functionName = tool.function.name;
      const functionParams = tool.function.arguments;

      if (functionName === `webSearch`) {
        const toolResult = await webSearch(JSON.parse(functionParams));

        //console.log("ToolResult", toolResult);
        // jo tool ka result hai wo bhi to message history ka unders hoga
        messages.push({
          tool_call_id: tool.id,
          role: `tool`,
          name: functionName,
          content: toolResult,
        });
      }
    }
  }
};

//console.log(JSON.stringify(completion2.choices[0].message, null, 2));

async function webSearch({ query }) {
  const response = await tvly.search(query);
  //console.log(response);

  const finalResult = response.results
    .map((result) => result.content)
    .join(`\n\n`); //es may jitna bhi response aya hai wo sb ek array may store ho jaa  a gaa

  //console.log(finalResult);

  return finalResult;
}
export default main;
// const response = await client.responses.create({
//   model: "openai/gpt-oss-20b",
//   input: "Who are you?",
// });
// console.log(response.output_text);
