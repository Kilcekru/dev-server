import * as Crypto from "node:crypto";
import * as FS from "node:fs";
import * as Path from "node:path";

import chokidar from "chokidar";

import { normalizePath } from "../utils";

export interface WatchOptions {
	chrootRefresh?: boolean;
	delay?: number;
	hashFiles?: boolean;
	injectCss?: boolean;
}

export type WatchDirArgs = {
	cb: (action: "reload" | "css", path: string) => void;
	dirPath: string;
} & WatchOptions;

/** Watch a directory and trigger actions on file changes. */
export function watchDir({ cb, delay, dirPath, hashFiles, injectCss }: WatchDirArgs) {
	let timer: { action: "reload" | "css"; timeout: NodeJS.Timeout } | undefined;
	const hashes = new Map<string, string | undefined>();
	let ready = false;
	const watcher = chokidar.watch(dirPath);
	watcher.on("ready", () => {
		ready = true;
	});
	watcher.on("all", async (event, filePath) => {
		if (event !== "add" && event !== "change" && event !== "unlink") {
			return;
		}
		const isReady = ready;
		const hash = !hashFiles || event === "unlink" ? undefined : await hashFile(filePath);
		if (isReady) {
			if (!hashFiles || hash !== hashes.get(filePath)) {
				hashes.set(filePath, hash);
				if (timer != undefined) {
					clearTimeout(timer.timeout);
				}
				timer = {
					action:
						timer?.action === "reload" || injectCss === false || Path.extname(filePath) !== ".css" ? "reload" : "css",
					timeout: setTimeout(() => {
						cb(timer?.action ?? "reload", normalizePath(Path.relative(dirPath, filePath), false));
						timer = undefined;
					}, delay ?? 100),
				};
			}
		} else {
			hashes.set(filePath, hash);
		}
	});
}

async function hashFile(path: string) {
	try {
		return await new Promise<string>((resolve, reject) => {
			const hash = Crypto.createHash("sha1");
			const input = FS.createReadStream(path);
			input.on("data", (data) => hash.update(data));
			input.on("end", () => resolve(hash.digest("base64")));
			input.on("error", reject);
		});
	} catch (err) {
		return undefined;
	}
}
