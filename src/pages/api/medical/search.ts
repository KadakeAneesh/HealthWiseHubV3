import type { NextApiRequest, NextApiResponse } from 'next';
import { medicalApi } from '@/services/MedicalApiService';
import { ArticleSearchResponse } from '@/types/medical';

interface SearchQuery {
	q?: string;
	page?: string;
	pageSize?: string;
	source?: 'all' | 'pubmed' | 'medlineplus';
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<ArticleSearchResponse | { error: string }>
) {
	if (req.method !== 'GET') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	try {
		const {
			q = '',
			page = '1',
			pageSize = '20',
			source = 'all',
		} = req.query as SearchQuery;

		const results = await medicalApi.searchArticles({
			query: q,
			page: parseInt(page),
			pageSize: parseInt(pageSize),
			source,
		});

		return res.status(200).json(results);
	} catch (error) {
		console.error('Search API error:', error);
		return res.status(500).json({
			error:
				error instanceof Error ? error.message : 'An error occurred',
		});
	}
}
