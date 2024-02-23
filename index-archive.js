import OpenAI from "openai";
import fs from "fs";
import "dotenv/config";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function main() {
  let haikusArray;
  try {
    haikusArray = JSON.parse(fs.readFileSync("haikus.json", "utf8"));
  } catch {
    haikusArray = [];
  }

  haikusArray.forEach((element) => {
    const folderName = `dist/archive/${element.id}`;
    if (element.id != 30) {
      console.log(folderName);
      if (element.id != 1) {
        const oldPath = `dist/img/${element.createdAt}.png`;
        const newPath = `dist/archive/${element.id}/${element.createdAt}.png`;
        try {
          // Top level await is available without a flag since Node.js v14.8
          fs.renameSync(oldPath, newPath);

          // Handle success (fs.rename resolves with `undefined` on success)
          console.log("File moved successfully");
        } catch (error) {
          // Handle the error
          console.error(error);
        }
      }
      try {
        if (!fs.existsSync(folderName)) {
          fs.mkdirSync(folderName);
        }
      } catch (err) {
        console.error(err);
      }
    }
  });

  /*   fs.readFile("template.html", "utf8", (err, data) => {
    if (err) {
      console.error("There was an error reading the HTML template:", err);
      return;
    }

    let updatedHtml = data.replace(
      "[HAIKU_TEXT]",
      haikuText.split("\n").join("<br>")
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
  }); */
}

main();
