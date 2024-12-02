import withPWA from 'next-pwa';

const config = withPWA({
	dest: 'public',
	disable: process.env.NODE_ENV === 'development',
	register: true,
	skipWaiting: true,
	runtimeCaching: [
		{
			urlPattern: /^https:\/\/eutils\.ncbi\.nlm\.nih\.gov\/.*$/,
			handler: 'StaleWhileRevalidate',
			options: {
				cacheName: 'pubmed-api',
				expiration: {
					maxEntries: 50,
					maxAgeSeconds: 60 * 60 * 24, // 24 hours
				},
			},
		},
		{
			urlPattern: /^https:\/\/wsearch\.nlm\.nih\.gov\/.*$/,
			handler: 'StaleWhileRevalidate',
			options: {
				cacheName: 'medlineplus-api',
				expiration: {
					maxEntries: 50,
					maxAgeSeconds: 60 * 60 * 24, // 24 hours
				},
			},
		},
		{
			urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/.*$/,
			handler: 'CacheFirst',
			options: {
				cacheName: 'firebase-storage',
				expiration: {
					maxEntries: 100,
					maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
				},
			},
		},
		{
			urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
			handler: 'CacheFirst',
			options: {
				cacheName: 'images',
				expiration: {
					maxEntries: 60,
					maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
				},
			},
		},
		{
			urlPattern:
				/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
			handler: 'CacheFirst',
			options: {
				cacheName: 'google-fonts',
				expiration: {
					maxEntries: 30,
					maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
				},
			},
		},
	],
})({
	async rewrites() {
		return [
			{
				source: '/api/proxy',
				destination: '/api/proxy',
			},
		];
	},
});

export default config;
