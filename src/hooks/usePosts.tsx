/**
 * Custom hook for managing posts
 */
import {
	useRecoilState,
	useRecoilValue,
	useSetRecoilState,
} from 'recoil';
import { Post, PostVote, postState } from '../atoms/postsAtom';
import { auth, db, storage } from '../firebase/clientApp';
import { deleteObject, ref } from 'firebase/storage';
import {
	collection,
	deleteDoc,
	doc,
	getDocs,
	increment,
	query,
	runTransaction,
	where,
	writeBatch,
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useEffect } from 'react';
import { CommunityState } from '../atoms/communitiesAtom';
import { authModalState } from '../atoms/authModalAtom';
import { useRouter } from 'next/router';

const usePosts = () => {
	const [user] = useAuthState(auth);
	const [postStateValue, setPostStateValue] =
		useRecoilState(postState);
	const currentCommunity =
		useRecoilValue(CommunityState).currentCommunity;
	const setAuthModalState = useSetRecoilState(authModalState);
	const router = useRouter();

	// Voting logic...
	const onVote = async (
		event: React.MouseEvent<SVGElement, MouseEvent>,
		post: Post,
		vote: number,
		communityId: string
	) => {
		event.stopPropagation();

		if (!user?.uid) {
			setAuthModalState({ open: true, view: 'login' });
			return;
		}

		try {
			const postRef = doc(db, 'posts', post.id);
			const postVoteRef = doc(
				collection(db, 'users', user.uid, 'postVotes')
			);

			await runTransaction(db, async (transaction) => {
				const postDoc = await transaction.get(postRef);
				if (!postDoc.exists()) {
					throw new Error('Post not found');
				}

				const postVoteDoc = await transaction.get(postVoteRef);

				if (!postVoteDoc.exists()) {
					// Create new vote - structure data specifically for Firestore
					const voteData = {
						postId: post.id,
						communityId,
						voteValue: vote,
					};

					transaction.set(postVoteRef, voteData);
					transaction.update(postRef, {
						voteStatus: increment(vote),
					});

					// Update client state with full PostVote interface
					const newVote: PostVote = {
						id: postVoteRef.id,
						...voteData,
					};

					setPostStateValue((prev) => ({
						...prev,
						postVotes: [...prev.postVotes, newVote],
						posts: prev.posts.map((item) =>
							item.id === post.id
								? { ...item, voteStatus: item.voteStatus + vote }
								: item
						),
					}));
				} else {
					const existingVote = postVoteDoc.data();

					if (existingVote.voteValue === vote) {
						// Remove vote
						transaction.delete(postVoteRef);
						transaction.update(postRef, {
							voteStatus: increment(-vote),
						});

						setPostStateValue((prev) => ({
							...prev,
							postVotes: prev.postVotes.filter(
								(vote) => vote.postId !== post.id
							),
							posts: prev.posts.map((item) =>
								item.id === post.id
									? { ...item, voteStatus: item.voteStatus - vote }
									: item
							),
						}));
					} else {
						// Update vote
						const voteData = {
							voteValue: vote,
						};

						transaction.update(postVoteRef, voteData);
						transaction.update(postRef, {
							voteStatus: increment(2 * vote),
						});

						setPostStateValue((prev) => ({
							...prev,
							postVotes: prev.postVotes.map((v) =>
								v.postId === post.id ? { ...v, voteValue: vote } : v
							),
							posts: prev.posts.map((item) =>
								item.id === post.id
									? {
											...item,
											voteStatus: item.voteStatus + 2 * vote,
									  }
									: item
							),
						}));
					}
				}
			});
		} catch (error) {
			console.error('onVote error', error);
		}
	};

	const onSelectPost = (post: Post) => {
		setPostStateValue((prev) => ({
			...prev,
			selectedPost: post,
		}));
		router.push(`/h/${post.communityId}/comments/${post.id}`);
	};
	const onDeletePost = async (post: Post): Promise<boolean> => {
		try {
			//check if img, delete if exists
			if (post.imageURL) {
				const imageRef = ref(storage, `posts/${post.id}/image`);
				await deleteObject(imageRef);
			}

			//delete post doc from db
			const postDocRef = doc(db, 'posts', post.id!);
			await deleteDoc(postDocRef);

			//update recoil state
			setPostStateValue((prev) => ({
				...prev,
				posts: prev.posts.filter((item) => item.id !== post.id),
			}));

			return true;
		} catch (error) {
			return false;
		}
	};
	// Post management functions...

	const getCommunityPostVotes = async (communityId: string) => {
		const postVotesQuery = query(
			collection(db, 'users', `${user?.uid}/postVotes`),
			where('communityId', '==', communityId)
		);

		const postVoteDocs = await getDocs(postVotesQuery);
		const postVotes = postVoteDocs.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		}));
		setPostStateValue((prev) => ({
			...prev,
			postVotes: postVotes as PostVote[],
		}));
	};

	useEffect(() => {
		if (!user || !currentCommunity?.id) return;
		getCommunityPostVotes(currentCommunity?.id);
	}, [user, currentCommunity]);

	useEffect(() => {
		if (!user) {
			//clear user post votes
			setPostStateValue((prev) => ({
				...prev,
				postVotes: [],
			}));
		}
	}, [user]);
	return {
		postStateValue,
		setPostStateValue,
		onVote,
		onSelectPost,
		onDeletePost,
	};
};
export default usePosts;
