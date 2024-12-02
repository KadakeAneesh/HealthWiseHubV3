import { Box, Heading, Text, Button, VStack } from '@chakra-ui/react';
import { useRouter } from 'next/router';

const Offline = () => {
	const router = useRouter();

	return (
		<Box
			display="flex"
			justifyContent="center"
			alignItems="center"
			minHeight="100vh"
			p={4}>
			<VStack spacing={6} textAlign="center">
				<Heading>You're Offline</Heading>
				<Text>
					Sorry, it seems you've lost your internet connection. Some
					features may be unavailable until you're back online.
				</Text>
				<Button colorScheme="blue" onClick={() => router.reload()}>
					Try Again
				</Button>
				<Text fontSize="sm" color="gray.500">
					Don't worry - any saved articles and cached content are
					still available.
				</Text>
			</VStack>
		</Box>
	);
};

export default Offline;
