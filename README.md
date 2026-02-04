# React AI Chatbot

A powerful, responsive AI chatbot built with React, Vite, and TypeScript. This application integrates multiple AI providers and focuses on performance, user privacy, and a seamless user experience.

## 🚀 Key Features

* **Optimized Local Storage**: Uses `lz-string` compression to store chat sessions and history in `localStorage`, significantly reducing memory usage while maintaining persistent state across reloads.
* **Privacy-First**: Includes a Data Consent Modal that requires user approval before any chat data is persisted locally.
* **Multi-Model Support**: Seamlessly switch between various top-tier AI models including Llama 3.3, GPT OSS (via Groq), Gemini 2.5, Claude 4.5 Haiku, GPT 5, and Grok 4.
* **Responsive UI**: Fully responsive design with a collapsible sidebar for mobile viewing, ensuring a great experience on all devices.
* **Theme Customization**: Built-in Dark and Light mode toggle.
* **Rich Content Rendering**: Supports Markdown rendering with syntax highlighting for code blocks.

## 🛠 Project Structure

The project follows a modular and scalable structure:

```
├── public/
    ├── chatbot.ico
    └── chatbotLogo.png
├── src/
    ├── interfaces/
    │   └── ai.ts
    ├── App.tsx
    ├── main.tsx
    ├── utils/
    │   └── dummy-values.ts
    ├── components/
    │   ├── pages/
    │   │   ├── Home.module.css
    │   │   ├── Home.tsx
    │   │   └── Home.test.tsx
    │   ├── chat/
    │   │   ├── ChatContainer.module.css
    │   │   ├── Chat.module.css
    │   │   ├── ChatContainer.tsx
    │   │   ├── Chat.tsx
    │   │   ├── Chat.test.tsx
    │   │   └── ChatContainer.integration.test.tsx
    │   ├── controls/
    │   │   ├── Controls.module.css
    │   │   ├── Controls.tsx
    │   │   └── Controls.test.tsx
    │   ├── DataConsentModal.tsx
    │   ├── DataConsentModal.module.css
    │   ├── Header.module.css
    │   ├── Sidebar.module.css
    │   ├── DataConsentModal.test.tsx
    │   ├── Header.tsx
    │   ├── Sidebar.integration.test.tsx
    │   ├── Sidebar.tsx
    │   ├── Header.integration.test.tsx
    │   ├── Header.test.tsx
    │   └── Sidebar.test.tsx
    ├── context/
    │   ├── ThemeContext.tsx
    │   ├── ThemeContext.test.tsx
    │   ├── ChatContext.tsx
    │   └── ChatContext.test.tsx
    ├── App.test.tsx
    ├── index.css
    └── assistants/
    │   ├── xAi.ts
    │   ├── groqAi.ts
    │   ├── openAi.ts
    │   ├── googleAi.ts
    │   ├── anthropicAi.ts
    │   └── assistants.test.tsx
├── tsconfig.json
├── vite.config.ts
├── .env.example
├── tests/
    └── setup.ts
├── index.html
├── vitest.config.ts
├── .gitignore
├── eslint.config.js
├── tsconfig.node.json
├── .github/
    └── workflows/
    │   └── playwright.yml
├── tsconfig.app.json
├── package.json
└── playwright.config.ts
```

## 🤖 Integrations

This application integrates with multiple AI providers to offer a diverse range of models:

* **Groq**: Llama 3.3, GPT OSS
* **Google**: Gemini 2.5
* **Anthropic**: Claude 4.5 Haiku
* **OpenAI**: GPT 5
* **xAI**: Grok 4

## 🧪 Testing

The project maintains high code quality through a dual-layer testing strategy:

### Unit & Integration Testing

Does uses **Vitest** and **React Testing Library** for fast, reliable unit checking.

* **Command**: `npm test`
* **Scope**: Components (Header, Sidebar, etc.), Context logic, and Utility functions.

### End-to-End (E2E) Testing

Uses **Playwright** for comprehensive browser automation testing.

* **Command**: `npm run e2e`
* **Key Test Suites**:
  * **Session Management**: Verifies creating, switching, and deleting chat sessions.
  * **Chat Flow**: Tests sending messages and receiving mocked AI responses.
  * **Mobile Responsiveness**: Ensures the sidebar overlays and toggles work correctly on smaller screens.
  * **UI Controls**: Checks theme toggling and model selection.

## 📦 Getting Started

1. **Install Dependencies**

    ```bash
    npm install
    ```

2. **Run Development Server**

    ```bash
    npm run dev
    ```

3. **Run Tests**

    ```bash
    npm test          # Run unit tests
    npm run e2e       # Run Playwright E2E tests
    ```

## 🏗 Build Check

```bash
npm run build
```
