import { startServer } from "./server/server";

export async function start(options: DevServerOptions): Promise<void> {
	await startServer(options);
}

export interface DevServerOptions {
	port: number;
	host?: string;
	root: string;
}
