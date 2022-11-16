import { FastifyPluginCallback } from "fastify";
import type { WebSocket } from "ws";

import { WatchOptions } from "./types";
import { watchDir } from "./watch";

export type WatchRouterOption = {
	dirPath: string;
} & WatchOptions;

export const watchRouter: FastifyPluginCallback<WatchRouterOption> = async (
	fastify,
	{ chrootRefresh, delay, dirPath, hashFiles }
) => {
	const listeners = new Set<{ path: string; socket: WebSocket }>();

	watchDir({
		cb: (action, path) => {
			for (const listener of listeners) {
				if (!chrootRefresh || path.startsWith(listener.path)) {
					listener.socket.send(action);
				}
			}
		},
		delay,
		dirPath,
		hashFiles,
	});

	await fastify.register(async function (fastify) {
		fastify.get<{ Querystring: { path?: string } }>("/ws", { websocket: true }, (connection, req) => {
			if (req.query.path != undefined) {
				const listener = {
					path: req.query.path,
					socket: connection.socket,
				};
				listeners.add(listener);
				connection.socket.on("close", () => {
					listeners.delete(listener);
				});
			} else {
				connection.end();
			}
		});
	});
};
