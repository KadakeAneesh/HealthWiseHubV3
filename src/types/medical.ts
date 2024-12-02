// src/types/medical.ts
export interface Author {
	firstName: string;
	lastName: string;
	initials: string;
}

export interface ArticleSearchParams {
	query: string;
	page?: number;
	pageSize?: number;
	source?: 'all' | 'pubmed' | 'medlineplus';
}

export interface ArticleSearchResponse {
	articles: ProcessedArticle[];
	totalResults: number;
	currentPage: number;
	pageSize: number;
	hasMore: boolean;
}

export interface ProcessedArticle {
	id: string;
	source: 'pubmed' | 'medlineplus';
	title: string;
	content: string;
	summary: string;
	publishDate: string;
	url: string;
	authors: Author[];
	keywords: string[];
	categories: string[];
	journal?: string;
}
