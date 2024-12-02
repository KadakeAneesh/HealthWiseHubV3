import { useEffect, useState, useMemo } from 'react';
import { db } from '../firebase/clientApp';
import {
	collection,
	query,
	where,
	onSnapshot,
	DocumentData,
} from 'firebase/firestore';

export const useFirestoreCollection = <T extends DocumentData>(
	collectionName: string,
	queryConstraints: any[] = []
) => {
	const [data, setData] = useState<T[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const memoizedConstraints = useMemo(
		() => queryConstraints,
		[JSON.stringify(queryConstraints)]
	);

	useEffect(() => {
		const q = query(
			collection(db, collectionName),
			...memoizedConstraints
		);

		const unsubscribe = onSnapshot(
			q,
			(snapshot) => {
				const documents = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				})) as unknown as T[];
				setData(documents);
				setLoading(false);
			},
			(error) => {
				console.error('Firestore subscription error:', error);
				setError(error);
				setLoading(false);
			}
		);

		return () => unsubscribe();
	}, [collectionName, JSON.stringify(memoizedConstraints)]);

	return { data, loading, error };
};
