import * as Path from "node:path";

import FastifyStatic from "@fastify/static";
import { FastifyPluginCallback } from "fastify";

import { injectClientScript } from "../client/inject";
import { isFastifyStaticStream, normalizePath, streamToString } from "../utils";
import { wsRouter } from "./wsRouter";

export const serveRouter: FastifyPluginCallback<{
	root: string;
	prefix: string;
}> = async (fastify, { root, prefix }) => {
	fastify.addHook("onSend", async (req, reply, payload) => {
		const contentType = reply.getHeader("content-type");
		if (typeof contentType === "string" && contentType.startsWith("text/html") && isFastifyStaticStream(payload)) {
			let html: string = await streamToString(payload);
			html = injectClientScript({
				html,
				path: normalizePath(Path.relative(root, Path.dirname(payload.filename)), false),
				prefix,
			});
			return html;
		}
		return payload;
	});

	await fastify.register(FastifyStatic, {
		root,
	});

	await fastify.register(wsRouter, { root });
};
