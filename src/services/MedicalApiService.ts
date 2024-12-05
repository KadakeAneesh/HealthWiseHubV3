/**
 * MedicalApiService handles all interactions with medical article APIs (PubMed and MedlinePlus)
 * This service implements the Singleton pattern to ensure only one instance manages API interactions
 */
import axios from 'axios';
import {
	ProcessedArticle,
	ArticleSearchParams,
	ArticleSearchResponse,
	Author,
} from '@/types/medical';

export class MedicalApiService {
	private static instance: MedicalApiService;
	private readonly PUBMED_BASE =
		'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
	private readonly MEDLINE_BASE =
		'https://wsearch.nlm.nih.gov/ws/query';

	private constructor() {}

	static getInstance(): MedicalApiService {
		if (!MedicalApiService.instance) {
			MedicalApiService.instance = new MedicalApiService();
		}
		return MedicalApiService.instance;
	}

	async getArticleById(
		articleId: string
	): Promise<ProcessedArticle | null> {
		try {
			const [source, originalId] = articleId.split('-');

			if (source === 'pubmed') {
				const summaryUrl = `${this.PUBMED_BASE}/esummary.fcgi?db=pubmed&id=${originalId}&retmode=json`;
				const fullTextUrl = `${this.PUBMED_BASE}/efetch.fcgi?db=pubmed&id=${originalId}&retmode=json`;

				const [summaryResponse, fullTextResponse] = await Promise.all(
					[axios.get(summaryUrl), axios.get(fullTextUrl)]
				);

				const article = summaryResponse.data.result[originalId];
				const fullText = fullTextResponse.data.result[originalId];

				return {
					id: `pubmed-${originalId}`,
					source: 'pubmed',
					title: article.title || '',
					content: fullText?.abstract || article.abstract || '',
					summary: article.abstract || '',
					publishDate: article.pubdate || new Date().toISOString(),
					url: `https://pubmed.ncbi.nlm.nih.gov/${originalId}`,
					authors: (article.authors || []).map((author: any) => ({
						lastName: author.name.split(' ').pop() || '',
						firstName: author.name.split(' ').slice(0, -1).join(' '),
						initials: author.name.match(/\b(\w)/g)?.join('') || '',
					})),
					keywords: article.keywords || [],
					categories: article.mesh || [],
					journal: article.fulljournalname || article.source || '',
				};
			}

			if (source === 'medlineplus') {
				const response = await axios.get(
					`${this.MEDLINE_BASE}?db=healthTopics&rettype=json&id=${originalId}`
				);
				const article = response.data.result;

				return {
					id: `medlineplus-${originalId}`,
					source: 'medlineplus',
					title: article.title || '',
					content: article.snippet || article.content || '',
					summary: article.snippet || '',
					publishDate: article.published || new Date().toISOString(),
					url: article.url || '',
					authors: [],
					keywords: article.keywords || [],
					categories: article.categories || [],
					journal: '',
				};
			}

			throw new Error('Invalid article source');
		} catch (error) {
			console.error('Error fetching article:', error);
			return null;
		}
	}

	async searchArticles(
		params: ArticleSearchParams
	): Promise<ArticleSearchResponse> {
		const { query, page = 1, pageSize = 20, source = 'all' } = params;

		try {
			const results = await Promise.allSettled([
				source === 'all' || source === 'pubmed'
					? this.searchPubMed(query, page, pageSize)
					: Promise.resolve([]),
				source === 'all' || source === 'medlineplus'
					? this.searchMedlinePlus(query, page, pageSize)
					: Promise.resolve([]),
			]);

			const articles = results.reduce<ProcessedArticle[]>(
				(acc, result) => {
					if (result.status === 'fulfilled') {
						acc.push(...result.value);
					}
					return acc;
				},
				[]
			);

			return {
				articles,
				totalResults: articles.length,
				currentPage: page,
				pageSize,
				hasMore: articles.length === pageSize,
			};
		} catch (error) {
			console.error('Search error:', error);
			throw new Error('Failed to search articles');
		}
	}

	private async searchPubMed(
		query: string,
		page: number,
		pageSize: number
	): Promise<ProcessedArticle[]> {
		const start = (page - 1) * pageSize;
		const searchUrl = `${
			this.PUBMED_BASE
		}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(
			query
		)}&retstart=${start}&retmax=${pageSize}&retmode=json`;

		try {
			const searchResponse = await this.makeProxiedRequest(searchUrl);
			const idList = searchResponse.esearchresult?.idlist || [];

			if (idList.length === 0) {
				return [];
			}

			const summaryUrl = `${
				this.PUBMED_BASE
			}/esummary.fcgi?db=pubmed&id=${idList.join(',')}&retmode=json`;
			const summaryResponse = await this.makeProxiedRequest(
				summaryUrl
			);

			return this.processPubMedResults(summaryResponse.result || {});
		} catch (error) {
			console.error('PubMed search error:', error);
			return [];
		}
	}

	private async makeProxiedRequest(url: string): Promise<any> {
		try {
			const response = await fetch(
				'/api/proxy?' +
					new URLSearchParams({
						url: encodeURIComponent(url),
					})
			);

			if (!response.ok) {
				throw new Error('Network response was not ok');
			}

			return await response.json();
		} catch (error) {
			console.error('Proxy request failed:', error);
			throw error;
		}
	}

	private async searchMedlinePlus(
		query: string,
		page: number,
		pageSize: number
	): Promise<ProcessedArticle[]> {
		try {
			const start = (page - 1) * pageSize;
			const url = `${
				this.MEDLINE_BASE
			}?db=healthTopics&term=${encodeURIComponent(
				query
			)}&retstart=${start}&retmax=${pageSize}`;

			const response = await this.makeProxiedRequest(url);
			return this.processMedlinePlusResults(response.result || []);
		} catch (error) {
			console.error('MedlinePlus search error:', error);
			return [];
		}
	}

	private processPubMedResults(results: any): ProcessedArticle[] {
		return Object.values(results)
			.filter((article: any) => article.uid)
			.map((article: any) => ({
				id: `pubmed-${article.uid}`,
				source: 'pubmed',
				title: article.title || '',
				content: article.abstract || '',
				summary: article.abstract || '',
				publishDate: article.pubdate || new Date().toISOString(),
				url: `https://pubmed.ncbi.nlm.nih.gov/${article.uid}`,
				authors: this.processAuthors(article.authors || []),
				keywords: article.keywords || [],
				categories: article.mesh || [],
				journal: article.fulljournalname || article.source || '',
			}));
	}

	private processMedlinePlusResults(
		results: any[]
	): ProcessedArticle[] {
		return results.map((article) => ({
			id: `medlineplus-${Date.now()}-${Math.random()
				.toString(36)
				.substr(2, 9)}`,
			source: 'medlineplus',
			title: article.title || '',
			content: article.snippet || article.content || '',
			summary: article.snippet || '',
			publishDate: article.published || new Date().toISOString(),
			url: article.url || '',
			authors: [],
			keywords: article.keywords || [],
			categories: article.categories || [],
			journal: '',
		}));
	}

	private processAuthors(authors: any[]): Author[] {
		return authors.map((author) => ({
			firstName: author.name.split(' ').slice(0, -1).join(' '),
			lastName: author.name.split(' ').pop() || '',
			initials: author.name.match(/\b(\w)/g)?.join('') || '',
		}));
	}
}

export const medicalApi = MedicalApiService.getInstance();
