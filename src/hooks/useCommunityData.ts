/**
 * Custom hook for managing community data
 */
import { useEffect, useState } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import {
	Community,
	CommunitySnippet,
	CommunityState,
} from '../atoms/communitiesAtom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase/clientApp';
import {
	collection,
	doc,
	getDoc,
	getDocs,
	increment,
	writeBatch,
} from 'firebase/firestore';
import { authModalState } from '../atoms/authModalAtom';
import { useRouter } from 'next/router';

const useCommunityData = () => {
	const [user] = useAuthState(auth);
	const router = useRouter();
	const [communityStateValue, setCommunityStateValue] =
		useRecoilState(CommunityState);
	const setAuthModalState = useSetRecoilState(authModalState);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const getMySnippets = async () => {
		setLoading(true);
		try {
			const snippetDocs = await getDocs(
				collection(db, `users/${user?.uid}/communitySnippets`)
			);

			const snippets = snippetDocs.docs.map((doc) => ({
				...doc.data(),
			}));

			setCommunityStateValue((prev) => ({
				...prev,
				mySnippets: snippets as CommunitySnippet[],
				snippetsFetched: true,
			}));
		} catch (error: any) {
			console.log('getMySnippets error', error);
			setError(error.message);
		}
		setLoading(false);
	};
	const getCommunityData = async (communityId: string) => {
		try {
			const communityDocRef = doc(db, 'communities', communityId);
			const communityDoc = await getDoc(communityDocRef);
			setCommunityStateValue((prev) => ({
				...prev,
				currentCommunity: {
					id: communityDoc.id,
					...communityDoc.data(),
				} as Community,
			}));
		} catch (error) {
			console.log('getCommunityData', error);
		}
	};

	const onJoinOrLeaveCommunity = (
		communityData: Community,
		isJoined: boolean
	) => {
		if (!user) {
			setAuthModalState({ open: true, view: 'login' });
			return;
		}
		if (isJoined) {
			leaveCommunity(communityData.id);
			return;
		}
		joinCommunity(communityData);
	};
	// Community data fetching and management functions...
	const joinCommunity = async (communityData: Community) => {
		//batch write

		try {
			const batch = writeBatch(db);

			//write fn, creating a new community snippet
			//write fn, updating the no. of members on a community

			const newSnippet: CommunitySnippet = {
				communityId: communityData.id,
				imageURL: communityData.imageURL || '',
				isModerator: user?.uid === communityData.creatorId,
			};

			batch.set(
				doc(
					db,
					`users/${user?.uid}/communitySnippets`,
					communityData.id
				),
				newSnippet
			);

			batch.update(doc(db, 'communities', communityData.id), {
				numberOfMembers: increment(1),
			});

			await batch.commit();

			//update recoil state(client data) - communityState.mySnippets
			setCommunityStateValue((prev) => ({
				...prev,
				mySnippets: [...prev.mySnippets, newSnippet],
			}));
		} catch (error: any) {
			console.log('joinCommunity error', error);
			setError(error.message);
		}
		setLoading(false);
	};

	const leaveCommunity = async (communityId: string) => {
		try {
			const batch = writeBatch(db);

			batch.delete(
				doc(db, `users/${user?.uid}/communitySnippets`, communityId)
			);

			batch.update(doc(db, 'communities', communityId), {
				numberOfMembers: increment(-1),
			});

			await batch.commit();

			setCommunityStateValue((prev) => ({
				...prev,
				mySnippets: prev.mySnippets.filter(
					(item) => item.communityId !== communityId
				),
			}));
		} catch (error: any) {
			console.log('leaveCommunity error', error);
			setError(error.message);
		}
		setLoading(false);
	};

	useEffect(() => {
		if (!user) {
			setCommunityStateValue((prev) => ({
				...prev,
				mySnippets: [],
				snippetsFetched: false,
			}));
			return;
		}
		getMySnippets();
	}, [user]);

	useEffect(() => {
		const { communityId } = router.query;

		if (communityId && !communityStateValue.currentCommunity) {
			getCommunityData(communityId as string);
		}
	}, [router.query, communityStateValue.currentCommunity]);

	return {
		communityStateValue,
		onJoinOrLeaveCommunity,
		loading,
	};
};

export default useCommunityData;
