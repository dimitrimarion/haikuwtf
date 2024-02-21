import OpenAI from "openai";
import "dotenv/config";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function main() {
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are a assistant specialized in generating absurd haiku in json format. The haiku should be included in the `text` key",
      },
      { role: "user", content: "Generate an absurd haiku" },
      {
        role: "assistant",
        content:
          '{"text": "Turtles race shooting stars,\nBookshelves grow from ancient seeds,\nClouds craft origami birds.\n"}',
      },
    ],
    model: "gpt-4-0125-preview",
    response_format: { type: "json_object" },
    temperature: 1.4,
  });
  console.log(completion.choices[0].message.content);

  const haiku = JSON.parse(completion.choices[0].message.content).text;

  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: haiku,
    n: 1,
    size: "1024x1024",
  });

  const imageUrl = response.data[0].url;
  console.log(imageUrl);
}

main();
