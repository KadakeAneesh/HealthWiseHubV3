import { useState } from 'react';
import {
	ProcessedArticle,
	ArticleSearchParams,
	ArticleSearchResponse,
} from '@/types/medical';

export function useMedicalSearch() {
	const [articles, setArticles] = useState<ProcessedArticle[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [hasMore, setHasMore] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalResults, setTotalResults] = useState(0);

	const searchArticles = async (params: ArticleSearchParams) => {
		try {
			setLoading(true);
			setError(null);

			const response = await fetch(
				'/api/medical/search?' +
					new URLSearchParams({
						query: params.query,
						page: (params.page || 1).toString(),
						pageSize: (params.pageSize || 20).toString(),
						source: params.source || 'all',
					})
			);

			if (!response.ok) {
				throw new Error('Failed to fetch articles');
			}

			const data: ArticleSearchResponse = await response.json();

			if (params.page === 1) {
				setArticles(data.articles);
			} else {
				setArticles((prev) => [...prev, ...data.articles]);
			}

			setCurrentPage(data.currentPage);
			setHasMore(data.hasMore);
			setTotalResults(data.totalResults);

			// Store articles in localStorage for detail view
			data.articles.forEach((article) => {
				localStorage.setItem(
					`article_${article.id}`,
					JSON.stringify(article)
				);
			});
		} catch (err) {
			setError(
				err instanceof Error ? err.message : 'An error occurred'
			);
			console.error('Search error:', err);
		} finally {
			setLoading(false);
		}
	};

	const loadMore = () => {
		if (!loading && hasMore) {
			searchArticles({
				query: articles[0]?.title || '', // or store current query in state
				page: currentPage + 1,
				pageSize: 20,
			});
		}
	};

	const resetSearch = () => {
		setArticles([]);
		setCurrentPage(1);
		setHasMore(false);
		setTotalResults(0);
		setError(null);
	};

	return {
		articles,
		loading,
		error,
		hasMore,
		currentPage,
		totalResults,
		searchArticles,
		loadMore,
		resetSearch,
	};
}
