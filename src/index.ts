import * as Path from "node:path";

import FastifySocket from "@fastify/websocket";
import Fastify from "fastify";

import { serveRouter } from "./server/serveRouter";
import { WatchOptions } from "./server/types";
import { log } from "./utils";

const fastify = Fastify();

export async function startServer(options: DevServerOptions) {
	await fastify.register(FastifySocket);

	if (typeof options.root === "string") {
		await fastify.register(serveRouter, {
			chrootRefresh: options.chrootRefresh,
			delay: options.delay,
			dirPath: Path.resolve(options.root),
			hashFiles: options.hashFiles,
			prefix: "",
		});
	} else {
		for (const [prefix, root] of Object.entries(options.root)) {
			await fastify.register(serveRouter, {
				chrootRefresh: options.chrootRefresh,
				delay: options.delay,
				dirPath: Path.resolve(root),
				hashFiles: options.hashFiles,
				prefix: prefix.startsWith("/") ? prefix : `/${prefix}`,
			});
		}
	}

	const address = await fastify.listen({
		host: options.host ?? "localhost",
		port: options.port,
	});
	log(`dev-server is listening on ${address}`);

	return {
		stop: async () => {
			await fastify.close();
		},
	};
}

export type DevServerOptions = {
	root: string | Record<string, string>;
	port: number;
	host?: string;
} & WatchOptions;

export default { startServer };
