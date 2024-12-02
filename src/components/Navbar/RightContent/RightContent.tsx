/**
 * RightContent Component
 * User-related navigation controls
 * Handles authentication menu and user actions
 */
import { Button, Flex } from '@chakra-ui/react';
import React from 'react';
import AuthButtons from './AuthButtons';
import Authmodal from '../../Modal/Auth/Authmodal';
import { User, signOut } from 'firebase/auth';
import { auth } from '@/firebase/clientApp';
import Icons from './Icons';
import UserMenu from './UserMenu';

type RightContentProps = {
	user?: User | null;
};

const RightContent: React.FC<RightContentProps> = ({ user }) => {
	return (
		<>
			<Authmodal />
			<Flex justify="center" align="center">
				{/*user ? <Icons /> : <AuthButtons />*/}
				<UserMenu user={user} />
			</Flex>
		</>
	);
};
export default RightContent;
