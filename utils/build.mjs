import esbuild from "esbuild";
import nodemon from "nodemon";
import Path from "path";
import { fileURLToPath } from "url";

const watch = process.argv[2] === "--watch";

const dirname = Path.dirname(fileURLToPath(import.meta.url));
const pkgPath = Path.join(dirname, "..");
const entry = Path.join(pkgPath, "src/index.ts");
const target = Path.join(pkgPath, "dist/index.js");
const startScript = Path.join(dirname, "start.mjs");

const log = (msg) => {
	console.log(`${new Date().toLocaleTimeString()}:`, msg); // eslint-disable-line no-console
};

async function main() {
	try {
		const start = Date.now();
		await esbuild.build({
			entryPoints: {
				index: entry,
			},
			outfile: target,
			bundle: true,
			keepNames: true,
			platform: "node",
			target: "node16",
			loader: {
				".html": "text",
			},
			external: ["@fastify/static", "@fastify/websocket", "chokidar", "fastify"],
			watch: watch && {
				onRebuild: (err) => {
					if (err) {
						log(`Rebuilt with error: ${err.message}`);
					} else {
						log("Rebuilt");
					}
				},
			},
		});
		log(`Built in ${Date.now() - start} ms`);

		if (watch) {
			nodemon({
				script: startScript,
				watch: [startScript, target],
			});
		}
	} catch (err) {
		log("Error", err);
		process.exit(1);
	}
}

main();
