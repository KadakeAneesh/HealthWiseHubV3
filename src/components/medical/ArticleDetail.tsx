/**
 * ArticleDetail Component
 * Provides a comprehensive view of a medical article with full content and metadata
 * Integrates user interactions like comments and likes
 * Implements data persistence and loading states
 */
import React, { useEffect, useState } from 'react';
import {
	Box,
	Container,
	Heading,
	Text,
	VStack,
	HStack,
	Tag,
	Button,
	useToast,
	Skeleton,
} from '@chakra-ui/react';
import {
	ExternalLinkIcon,
	CalendarIcon,
	UserIcon,
} from 'lucide-react';
import { Article } from '@/types/article';
import ArticleInteractions from './ArticleInteractions';
import ArticleComments from './ArticleComments';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebase/clientApp';
import { doc, getDoc } from 'firebase/firestore';

interface ArticleDetailProps {
	article: Article;
}

const ArticleDetail: React.FC<ArticleDetailProps> = ({ article }) => {
	const { user } = useAuth();
	const toast = useToast();
	const [loading, setLoading] = useState(true);
	const [articleData, setArticleData] = useState<Article | null>(
		null
	);
	/**
	 * Fetches and merges article data from Firestore with provided data
	 * Handles persistence of article interactions and metadata
	 */
	useEffect(() => {
		const fetchArticleData = async () => {
			try {
				// Try to get article data from Firestore first
				const articleDoc = await getDoc(
					doc(db, 'articles', article.id)
				);

				if (articleDoc.exists()) {
					setArticleData({
						...article,
						...articleDoc.data(),
					} as Article);
				} else {
					// If not in Firestore, use the passed article data
					setArticleData(article);
				}
			} catch (error) {
				console.error('Error fetching article data:', error);
				setArticleData(article);
			} finally {
				setLoading(false);
			}
		};

		fetchArticleData();
	}, [article]);

	if (!articleData) {
		return <Skeleton height="600px" />;
	}

	return (
		<Container maxW="container.lg" py={8}>
			<VStack spacing={6} align="stretch">
				<Heading as="h1" size="xl">
					{articleData.title}
				</Heading>

				<HStack spacing={4} wrap="wrap">
					{articleData.publishDate && (
						<HStack>
							<CalendarIcon size={16} />
							<Text>
								{new Date(
									articleData.publishDate
								).toLocaleDateString()}
							</Text>
						</HStack>
					)}

					{articleData.source && (
						<Tag size="md" colorScheme="blue">
							{articleData.source}
						</Tag>
					)}
				</HStack>

				<ArticleInteractions
					articleId={articleData.id}
					interactions={articleData.interactions}
				/>

				{articleData.authors && articleData.authors.length > 0 && (
					<HStack spacing={2}>
						<UserIcon size={16} />
						<Text>{articleData.authors.join(', ')}</Text>
					</HStack>
				)}

				<Box bg="gray.50" p={6} borderRadius="md">
					<Heading as="h2" size="md" mb={4}>
						Abstract
					</Heading>
					<Text>{articleData.summary || articleData.content}</Text>
				</Box>

				{((articleData.keywords && articleData.keywords.length > 0) ||
					(articleData.categories &&
						articleData.categories.length > 0)) && (
					<Box>
						<Heading as="h3" size="sm" mb={2}>
							Topics & Keywords
						</Heading>
						<HStack spacing={2} wrap="wrap">
							{[
								...(articleData.keywords || []),
								...(articleData.categories || []),
							].map((tag, index) => (
								<Tag key={index} colorScheme="blue" variant="subtle">
									{tag}
								</Tag>
							))}
						</HStack>
					</Box>
				)}

				{articleData.url && (
					<Button
						rightIcon={<ExternalLinkIcon />}
						as="a"
						href={articleData.url}
						target="_blank"
						rel="noopener noreferrer">
						View Original Article
					</Button>
				)}

				<ArticleComments
					articleId={articleData.id}
					comments={articleData.comments || []}
				/>
			</VStack>
		</Container>
	);
};

export default ArticleDetail;
