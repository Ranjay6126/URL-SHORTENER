// Verify React setup + swap EJS shells + babel-compile check
const fs = require("fs");
const path = require("path");
const out = [];

const B = "c:/Users/HatBoy/Desktop/URL_shortener/";

// 1. verify installed packages
const checks = [
  "node_modules/react/umd/react.production.min.js",
  "node_modules/react-dom/umd/react-dom.production.min.js",
  "node_modules/@babel/standalone/babel.min.js",
];
checks.forEach((c) => {
  const p = path.join(B, c);
  const ok = fs.existsSync(p);
  out.push((ok ? "OK   " : "MISS ") + c + (ok ? " (" + fs.statSync(p).size + " bytes)" : ""));
});

// 2. swap EJS shells
[
  ["views/_home_new.ejs", "views/home.ejs"],
  ["views/_logs_new.ejs", "views/logs.ejs"],
].forEach(([s, d]) => {
  if (fs.existsSync(B + s)) {
    fs.copyFileSync(B + s, B + d);
    fs.unlinkSync(B + s);
    out.push("SWAPPED " + d);
  } else {
    out.push("TEMP MISSING: " + s);
  }
});

// 3. remove vanilla main.js (replaced by React apps)
try {
  fs.unlinkSync(B + "public/main.js");
  out.push("REMOVED public/main.js (vanilla)");
} catch (e) {
  out.push("main.js already gone");
}

// 4. babel-compile check for both JSX apps (catches syntax errors)
try {
  const babel = require(B + "node_modules/@babel/standalone/babel.js");
  ["public/react/HomeApp.jsx", "public/react/LogsApp.jsx"].forEach((f) => {
    try {
      const src = fs.readFileSync(B + f, "utf8");
      babel.transform(src, { presets: ["react"] });
      out.push("COMPILES OK: " + f);
    } catch (e) {
      out.push("SYNTAX ERROR in " + f + ": " + e.message.split("\n")[0]);
    }
  });
} catch (e) {
  out.push("babel load error: " + e.message);
}

fs.writeFileSync("c:/Users/HatBoy/AppData/Local/Temp/react_setup.log", out.join("\n"), "utf8");
console.log("DONE");
