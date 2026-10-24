import { Client, GatewayIntentBits } from "discord.js";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("clientReady", async () => {
  await client.application.commands.set([{
    name: "talk",
    description: "Talk to the AI",
    options: [{ name: "message", description: "What to say", type: 3, required: true }],
  }]);
  console.log(`Ready as ${client.user.tag}`);
});

client.on("interactionCreate", async (i) => {
  if (!i.isChatInputCommand() || i.commandName !== "talk") return;
  await i.deferReply(); // Gemini can take longer than Discord's 3s limit
  try {
    const res = await ai.models.generateContent({
      model,
      contents: i.options.getString("message"),
    });
    await i.editReply((res.text || "No response.").slice(0, 2000));
  } catch (err) {
    console.error(err);
    await i.editReply("⚠️ Something went wrong talking to the AI.");
  }
});

client.login(process.env.DISCORD_TOKEN);
