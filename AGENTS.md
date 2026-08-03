# Agent Instructions — WebXR Showcases

A monorepo of standalone WebXR showcase experiences (Three.js + webpack) deployable to Quest Browser and other WebXR-capable browsers. Each subdirectory is its own buildable app.

## Source-of-truth files (read these first, do not duplicate their contents in this file)

For setup, build steps, dependency versions, and project layout, read:

- `README.md` — list of showcases and links to live builds
- `package.json` (root) — shared dev tooling: linters, formatters, gltf-transform pipeline
- `<showcase>/package.json` — per-showcase runtime dependencies and scripts (`serve`, `build`)
- `<showcase>/webpack.config.{js,cjs}` — per-showcase bundler config
- `LICENSE` — license terms

## Quest / Horizon-specific notes

- Repo shape: top-level `package.json` is shared dev tooling only. Each showcase (`sneaker-builder/`, `realmeasure/`, `chairs-etc/`, `flap-frenzy/`) is its own npm project — `npm install` and `npm run` from inside the showcase directory, not the root.
- Showcases pin a Meta-specific Three.js fork (`super-three`); do not silently replace it with mainline `three` when bumping versions.
- A change in one showcase does not propagate to the others — verify each independently.

## Meta Quest tooling

This repository is part of the Meta Quest / Horizon OS ecosystem (a sample, library, template, or related project — the bespoke intro above describes which). Use that intro and the source-of-truth files it references for project-specific decisions; don't restate or invent facts from memory.

When the user asks anything about Quest device behavior, build / deploy / debug / capture flows, on-device performance, or Horizon OS APIs, reach for these tools instead of generic WebXR answers:

- **`hzdb`** — Quest-aware ADB wrapper (device list, install / launch / stop, logs, screenshots, Perfetto traces, on-device docs search). Already wired up as an MCP server via `.mcp.json`, `.vscode/mcp.json`, and `.cursor/mcp.json`. Also runnable directly: `npx -y @meta-quest/hzdb <subcommand>`.
- **Meta Quest Agentic Tools** — the full skill set, including WebXR-specific skills: [github.com/meta-quest/agentic-tools](https://github.com/meta-quest/agentic-tools). Install per your client (Claude Code: `/plugin install meta-vr@meta-quest`; Gemini CLI: `gemini extensions install https://github.com/meta-quest/agentic-tools`; Cursor / VS Code: install the **Meta Horizon** extension from the Marketplace).

A few behavior expectations:

- **Read this repo's files first.** Before answering anything project-specific, read `README.md` and whichever source-of-truth files the intro above points at. Don't restate their contents in chat — quote or link instead.
- **Use `hzdb` for device-side work.** Anything that touches an attached Quest (install, launch, logs, screenshot, capture, manifest inspection) goes through `hzdb`, not raw `adb`.
- **Check live Horizon OS docs before answering API questions.** `hzdb docs search "..."` queries the live docs; training data on Horizon OS APIs goes stale fast.
- **Don't fabricate SDK / engine versions.** If a version isn't visible in this repo's files, say so rather than guessing.
