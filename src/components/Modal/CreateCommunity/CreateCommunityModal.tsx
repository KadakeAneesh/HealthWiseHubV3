/**
 * CreateCommunityModal Component
 * Handles community creation with admin-only access
 * Manages validation, submissions, and database interactions
 */
import { auth, db } from '@/firebase/clientApp';
import useDirectory from '@/hooks/useDirectory';
import {
	Button,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalCloseButton,
	ModalBody,
	ModalFooter,
	Box,
	Divider,
	Text,
	Input,
	Stack,
	Checkbox,
	Flex,
	Icon,
} from '@chakra-ui/react';
import { Transaction } from '@google-cloud/firestore';
import {
	doc,
	getDoc,
	runTransaction,
	serverTimestamp,
	setDoc,
} from 'firebase/firestore';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { BsFillEyeFill, BsFillPersonFill } from 'react-icons/bs';
import { HiLockClosed } from 'react-icons/hi';

const ADMIN_EMAIL = 'aneeshkadake@gmail.com';

type CreateCommunityModalProps = {
	open: boolean;
	handleClose: () => void;
	userId: string;
};

const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({
	open,
	handleClose,
}) => {
	const [user] = useAuthState(auth);
	const [communityName, setCommunityName] = useState('');
	const [charsRemaining, setCharsRemaining] = useState(21);
	const [communityType, setCommunityType] = useState('public');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	const { toggleMenuOpen } = useDirectory();

	const isAdmin = user?.email === ADMIN_EMAIL;

	const handleChange = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		if (event.target.value.length > 21) return;
		//recalculate how many chars we have left in the community name
		setCommunityName(event.target.value);
		setCharsRemaining(21 - event.target.value.length);
	};

	const onCommunityTypeChange = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		setCommunityType(event.target.name);
	};

	const handleCreateCommunity = async () => {
		if (error) setError('');
		// validate Community Name
		const format = /[ `!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?~]/;

		if (format.test(communityName) || communityName.length < 3) {
			setError(
				'Community names must be between 3-21 characters, and can only contain letters, numbers, or underscores'
			);
			return;
		}

		setLoading(true);

		try {
			//Create community doc in firestore
			//Check that name is not taken
			//If valid name, create community

			const communityDocRef = doc(db, 'communities', communityName);

			await runTransaction(db, async (transaction) => {
				//check if community exists in DB
				const communityDoc = await transaction.get(communityDocRef);

				if (communityDoc.exists()) {
					throw new Error(
						'Sorry, h/$(communityName) is taken, Please try another.'
					);
				}

				//Create the community

				transaction.set(communityDocRef, {
					//creatorId
					//createdAt
					//numberOfMembers
					//privacyType
					creatorId: user?.uid,
					createdAt: serverTimestamp(),
					numberOfMembers: 1,
					privacyType: communityType,
				});

				//create communitySnipet on user
				transaction.set(
					doc(
						db,
						'users/${user?.uid}/communitySnippets',
						communityName
					),
					{
						communityIs: communityName,
						isModerator: true,
					}
				);
			});

			handleClose();
			toggleMenuOpen();
			router.push(`h/${communityName}`);
		} catch (error: any) {
			console.log('handleCreateCommunity error', error);
			setError(error.message);
		}

		setLoading(false);
	};

	return (
		<>
			<Modal isOpen={open} onClose={handleClose} size="lg">
				<ModalOverlay />
				<ModalContent>
					<ModalHeader
						display="flex"
						flexDirection="column"
						fontSize={15}
						padding={3}>
						{/*Create a Community*/}
						{isAdmin ? 'Create a Community' : 'Request a Community'}
					</ModalHeader>
					<Box pl={3} pr={3}>
						<Divider />
						<ModalCloseButton />
						{isAdmin ? (
							/* Community creation form */
							/* ... Form components here ... */
							<ModalBody
								display="flex"
								flexDirection="column"
								padding="10px 0px">
								<Text fontWeight={600} fontSize={15}>
									Name
								</Text>
								<Text fontSize={11} color="gray.500">
									Community names including Capitalization cannot be
									changed
								</Text>
								<Text
									position="relative"
									top="28px"
									left="10px"
									width="20px"
									color="gray.400">
									h/
								</Text>
								<Input
									position="relative"
									value={communityName}
									size="sm"
									pl="26px"
									onChange={handleChange}
								/>
								<Text
									fontSize="9pt"
									color={charsRemaining === 0 ? 'red' : 'grey.500'}>
									{charsRemaining} Characters Remaining
								</Text>
								<Text fontSize="9pt" color="red" pt={1}>
									{error}
								</Text>
								<Box mt={4} mb={4}>
									<Text fontWeight={600} fontSize={15}>
										Community Type
									</Text>
									{/*checkbox */}
									<Stack spacing={2}>
										<Checkbox
											name="public"
											isChecked={communityType === 'public'}
											onChange={onCommunityTypeChange}>
											<Flex align="center">
												<Icon
													as={BsFillPersonFill}
													color="gray.500"
													mr={2}
												/>
												<Text fontSize="10pt" mr={1}>
													Public
												</Text>
												<Text fontSize="8pt" color="gray.500">
													(Anyone can view, post, and comment to this
													community)
												</Text>
											</Flex>
										</Checkbox>
										<Checkbox
											name="restricted"
											isChecked={communityType === 'restricted'}
											onChange={onCommunityTypeChange}>
											<Flex align="center">
												<Icon
													as={BsFillEyeFill}
													color="gray.500"
													mr={2}
												/>
												<Text fontSize="10pt" mr={1}>
													Restricted
												</Text>
												<Text fontSize="8pt" color="gray.500">
													(Anyone can view, but only approved users
													can post, and comment to this community)
												</Text>
											</Flex>
										</Checkbox>
										<Checkbox
											name="private"
											isChecked={communityType === 'private'}
											onChange={onCommunityTypeChange}>
											<Flex align="center">
												<Icon
													as={HiLockClosed}
													color="gray.500"
													mr={2}
												/>
												<Text fontSize="10pt" mr={1}>
													Private
												</Text>
												<Text fontSize="8pt" color="gray.500">
													(Only approved users can view, post, and
													comment to this community)
												</Text>
											</Flex>
										</Checkbox>
									</Stack>
								</Box>
							</ModalBody>
						) : (
							<ModalBody>
								<Text>
									Community creation is restricted to administrators.
									Please use the request form to submit a new
									community request.
								</Text>
								{/* <Button
									mt={4}
									colorScheme="blue"
									onClick={() => {
										handleClose();
										router.push('/request-community');
									}}>
									Go to Request Form
								</Button> */}
							</ModalBody>
						)}
					</Box>
					<ModalFooter bg="gray.100" borderRadius="0px 0px 10px 10px">
						{/* ... Footer buttons ... */}
						<Button
							variant="outline"
							height="30px"
							mr={3}
							onClick={handleClose}>
							Cancel
						</Button>
						{/* <Button
							height="30px"
							onClick={handleCreateCommunity}
							isLoading={loading}>
							Create Community
						</Button> */}
						<Button
							variant="outline"
							height="30px"
							mr={3}
							colorScheme="blue"
							onClick={() => {
								handleClose();
								router.push('/request-community');
							}}>
							Go to Request Form
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
};
export default CreateCommunityModal;
