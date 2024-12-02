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
	// Make these properties optional since they might not always be present
	categories?: string[];
	journal?: string;
}

export interface Author {
	firstName: string;
	lastName: string;
	initials: string;
}
