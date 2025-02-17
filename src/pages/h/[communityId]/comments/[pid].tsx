import { Post } from '@/atoms/postsAtom';
import About from '@/components/Community/About';
import PageContent from '@/components/Layout/PageContent';
import Comments from '@/components/Posts/Comments/Comments';
import PostItem from '@/components/Posts/PostItem';
import PostLoader from '@/components/Posts/PostLoader';
import { auth, db } from '@/firebase/clientApp';
import useCommunityData from '@/hooks/useCommunityData';
import usePosts from '@/hooks/usePosts';
import { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import Error from 'next/error';

const PostPage: React.FC = () => {
	const { postStateValue, setPostStateValue, onDeletePost, onVote } =
		usePosts();
	const [user] = useAuthState(auth);
	const router = useRouter();
	const { communityStateValue } = useCommunityData();
	const [loading, setLoading] = React.useState(false);
	const { communityId, pid } = router.query;

	const decodedCommunityId = communityId
		? decodeURIComponent(communityId as string)
		: '';

	//console.log('Router query params:', router.query); // Debug logging

	const fetchPost = async (postId: string) => {
		try {
			const postDocRef = doc(db, 'posts', postId);
			const postDoc = await getDoc(postDocRef);
			setPostStateValue((prev) => ({
				...prev,
				selectedPost: { id: postDoc.id, ...postDoc.data() } as Post,
			}));
		} catch (error) {
			console.log('fetchPost error', error);
		}
	};

	// const DebugRouter: React.FC = () => {
	// 	const router = useRouter();

	// 	useEffect(() => {
	// 		console.log('Current route:', {
	// 			pathname: router.pathname,
	// 			query: router.query,
	// 			asPath: router.asPath,
	// 		});
	// 	}, [router.pathname, router.query]);

	// 	return null;
	// };

	useEffect(() => {
		if (!pid || !communityId) return;

		const fetchPost = async () => {
			try {
				const postRef = doc(db, 'posts', pid as string);
				const postDoc = await getDoc(postRef);

				if (!postDoc.exists()) {
					console.error('Post not found');
					return;
				}

				setPostStateValue((prev) => ({
					...prev,
					selectedPost: {
						id: postDoc.id,
						...postDoc.data(),
					} as Post,
				}));
			} catch (error) {
				console.error('Error fetching post:', error);
			}
		};

		fetchPost();
	}, [pid, communityId]);

	useEffect(() => {
		console.log('Comments page mounted:', {
			query: router.query,
			path: router.asPath,
		});
	}, [router.query]);

	useEffect(() => {
		console.log('Router query:', router.query); // Debug log
		if (!communityId || !pid) {
			console.log('Missing params:', { communityId, pid }); // Debug log
			return;
		}
		// ... rest of your code
	}, [router.query]);

	useEffect(() => {
		if (!decodedCommunityId || !pid) return;

		const loadPost = async () => {
			try {
				const postDocRef = doc(db, 'posts', pid as string);
				const postDoc = await getDoc(postDocRef);

				if (!postDoc.exists()) {
					router.push(`/h/${decodedCommunityId}`);
					return;
				}

				setPostStateValue((prev) => ({
					...prev,
					selectedPost: { id: postDoc.id, ...postDoc.data() } as Post,
				}));
			} catch (error) {
				console.error('Error loading post:', error);
			}
		};

		loadPost();
	}, [pid, decodedCommunityId]);

	// useEffect(() => {
	// 	const { pid } = router.query;

	// 	const loadPost = async () => {
	// 		if (!pid) return;
	// 		setLoading(true);
	// 		try {
	// 			const postDocRef = doc(db, 'posts', pid as string);
	// 			const postDoc = await getDoc(postDocRef);
	// 			if (postDoc.exists()) {
	// 				setPostStateValue((prev) => ({
	// 					...prev,
	// 					selectedPost: {
	// 						id: postDoc.id,
	// 						...postDoc.data(),
	// 					} as Post,
	// 				}));
	// 			}
	// 		} catch (error) {
	// 			console.error('Error loading post:', error);
	// 		} finally {
	// 			setLoading(false);
	// 		}
	// 	};

	// 	loadPost();
	// }, [router.query.pid, setPostStateValue]);
	if (!communityId || !pid) {
		return <Error statusCode={404} />;
	}

	return (
		<PageContent>
			{/* <DebugRouter /> */}
			<>
				{loading ? (
					<PostLoader />
				) : (
					<>
						{postStateValue.selectedPost && (
							<PostItem
								post={postStateValue.selectedPost}
								onVote={onVote}
								onDeletePost={onDeletePost}
								userVoteValue={
									postStateValue.postVotes.find(
										(item) =>
											item.postId === postStateValue.selectedPost?.id
									)?.voteValue
								}
								userIsCreator={
									user?.uid === postStateValue.selectedPost?.creatorId
								}
							/>
						)}
						<Comments
							user={user as User}
							selectedPost={postStateValue.selectedPost}
							communityId={
								postStateValue.selectedPost?.communityId as string
							}
						/>
					</>
				)}
			</>
			<>
				{communityStateValue.currentCommunity && (
					<About
						communityData={communityStateValue.currentCommunity}
					/>
				)}
			</>
		</PageContent>
	);
};
export default PostPage;
