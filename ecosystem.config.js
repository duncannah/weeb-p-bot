module.exports = {
	apps: [
		{
			name: "weeb-p-bot",
			script: ".",
			autorestart: true,
			time: true,
			max_memory_restart: "200M",
			env: {
				NODE_ENV: "development",
			},
			env_production: {
				NODE_ENV: "production",
			},
		},
	],
};
