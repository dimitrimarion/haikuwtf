import OpenAI from "openai";
import fs from "fs";
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
    response_format: "b64_json",
  });

  const image = response.data[0].b64_json;

  // Decode the base64 image and save it as a file
  const buffer = Buffer.from(image, "base64");
  const timestamp = Date.now();
  fs.writeFile(`${timestamp}.png`, buffer, (err) => {
    if (err) {
      console.error("There was an error saving the image:", err);
    } else {
      console.log("Image was saved successfully.");
    }
  });

  fs.readFile("template.html", "utf8", (err, data) => {
    if (err) {
      console.error("There was an error reading the HTML template:", err);
      return;
    }

    let updatedHtml = data.replace(
      "[HAIKU_TEXT]",
      haiku.split("\n").join("<br>")
    );
    updatedHtml = updatedHtml.replace("[IMAGE_URL]", `${timestamp}.png`);

    // Save the updated HTML to a new file
    fs.writeFile(`generated-${timestamp}.html`, updatedHtml, (err) => {
      if (err) {
        console.error("There was an error writing the updated HTML file:", err);
      } else {
        console.log("Updated HTML was saved successfully.");
      }
    });
  });
}

main();
