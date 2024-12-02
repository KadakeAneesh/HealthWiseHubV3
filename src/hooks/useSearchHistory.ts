/**
 * Custom hook for search history
 */
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface SearchHistoryState {
	query: string;
	results: any[]; // Replace 'any' with your article type
	timestamp: number;
}

export const useSearchHistory = () => {
	const router = useRouter();
	const [searchHistory, setSearchHistory] =
		useState<SearchHistoryState | null>(null);

	// Load search history when component mounts
	useEffect(() => {
		const savedHistory = localStorage.getItem('lastSearch');
		if (savedHistory) {
			setSearchHistory(JSON.parse(savedHistory));
		}
	}, []);

	// Save search to history
	const saveSearch = (query: string, results: any[]) => {
		const historyState: SearchHistoryState = {
			query,
			results,
			timestamp: Date.now(),
		};
		localStorage.setItem('lastSearch', JSON.stringify(historyState));
		setSearchHistory(historyState);
	};

	// Clear search history
	const clearSearchHistory = () => {
		localStorage.removeItem('lastSearch');
		setSearchHistory(null);
	};

	return {
		searchHistory,
		saveSearch,
		clearSearchHistory,
	};
};
