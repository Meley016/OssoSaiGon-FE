/* eslint-env node */
/* global process */
import fs from "fs";
import path from "path";
import ttf2woff2 from "ttf2woff2";

const inputDir = "public/fonts";

console.log("📂 Đang quét thư mục:", inputDir);

if (!fs.existsSync(inputDir)) {
  console.log("❌ Không tìm thấy thư mục:", inputDir);
  process.exit(1);
}

const files = fs.readdirSync(inputDir);
console.log("📄 Tìm thấy file:", files);

files.forEach(file => {
  if (file.toLowerCase().endsWith(".ttf")) {
    const inputPath = path.join(inputDir, file);
    const outputPath = inputPath.replace(/\.ttf$/i, ".woff2");

    const ttf = fs.readFileSync(inputPath);
    const woff2 = ttf2woff2(ttf);

    fs.writeFileSync(outputPath, woff2);
    console.log("✅ Converted:", file);
  }
});

console.log("🎉 Hoàn tất convert font.");
