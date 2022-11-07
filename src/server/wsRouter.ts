import { FastifyPluginCallback } from "fastify";
import type { WebSocket } from "ws";

import { watchDir } from "../watch/watch";

export const wsRouter: FastifyPluginCallback<{ root: string }> = async (fastify, { root }) => {
	const listeners = new Set<{ path: string; socket: WebSocket }>();

	watchDir(root, (action, path) => {
		for (const listener of listeners) {
			if (path.startsWith(listener.path)) {
				listener.socket.send(action);
			}
		}
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
