import * as Path from "node:path";

import FastifySocket from "@fastify/websocket";
import Fastify from "fastify";

import { serveRouter } from "./server/serveRouter";
import { WatchOptions } from "./server/types";
import { log } from "./utils";

const fastify = Fastify();

export async function startServer({ port, root, host, ...options }: DevServerOptions) {
	await fastify.register(FastifySocket);

	if (typeof root === "string") {
		await fastify.register(serveRouter, {
			dirPath: Path.resolve(root),
			prefix: "",
			...options,
		});
	} else {
		for (const [prefix, dirPath] of Object.entries(root)) {
			await fastify.register(serveRouter, {
				dirPath: Path.resolve(dirPath),
				prefix: prefix.startsWith("/") ? prefix : `/${prefix}`,
				...options,
			});
		}
	}

	const address = await fastify.listen({
		host: host ?? "localhost",
		port,
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
	reloadOnReconnect?: boolean;
} & WatchOptions;

export default { startServer };
