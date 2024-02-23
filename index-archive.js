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

  haikusArray.forEach((element, i) => {
    const folderName = `dist/archive/${element.id}`;
    if (element.id != 30) {
      const haikuText = element.text;
      const timestamp = element.createdAt;
      console.log(folderName);
      if (element.id != 1) {
        fs.readFile("template-archive.html", "utf8", (err, data) => {
          if (err) {
            console.error("There was an error reading the HTML template:", err);
            return;
          }

          let updatedHtml = data.replace(
            "[HAIKU_TEXT]",
            haikuText.split("\n").join("<br>")
          );
          updatedHtml = updatedHtml.replace("[IMAGE_URL]", `${timestamp}.png`);

          updatedHtml = updatedHtml.replace(
            "[PREVIOUS]",
            `../${haikusArray[i - 1].id}/index.html`
          );

          updatedHtml = updatedHtml.replace(
            "[NEXT]",
            `../${haikusArray[i + 1].id}/index.html`
          );
          // Save the updated HTML to a new file
          fs.writeFile(
            `dist/archive/${element.id}/index.html`,
            updatedHtml,
            (err) => {
              if (err) {
                console.error(
                  "There was an error writing the updated HTML file:",
                  err
                );
              } else {
                console.log("Updated HTML was saved successfully.");
              }
            }
          );
        });
      }
    }
  });
}

main();
