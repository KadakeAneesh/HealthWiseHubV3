// src/utils/dbFixes.ts
import {
	collection,
	getDocs,
	writeBatch,
	doc,
} from 'firebase/firestore';
import { db } from '../firebase/clientApp';

export const fixPostIds = async () => {
	try {
		console.log('Starting post ID fix...');
		const postsRef = collection(db, 'posts');
		const postsSnap = await getDocs(postsRef);

		const batch = writeBatch(db);
		let fixCount = 0;

		postsSnap.docs.forEach((doc) => {
			const postData = doc.data();
			if (!postData.id) {
				batch.update(doc.ref, {
					id: doc.id,
				});
				fixCount++;
			}
		});

		if (fixCount > 0) {
			await batch.commit();
			console.log(`Fixed ${fixCount} posts`);
		} else {
			console.log('No posts needed fixing');
		}
	} catch (error) {
		console.error('Error fixing post IDs:', error);
	}
};
