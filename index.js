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

  const haikuText = JSON.parse(completion.choices[0].message.content).text;
  console.log(haikuText);
  const timestamp = Date.now();

  let haikusArray;
  try {
    haikusArray = JSON.parse(fs.readFileSync("haikus.json", "utf8"));
  } catch {
    haikusArray = [];
  }

  // Archive current
  archive(haikusArray);

  const newId =
    haikusArray.length > 0 ? haikusArray[haikusArray.length - 1].id + 1 : 1;
  haikusArray.push({ id: newId, createdAt: timestamp, text: haikuText });
  fs.writeFileSync("haikus.json", JSON.stringify(haikusArray, null, 2));

  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: haikuText,
    n: 1,
    size: "1024x1024",
    response_format: "b64_json",
  });

  const image = response.data[0].b64_json;

  // Decode the base64 image and save it as a file
  const buffer = Buffer.from(image, "base64");
  fs.writeFile(`dist/img/${timestamp}.png`, buffer, (err) => {
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
      haikuText.split("\n").join("<br>")
    );

    updatedHtml = updatedHtml.replace(
      "[PREVIOUS]",
      `archiveJJ/${haikusArray[i - 1].id}/index.html`
    );

    updatedHtml = updatedHtml.replace("[IMAGE_URL]", `img/${timestamp}.png`);

    // Save the updated HTML to a new file
    fs.writeFile(`dist/index.html`, updatedHtml, (err) => {
      if (err) {
        console.error("There was an error writing the updated HTML file:", err);
      } else {
        console.log("Updated HTML was saved successfully.");
      }
    });
  });
}

function archive(haikusArray) {
  const haiku = haikusArray[haikusArray.length - 1];
  const { id, createdAt, haikuText } = haiku;

  const folderName = `dist/archive/${id}`;
  try {
    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName);
    }
  } catch (err) {
    console.error(err);
  }
  const oldPath = `dist/img/${createdAt}.png`;
  const newPath = `dist/archive/${id}/${createdAt}.png`;
  try {
    fs.renameSync(oldPath, newPath);

    console.log("File moved successfully");
  } catch (error) {
    console.error(error);
  }

  fs.readFile("template-archive.html", "utf8", (err, data) => {
    if (err) {
      console.error("There was an error reading the HTML template:", err);
      return;
    }

    let updatedHtml = data.replace(
      "[HAIKU_TEXT]",
      haikuText.split("\n").join("<br>")
    );
    updatedHtml = updatedHtml.replace("[IMAGE_URL]", `${createdAt}.png`);

    updatedHtml = updatedHtml.replace(
      "[PREVIOUS]",
      `../${haikusArray[i - 1].id}/index.html`
    );

    updatedHtml = updatedHtml.replace(
      "[NEXT]",
      `../${haikusArray[i + 1].id}/index.html`
    );
    // Save the updated HTML to a new file
    fs.writeFile(`dist/archive/${id}/index.html`, updatedHtml, (err) => {
      if (err) {
        console.error("There was an error writing the updated HTML file:", err);
      } else {
        console.log("Updated HTML was saved successfully.");
      }
    });
  });
}

main();
