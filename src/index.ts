import * as Path from "node:path";

import FastifySocket from "@fastify/websocket";
import Fastify from "fastify";

import { serveRouter } from "./server/serveRouter";
import { log } from "./utils";

const fastify = Fastify();

/**
 * Starts the dev-server
 *
 * @param DevServerOptions
 *
 * @returns DevServerResult
 */
export async function startServer({ port, root, host, ...options }: DevServerOptions): Promise<DevServerResult> {
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

	const address = await fastify.listen({ host: host ?? "localhost", port });
	log(`dev-server is listening on ${address}`);

	return {
		address,
		stop: async () => {
			await fastify.close();
		},
	};
}

export type DevServerOptions = {
	/**
	 * Path of a directory that contains the files to serve.\
	 * Non-absolute paths are interpreted relative to current working directory.
	 *
	 * Multiple roots can be given as `Record<mountPath, directoryPath>`.
	 * - mountPath: Url the directory will be mounted on
	 * - directoryPath: Path to directory
	 *
	 * Multiple roots are independent; a change in root will not reload html served from another root.
	 */
	root: string | Record<string, string>;

	/**
	 * HTTP port the dev-server listens on.\
	 * Setting port to 0 will use a random unused port.
	 */
	port: number;

	/**
	 * Host adress to bind to.
	 *
	 * @defaultValue localhost
	 */
	host?: string;

	/**
	 * Refresh html only on changes in the same or a sub-directory.\
	 * This is usefull to serve multiple independent webapps in folders next to each other.
	 *
	 * @defaultValue false
	 */
	chrootRefresh?: boolean;

	/**
	 * Time in ms to wait after file change before refreshing.\
	 * Very small values might trigger reloads before file write is finished.
	 *
	 * @defaultValue 100
	 */
	delay?: number;

	/**
	 * When a file changes compare the file hash to the version before.\
	 * This prevents a refresh when a file has been written with the same content.\
	 * e.g. esbuild will write every file on every build.
	 *
	 * This will increase CPU load especially if a lot of files are watched.
	 *
	 * @defaultValue false
	 */
	hashFiles?: boolean;

	/**
	 * Don't reload on changes in css files, instead refresh only stylesheets.\
	 * Only works if css files are included with `<link rel="stylesheet">` in html.
	 *
	 * @defaultValue true
	 */
	injectCss?: boolean;

	/**
	 * Reload html when dev-server is restarted.
	 *
	 * @defaultValue false
	 */
	reloadOnReconnect?: boolean;
};

export interface DevServerResult {
	/** Address dev-server is listening on. */
	address: string;
	/** Function to close the dev-server. */
	stop: () => Promise<void>;
}
