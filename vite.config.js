import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Ensure the correct file is used for pdfmake fonts
      "pdfmake/build/vfs_fonts": "pdfmake/build/vfs_fonts.js",
      // Polyfill Buffer by redirecting imports to the polyfilled version
    },
  },


});
