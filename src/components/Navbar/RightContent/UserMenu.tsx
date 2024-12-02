/**
 * UserMenu Component
 * Dropdown menu for authenticated users
 */
import { authModalState } from '@/atoms/authModalAtom';
import { auth } from '@/firebase/clientApp';
import { ChevronDownIcon } from '@chakra-ui/icons';
import {
	Button,
	Flex,
	Icon,
	Menu,
	MenuButton,
	MenuDivider,
	MenuItem,
	MenuList,
	Text,
	Box,
} from '@chakra-ui/react';
import { User, signOut } from 'firebase/auth';
import React from 'react';
import { CgProfile } from 'react-icons/cg';
import { FaRegSmile } from 'react-icons/fa';
import { MdOutlineLogin } from 'react-icons/md';
import { VscAccount } from 'react-icons/vsc';
import { HiUserGroup } from 'react-icons/hi'; // Added for communities icon
import { useRouter } from 'next/router';
import { useResetRecoilState, useSetRecoilState } from 'recoil';

type UserMenuProps = {
	user?: User | null;
};

const UserMenu: React.FC<UserMenuProps> = ({ user }) => {
	const setAuthModalState = useSetRecoilState(authModalState);
	const router = useRouter();

	const logout = async () => {
		await signOut(auth);
	};

	return (
		<Box>
			{user ? (
				<Menu>
					<MenuButton
						cursor="pointer"
						padding="0px 6px"
						borderRadius={4}
						_hover={{
							outline: '1px solid',
							outlineColor: 'gray.200',
						}}>
						<Flex align="center">
							<Icon
								fontSize={24}
								mr={1}
								color="gray.300"
								as={FaRegSmile}
							/>
							<Flex
								direction="column"
								display={{ base: 'none', lg: 'flex' }}
								fontSize="8pt"
								align="flex-start"
								mr={8}>
								<Text fontWeight={700}>
									{user?.displayName || user.email?.split('@')[0]}
								</Text>
							</Flex>
							<ChevronDownIcon />
						</Flex>
					</MenuButton>
					<MenuList>
						<MenuItem
							fontSize="10pt"
							fontWeight={700}
							_hover={{ bg: 'blue.500', color: 'white' }}>
							<Flex align="center">
								<Icon fontSize={20} mr={2} as={CgProfile} />
								Profile
							</Flex>
						</MenuItem>
						<MenuItem
							fontSize="10pt"
							fontWeight={700}
							_hover={{ bg: 'blue.500', color: 'white' }}
							onClick={() => router.push('/communities')}>
							<Flex align="center">
								<Icon fontSize={20} mr={2} as={HiUserGroup} />
								View all Communities
							</Flex>
						</MenuItem>
						<MenuDivider />
						<MenuItem
							fontSize="10pt"
							fontWeight={700}
							_hover={{ bg: 'blue.500', color: 'white' }}
							onClick={logout}>
							<Flex align="center">
								<Icon fontSize={20} mr={2} as={MdOutlineLogin} />
								Logout
							</Flex>
						</MenuItem>
					</MenuList>
				</Menu>
			) : (
				<Menu>
					<MenuButton
						as={Button}
						rightIcon={<ChevronDownIcon />}
						leftIcon={<Icon as={VscAccount} fontSize={20} />}
						variant="outline"
						size="sm"
						height="34px"
						px={2}
						_hover={{ bg: 'gray.50' }}>
						<Text display={{ base: 'none', md: 'inline' }}>
							Login / Sign Up
						</Text>
					</MenuButton>
					<MenuList>
						<MenuItem
							fontSize="10pt"
							fontWeight={700}
							_hover={{ bg: 'blue.500', color: 'white' }}
							onClick={() =>
								setAuthModalState({ open: true, view: 'login' })
							}>
							<Flex align="center">
								<Icon fontSize={20} mr={2} as={MdOutlineLogin} />
								Log In
							</Flex>
						</MenuItem>
						<MenuItem
							fontSize="10pt"
							fontWeight={700}
							_hover={{ bg: 'blue.500', color: 'white' }}
							onClick={() => router.push('/communities')}>
							<Flex align="center">
								<Icon fontSize={20} mr={2} as={HiUserGroup} />
								View all Communities
							</Flex>
						</MenuItem>
						<MenuDivider />
						<MenuItem
							fontSize="10pt"
							fontWeight={700}
							_hover={{ bg: 'blue.500', color: 'white' }}
							onClick={() =>
								setAuthModalState({ open: true, view: 'signup' })
							}>
							<Flex align="center">
								<Icon fontSize={20} mr={2} as={CgProfile} />
								Sign Up
							</Flex>
						</MenuItem>
					</MenuList>
				</Menu>
			)}
		</Box>
	);
};

export default UserMenu;
