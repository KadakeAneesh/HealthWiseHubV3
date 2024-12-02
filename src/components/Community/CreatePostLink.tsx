import { Flex, Icon, Input } from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { BsLink45Deg } from 'react-icons/bs';
import { FaHeartbeat, FaReddit } from 'react-icons/fa';
import { IoImageOutline } from 'react-icons/io5';
import useDirectory from '../../hooks/useDirectory';
import { auth } from '@/firebase/clientApp';
import { authModalState } from '@/atoms/authModalAtom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useSetRecoilState } from 'recoil';
import { useBreakpointValue } from '@chakra-ui/react';

type CreatePostProps = {};

const CreatePostLink: React.FC<CreatePostProps> = () => {
	const router = useRouter();
	const { toggleMenuOpen } = useDirectory();
	const [user] = useAuthState(auth);
	const setAuthModalState = useSetRecoilState(authModalState);
	const isMobile = useBreakpointValue({ base: true, md: false });

	const onClick = () => {
		if (!user) {
			setAuthModalState({ open: true, view: 'login' });
			return;
		}

		const { community } = router.query;
		if (community) {
			router.push(`/h/${community}/submit`);
			return;
		}
		toggleMenuOpen();
	};

	return (
		<Flex
			justify="space-evenly"
			align="center"
			bg="white"
			height={isMobile ? '45px' : '56px'}
			borderRadius={4}
			border="1px solid"
			borderColor="gray.300"
			p={2}
			mb={4}
			onClick={onClick}
			cursor="pointer">
			<Icon
				as={FaHeartbeat}
				fontSize={isMobile ? 24 : 36}
				color="gray.300"
				mr={4}
			/>
			<Input
				placeholder="Create Post"
				fontSize="10pt"
				_placeholder={{ color: 'gray.500' }}
				_hover={{
					bg: 'white',
					border: '1px solid',
					borderColor: 'blue.500',
				}}
				_focus={{
					outline: 'none',
					bg: 'white',
					border: '1px solid',
					borderColor: 'blue.500',
				}}
				bg="gray.50"
				borderColor="gray.200"
				height="36px"
				borderRadius={4}
				mr={4}
				pointerEvents="none" // Make input non-interactive since whole container is clickable
			/>
			{!isMobile && (
				<>
					<Icon
						as={IoImageOutline}
						fontSize={24}
						mr={4}
						color="gray.400"
						cursor="pointer"
					/>
					<Icon
						as={BsLink45Deg}
						fontSize={24}
						color="gray.400"
						cursor="pointer"
					/>
				</>
			)}
		</Flex>
	);
};
export default CreatePostLink;
