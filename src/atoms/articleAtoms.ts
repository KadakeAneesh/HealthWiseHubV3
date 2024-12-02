import { atom } from 'recoil';
import {
	ArticleInteraction,
	ArticleComment,
} from '../types/interactions';

export const articleInteractionsState = atom<ArticleInteraction[]>({
	key: 'articleInteractionsState',
	default: [],
});

export const articleCommentsState = atom<ArticleComment[]>({
	key: 'articleCommentsState',
	default: [],
});
