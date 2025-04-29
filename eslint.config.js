export default [
  {
    files: ["*.ts"],
    parser: "@typescript-eslint/parser", // Используем парсер для TypeScript
    parserOptions: {
      project: ["./tsconfig.json"], // Указываем на tsconfig.json
    },
    plugins: ["@typescript-eslint"], // Включаем плагин для TypeScript
    extends: [
      "plugin:@angular-eslint/recommended",
      "plugin:@angular-eslint/template/process-inline-templates",
      "prettier",
    ],
    rules: {
      // Ваши кастомные правила ESLint
    },
  },
];
