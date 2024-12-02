import * as admin from 'firebase-admin';
//ximport { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { beforeUserCreated } from 'firebase-functions/v2/identity';

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Updated to v2 syntax with correct imports
export const createUserDocument = beforeUserCreated(async (event) => {
	const user = event.data;
	if (!user) return;

	try {
		await db.collection('users').doc(user.uid).set({
			uid: user.uid,
			email: user.email,
			displayName: user.displayName,
			providerData: user.providerData,
			createdAt: admin.firestore.FieldValue.serverTimestamp(),
		});

		console.log(`Successfully created user document for ${user.uid}`);
		return;
	} catch (error) {
		console.error('Error creating user document:', error);
		throw error;
	}
});
