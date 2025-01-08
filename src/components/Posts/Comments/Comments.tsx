import { Post, postState } from '@/atoms/postsAtom';
import {
	Box,
	Flex,
	SkeletonCircle,
	SkeletonText,
	Stack,
	Text,
} from '@chakra-ui/react';
import { User } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import CommentInput from './CommentInput';
import {
	Timestamp,
	collection,
	doc,
	getDocs,
	increment,
	orderBy,
	query,
	serverTimestamp,
	setDoc,
	updateDoc,
	where,
	writeBatch,
} from 'firebase/firestore';
import { db } from '@/firebase/clientApp';
import { useSetRecoilState } from 'recoil';
import CommentItem, { Comment } from './CommentItem';

type CommentsProps = {
	user: User;
	selectedPost: Post | null;
	communityId: string;
};

const Comments: React.FC<CommentsProps> = ({
	user,
	selectedPost,
	communityId,
}) => {
	const [commentText, setCommmentText] = useState('');
	const [comments, setComments] = useState<Comment[]>([]);
	const [fetchLoading, setFetchLoading] = useState(true);
	const [createLoading, setCreateLoading] = useState(false);
	const [loadingDeleteId, setloadingDeleteId] = useState('');
	const setPostState = useSetRecoilState(postState);
	const [error, setError] = useState('');

	const onCreateComment = async (commentText: string) => {
		setCreateLoading(true);
		try {
			const batch = writeBatch(db);

			// Create comment document
			const commentDocRef = doc(
				collection(db, `posts/${selectedPost?.id}/comments`)
			);

			const newComment = {
				id: commentDocRef.id,
				creatorId: user.uid,
				creatorDisplayText: user.email!.split('@')[0],
				communityId,
				postId: selectedPost?.id!,
				postTitle: selectedPost?.title!,
				text: commentText,
				createdAt: serverTimestamp(),
			};
			await setDoc(commentDocRef, newComment);
			batch.set(commentDocRef, newComment);

			await updateDoc(doc(db, 'posts', selectedPost?.id!), {
				numberOfComments: increment(1),
			});

			await batch.commit();

			// Update local state with properly typed comment
			setComments((prev) => [
				{
					...newComment,
					createdAt: {
						seconds: Date.now() / 1000,
						nanoseconds: 0,
					} as Timestamp,
				},
				...prev,
			]);

			// Clear comment input
			setCommmentText(''); // Note the correct variable name
		} catch (error) {
			console.error('onCreateComment error:', error);
		}
		setCreateLoading(false);
	};

	const onDeleteComment = async (comment: Comment) => {
		setloadingDeleteId(comment.id);
		try {
			const batch = writeBatch(db);

			//delete comment document
			const commentDocRef = doc(db, 'comments', comment.id);
			batch.delete(commentDocRef);

			//update post numberOfComments -1
			const postDocRef = doc(db, 'posts', selectedPost?.id!);
			batch.update(postDocRef, {
				numberOfComments: increment(-1),
			});

			await batch.commit();

			//update client recoil state to show comments and their count
			setPostState((prev) => ({
				...prev,
				selectedPost: {
					...prev.selectedPost,
					numberOfComments: prev.selectedPost?.numberOfComments! - 1,
				} as Post,
			}));

			setComments((prev) =>
				prev.filter((item) => item.id !== comment.id)
			);
		} catch (error) {
			console.log('onDeleteComment error', error);
		}
		setloadingDeleteId('');
	};

	const getPostComments = async () => {
		if (!selectedPost?.id) return;

		setFetchLoading(true);
		try {
			const commentsQuery = query(
				collection(db, `posts/${selectedPost?.id}/comments`),
				orderBy('createdAt', 'desc')
			);

			const commentDocs = await getDocs(commentsQuery);
			const comments = commentDocs.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}));
			setComments(comments as Comment[]);
		} catch (error) {
			setError('Error fetching comments');
			console.error('getPostComments error:', error);
		} finally {
			setFetchLoading(false);
		}
	};

	useEffect(() => {
		getPostComments();
	}, [selectedPost?.id]);
	return (
		<Box bg="white" borderRadius="0px 0px 4px 4px" p={2}>
			<Flex
				direction="column"
				pl={10}
				pr={4}
				mb={6}
				fontSize="10pt"
				width="100%">
				{!fetchLoading && (
					<CommentInput
						commentText={commentText}
						setCommentText={setCommmentText}
						user={user}
						createLoading={createLoading}
						onCreateComment={onCreateComment}
					/>
				)}
			</Flex>
			<Stack spacing={6} p={2}>
				{fetchLoading ? (
					<>
						{[0, 1, 2].map((item) => (
							<Box key={item} padding="6" bg="white">
								<SkeletonCircle size="10" />
								<SkeletonText mt="4" noOfLines={2} spacing="4" />
							</Box>
						))}
					</>
				) : (
					<>
						{comments.length === 0 ? (
							<Flex
								direction="column"
								justify="center"
								align="center"
								borderTop="1px solid"
								borderColor="gray.100"
								p={20}>
								<Text fontWeight={700} opacity={0.3}>
									No Comments Yet
								</Text>
							</Flex>
						) : (
							<>
								{comments.map((comment) => (
									<CommentItem
										key={comment.id}
										comment={comment}
										onDeleteComment={onDeleteComment}
										loadingDelete={loadingDeleteId === comment.id}
										userId={user.uid}
									/>
								))}
							</>
						)}
					</>
				)}
			</Stack>
		</Box>
	);
};
export default Comments;
