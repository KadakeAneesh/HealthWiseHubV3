// components/Medical/ArticleDetail.tsx
import { useEffect, useState } from 'react';
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
	Flex,
} from '@chakra-ui/react';
import {
	ExternalLink,
	Calendar,
	User,
	ChevronLeft,
	Share2,
} from 'lucide-react';
import { Article } from '@/types/article';
import ArticleInteractions from './ArticleInteractions';
import ArticleComments from './ArticleComments';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/firebase/clientApp';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { useSetRecoilState } from 'recoil';
import { authModalState } from '@/atoms/authModalAtom';
import useDirectory from '@/hooks/useDirectory';
import { FaShare } from 'react-icons/fa';
import { FaExternalLinkAlt } from 'react-icons/fa';

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
	const router = useRouter();
	const setAuthModalState = useSetRecoilState(authModalState);
	const { toggleMenuOpen } = useDirectory();

	const handleShare = () => {
		if (!user) {
			setAuthModalState({ open: true, view: 'login' });
			return;
		}

		const postData = {
			title: article.title,
			body: `${article.summary || article.content}\n\nKeywords: ${
				article.keywords ? article.keywords.join(', ') : ''
			}\n\nOriginal Article: ${article.url}`,
			articleUrl: article.url,
			isSharedArticle: true,
			source: article.source,
			publishDate: article.publishDate,
		};

		sessionStorage.setItem(
			'sharedArticleData',
			JSON.stringify(postData)
		);

		const { communityId } = router.query;
		if (communityId) {
			router.push(`/h/${communityId}/submit`);
		} else {
			toggleMenuOpen();
			toast({
				title: 'Select a community',
				description: 'Choose where you want to share this article',
				status: 'info',
				duration: 3000,
			});
		}
	};

	const ActionButtons = () => (
		<HStack spacing={4} width="100%">
			<Button
				leftIcon={<FaShare />}
				colorScheme="blue"
				onClick={handleShare}
				isLoading={loading}>
				Share to Community
			</Button>
			{articleData?.url && (
				<Button
					as="a"
					href={articleData.url}
					target="_blank"
					leftIcon={<FaExternalLinkAlt />}
					variant="outline">
					View Original
				</Button>
			)}
		</HStack>
	);

	useEffect(() => {
		const fetchArticleData = async () => {
			try {
				const articleDoc = await getDoc(
					doc(db, 'articles', article.id)
				);
				if (articleDoc.exists()) {
					setArticleData({
						...article,
						...articleDoc.data(),
					} as Article);
				} else {
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

	const AbstractSection = () => (
		<Box bg="gray.50" p={6} borderRadius="md">
			<Heading as="h2" size="md" mb={4}>
				Abstract
			</Heading>
			{loading ? (
				<Skeleton height="100px" />
			) : articleData?.content || articleData?.summary ? (
				<Text>{articleData.content || articleData.summary}</Text>
			) : (
				<Text color="gray.500">Abstract not available</Text>
			)}
		</Box>
	);

	return (
		<Container maxW="container.lg" py={8}>
			<Flex mb={4}>
				<Button
					leftIcon={<ChevronLeft />}
					onClick={() => router.back()}
					variant="ghost">
					Back to Search
				</Button>
			</Flex>

			<VStack
				spacing={6}
				align="stretch"
				bg="white"
				p={6}
				borderRadius="md"
				shadow="sm">
				<Tag size="md" colorScheme="purple" alignSelf="flex-start">
					{articleData.source?.toUpperCase()}
				</Tag>

				<Heading size="xl">{articleData.title}</Heading>

				<HStack spacing={4} wrap="wrap">
					<HStack>
						<Calendar size={16} />
						<Text>
							{new Date(articleData.publishDate).toLocaleDateString()}
						</Text>
					</HStack>
				</HStack>

				<HStack spacing={4}>
					<Button
						leftIcon={<Share2 />}
						colorScheme="blue"
						onClick={handleShare}>
						Share to Community
					</Button>
					<Button
						as="a"
						href={articleData.url}
						target="_blank"
						leftIcon={<ExternalLink />}
						variant="outline">
						View Original
					</Button>
				</HStack>

				<Box bg="gray.50" p={6} borderRadius="md">
					<Heading as="h2" size="md" mb={4}>
						Abstract
					</Heading>
					<Text>{articleData.summary || articleData.content}</Text>
				</Box>
				<AbstractSection />

				{articleData.keywords?.length > 0 && (
					<Box>
						<Heading as="h3" size="sm" mb={2}>
							Keywords
						</Heading>
						<HStack spacing={2} wrap="wrap">
							{articleData.keywords.map((keyword, index) => (
								<Tag key={index} colorScheme="blue" variant="subtle">
									{keyword}
								</Tag>
							))}
						</HStack>
					</Box>
				)}

				<ArticleInteractions
					articleId={articleData.id}
					interactions={articleData.interactions}
				/>

				<ArticleComments
					articleId={articleData.id}
					comments={articleData.comments || []}
				/>
			</VStack>
		</Container>
	);
};

export default ArticleDetail;
