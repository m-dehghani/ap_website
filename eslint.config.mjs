import nextTypescript from "eslint-config-next/typescript";
import next from "eslint-config-next";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
    ...nextTypescript,
    ...next,
    ...nextCoreWebVitals,
    {
        rules: {
            "@typescript-eslint/no-explicit-any": "warn"
        }
    },
    {
        ignores: [
            "dist/**/*",
            "node_modules/**/*",
            ".next/**/*"
        ]
    }
];

export default eslintConfig;
