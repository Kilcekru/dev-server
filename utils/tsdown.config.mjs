import { defineConfig } from "tsdown";

export default defineConfig((options) => [
	{
		clean: true,
		entry: "../src/index.ts",
		outDir: "../dist",
		platform: "node",
		loader: {
			".html": "text",
		},
		format: ["cjs", "esm"],
		dts: { cjsReexport: true },
		watch: options.watch,
		onSuccess: options.watch ? "node start.js" : undefined,
	},
]);
