import { Community } from '@/atoms/communitiesAtom';
import { db, auth } from '@/firebase/clientApp';
import {
	Box,
	Button,
	Flex,
	Grid,
	Heading,
	Icon,
	Image,
	Skeleton,
	Stack,
	Text,
	useColorModeValue,
	ButtonGroup,
} from '@chakra-ui/react';
import {
	collection,
	getDocs,
	orderBy,
	query,
	limit,
	startAfter,
	doc,
	runTransaction,
	increment,
	getDoc,
	where,
	QueryDocumentSnapshot,
	DocumentData,
} from 'firebase/firestore';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { HiOutlineUsers } from 'react-icons/hi';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useToast } from '@chakra-ui/react';

interface CommunityWithMemberStatus extends Community {
	isMember?: boolean;
	description?: string;
}

const ITEMS_PER_PAGE = 9;

const CommunitiesPage: React.FC = () => {
	const [communities, setCommunities] = useState<
		CommunityWithMemberStatus[]
	>([]);
	const [loading, setLoading] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const [lastVisibleDoc, setLastVisibleDoc] =
		useState<QueryDocumentSnapshot<DocumentData> | null>(null);
	const [hasMore, setHasMore] = useState(true);
	const [joinLoading, setJoinLoading] = useState<string[]>([]);

	const [user] = useAuthState(auth);
	const router = useRouter();
	const toast = useToast();
	const bgColor = useColorModeValue('white', 'gray.800');
	const borderColor = useColorModeValue('gray.200', 'gray.700');

	useEffect(() => {
		fetchCommunities();
	}, [user]);

	const processCommunityDocs = async (
		communityDocs: QueryDocumentSnapshot<DocumentData>[]
	) => {
		try {
			const processedCommunities = await Promise.all(
				communityDocs.map(async (communityDoc) => {
					const communityData = {
						id: communityDoc.id,
						...communityDoc.data(),
					} as CommunityWithMemberStatus;

					if (user) {
						const memberDocRef = doc(
							db,
							'communities',
							communityDoc.id,
							'members',
							user.uid
						);
						const memberDoc = await getDoc(memberDocRef);
						communityData.isMember = memberDoc.exists();
					}

					const requestQuery = query(
						collection(db, 'communityRequests'),
						where('name', '==', communityDoc.id),
						where('status', '==', 'approved'),
						limit(1)
					);

					const requestDocs = await getDocs(requestQuery);
					communityData.description = requestDocs.empty
						? ''
						: requestDocs.docs[0].data().description || '';

					return communityData;
				})
			);

			return processedCommunities;
		} catch (error) {
			console.error('Error processing community docs:', error);
			throw error;
		}
	};

	const fetchCommunities = async () => {
		try {
			setLoading(true);
			const communitiesQuery = query(
				collection(db, 'communities'),
				orderBy('numberOfMembers', 'desc'),
				limit(ITEMS_PER_PAGE)
			);

			// Add error handling and logging
			console.log('Fetching communities...');
			const communityDocs = await getDocs(communitiesQuery);
			console.log('Fetched docs:', communityDocs.size);

			const lastVisible =
				communityDocs.docs[communityDocs.docs.length - 1];
			const processedCommunities = await Promise.all(
				communityDocs.docs.map(async (doc) => {
					const communityData = {
						id: doc.id,
						...doc.data(),
					} as Community;
					return communityData;
				})
			);

			setCommunities(processedCommunities);
			setLastVisibleDoc(lastVisible);
			setHasMore(communityDocs.docs.length === ITEMS_PER_PAGE);
			setLoading(false);
		} catch (error) {
			console.error('Error fetching communities:', error);
			toast({
				title: 'Error fetching communities',
				status: 'error',
				duration: 3000,
				isClosable: true,
			});
		} finally {
			setLoading(false);
		}
	};

	const loadMore = async () => {
		if (!lastVisibleDoc || loadingMore) return;

		try {
			setLoadingMore(true);
			const communitiesQuery = query(
				collection(db, 'communities'),
				orderBy('numberOfMembers', 'desc'),
				startAfter(lastVisibleDoc),
				limit(ITEMS_PER_PAGE)
			);

			const communityDocs = await getDocs(communitiesQuery);
			const lastVisible =
				communityDocs.docs[communityDocs.docs.length - 1];
			const processedCommunities = await processCommunityDocs(
				communityDocs.docs
			);

			setCommunities((prev) => [...prev, ...processedCommunities]);
			setLastVisibleDoc(lastVisible);
			setHasMore(communityDocs.docs.length === ITEMS_PER_PAGE);
		} catch (error) {
			console.error('Error loading more communities:', error);
			toast({
				title: 'Error loading more communities',
				status: 'error',
				duration: 3000,
				isClosable: true,
			});
		} finally {
			setLoadingMore(false);
		}
	};

	const onJoinOrLeaveCommunity = async (
		communityId: string,
		isJoining: boolean
	) => {
		if (!user) {
			toast({
				title: 'Please sign in first',
				status: 'warning',
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		try {
			setJoinLoading((prev) => [...prev, communityId]);

			const communityDocRef = doc(db, 'communities', communityId);
			const userCommunityDocRef = doc(
				db,
				`users/${user.uid}/communitySnippets`,
				communityId
			);

			await runTransaction(db, async (transaction) => {
				const communityDoc = await transaction.get(communityDocRef);
				const userCommunityDoc = await transaction.get(
					userCommunityDocRef
				);

				if (isJoining) {
					transaction.set(userCommunityDocRef, {
						communityId: communityId,
						isModerator: false,
					});
					transaction.update(communityDocRef, {
						numberOfMembers: increment(1),
					});
				} else {
					if (userCommunityDoc.exists()) {
						transaction.delete(userCommunityDocRef);
						transaction.update(communityDocRef, {
							numberOfMembers: increment(-1),
						});
					}
				}
			});

			setCommunities((prev) =>
				prev.map((community) => {
					if (community.id === communityId) {
						return {
							...community,
							isMember: isJoining,
							numberOfMembers: isJoining
								? community.numberOfMembers + 1
								: community.numberOfMembers - 1,
						};
					}
					return community;
				})
			);

			toast({
				title: `Successfully ${
					isJoining ? 'joined' : 'left'
				} the community`,
				status: 'success',
				duration: 3000,
				isClosable: true,
			});
		} catch (error) {
			console.error('Error joining/leaving community:', error);
			toast({
				title: `Error ${isJoining ? 'joining' : 'leaving'} community`,
				status: 'error',
				duration: 3000,
				isClosable: true,
			});
		} finally {
			setJoinLoading((prev) =>
				prev.filter((id) => id !== communityId)
			);
		}
	};

	return (
		<Box p={4} maxWidth="1200px" mx="auto">
			<Flex direction="column" mb={6}>
				<Heading size="lg" mb={2}>
					Health Communities
				</Heading>
				<Text color="gray.600">
					Discover and join health-focused communities
				</Text>
			</Flex>

			{loading ? (
				<Grid
					templateColumns={{
						base: '1fr',
						md: 'repeat(2, 1fr)',
						lg: 'repeat(3, 1fr)',
					}}
					gap={6}>
					{[1, 2, 3, 4, 5, 6].map((item) => (
						<Skeleton key={item} height="200px" />
					))}
				</Grid>
			) : (
				<>
					<Grid
						templateColumns={{
							base: '1fr',
							md: 'repeat(2, 1fr)',
							lg: 'repeat(3, 1fr)',
						}}
						gap={6}>
						{communities.map((community) => (
							<Box
								key={community.id}
								bg={bgColor}
								borderRadius="lg"
								border="1px"
								borderColor={borderColor}
								overflow="hidden"
								transition="transform 0.2s"
								_hover={{ transform: 'translateY(-4px)' }}>
								<Box height="120px" overflow="hidden">
									<Image
										src={
											community.imageURL ||
											'/images/healthwise-noimage.png'
										}
										alt={community.id}
										objectFit="cover"
										width="100%"
										height="100%"
									/>
								</Box>
								<Stack p={4} spacing={3}>
									<Heading size="md">{community.id}</Heading>
									{community.description && (
										<Text
											color="gray.600"
											noOfLines={2}
											fontSize="sm">
											{community.description}
										</Text>
									)}
									<Flex align="center">
										<Icon as={HiOutlineUsers} mr={2} />
										<Text color="gray.600">
											{community.numberOfMembers} members
										</Text>
									</Flex>
									<ButtonGroup spacing={2}>
										<Button
											colorScheme="blue"
											variant="outline"
											onClick={() =>
												router.push(`/h/${community.id}`)
											}>
											View
										</Button>
										<Button
											colorScheme={
												community.isMember ? 'red' : 'green'
											}
											isLoading={joinLoading.includes(community.id)}
											onClick={() =>
												onJoinOrLeaveCommunity(
													community.id,
													!community.isMember
												)
											}>
											{community.isMember ? 'Leave' : 'Join'}
										</Button>
									</ButtonGroup>
								</Stack>
							</Box>
						))}
					</Grid>

					{hasMore && (
						<Flex justify="center" mt={8}>
							<Button
								onClick={loadMore}
								isLoading={loadingMore}
								colorScheme="blue">
								Load More Communities
							</Button>
						</Flex>
					)}
				</>
			)}

			{!loading && communities.length === 0 && (
				<Flex
					direction="column"
					align="center"
					justify="center"
					p={8}
					textAlign="center">
					<Text fontSize="lg" mb={4}>
						No communities found
					</Text>
					<Text color="gray.600">
						Be the first to create a health community!
					</Text>
				</Flex>
			)}
		</Box>
	);
};

export default CommunitiesPage;
