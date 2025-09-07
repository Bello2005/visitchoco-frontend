export default {
  plugins: {
    "postcss-import": {
      path: ["src"],
    },
    "tailwindcss/nesting": "postcss-nesting",
    tailwindcss: {},
    autoprefixer: {
      flexbox: "no-2009",
    },
  },
};
