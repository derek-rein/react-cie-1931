import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		dts({ insertTypesEntry: true }), // Generate declaration files
	],
	build: {
		lib: {
			// Could also be a dictionary or array of multiple entry points
			entry: path.resolve(__dirname, "src/index.tsx"),
			name: "React-CIE-1931",
			// the proper extensions will be added
			formats: ["es", "umd"],
			fileName: (format) => `viewer.${format}.js`,
		},
		rollupOptions: {
			// make sure to externalize deps that shouldn't be bundled
			// into your library
			external: ["react", "react-dom"],
			output: {
				// Provide global variables to use in the UMD build
				// for externalized deps
				globals: {
					react: "React",
					"react-dom": "ReactDOM",
				},
			},
		},
	},
});
