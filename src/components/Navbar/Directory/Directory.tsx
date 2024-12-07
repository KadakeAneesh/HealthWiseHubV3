/**
 * Directory Component
 * Community navigation dropdown menu
 * Shows user's communities and navigation options
 */
import { ChevronDownIcon } from '@chakra-ui/icons';
import {
	Box,
	Flex,
	Icon,
	Image,
	Menu,
	MenuButton,
	MenuList,
	Text,
} from '@chakra-ui/react';
import React from 'react';
import { TiHome } from 'react-icons/ti';
import Communities from './Communities';
import useDirectory from '@/hooks/useDirectory';
import { useEffect, useRef } from 'react';

const Directory: React.FC = () => {
	const { directoryState, toggleMenuOpen } = useDirectory();
	const wrapperRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				wrapperRef.current &&
				!wrapperRef.current.contains(event.target as Node) &&
				directoryState.isOpen
			) {
				toggleMenuOpen();
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () =>
			document.removeEventListener('mousedown', handleClickOutside);
	}, [directoryState.isOpen, toggleMenuOpen]);

	return (
		<Box ref={wrapperRef}>
			<Menu isOpen={directoryState.isOpen}>
				<MenuButton
					cursor="pointer"
					padding="0px 6px"
					borderRadius={4}
					mr={2}
					ml={{ base: 0, md: 2 }}
					_hover={{ outline: '1px solid', outlineColor: 'gray.200' }}
					onClick={toggleMenuOpen}>
					<Flex
						align="center"
						justify="space-between"
						width={{ base: 'auto', lg: '200px' }}>
						<Flex align="center">
							{directoryState.selectedMenuItem.imageURL ? (
								<Image
									src={directoryState.selectedMenuItem.imageURL}
									borderRadius="full"
									boxSize="24px"
									mr={2}
									alt="community image"
								/>
							) : (
								<Icon
									as={directoryState.selectedMenuItem.icon}
									fontSize={24}
									mr={{ base: 1, md: 2 }}
									color={directoryState.selectedMenuItem.iconColor}
								/>
							)}
							<Flex display={{ base: 'none', lg: 'flex' }}>
								<Text fontWeight={600} fontSize="10pt">
									{directoryState.selectedMenuItem.displayText}
								</Text>
							</Flex>
						</Flex>
						<ChevronDownIcon />
					</Flex>
				</MenuButton>
				<MenuList>
					<Communities />
				</MenuList>
			</Menu>
		</Box>
	);
};
export default Directory;
