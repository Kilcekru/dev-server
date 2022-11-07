import clientScript from "./client.html";

interface InjectOptions {
	html: string;
	path: string;
	prefix: string;
}

export function injectClientScript({ html, path, prefix }: InjectOptions): string {
	const script = clientScript.replace("%PREFIX%", prefix).replace("%PATH%", path);
	if (html.includes("</head>")) {
		return html.replace("</head>", `${script}\n</head>`);
	} else if (html.includes("</body>")) {
		return html.replace("</body>", `${script}\n</body>`);
	} else {
		return html;
	}
}
