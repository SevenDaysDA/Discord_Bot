import dotenv, { configDotenv } from "dotenv";
import { Client, GatewayIntentBits } from "discord.js";
import { Configuration, OpenAIApi } from "openai";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const openai = new OpenAIApi(new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
);

async function getConversation (message) {

  let conversationList = [];
  const repliedMessage = await message.channel.messages.fetch(message.channelID);
  repliedMessage.reverse().forEach((m, messageId) => {
    // Perform your desired operation inside the following block
    
    const formatted = {
      role: m.author.bot ? 'assistant' : 'user',
      content: m.content.replace(`<@${process.env.DISCORD_CLIENT_ID}> `, ''),
    }
    conversationList.push(formatted)
  
  });

  return conversationList;
}

client.on("messageCreate", async function (message) {
  if (message.author.bot) return;
  if (message.content.includes(`<@${process.env.DISCORD_CLIENT_ID}>`)) return;
  const conversation = await getConversation(message)

  try {
    const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            {role: "system", content: "You are a helpful assistant who responds succinctly"},
            ...conversation,
        ],
      });
      console.log(response)

    const content = response.data.choices[0].message;
    return message.reply(content);

  } catch (err) {
    return message.reply(`As an AI robot, I errored out.\n${err}`);
  }
});

client.login(process.env.BOT_TOKEN);
