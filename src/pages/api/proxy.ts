// src/pages/api/proxy.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'GET') {
		return res.status(405).json({ message: 'Method not allowed' });
	}

	const { url, ...params } = req.query;

	if (!url || typeof url !== 'string') {
		return res
			.status(400)
			.json({ message: 'URL parameter is required' });
	}

	try {
		const response = await axios({
			method: 'get',
			url: decodeURIComponent(url),
			params: params,
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Origin:
					process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
			},
			timeout: 10000, // 10 second timeout
			maxRedirects: 5,
		});

		// Set CORS headers
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
		res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

		return res.status(200).json(response.data);
	} catch (error) {
		console.error('Proxy error:', error);

		if (axios.isAxiosError(error)) {
			const status = error.response?.status || 500;
			const errorMessage =
				error.response?.data?.message || error.message;

			return res.status(status).json({
				message: 'Error fetching data',
				error: errorMessage,
				details: error.response?.data,
			});
		}

		return res.status(500).json({
			message: 'Internal server error',
			error: error instanceof Error ? error.message : 'Unknown error',
		});
	}
}
