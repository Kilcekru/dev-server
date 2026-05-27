const { startServer } = require("..");

startServer({
	port: 8080,
	root: "./public",
	chrootRefresh: true,
	hashFiles: true,
	reloadOnReconnect: true,
});
