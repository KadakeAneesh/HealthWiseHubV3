// src/pages/api/proxy.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === 'OPTIONS') {
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
		res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
		return res.status(200).end();
	}

	if (req.method !== 'GET') {
		return res.status(405).json({ message: 'Method not allowed' });
	}

	const { url } = req.query;

	if (!url || typeof url !== 'string') {
		return res
			.status(400)
			.json({ message: 'URL parameter is required' });
	}

	try {
		const response = await axios({
			method: 'get',
			url: decodeURIComponent(url),
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				'User-Agent': 'HealthWise Hub/1.0',
			},
			timeout: 10000,
			maxRedirects: 5,
		});

		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader(
			'Cache-Control',
			's-maxage=300, stale-while-revalidate'
		);

		return res.status(200).json(response.data);
	} catch (error) {
		console.error('Proxy error:', error);

		if (axios.isAxiosError(error)) {
			return res.status(error.response?.status || 500).json({
				message: 'Error fetching data',
				error: error.message,
			});
		}

		return res.status(500).json({
			message: 'Internal server error',
			error: error instanceof Error ? error.message : 'Unknown error',
		});
	}
}
