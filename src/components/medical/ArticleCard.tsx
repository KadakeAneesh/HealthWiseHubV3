/**
 * ArticleCard Component
 * Displays a summary card for an individual medical article
 * Handles article preview and navigation to detailed view
 */
import { useRouter } from 'next/router';
import {
	Box,
	Badge,
	Heading,
	Text,
	HStack,
	VStack,
	Icon,
	useColorModeValue,
} from '@chakra-ui/react';
import { Calendar, User } from 'lucide-react';
import { ProcessedArticle } from '@/types/medical';

export const ArticleCard = ({
	article,
}: {
	article: ProcessedArticle;
}) => {
	const router = useRouter();
	const bgColor = useColorModeValue('white', 'gray.800');
	const borderColor = useColorModeValue('gray.200', 'gray.700');

	const handleClick = () => {
		// Store article data in router state and localStorage
		localStorage.setItem(
			`article_${article.id}`,
			JSON.stringify(article)
		);
		router.push({
			pathname: `/article/${article.id}`,
			query: {
				articleData: encodeURIComponent(JSON.stringify(article)),
			},
		});
	};

	return (
		<Box
			as="article"
			p={6}
			bg={bgColor}
			borderWidth="1px"
			borderColor={borderColor}
			borderRadius="lg"
			cursor="pointer"
			transition="all 0.2s"
			_hover={{
				shadow: 'lg',
				transform: 'translateY(-2px)',
				borderColor: 'blue.400',
			}}
			onClick={handleClick}>
			<VStack align="stretch" spacing={4}>
				<Badge
					alignSelf="flex-start"
					colorScheme={
						article.source === 'pubmed' ? 'purple' : 'green'
					}>
					{article.source.toUpperCase()}
				</Badge>

				<Heading size="md">{article.title}</Heading>

				<HStack spacing={4} color="gray.600">
					<HStack>
						<Icon as={Calendar} />
						<Text>
							{new Date(article.publishDate).toLocaleDateString()}
						</Text>
					</HStack>
					{article.authors && article.authors.length > 0 && (
						<HStack>
							<Icon as={User} />
							<Text>
								By{' '}
								{article.authors
									.map((a) => `${a.firstName} ${a.lastName}`)
									.join(', ')}
							</Text>
						</HStack>
					)}
				</HStack>

				<Text noOfLines={3} color="gray.600">
					{article.summary}
				</Text>
			</VStack>
		</Box>
	);
};
