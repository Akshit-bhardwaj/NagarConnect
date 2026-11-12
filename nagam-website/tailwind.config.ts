import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "../nagam-ui/src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#142F58",
          darkNavy: "#0B1D35",
          blue: "#245A86",
          brightBlue: "#2563EB",
          sky: "#38BDF8",
          white: "#FFFFFF",
          lightBlue: "#EAF1F6",
        },
      },
    },
  },
  plugins: [],
};
export default config;
