/**
 * ArticleInteractions Component
 * Manages user interactions with articles including likes, bookmarks, and sharing
 * Handles authentication state and provides feedback for user actions
 */
import React from 'react';
import { Box, IconButton, Tooltip, Text } from '@chakra-ui/react';
import { Heart, Bookmark, Share2 } from 'lucide-react';
import { useArticleInteractions } from '../../hooks/useArticleInteractions';
import { useAuth } from '../../hooks/useAuth';
import { ArticleInteractions as ArticleInteractionsType } from '@/types/article';

interface ArticleInteractionsProps {
	articleId: string;
	likes?: number;
	saves?: number;
	interactions?: ArticleInteractionsType;
}

const ArticleInteractions: React.FC<ArticleInteractionsProps> = ({
	articleId,
	likes = 0,
	saves = 0,
}) => {
	const { user } = useAuth();
	const { loading, likeArticle, saveArticle, shareArticle } =
		useArticleInteractions(articleId);
	/**
	 * Generic handler for user interactions
	 * Manages authentication state and executes interaction functions
	 */

	const handleInteraction = async (action: () => Promise<void>) => {
		if (!user) {
			// Trigger auth modal
			return;
		}
		await action();
	};

	return (
		<Box display="flex" alignItems="center" gap={4}>
			{/* Like Button */}
			<Tooltip label={user ? 'Like' : 'Sign in to like'}>
				<Box>
					<IconButton
						aria-label="Like article"
						icon={<Heart />}
						onClick={() => handleInteraction(likeArticle)}
						isLoading={loading}
						variant="ghost"
					/>
					<Text fontSize="sm">{likes}</Text>
				</Box>
			</Tooltip>
			{/* Save Button */}
			<Tooltip label={user ? 'Save' : 'Sign in to save'}>
				<Box>
					<IconButton
						aria-label="Save article"
						icon={<Bookmark />}
						onClick={() => handleInteraction(saveArticle)}
						isLoading={loading}
						variant="ghost"
					/>
					<Text fontSize="sm">{saves}</Text>
				</Box>
			</Tooltip>
			{/* Share Button */}
			<Tooltip label="Share">
				<IconButton
					aria-label="Share article"
					icon={<Share2 />}
					onClick={() => handleInteraction(shareArticle)}
					variant="ghost"
				/>
			</Tooltip>
		</Box>
	);
};

export default ArticleInteractions;
