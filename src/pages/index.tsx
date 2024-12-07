import type { NextPage } from 'next';
import PageContent from '../components/Layout/PageContent';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase/clientApp';
import { useEffect, useState } from 'react';
import {
	collection,
	getDocs,
	limit,
	orderBy,
	query,
	where,
} from 'firebase/firestore';
import usePosts from '../hooks/usePosts';
import { Post, PostVote } from '../atoms/postsAtom';
import PostLoader from '../components/Posts/PostLoader';
import { Box, Heading, Stack } from '@chakra-ui/react';
import PostItem from '../components/Posts/PostItem';
import CreatePostLink from '../components/Community/CreatePostLink';
import useCommunityData from '../hooks/useCommunityData';
import Recommendations from '../components/Community/Recommendations';
//import SearchBar from '../components/Navbar/SearchBar';
import { useRouter } from 'next/router';

const Home: NextPage = () => {
	const [user, loadingUser] = useAuthState(auth);
	const [loading, setLoading] = useState(false);
	//const communityStateValue = useRecoilValue(CommunityState);
	const { communityStateValue } = useCommunityData();
	const {
		postStateValue,
		setPostStateValue,
		onSelectPost,
		onDeletePost,
		onVote,
	} = usePosts();
	const router = useRouter();

	const buildUserHomeFeed = async () => {
		setLoading(true);

		try {
			if (communityStateValue.mySnippets.length) {
				//get posts from users' communities

				const myCommunityIds = communityStateValue.mySnippets.map(
					(snippet) => snippet.communityId
				);

				// Update query to handle empty array case
				const postsQuery =
					myCommunityIds.length > 0
						? query(
								collection(db, 'posts'),
								where('communityId', 'in', myCommunityIds),
								orderBy('createdAt', 'desc'),
								limit(10)
						  )
						: query(
								collection(db, 'posts'),
								orderBy('voteStatus', 'desc'),
								limit(10)
						  );

				const postDocs = await getDocs(postsQuery);
				const posts = postDocs.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));

				console.log('Fetched posts:', posts); // Debug log

				setPostStateValue((prev) => ({
					...prev,
					posts: posts as Post[],
				}));
			} else {
				buildNoUserHomeFeed();
			}
		} catch (error) {
			console.error('buildUserHomeFeed error', error);
		}
		setLoading(false);
	};

	const buildNoUserHomeFeed = async () => {
		setLoading(true);
		try {
			const postsQuery = query(
				collection(db, 'posts'),
				orderBy('voteStatus', 'desc'),
				limit(10)
			);

			console.log('Fetching no-user feed'); // Debug log

			const postDocs = await getDocs(postsQuery);
			const posts = postDocs.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}));

			console.log('Fetched no-user posts:', posts); // Debug log

			setPostStateValue((prev) => ({
				...prev,
				posts: posts as Post[],
			}));
		} catch (error) {
			console.error('buildNoUserHomeFeed error', error);
		}
		setLoading(false);
	};

	const getUserPostVotes = async () => {
		try {
			const postIds = postStateValue.posts.map((post) => post.id);
			const postVotesQuery = query(
				collection(db, `users/${user?.uid}/postVotes`),
				where('postId', 'in', postIds)
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
		} catch (error) {
			console.log('getUserPostVotes error', error);
		}
	};

	// const handleSearch = (query: string) => {
	// 	router.push(`/search?query=${encodeURIComponent(query)}`);
	// };

	// //useEffects
	// useEffect(() => {
	// 	if (communityStateValue.snippetsFetched) buildUserHomeFeed();
	// }, [communityStateValue.snippetsFetched]);

	// useEffect(() => {
	// 	if (!user && !loadingUser) buildNoUserHomeFeed();
	// }, [user, loadingUser]);

	// useEffect(() => {
	// 	if (user && postStateValue.posts.length) getUserPostVotes();

	// 	// cleanup function
	// 	return () => {
	// 		setPostStateValue((prev) => ({
	// 			...prev,
	// 			postVotes: [],
	// 		}));
	// 	};
	// }, [user, postStateValue.posts]);

	useEffect(() => {
		if (!user && !loadingUser) {
			buildNoUserHomeFeed();
		}
	}, [user, loadingUser]);

	useEffect(() => {
		if (user && communityStateValue.snippetsFetched) {
			buildUserHomeFeed();
		}
	}, [user, communityStateValue.snippetsFetched]);

	return (
		<PageContent>
			<>
				<CreatePostLink />
				{loading ? (
					<PostLoader />
				) : (
					<Stack>
						{postStateValue.posts.map((post) => (
							<PostItem
								key={post.id}
								post={post}
								onSelectPost={onSelectPost}
								onDeletePost={onDeletePost}
								onVote={onVote}
								userVoteValue={
									postStateValue.postVotes.find(
										(item) => item.postId === post.id
									)?.voteValue
								}
								userIsCreator={user?.uid === post.creatorId}
								homePage
							/>
						))}
					</Stack>
				)}
			</>
			<Stack spacing={5}>
				<Recommendations />
			</Stack>
		</PageContent>
	);
};

export default Home;
