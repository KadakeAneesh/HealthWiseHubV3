/**
 * SearchInput Component
 * Provides the search interface for medical articles
 * Implements debounced search functionality and input validation
 * Integrates with the search results component for unified search experience
 */
import { useState } from 'react';
import {
	InputGroup,
	Input,
	InputRightElement,
	IconButton,
} from '@chakra-ui/react';
import { Search } from 'lucide-react';

interface SearchInputProps {
	onSearch: (query: string) => void;
}

export const SearchInput = ({ onSearch }: SearchInputProps) => {
	const [query, setQuery] = useState('');
	/**
	 * Handles form submission for search
	 * Prevents default form behavior and validates input
	 */
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (query.trim()) {
			onSearch(query.trim());
		}
	};

	return (
		<form onSubmit={handleSubmit} style={{ width: '100%' }}>
			<InputGroup size="lg">
				<Input
					placeholder="Search medical articles..."
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					bg="white"
					borderRadius="full"
				/>
				<InputRightElement>
					<IconButton
						aria-label="Search"
						icon={<Search />}
						type="submit"
						variant="ghost"
						borderRadius="full"
					/>
				</InputRightElement>
			</InputGroup>
		</form>
	);
};
