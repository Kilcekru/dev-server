import * as Path from "node:path";

import FastifyStatic from "@fastify/static";
import { FastifyPluginCallback } from "fastify";

import { injectClientScript } from "../client/inject";
import { isFastifyStaticStream, normalizePath, streamToString } from "../utils";
import { WatchOptions } from "./watch";
import { watchRouter } from "./watchRouter";

export type ServeRouterOptions = {
	dirPath: string;
	prefix: string;
	reloadOnReconnect?: boolean;
} & WatchOptions;

/**
 * Router to serve a directory.\
 * Also handles watching, websocket connection and refreshing html.
 */
export const serveRouter: FastifyPluginCallback<ServeRouterOptions> = async (
	fastify,
	{ dirPath, prefix, reloadOnReconnect, ...options }
) => {
	fastify.addHook("onSend", async (req, reply, payload) => {
		const contentType = reply.getHeader("content-type");
		if (typeof contentType === "string" && contentType.startsWith("text/html") && isFastifyStaticStream(payload)) {
			let html: string = await streamToString(payload);
			html = injectClientScript({
				html,
				path: normalizePath(Path.relative(dirPath, Path.dirname(payload.filename)), true),
				prefix: normalizePath(prefix, true),
				reloadOnReconnect,
			});
			return html;
		}
		return payload;
	});

	await fastify.register(FastifyStatic, {
		root: dirPath,
	});

	await fastify.register(watchRouter, { dirPath, ...options });
};
