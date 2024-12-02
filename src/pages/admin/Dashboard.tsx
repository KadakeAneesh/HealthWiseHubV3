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
} from '@chakra-ui/react';
import {
	collection,
	query,
	onSnapshot,
	doc,
	updateDoc,
	getDoc,
	runTransaction,
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

const AdminDashboard = () => {
	const [user] = useAuthState(auth);
	const [requests, setRequests] = useState<CommunityRequest[]>([]);
	const [isAdmin, setIsAdmin] = useState(false);
	const toast = useToast();
	const router = useRouter();

	useEffect(() => {
		// Check if user is admin

		setIsAdmin(true);
		// Subscribe to community requests
		const q = query(collection(db, 'communityRequests'));
		const unsubscribe = onSnapshot(q, (querySnapshot) => {
			const requests: CommunityRequest[] = [];
			querySnapshot.forEach((doc) => {
				requests.push({
					id: doc.id,
					...doc.data(),
				} as CommunityRequest);
			});
			setRequests(requests);
		});

		return () => unsubscribe();
	}, [user, isAdmin, router]);

	{
		/*useEffect(() => {
		// Check if user is admin
		if (user?.email === ADMIN_EMAIL) {
			setIsAdmin(true);
			// Subscribe to community requests
			const q = query(collection(db, 'communityRequests'));
			const unsubscribe = onSnapshot(q, (querySnapshot) => {
				const requests: CommunityRequest[] = [];
				querySnapshot.forEach((doc) => {
					requests.push({
						id: doc.id,
						...doc.data(),
					} as CommunityRequest);
				});
				setRequests(requests);
			});

			return () => unsubscribe();
		} else {
			router.push('/request-community'); // Redirect non-admin users
		}
	}, [user, isAdmin, router]);*/
	}

	const handleApprove = async (request: CommunityRequest) => {
		if (!user) return;

		try {
			await runTransaction(db, async (transaction) => {
				// Create the community
				const communityDocRef = doc(db, 'communities', request.name);
				const communityDoc = await transaction.get(communityDocRef);

				if (communityDoc.exists()) {
					throw new Error('Community name is already taken');
				}

				// Create community document
				transaction.set(communityDocRef, {
					creatorId: request.userId,
					createdAt: new Date().toISOString(),
					numberOfMembers: 1,
					privacyType: request.type,
				});

				// Create community snippet for the requesting user
				transaction.set(
					doc(
						db,
						`users/${request.userId}/communitySnippets`,
						request.name
					),
					{
						communityId: request.name,
						isModerator: true,
					}
				);

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
				title: 'Community created',
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
		}
	};

	const handleReject = async (requestId: string) => {
		try {
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
		}
	};

	if (!isAdmin) {
		return <Text>Access denied. Admin only area.</Text>;
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
									<>
										<Button
											onClick={() => handleApprove(request)}
											colorScheme="green"
											size="sm"
											mr={2}>
											Approve
										</Button>
										<Button
											onClick={() => handleReject(request.id)}
											colorScheme="red"
											size="sm">
											Reject
										</Button>
									</>
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
