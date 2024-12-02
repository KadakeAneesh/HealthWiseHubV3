import React, { useState } from 'react';
import {
	Box,
	Button,
	FormControl,
	FormLabel,
	Input,
	Select,
	Textarea,
	VStack,
	useToast,
} from '@chakra-ui/react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/firebase/clientApp';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/firebase/clientApp';

const CommunityRequestForm = () => {
	const [user] = useAuthState(auth);
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [type, setType] = useState('public');
	const [isLoading, setIsLoading] = useState(false);
	const toast = useToast();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user) {
			toast({
				title: 'Error',
				description: 'You must be logged in to request a community',
				status: 'error',
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		setIsLoading(true);

		try {
			// Add request to 'communityRequests' collection
			await addDoc(collection(db, 'communityRequests'), {
				name,
				description,
				type,
				userId: user.uid,
				userEmail: user.email,
				status: 'pending',
				createdAt: new Date().toISOString(),
			});

			toast({
				title: 'Request submitted',
				description:
					'Your community creation request has been submitted for review.',
				status: 'success',
				duration: 5000,
				isClosable: true,
			});

			// Reset form
			setName('');
			setDescription('');
			setType('public');
		} catch (error) {
			toast({
				title: 'Error',
				description:
					'Failed to submit your request. Please try again.',
				status: 'error',
				duration: 5000,
				isClosable: true,
			});
		}
		setIsLoading(false);
	};

	return (
		<Box maxWidth="500px" margin="auto" mt={8}>
			<form onSubmit={handleSubmit}>
				<VStack spacing={4}>
					<FormControl isRequired>
						<FormLabel>Community Name</FormLabel>
						<Input
							value={name}
							onChange={(e) => setName(e.target.value)}
							background={'white'}
						/>
					</FormControl>
					<FormControl isRequired>
						<FormLabel>Description</FormLabel>
						<Textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							background={'white'}
						/>
					</FormControl>
					<FormControl isRequired>
						<FormLabel>Type</FormLabel>
						<Select
							value={type}
							background={'white'}
							onChange={(e) => setType(e.target.value)}>
							<option value="public">Public</option>
							<option value="private">Private</option>
							<option value="restricted">Restricted</option>
						</Select>
					</FormControl>
					<Button
						type="submit"
						colorScheme="blue"
						isLoading={isLoading}
						isDisabled={!user}>
						Submit Request
					</Button>
				</VStack>
			</form>
		</Box>
	);
};

export default CommunityRequestForm;
