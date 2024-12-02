/**
 * Community Header Component
 * Displays the main header for community pages with join/leave functionality
 * Shows community information and manages user interactions with the community
 */
import { Community } from '@/atoms/communitiesAtom';
import useCommunityData from '@/hooks/useCommunityData';
import {
	Box,
	Button,
	Flex,
	Icon,
	Image,
	Text,
} from '@chakra-ui/react';
import React from 'react';
import { FaHeartbeat } from 'react-icons/fa';

type HeaderProps = {
	communityData: Community;
};

const Header: React.FC<HeaderProps> = ({ communityData }) => {
	const { communityStateValue, onJoinOrLeaveCommunity, loading } =
		useCommunityData();
	// Check if user is already a member
	const isJoined = !!communityStateValue.mySnippets.find(
		(item) => item.communityId === communityData.id
	); // will read from communitySnippets
	return (
		<Flex direction="column" width="100%" height="146px">
			<Box height="50%" bg="blue.400">
				<Flex justify="center" bg="white" flexGrow={1}>
					<Flex width="95%" maxWidth="860px">
						{/* Community Image/Icon */}
						{communityStateValue.currentCommunity?.imageURL ? (
							<Image
								borderRadius="full"
								boxSize="66px"
								position="relative"
								top={3}
								color="blue.500"
								border="4px solid white"
								src={communityStateValue.currentCommunity.imageURL}
								alt="community logo"
							/>
						) : (
							<Icon
								as={FaHeartbeat}
								fontSize={64}
								position="relative"
								top={-3}
								color="blue.500"
								border="4px solid white"
								borderRadius="50%"
							/>
						)}
						{/* Community Information */}
						<Flex padding="10px 16px">
							<Flex direction="column" mr={6}>
								<Text fontWeight={800} fontSize="16pt">
									{communityData.id}
								</Text>
								<Text
									fontWeight={600}
									fontSize="10pt"
									color="grey.400">
									{communityData.id}
								</Text>
							</Flex>
							{/* Join/Leave Button */}
							<Button
								variant={isJoined ? 'outline' : 'solid'}
								height="30px"
								pr={6}
								pl={6}
								isLoading={loading}
								onClick={() =>
									onJoinOrLeaveCommunity(communityData, isJoined)
								}>
								{isJoined ? 'Joined' : 'Join'}
							</Button>
						</Flex>
					</Flex>
				</Flex>
			</Box>
		</Flex>
	);
};
export default Header;
