import React, { useEffect, useState } from 'react';
import {
	Box,
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	Button,
	useToast,
	Text,
	Alert,
	AlertDescription,
	AlertIcon,
	AlertTitle,
	Spinner,
	ButtonGroup,
} from '@chakra-ui/react';
import {
	collection,
	query,
	onSnapshot,
	doc,
	updateDoc,
	getDoc,
	runTransaction,
	orderBy,
	serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '@/firebase/clientApp';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/router';

interface CommunityRequest {
	id: string;
	name: string;
	description: string;
	type: string;
	status: string;
	userId: string;
	userEmail: string;
	createdAt: string;
}

const ADMIN_EMAIL = 'aneeshkadake@gmail.com';

const AdminDashboard: React.FC = () => {
	const [user] = useAuthState(auth);
	const [requests, setRequests] = useState<CommunityRequest[]>([]);

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	const toast = useToast();
	const router = useRouter();

	const ADMIN_EMAIL = 'aneeshkadake@gmail.com';

	useEffect(() => {
		const fetchRequests = async () => {
			if (!user) {
				router.push('/');
				return;
			}

			// Check if user is admin based on email
			const isAdmin = user.email === ADMIN_EMAIL;
			if (!isAdmin) {
				router.push('/');
				return;
			}

			try {
				const q = query(
					collection(db, 'communityRequests'),
					orderBy('createdAt', 'desc')
				);

				const unsubscribe = onSnapshot(
					q,
					(snapshot) => {
						const requests: CommunityRequest[] = [];
						snapshot.forEach((doc) => {
							requests.push({
								id: doc.id,
								...doc.data(),
							} as CommunityRequest);
						});
						setRequests(requests);
						setLoading(false);
					},
					(error) => {
						console.error('Error fetching requests:', error);
						setError(error as Error);
						setLoading(false);
					}
				);

				return () => unsubscribe();
			} catch (error) {
				console.error('Error in admin dashboard:', error);
				setError(error as Error);
				setLoading(false);
			}
		};

		fetchRequests();
	}, [user, router]);

	const handleApprove = async (request: CommunityRequest) => {
		try {
			setLoading(true);

			await runTransaction(db, async (transaction) => {
				// Create the community
				const communityDocRef = doc(db, 'communities', request.name);

				// Check if community already exists
				const communityDoc = await transaction.get(communityDocRef);
				if (communityDoc.exists()) {
					throw new Error('Community name is already taken');
				}

				// Create community document
				transaction.set(communityDocRef, {
					creatorId: request.userId,
					createdAt: serverTimestamp(),
					numberOfMembers: 1,
					privacyType: request.type,
				});

				// Create community snippet for the requesting user
				const userSnippetRef = doc(
					db,
					`users/${request.userId}/communitySnippets`,
					request.name
				);

				transaction.set(userSnippetRef, {
					communityId: request.name,
					isModerator: true,
				});

				// Update request status
				const requestDocRef = doc(
					db,
					'communityRequests',
					request.id
				);
				transaction.update(requestDocRef, {
					status: 'approved',
				});
			});

			toast({
				title: 'Community approved',
				description: `Successfully created community: h/${request.name}`,
				status: 'success',
				duration: 5000,
			});
		} catch (error: any) {
			toast({
				title: 'Error',
				description: error.message,
				status: 'error',
				duration: 5000,
			});
			console.error('Error approving community:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleReject = async (requestId: string) => {
		try {
			setLoading(true);

			// Update request status to rejected
			await updateDoc(doc(db, 'communityRequests', requestId), {
				status: 'rejected',
			});

			toast({
				title: 'Request rejected',
				status: 'info',
				duration: 3000,
			});
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to reject request',
				status: 'error',
				duration: 3000,
			});
			console.error('Error rejecting request:', error);
		} finally {
			setLoading(false);
		}
	};

	// Only check if not admin after loading is complete
	if (user?.email !== ADMIN_EMAIL) {
		return (
			<Box p={4}>
				<Text>Access denied. Admin only area.</Text>
				<Button mt={4} onClick={() => router.push('/')}>
					Return Home
				</Button>
			</Box>
		);
	}

	if (loading) {
		return (
			<Box p={4}>
				<Spinner />
			</Box>
		);
	}
	if (error) {
		return (
			<Alert status="error">
				<AlertIcon />
				<AlertTitle>Error</AlertTitle>
				<AlertDescription>{error.message}</AlertDescription>
			</Alert>
		);
	}

	return (
		<Box p={4}>
			<Text fontSize="2xl" mb={4}>
				Community Requests
			</Text>
			<Table variant="simple">
				<Thead>
					<Tr>
						<Th>Name</Th>
						<Th>Description</Th>
						<Th>Type</Th>
						<Th>Requested By</Th>
						<Th>Status</Th>
						<Th>Actions</Th>
					</Tr>
				</Thead>
				<Tbody>
					{requests.map((request) => (
						<Tr key={request.id}>
							<Td>h/{request.name}</Td>
							<Td>{request.description}</Td>
							<Td>{request.type}</Td>
							<Td>{request.userEmail}</Td>
							<Td>{request.status}</Td>
							<Td>
								{request.status === 'pending' && (
									<ButtonGroup spacing={2}>
										<Button
											colorScheme="green"
											size="sm"
											onClick={() => handleApprove(request)}
											isLoading={loading}>
											Approve
										</Button>
										<Button
											colorScheme="red"
											size="sm"
											onClick={() => handleReject(request.id)}
											isLoading={loading}>
											Reject
										</Button>
									</ButtonGroup>
								)}
							</Td>
						</Tr>
					))}
				</Tbody>
			</Table>
		</Box>
	);
};

export default AdminDashboard;
