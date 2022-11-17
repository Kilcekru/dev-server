import { startServer } from "../dist/index.mjs";

startServer({
	port: 8080,
	root: "./utils/public",
	chrootRefresh: true,
	hashFiles: true,
	reloadOnReconnect: true,
});
