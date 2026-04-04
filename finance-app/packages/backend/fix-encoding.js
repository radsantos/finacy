import fs from "fs";
import path from "path";

const walk = (dir) => {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walk(fullPath);
    } else if (file.endsWith(".ts")) {
      try {
        const content = fs.readFileSync(fullPath, "utf8");

        // Reescreve como UTF-8 limpo
        fs.writeFileSync(fullPath, content, {
          encoding: "utf8",
        });

        console.log("✔ Corrigido:", fullPath);
      } catch (err) {
        console.error("Erro em:", fullPath, err.message);
      }
    }
  }
};

walk("./src");