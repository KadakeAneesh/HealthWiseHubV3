import { ProcessedArticle } from './medical';

export interface ArticleComment {
	id: string;
	articleId: string;
	userId: string;
	userDisplayName: string;
	content: string;
	createdAt: string;
	likes: number;
}

export interface ArticleInteraction {
	likes: number;
	comments: number;
	userHasLiked: boolean;
}

export interface ArticleDetailData extends ProcessedArticle {
	interactions: ArticleInteraction;
	comments: ArticleComment[];
}
