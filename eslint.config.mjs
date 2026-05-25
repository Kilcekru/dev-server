import tsBasics from "@kilcekru/ts-basics";

export default tsBasics.defineConfig([...tsBasics.presets.node, tsBasics.globalIgnores(["**/dist/"])]);
