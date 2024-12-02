/**
 * ArticleComments Component
 * Manages the comment section for medical articles
 * Provides functionality for viewing, adding, and managing comments
 * Implements real-time updates and user authentication checks
 */
import React, { useState } from 'react';
import {
	Box,
	Button,
	Text,
	Textarea,
	VStack,
	HStack,
	Avatar,
} from '@chakra-ui/react';
import { useAuth } from '../../hooks/useAuth';
import { useRecoilState } from 'recoil';
import { articleCommentsState } from '../../atoms/articleAtoms';
import { db } from '../../firebase/clientApp';
import {
	addDoc,
	collection,
	serverTimestamp,
} from 'firebase/firestore';
import { Comment } from '@/types/article';

interface ArticleCommentsProps {
	articleId: string;
	comments: Comment[];
}

const ArticleComments: React.FC<ArticleCommentsProps> = ({
	articleId,
}) => {
	const { user } = useAuth();
	const [comments, setComments] = useRecoilState(
		articleCommentsState
	);
	const [newComment, setNewComment] = useState('');
	const [loading, setLoading] = useState(false);
	/**
	 * Handles the submission of new comments
	 * Validates user authentication and comment content
	 * Updates both Firestore and local state
	 */

	const handleSubmitComment = async () => {
		if (!user || !newComment.trim()) return;

		setLoading(true);
		try {
			const commentData = {
				articleId,
				userId: user.uid,
				text: newComment.trim(),
				createdAt: serverTimestamp(),
				likes: 0,
			};

			const docRef = await addDoc(
				collection(db, 'comments'),
				commentData
			);
			// Update local state with new comment
			setComments((prev) => [
				...prev,
				{
					id: docRef.id,
					...commentData,
					createdAt: new Date(),
				},
			]);

			setNewComment('');
		} catch (error) {
			console.error('Error adding comment:', error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box mt={6}>
			<Text fontSize="xl" fontWeight="bold" mb={4}>
				Comments
			</Text>
			{/* Comment Input Section */}
			{user ? (
				<Box mb={6}>
					<Textarea
						value={newComment}
						onChange={(e) => setNewComment(e.target.value)}
						placeholder="Add a comment..."
						resize="vertical"
						mb={2}
					/>
					<Button
						onClick={handleSubmitComment}
						isLoading={loading}
						isDisabled={!newComment.trim()}
						colorScheme="blue">
						Post Comment
					</Button>
				</Box>
			) : (
				<Text mb={4}>Please sign in to comment</Text>
			)}

			{/* Comments Display Section */}
			<VStack spacing={4} align="stretch">
				{comments.map((comment) => (
					<Box
						key={comment.id}
						p={4}
						borderWidth={1}
						borderRadius="md"
						bg="white">
						<HStack spacing={3} mb={2}>
							<Avatar size="sm" />
							<Text fontWeight="bold">User</Text>
							<Text fontSize="sm" color="gray.500">
								{new Date(comment.createdAt).toLocaleDateString()}
							</Text>
						</HStack>
						<Text>{comment.text}</Text>
					</Box>
				))}
			</VStack>
		</Box>
	);
};

export default ArticleComments;
