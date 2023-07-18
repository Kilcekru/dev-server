import * as Crypto from "node:crypto";
import * as FS from "node:fs";
import * as Path from "node:path";

import chokidar from "chokidar";

import { normalizePath } from "../utils";

export type IgnoredMatcher = chokidar.WatchOptions["ignored"];

export interface WatchOptions {
	chrootRefresh?: boolean;
	delay?: number;
	hashFiles?: boolean;
	injectCss?: boolean;
	ignored?: IgnoredMatcher;
}

export type WatchDirArgs = {
	cb: (action: "reload" | "css", paths: string[]) => void;
	dirPath: string;
} & WatchOptions;

/** Watch a directory and trigger actions on file changes. */
export function watchDir({ cb, delay, dirPath, hashFiles, injectCss, ignored }: WatchDirArgs) {
	let timer: { action: "reload" | "css"; timeout: NodeJS.Timeout } | undefined;
	let paths = new Set<string>();
	const hashes = new Map<string, string | undefined>();
	let ready = false;
	const watcher = chokidar.watch(dirPath, { ignored: ignored });
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
				paths.add(normalizePath(Path.relative(dirPath, filePath), false));
				timer = {
					action:
						timer?.action === "reload" || injectCss === false || Path.extname(filePath) !== ".css" ? "reload" : "css",
					timeout: setTimeout(() => {
						cb(timer?.action ?? "reload", [...paths]);
						timer = undefined;
						paths = new Set();
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
