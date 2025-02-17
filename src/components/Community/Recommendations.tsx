/**
 * Recommendations Component
 * Displays top communities based on member count
 * Provides join/leave functionality and community previews
 */
import { Community } from '@/atoms/communitiesAtom';
import { db } from '@/firebase/clientApp';
import useCommunityData from '@/hooks/useCommunityData';
import {
	Box,
	Button,
	Flex,
	Icon,
	Image,
	Skeleton,
	SkeletonCircle,
	Stack,
	Text,
} from '@chakra-ui/react';
import {
	collection,
	getDocs,
	limit,
	orderBy,
	query,
} from 'firebase/firestore';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { FaHeartbeat } from 'react-icons/fa';

const Recommendations: React.FC = () => {
	const [communities, setCommunities] = useState<Community[]>([]);
	const [loading, setLoading] = useState(false);
	const { communityStateValue, onJoinOrLeaveCommunity } =
		useCommunityData();

	const getCommunityRecommendations = async () => {
		setLoading(true);
		try {
			const communityQuery = query(
				collection(db, 'communities'),
				orderBy('numberOfMembers', 'desc'),
				limit(5)
			);
			const communityDocs = await getDocs(communityQuery);
			const communities = communityDocs.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			})) as Community[];

			setCommunities(communities);
		} catch (error) {
			console.log('getCommunityRecommendations error', error);
		}
		setLoading(false);
	};

	useEffect(() => {
		getCommunityRecommendations();
	}, []);

	return (
		<Flex
			direction="column"
			bg="white"
			borderRadius={4}
			border="1px solid"
			borderColor="grey.300">
			<Flex
				align="flex-end"
				color="white"
				p="6px 10px"
				bg="blue.500"
				height="70px"
				borderRadius="4px 4px 0px 0px"
				fontWeight={600}
				bgImage="url(/images/banner1.jpg)"
				backgroundSize="cover"
				bgGradient="linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.75)),
        url('images/banner1.jpg')">
				Top Communities
			</Flex>
			<Flex direction="column">
				{loading ? (
					<Stack mt={2} p={3}>
						<Flex justify="space-between" align="center">
							<SkeletonCircle size="10" />
							<Skeleton height="10px" width="70%" />
						</Flex>
						<Flex justify="space-between" align="center">
							<SkeletonCircle size="10" />
							<Skeleton height="10px" width="70%" />
						</Flex>
						<Flex justify="space-between" align="center">
							<SkeletonCircle size="10" />
							<Skeleton height="10px" width="70%" />
						</Flex>
					</Stack>
				) : (
					<>
						{communities.map((item, index) => {
							/* Community item rendering */
							const isJoined = !!communityStateValue.mySnippets.find(
								(snippet) => snippet.communityId === item.id
							);
							return (
								<Link key={item.id} href={`/h/${item.id}`}>
									<Flex
										position="relative"
										align="center"
										fontSize="10pt"
										borderBottom="1px solid"
										borderColor="gray.200"
										p="10px 12px">
										<Flex width="80%" align="center">
											<Flex width="15%">
												<Text>{index + 1}</Text>
											</Flex>
											<Flex align="center" width="80%">
												{item.imageURL ? (
													<Image
														src={item.imageURL}
														borderRadius="full"
														boxSize="28px"
														mr={2}
														alt="community image"
													/>
												) : (
													<Icon
														as={FaHeartbeat}
														fontSize={30}
														color="brand.100"
														mr={2}
													/>
												)}
												<span
													style={{
														whiteSpace: 'nowrap',
														overflow: 'hidden',
														textOverflow: 'ellipsis',
													}}>
													{`h/${item.id}`}
												</span>
											</Flex>
										</Flex>
										<Box position="absolute" right="10px">
											<Button
												height="22px"
												fontSize="8pt"
												variant={isJoined ? 'outline' : 'solid'}
												onClick={(event) => {
													event.stopPropagation();
													onJoinOrLeaveCommunity(item, isJoined);
												}}>
												{isJoined ? 'Joined' : 'Join'}
											</Button>
										</Box>
									</Flex>
								</Link>
							);
						})}
						{/*<Box p="10px 20px">
							<Button height="30px" width="100%">
								View All
							</Button>
						</Box>
						for decoration, can potentially lead to a page with list of all communities*/}
					</>
				)}
			</Flex>
		</Flex>
	);
};
export default Recommendations;
