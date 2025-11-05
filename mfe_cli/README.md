# mfe-cli

A lightweight CLI tool for scaffolding Module Federation-based micro-frontend apps using modern frontend frameworks like **Vite**, **Webpack**, or **Rsbuild**.

This tool helps you generate self-contained, framework-ready microfrontends (Remotes) or host apps (Shells), with fully configured **Module Federation**, build tooling, and shared dependencies.

---

## 🚀 Quick Start

Use `npx` to instantly scaffold a new app:

```bash
npx @vietvohoang/mfe-cli my-dashboard \
  --template react-vite \
  --mf-name dashboardRemote \
  --port 3200 \
  --install
```

or

```bash
npx @vietvohoang/mfe-cli my-dashboard
```

🎉 This will create a new app inside a folder called `my-dashboard` using the selected template.

---

## 📦 Install Globally (optional)

```bash
npm install -g @vietvohoang/mfe-cli
# or
pnpm add -g @vietvohoang/mfe-cli
```

Then run:

```bash
generate-mfe my-dashboard --template react-webpack
```

---

## 🧰 Available Templates

| Template Key       | Framework          | Description                    |
|--------------------|--------------------|--------------------------------|
| `react-vite`       | React + Vite       | Fast dev server, simple setup  |
| `react-webpack`    | React + Webpack    | Classic Webpack 5 + MF         |
| `react-rsbuild`    | React + Rsbuild    | Extremely fast build with Rspack|
| `provider-app`     | React + Rspack     | MF Provider-ready example      |

---

## ⚙️ CLI Options

| Option              | Type     | Description |
|---------------------|----------|-------------|
| `--template`        | string   | Template to use (e.g. `react-vite`) |
| `--mf-name`         | string   | Module Federation `name` (e.g. `dashboardRemote`) |
| `--port`            | number   | Dev server port (default: 3000) |
| `--shared`          | string   | Comma-separated shared libs (default: `react,react-dom`) |
| `--install`         | boolean  | Automatically install dependencies |
| `--git-init`        | boolean  | Initialize Git in the new project |
| `--force`           | boolean  | Override existing folder if exists |

---

## 📁 Project Output

Each generated app contains:

- Proper `package.json` and MF config
- `src/bootstrap.tsx` entry for async loading
- React app entry with exposed components (if Remote)
- Pre-configured dev/production builds
- Shared dependencies (React, react-dom, optional UI libs)

---

## 📘 Resources

Learn more about Module Federation:
- https://module-federation.io
- https://webpack.js.org/concepts/module-federation
- https://rspack.dev/guide/module-federation

---

## 👨‍💻 Contributing / Local Development

If you're interested in contributing or want to debug the CLI locally, check out `DEV_GUIDE.md`.

---

## 📝 License

MIT © 2025 [Viet Vo Hoang](https://github.com/vietvohoang)
