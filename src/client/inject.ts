import clientScript from "./client.html";

interface InjectOptions {
	html: string;
	path: string;
	prefix: string;
	reloadOnReconnect?: boolean;
}

export function injectClientScript({ html, path, prefix, reloadOnReconnect }: InjectOptions): string {
	const script = clientScript
		.replace("_PREFIX_", prefix)
		.replace("_PATH_", path)
		.replace("_AUTORELOAD_", reloadOnReconnect ? "true" : "false");
	if (html.includes("</head>")) {
		return html.replace("</head>", `${script}\n</head>`);
	} else if (html.includes("</body>")) {
		return html.replace("</body>", `${script}\n</body>`);
	} else {
		return html;
	}
}
