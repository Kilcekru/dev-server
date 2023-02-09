import { FastifyPluginCallback } from "fastify";
import type { WebSocket } from "ws";

import { watchDir, WatchOptions } from "./watch";

export type WatchRouterOption = {
	dirPath: string;
} & WatchOptions;

/** Router to watch a directory and send refresh actions over websocket */
export const watchRouter: FastifyPluginCallback<WatchRouterOption> = async (fastify, { chrootRefresh, ...options }) => {
	const listeners = new Set<{ path: string; socket: WebSocket }>();

	watchDir({
		cb: (action, paths) => {
			for (const listener of listeners) {
				if (!chrootRefresh || paths.some((path) => path.startsWith(listener.path))) {
					listener.socket.send(action);
				}
			}
		},
		...options,
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
