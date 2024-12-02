export interface Author {
	firstName: string;
	lastName: string;
	initials: string;
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
	categories?: string[];
	journal?: string;
}
