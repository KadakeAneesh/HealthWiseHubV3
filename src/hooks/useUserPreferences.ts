import { useState, useCallback } from 'react';
import { db } from '../firebase/clientApp';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserPreferences } from '../types/interactions';

export const useUserPreferences = (userId: string) => {
	const [loading, setLoading] = useState(false);

	const getUserPreferences =
		useCallback(async (): Promise<UserPreferences | null> => {
			if (!userId) return null;

			try {
				const prefsDoc = await getDoc(
					doc(db, `users/${userId}/preferences/general`)
				);
				return prefsDoc.exists()
					? (prefsDoc.data() as UserPreferences)
					: null;
			} catch (error) {
				console.error('Error fetching user preferences:', error);
				return null;
			}
		}, [userId]);

	const updateUserPreferences = useCallback(
		async (updates: Partial<UserPreferences>): Promise<void> => {
			if (!userId) return;

			setLoading(true);
			try {
				const prefsRef = doc(
					db,
					`users/${userId}/preferences/general`
				);
				await setDoc(prefsRef, updates, { merge: true });
			} catch (error) {
				console.error('Error updating user preferences:', error);
			} finally {
				setLoading(false);
			}
		},
		[userId]
	);

	return {
		loading,
		getUserPreferences,
		updateUserPreferences,
	};
};
