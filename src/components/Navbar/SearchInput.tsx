// src/components/Navbar/SearchInput.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import {
	InputGroup,
	Input,
	InputRightElement,
	IconButton,
	useToast,
	Flex,
} from '@chakra-ui/react';
import { Search, SearchIcon } from 'lucide-react';

const SearchInput: React.FC = () => {
	const [searchQuery, setSearchQuery] = useState('');
	const router = useRouter();
	const toast = useToast();

	const handleSearch = (event: React.FormEvent) => {
		event.preventDefault();
		const trimmedQuery = searchQuery.trim();

		if (!trimmedQuery) {
			toast({
				title: 'Please enter a search term',
				status: 'info',
				duration: 2000,
				isClosable: true,
			});
			return;
		}
		if (searchQuery.trim()) {
			// Navigate to search page with query parameter
			router.push({
				pathname: '/search',
				query: { q: searchQuery },
			});
		}
	};
	// Navigate to search page with query
	// 	router.push({
	// 		pathname: '/search',
	// 		query: { q: trimmedQuery },
	// 	});
	// };

	return (
		// <form onSubmit={handleSearch} style={{ width: '100%' }}>
		// 	<InputGroup>
		// 		<Input
		// 			placeholder="Search health articles..."
		// 			value={searchQuery}
		// 			onChange={(e) => setSearchQuery(e.target.value)}
		// 			fontSize="10pt"
		// 			_placeholder={{ color: 'gray.500' }}
		// 			_hover={{
		// 				bg: 'white',
		// 				border: '1px solid',
		// 				borderColor: 'blue.500',
		// 			}}
		// 			_focus={{
		// 				outline: 'none',
		// 				border: '1px solid',
		// 				borderColor: 'blue.500',
		// 			}}
		// 			height="34px"
		// 			bg="gray.50"
		// 		/>
		// 		<InputRightElement>
		// 			<IconButton
		// 				aria-label="Search"
		// 				icon={<Search size={18} />}
		// 				onClick={handleSearch}
		// 				type="submit"
		// 				variant="ghost"
		// 				size="sm"
		// 			/>
		// 		</InputRightElement>
		// 	</InputGroup>
		// </form>
		<Flex flex={1} maxWidth="600px">
			<form onSubmit={handleSearch} style={{ width: '100%' }}>
				<InputGroup>
					<Input
						placeholder="Search health articles..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
					<InputRightElement>
						<IconButton
							aria-label="Search"
							icon={<SearchIcon />}
							type="submit"
							variant="ghost"
						/>
					</InputRightElement>
				</InputGroup>
			</form>
		</Flex>
	);
};

export default SearchInput;
