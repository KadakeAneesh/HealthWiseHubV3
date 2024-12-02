/**
 * SearchResults Component
 * Handles the display and management of medical article search results
 * Implements pagination, loading states, and error handling
 * Integrates with the MedicalApiService for data fetching
 */
import { useEffect, useState } from 'react';
import {
	Box,
	Text,
	VStack,
	Alert,
	AlertIcon,
	AlertTitle,
	AlertDescription,
} from '@chakra-ui/react';
import { ProcessedArticle } from '@/types/medical';
import { medicalApi } from '@/services/MedicalApiService';
import { ArticleCard } from '@/components/medical/ArticleCard';

interface SearchResultsProps {
	query: string;
	page?: number;
	pageSize?: number;
}

export default function SearchResults({
	query,
	page = 1,
	pageSize = 20,
}: SearchResultsProps) {
	const [articles, setArticles] = useState<ProcessedArticle[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	/**
	 * Performs the article search when query parameters change
	 * Manages loading states and error handling
	 */

	useEffect(() => {
		async function performSearch() {
			if (!query.trim()) return;

			setLoading(true);
			setError(null);

			try {
				const response = await medicalApi.searchArticles({
					query,
					page,
					pageSize,
				});
				setArticles(response.articles);
				// Cache articles for detail view
			} catch (err) {
				console.error('Search error:', err);
				setError(
					err instanceof Error
						? err.message
						: 'Failed to search articles'
				);
			} finally {
				setLoading(false);
			}
		}

		performSearch();
	}, [query, page, pageSize]);
	/**
	 * Renders appropriate UI based on current state
	 */
	if (error) {
		return (
			<Alert status="error" borderRadius="md">
				<AlertIcon />
				<Box>
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>{error}</AlertDescription>
				</Box>
			</Alert>
		);
	}

	if (loading) {
		return <Text>Searching...</Text>;
	}

	if (articles.length === 0) {
		return <Text>No results found for "{query}"</Text>;
	}

	return (
		<VStack spacing={4} align="stretch">
			{articles.map((article) => (
				<ArticleCard key={article.id} article={article} />
			))}
		</VStack>
	);
}
