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
        files: ["**/*.cjs"],
        rules: {
            "@typescript-eslint/no-require-imports": "off"
        }
    },
    {
        ignores: [
            ".prisma/**/*",
            "prisma/.prisma/**/*",
            "prisma/generated/**/*",
            "dist/**/*",
            "node_modules/**/*",
            ".next/**/*"
        ]
    }
];

export default eslintConfig;
