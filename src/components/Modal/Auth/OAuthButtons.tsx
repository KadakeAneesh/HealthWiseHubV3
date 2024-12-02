/**
 * OAuthButtons Component
 * Provides social authentication options (currently Google)
 * Can be expanded to include other OAuth providers
 */
import { auth } from '@/firebase/clientApp';
import { Button, Flex, Image } from '@chakra-ui/react';
import React from 'react';
import { useSignInWithGoogle } from 'react-firebase-hooks/auth';

const OAuthButtons: React.FC = () => {
	const [signInWithGoogle, user, loading, error] =
		useSignInWithGoogle(auth);

	return (
		<Flex direction="column" width="100%" mb={4}>
			<Button
				variant="oauth"
				mb={2}
				isLoading={loading}
				onClick={() => signInWithGoogle()}>
				<Image
					src="/images/googlelogo.png"
					height="20px"
					alt="google login"
					mr={4}></Image>
				Continue With Google
			</Button>
		</Flex>
	);
};
export default OAuthButtons;
