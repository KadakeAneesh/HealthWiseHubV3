/**
 * Navbar Component
 * Main navigation bar with search, user menu, and community access
 * Handles authentication state and navigation actions
 */

import { Flex, Image, Input, IconButton } from '@chakra-ui/react';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import RightContent from './RightContent/RightContent';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/firebase/clientApp';
import Directory from './Directory/Directory';
import useDirectory from '@/hooks/useDirectory';
import { defaultMenuItem } from '@/atoms/directoryMenuAtom';
import { SearchIcon } from '@chakra-ui/icons';

const Navbar: React.FC = () => {
	const [user] = useAuthState(auth);
	const { onSelectMenuItem } = useDirectory();
	const [searchQuery, setSearchQuery] = useState('');
	const router = useRouter();

	const handleSearch = (event: React.FormEvent) => {
		event.preventDefault();
		if (searchQuery.trim()) {
			router.push(
				`/search?query=${encodeURIComponent(searchQuery.trim())}`
			);
		}
	};

	return (
		<Flex
			bg="white"
			height="44px"
			padding="6px 12px"
			justify={{ md: 'space-between' }}
			align="center">
			<Flex
				align="center"
				width={{ base: '40px', md: 'auto' }}
				mr={{ base: 0, md: 2 }}
				cursor="pointer"
				onClick={() => onSelectMenuItem(defaultMenuItem)}>
				<Image src="/images/logo1.png" height="30px" alt="logo" />
				<Image
					src="/images/logo2.png"
					height="25px"
					alt="HealthWise Hub"
					display={{ base: 'none', md: 'unset' }}
				/>
			</Flex>

			{user && <Directory />}

			<Flex
				as="form"
				onSubmit={handleSearch}
				flex={1}
				mx={2}
				maxWidth="600px">
				<Input
					placeholder="Search health articles..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					mr={2}
				/>
				<IconButton
					aria-label="Search"
					icon={<SearchIcon />}
					type="submit"
				/>
			</Flex>

			<RightContent user={user} />
		</Flex>
	);
};

export default Navbar;
