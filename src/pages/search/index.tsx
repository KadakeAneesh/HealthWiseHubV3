// src/pages/search/index.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
	Container,
	VStack,
	Heading,
	InputGroup,
	InputRightElement,
	IconButton,
	Box,
	useColorModeValue,
	Text,
	useToast,
} from '@chakra-ui/react';
import { Search } from 'lucide-react';
import SearchResults from '@/components/medical/SearchResults';
import PageContent from '@/components/Layout/PageContent';
import { medicalApi } from '@/services/MedicalApiService';
import { ProcessedArticle } from '@/types/medical';

export default function SearchPage() {
	const router = useRouter();
	const toast = useToast();
	const [searchResults, setSearchResults] = useState<
		ProcessedArticle[]
	>([]);
	const [isLoading, setIsLoading] = useState(false);
	const bgColor = useColorModeValue('white', 'gray.800');

	useEffect(() => {
		const { query } = router.query;

		if (router.isReady && query) {
			const performSearch = async (searchQuery: string) => {
				setIsLoading(true);
				try {
					const response = await medicalApi.searchArticles({
						query: searchQuery.trim(),
						page: 1,
						pageSize: 20,
					});
					setSearchResults(response.articles);
				} catch (error) {
					toast({
						title: 'Search failed',
						description: 'Please try again',
						status: 'error',
						duration: 3000,
						isClosable: true,
					});
				} finally {
					setIsLoading(false);
				}
			};

			performSearch(query as string);
		}
	}, [router.isReady, router.query, toast]);

	return (
		<PageContent>
			<>
				<Container maxW="container.lg" py={8}>
					<VStack spacing={8} align="stretch">
						{router.query.query && (
							<Box>
								<Text mb={4} color="gray.600">
									Search results for: {router.query.query}
								</Text>
								<SearchResults
									query={router.query.query as string}
									isLoading={isLoading}
									results={searchResults}
								/>
							</Box>
						)}
					</VStack>
				</Container>
			</>
			<>
				<Box width="100%">
					{/* Right sidebar content can go here */}
				</Box>
			</>
		</PageContent>
	);
}
