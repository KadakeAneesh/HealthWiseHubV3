export interface ArticleInteraction {
	articleId: string;
	userId: string;
	createdAt: Date;
	type: 'like' | 'save' | 'share';
}

export interface ArticleComment {
	id: string;
	articleId: string;
	userId: string;
	text: string;
	createdAt: Date;
	updatedAt?: Date;
	parentId?: string;
	likes: number;
}

export interface UserPreferences {
	savedArticles: string[];
	readingHistory: string[];
	topicPreferences: string[];
}
