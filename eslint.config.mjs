import nextVitals from "eslint-config-next";

const eslintConfig = [
  ...nextVitals,
  {
    ignores: ["src/generated/**", ".next/**", "node_modules/**"],
  },
];

export default eslintConfig;
