# powerimo-short-links-web

This repository hosts the frontend codebase for the [**secrets.powerimo.org**](https://secrets.powerimo.org) service, a secure platform for creating temporary or password-protected URLs for sharing sensitive information. Built with **React** and **TypeScript**, the project leverages **Vite** for a fast development environment and **Shadcn/UI** for a modern, responsive user interface.

## Getting Started

### Prerequisites

-   **Node.js** (v18 or higher)
-   **pnpm** or **npm** or **yarn**

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/powerimo/powerimo-secrets-web.git
    cd powerimo-secrets-web
    ```

2. Install dependencies:

    ```bash
    pnpm install
    # or
    npm install
    # or
    yarn install
    ```

3. Copy .env.sample file to .env.development and modify it to fit your environment:

```bash
cp .env.sample .env.development
nano .env.development
```

4. Start the development server:

    ```bash
    pnpm run dev
    # or
    npm run dev
    # or
    yarn dev
    ```

5. Open your browser and navigate to `http://localhost:3000` to view the application.

## Contributing

Contributions are welcome! If you have any suggestions, bug reports, or want to contribute code, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for more details.

---

Feel free to customize this template to better fit the specific details and needs of your project.
