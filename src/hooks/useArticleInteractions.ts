import { useState, useCallback } from 'react';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import { articleInteractionsState } from '../atoms/articleAtoms';
import { useAuth } from './useAuth';
import { db } from '../firebase/clientApp';
import {
	doc,
	setDoc,
	deleteDoc,
	collection,
	query,
	where,
	getDocs,
} from 'firebase/firestore';

export const useArticleInteractions = (articleId: string) => {
	const [loading, setLoading] = useState(false);
	const { user } = useAuth();
	const setInteractions = useSetRecoilState(articleInteractionsState);
	const interactions = useRecoilValue(articleInteractionsState);

	const likeArticle = useCallback(async () => {
		if (!user) return;
		setLoading(true);
		try {
			const interactionRef = doc(
				db,
				`articles/${articleId}/interactions/${user.uid}`
			);
			await setDoc(interactionRef, {
				type: 'like',
				userId: user.uid,
				createdAt: new Date(),
			});

			setInteractions((prev) => [
				...prev,
				{
					articleId,
					userId: user.uid,
					type: 'like',
					createdAt: new Date(),
				},
			]);
		} catch (error) {
			console.error('Error liking article:', error);
		} finally {
			setLoading(false);
		}
	}, [articleId, user, setInteractions]);

	const saveArticle = useCallback(async () => {
		if (!user) return;
		setLoading(true);
		try {
			const saveRef = doc(
				db,
				`users/${user.uid}/savedArticles/${articleId}`
			);
			await setDoc(saveRef, {
				articleId,
				savedAt: new Date(),
			});

			setInteractions((prev) => [
				...prev,
				{
					articleId,
					userId: user.uid,
					type: 'save',
					createdAt: new Date(),
				},
			]);
		} catch (error) {
			console.error('Error saving article:', error);
		} finally {
			setLoading(false);
		}
	}, [articleId, user, setInteractions]);

	const shareArticle = useCallback(async () => {
		if (!user) return;
		try {
			await navigator.share({
				title: 'Check out this article on HealthWise Hub',
				url: `/article/${articleId}`,
			});

			setInteractions((prev) => [
				...prev,
				{
					articleId,
					userId: user.uid,
					type: 'share',
					createdAt: new Date(),
				},
			]);
		} catch (error) {
			console.error('Error sharing article:', error);
		}
	}, [articleId, user, setInteractions]);

	return {
		loading,
		likeArticle,
		saveArticle,
		shareArticle,
	};
};
