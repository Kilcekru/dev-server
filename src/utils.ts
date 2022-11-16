import { Buffer } from "node:buffer";
import { Stream } from "node:stream";

export function hasKey<Key extends string>(value: unknown, key: Key): value is { [k in Key]: unknown } {
	return typeof value === "object" && value != null && key in value;
}

export function isFastifyStaticStream(value: unknown): value is Stream & { filename: string } {
	return (
		hasKey(value, "pipe") &&
		typeof value.pipe === "function" &&
		hasKey(value, "filename") &&
		typeof value.filename === "string"
	);
}

export async function streamToString(stream: Stream): Promise<string> {
	return await new Promise<string>((resolve, reject) => {
		const chunks: Buffer[] = [];
		stream.on("data", (chunk: Buffer | string) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
		stream.on("error", (err) => reject(err));
		stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
	});
}

export function log(...args: unknown[]) {
	console.log(...args); // eslint-disable-line no-console
}

export function normalizePath(str: string, trailingSlash: boolean) {
	if (str === "") {
		return "/";
	}
	return `/${str.replaceAll(/\\/g, "/")}${trailingSlash ? "/" : ""}`.replaceAll(/\/+/g, "/");
}
