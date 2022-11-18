const { startServer } = require("..");

startServer({
	port: 8080,
	root: "./utils/public",
	chrootRefresh: true,
	hashFiles: true,
	reloadOnReconnect: true,
});
