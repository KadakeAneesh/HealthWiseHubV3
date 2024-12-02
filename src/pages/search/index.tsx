// src/pages/search/index.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
	Container,
	VStack,
	Heading,
	Input,
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
	const [searchQuery, setSearchQuery] = useState('');
	const [searchResults, setSearchResults] = useState<
		ProcessedArticle[]
	>([]);
	const [isLoading, setIsLoading] = useState(false);
	const bgColor = useColorModeValue('white', 'gray.800');

	const performSearch = async (query: string) => {
		if (!query.trim()) return;

		setIsLoading(true);
		try {
			const response = await medicalApi.searchArticles({
				query: query.trim(),
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

	useEffect(() => {
		if (router.isReady && router.query.q) {
			const queryString = router.query.q as string;
			setSearchQuery(queryString);
			performSearch(queryString);
		}
	}, [router.isReady, router.query.q]);

	const handleSearch = (event: React.FormEvent) => {
		event.preventDefault();
		if (!searchQuery.trim()) {
			toast({
				title: 'Please enter a search term',
				status: 'info',
				duration: 2000,
				isClosable: true,
			});
			return;
		}

		router.push(
			{
				pathname: '/search',
				query: { q: searchQuery.trim() },
			},
			undefined,
			{ shallow: true }
		);
	};

	return (
		<PageContent>
			<>
				<Container maxW="container.lg" py={8}>
					<VStack spacing={8} align="stretch">
						<Box>
							<Heading mb={4}>Health Articles Search</Heading>
							<form onSubmit={handleSearch}>
								<InputGroup size="lg">
									<Input
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										placeholder="Search medical articles..."
										bg={bgColor}
										borderRadius="full"
									/>
									<InputRightElement>
										<IconButton
											aria-label="Search"
											icon={<Search />}
											type="submit"
											variant="ghost"
											borderRadius="full"
											isLoading={isLoading}
										/>
									</InputRightElement>
								</InputGroup>
							</form>
						</Box>

						{router.query.q && (
							<Box>
								<Text mb={4} color="gray.600">
									Search results for: {router.query.q}
								</Text>
								<SearchResults
									query={router.query.q as string}
									//results={searchResults}
									//isLoading={isLoading}
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
