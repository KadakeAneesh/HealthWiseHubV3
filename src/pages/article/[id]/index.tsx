// src/pages/article/[id]/index.tsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import {
	Container,
	VStack,
	Heading,
	Text,
	Badge,
	Button,
	Box,
	HStack,
	Divider,
	useColorModeValue,
	Icon,
	Spinner,
	useToast,
} from '@chakra-ui/react';
import {
	Calendar,
	User,
	ExternalLink,
	ArrowLeft,
} from 'lucide-react';
import { ProcessedArticle } from '@/types/medical';
import { medicalApi } from '@/services/MedicalApiService';

export default function ArticleDetailPage() {
	const router = useRouter();
	const { id } = router.query;
	const [article, setArticle] = useState<ProcessedArticle | null>(
		null
	);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const toast = useToast();

	const bgColor = useColorModeValue('white', 'gray.800');
	const borderColor = useColorModeValue('gray.200', 'gray.700');
	const metadataBg = useColorModeValue('gray.50', 'gray.900');

	useEffect(() => {
		async function loadArticle() {
			if (!router.isReady || !id) return;

			setIsLoading(true);
			setError(null);

			try {
				const articleData = router.query.articleData;
				if (articleData) {
					const parsedArticle = JSON.parse(
						decodeURIComponent(articleData as string)
					) as ProcessedArticle;
					setArticle(parsedArticle);
					localStorage.setItem(
						`article_${id}`,
						JSON.stringify(parsedArticle)
					);
					setIsLoading(false);
					return;
				}

				const storedArticle = localStorage.getItem(`article_${id}`);
				if (storedArticle) {
					setArticle(JSON.parse(storedArticle) as ProcessedArticle);
					setIsLoading(false);
					return;
				}

				const fetchedArticle = await medicalApi.getArticleById(
					id as string
				);
				if (fetchedArticle) {
					setArticle(fetchedArticle);
					localStorage.setItem(
						`article_${id}`,
						JSON.stringify(fetchedArticle)
					);
				} else {
					setError('Article not found');
				}
			} catch (err) {
				console.error('Error loading article:', err);
				setError('Failed to load article');
				toast({
					title: 'Error loading article',
					description: 'Please try again later',
					status: 'error',
					duration: 5000,
					isClosable: true,
				});
			} finally {
				setIsLoading(false);
			}
		}

		loadArticle();
	}, [router.isReady, id, router.query, toast]);

	if (isLoading) {
		return (
			<Container centerContent py={20}>
				<Spinner size="xl" />
			</Container>
		);
	}

	if (error || !article) {
		return (
			<Container centerContent py={20}>
				<VStack spacing={4}>
					<Heading size="md" color="red.500">
						{error || 'Article not found'}
					</Heading>
					<Button
						leftIcon={<Icon as={ArrowLeft} />}
						onClick={() => router.push('/search')}>
						Return to Search
					</Button>
				</VStack>
			</Container>
		);
	}

	return (
		<Container maxW="container.lg" py={8}>
			<VStack
				spacing={6}
				align="stretch"
				bg={bgColor}
				p={8}
				borderWidth="1px"
				borderColor={borderColor}
				borderRadius="lg"
				shadow="md">
				<Button
					leftIcon={<Icon as={ArrowLeft} />}
					variant="ghost"
					alignSelf="flex-start"
					size="sm"
					onClick={() => router.back()}>
					Back to Search
				</Button>

				<HStack justify="space-between" align="center">
					<Badge
						colorScheme={
							article.source === 'pubmed' ? 'purple' : 'green'
						}
						px={3}
						py={1}
						fontSize="md"
						borderRadius="full">
						{article.source.toUpperCase()}
					</Badge>
					<HStack spacing={2} color="gray.600">
						<Icon as={Calendar} />
						<Text>
							{new Date(article.publishDate).toLocaleDateString()}
						</Text>
					</HStack>
				</HStack>

				<Heading size="xl" lineHeight="1.4">
					{article.title}
				</Heading>

				{article.authors && article.authors.length > 0 && (
					<VStack align="stretch" spacing={2}>
						<Text fontWeight="medium" color="gray.700">
							Authors
						</Text>
						<Text color="gray.600">
							{article.authors
								.map((a) => `${a.firstName} ${a.lastName}`)
								.join(', ')}
						</Text>
					</VStack>
				)}

				<Divider />

				<VStack align="stretch" spacing={4}>
					<Heading size="md" color="gray.700">
						Abstract
					</Heading>
					<Text fontSize="lg" lineHeight="tall" color="gray.700">
						{article.content || article.summary}
					</Text>
				</VStack>

				{(article.keywords.length > 0 ||
					article.categories.length > 0) && (
					<VStack align="stretch" spacing={3}>
						<Heading size="md" color="gray.700">
							Keywords
						</Heading>
						<HStack spacing={2} flexWrap="wrap">
							{[...article.keywords, ...article.categories].map(
								(keyword, index) => (
									<Badge
										key={index}
										colorScheme="blue"
										px={3}
										py={1}
										borderRadius="full"
										fontSize="sm">
										{keyword}
									</Badge>
								)
							)}
						</HStack>
					</VStack>
				)}

				<Divider />

				<HStack spacing={4}>
					<Button
						leftIcon={<Icon as={ExternalLink} />}
						colorScheme="blue"
						as="a"
						href={article.url}
						target="_blank">
						View Original Article
					</Button>
				</HStack>

				<Box mt={4} p={4} bg={metadataBg} borderRadius="md">
					<VStack align="stretch" spacing={2}>
						<Text color="gray.600" fontSize="sm">
							Source:{' '}
							{article.source === 'pubmed'
								? 'PubMed Journal Article'
								: 'MedlinePlus Health Information'}
						</Text>
						<Text color="gray.600" fontSize="sm">
							Published:{' '}
							{new Date(article.publishDate).toLocaleDateString()}
						</Text>
						{article.journal && (
							<Text color="gray.600" fontSize="sm">
								Journal: {article.journal}
							</Text>
						)}
					</VStack>
				</Box>
			</VStack>
		</Container>
	);
}
