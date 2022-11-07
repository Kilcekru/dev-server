import * as Path from "node:path";

import FastifySocket from "@fastify/websocket";
import Fastify from "fastify";

import { log } from "../utils";
import { serveRouter } from "./serveRouter";

const fastify = Fastify();

export async function startServer(options: ServerOptions): Promise<void> {
	await fastify.register(FastifySocket);

	await fastify.register(serveRouter, {
		root: Path.resolve(options.root),
		prefix: "",
	});

	const address = await fastify.listen({
		host: options.host ?? "localhost",
		port: options.port,
	});
	log(`dev-server is listening on ${address}`);
}

export async function stopServer() {
	await fastify.close();
}

interface ServerOptions {
	port: number;
	host?: string;
	root: string;
}
