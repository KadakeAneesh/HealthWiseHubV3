/**
 * PostItem Component
 * Renders individual post with voting, comments, and interaction features
 * Handles post actions like voting, deletion, and navigation
 */
import { Post } from '@/atoms/postsAtom';
import {
	Alert,
	AlertIcon,
	AlertTitle,
	Badge,
	Flex,
	Icon,
	Image,
	Skeleton,
	Spinner,
	Stack,
	Text,
	useSafeLayoutEffect,
	useStatStyles,
} from '@chakra-ui/react';
import moment from 'moment';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { AiOutlineDelete } from 'react-icons/ai';
import { BsChat, BsDot } from 'react-icons/bs';
import { FaHeartbeat, FaReddit } from 'react-icons/fa';
import {
	IoArrowDownCircleOutline,
	IoArrowDownCircleSharp,
	IoArrowRedoOutline,
	IoArrowUpCircleOutline,
	IoArrowUpCircleSharp,
	IoBookOutline,
	IoBookmarkOutline,
} from 'react-icons/io5';
import { FaNewspaper } from 'react-icons/fa';

type PostItemProps = {
	post: Post;
	userIsCreator: boolean;
	userVoteValue?: number;
	onVote: (
		event: React.MouseEvent<SVGElement>,
		post: Post,
		vote: number,
		communityId: string
	) => void;
	onDeletePost: (post: Post) => Promise<boolean>;
	onSelectPost?: (post: Post) => void;
	homePage?: boolean;
};

const PostItem: React.FC<PostItemProps> = ({
	post,
	userIsCreator,
	userVoteValue,
	onVote,
	onSelectPost,
	onDeletePost,
	homePage,
}) => {
	const [loadingImage, setLoadingImage] = useState(true);
	const [error, setError] = useState(false);
	const [loadingDelete, setLoadingDelete] = useState(false);
	const router = useRouter();
	const singlePostPage = !onSelectPost;

	{
		/*For error handling and calling onDeletePost fn */
	}
	const handleDelete = async (
		event: React.MouseEvent<HTMLDivElement, MouseEvent>
	) => {
		event.stopPropagation();
		setLoadingDelete(true);
		try {
			const success = await onDeletePost(post);

			if (!success) {
				throw new Error('Failed to delete the Post');
			}
			console.log('Post was successfully deleted');
			if (singlePostPage) {
				router.push(`/h/${post.communityId}`);
			}
		} catch (error: any) {
			setError(error.message);
		}
		setLoadingDelete(false);
	};

	const handleCommentsClick = (event: React.MouseEvent) => {
		event.stopPropagation();
		const safeUrl = `/h/${encodeURIComponent(
			post.communityId
		)}/comments/${post.id}`;
		router.push(safeUrl);
	};

	return (
		<Flex
			border="1px solid"
			bg="white"
			borderColor={singlePostPage ? 'white' : 'gray.300'}
			borderRadius={singlePostPage ? '4px 4px 0px 0px' : '4px'}
			_hover={{ borderColor: singlePostPage ? 'none' : 'gray.500' }}
			cursor={singlePostPage ? 'unset' : 'pointer'}
			onClick={() => onSelectPost && onSelectPost(post)}>
			{/*LHS content of Post Card*/}
			<Flex
				direction="column"
				align="center"
				bg={singlePostPage ? 'none' : 'gray.100'}
				p={2}
				width="40px"
				borderRadius={singlePostPage ? '0' : '3px 0px 0px 3px'}>
				{/*UpVote Icon*/}
				<Icon
					as={
						userVoteValue === 1
							? IoArrowUpCircleSharp
							: IoArrowUpCircleOutline
					}
					color={userVoteValue === 1 ? 'brand.100' : 'gray.400'}
					fontSize={22}
					onClick={(event) =>
						onVote(event, post, 1, post.communityId)
					}
					cursor="pointer"
				/>
				<Text fontSize="9pt">{post.voteStatus}</Text>
				{/* Voting and interaction elements */}
				{/*DownVote Icon*/}
				<Icon
					as={
						userVoteValue === -1
							? IoArrowDownCircleSharp
							: IoArrowDownCircleOutline
					}
					color={userVoteValue === -1 ? '#4379ff' : 'gray.400'}
					fontSize={22}
					onClick={(event) =>
						onVote(event, post, -1, post.communityId)
					}
					cursor="pointer"
				/>
			</Flex>
			{/*RHS content of Post Card*/}
			<Flex direction="column" width="100%">
				{/* Post content rendering */}
				{error && (
					<Alert status="error">
						<AlertIcon />
						<AlertTitle mr={2}>{error}</AlertTitle>
					</Alert>
				)}
				{/* <Stack spacing={1} p="10px">
					<Flex align="center" gap={2}>
						{post.isSharedArticle && (
							<>
								<Icon as={FaNewspaper} color="blue.500" />
								<Badge colorScheme="blue">Health Article</Badge>
							</>
						)}
						<Text fontSize="12pt" fontWeight={600}>
							{post.title}
						</Text>
					</Flex>
				</Stack> */}
				<Stack spacing={1} p="10px">
					{/* Post metadata and content */}
					<Stack
						direction="row"
						spacing={0.6}
						align="center"
						fontSize="9pt">
						{/*Homepage Check*/}
						{homePage && (
							<>
								{post.communityImageURL ? (
									<Image
										src={post.communityImageURL}
										borderRadius="full"
										boxSize="18px"
										mr={2}
										alt="community Image"
									/>
								) : (
									<Icon
										as={FaHeartbeat}
										fontSize="18pt"
										mr={1}
										color="blue.500"
									/>
								)}
								<Link href={`h/${post.communityId}`}>
									<Text
										fontWeight={700}
										_hover={{
											textDecoration: 'underline',
										}}
										onClick={(event) =>
											event.stopPropagation()
										}>{`h/${post.communityId}`}</Text>
								</Link>
								<Icon as={BsDot} color="gray.500" fontSize={8} />
							</>
						)}
						<Text>
							Posted by i/{post.creatorDisplayName}{' '}
							{moment(
								new Date(post.createdAt?.seconds * 1000)
							).fromNow()}
						</Text>
					</Stack>
					<Text fontSize="12pt" fontWeight={600}>
						{post.title}
					</Text>
					<Text fontSize="10pt">{post.body}</Text>
					{post.imageURL && (
						<Flex justify="center" align="center" p={2}>
							{loadingImage && (
								<Skeleton
									height="200px"
									width="100%"
									borderRadius={4}
								/>
							)}
							<Image
								src={post.imageURL}
								maxHeight="460px"
								alt="Post Image"
								display={loadingImage ? 'none' : 'unset'}
								onLoad={() => setLoadingImage(false)}
							/>
						</Flex>
					)}
				</Stack>
				{/* Post actions (comments, share, save) */}
				<Flex ml={1} mb={0.5} color="gray.500">
					<Flex
						align="center"
						p="8px 10px"
						borderRadius={4}
						_hover={{ bg: 'gray.200' }}
						cursor="pointer"
						onClick={handleCommentsClick}>
						<Icon as={BsChat} mr={2} />
						<Text fontSize="9pt">{post.numberOfComments}</Text>
					</Flex>
					<Flex
						align="center"
						p="8px 10px"
						borderRadius={4}
						_hover={{ bg: 'gray.200' }}
						cursor="pointer">
						<Icon as={IoArrowRedoOutline} mr={2} />
						<Text fontSize="9pt">Share</Text>
					</Flex>
					<Flex
						align="center"
						p="8px 10px"
						borderRadius={4}
						_hover={{ bg: 'gray.200' }}
						cursor="pointer">
						<Icon as={IoBookmarkOutline} mr={2} />
						<Text fontSize="9pt">Save</Text>
					</Flex>
					{userIsCreator && (
						<Flex
							align="center"
							p="8px 10px"
							borderRadius={4}
							_hover={{ bg: 'gray.200' }}
							cursor="pointer"
							onClick={handleDelete}>
							{loadingDelete ? (
								<Spinner size="sm" />
							) : (
								<>
									<Icon as={AiOutlineDelete} mr={2} />
									<Text fontSize="9pt">Delete</Text>
								</>
							)}
						</Flex>
					)}
				</Flex>
			</Flex>
		</Flex>
	);
};
export default PostItem;
