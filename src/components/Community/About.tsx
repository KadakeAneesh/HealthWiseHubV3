/**
 * Community About Component
 * Provides detailed information about a community and management options for administrators
 * Handles community image management and metadata display
 */
import { Community, CommunityState } from '@/atoms/communitiesAtom';
import { auth, db, storage } from '@/firebase/clientApp';
import useSelectFile from '@/hooks/useSelectFile';
import {
	Box,
	Button,
	Divider,
	Flex,
	Icon,
	Image,
	Input,
	Spinner,
	Stack,
	Text,
	useBreakpointValue,
} from '@chakra-ui/react';
import { doc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import moment from 'moment';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useRef, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { FaHeartbeat } from 'react-icons/fa';
import { HiOutlineDotsHorizontal } from 'react-icons/hi';
import { RiCakeLine } from 'react-icons/ri';
import { useSetRecoilState } from 'recoil';
import CreatePostLink from './CreatePostLink';

type AboutProps = {
	communityData: Community;
};

const About: React.FC<AboutProps> = ({ communityData }) => {
	const router = useRouter();
	const [user] = useAuthState(auth);
	const selectedFileRef = useRef<HTMLInputElement>(null);
	const { selectedFile, setSelectedFile, onSelectFile } =
		useSelectFile();
	const [uploadingImage, setUploadingImage] = useState(false);
	const setCommunityStateValue = useSetRecoilState(CommunityState);
	const isMobile = useBreakpointValue({ base: true, md: false });
	/**
	 * Handles community image updates
	 * Manages the upload process and state updates
	 */
	const onUpdateImage = async () => {
		if (!selectedFile) return;
		setUploadingImage(true);
		try {
			const imageRef = ref(
				storage,
				`communities/${communityData.id}/image`
			);
			await uploadString(imageRef, selectedFile, 'data_url');
			const downloadURL = await getDownloadURL(imageRef);
			// Update community document with new image URL
			await updateDoc(doc(db, 'communities', communityData.id), {
				imageURL: downloadURL,
			});
			// Update local state
			setCommunityStateValue((prev) => ({
				...prev,
				currentCommunity: {
					...prev.currentCommunity,
					imageURL: downloadURL,
				} as Community,
			}));
		} catch (error) {
			console.log('onUpdateImage error', error);
		}
		setUploadingImage(false);
	};
	return (
		<Box position={isMobile ? 'relative' : 'sticky'} top="14px">
			<Flex
				justify="space-between"
				align="center"
				bg="blue.400"
				color="white"
				p={isMobile ? 2 : 3}
				borderRadius="4px 4px 0px 0px">
				<Text fontSize={isMobile ? '9pt' : '10pt'} fontWeight={700}>
					About Community
				</Text>
				<Icon as={HiOutlineDotsHorizontal} />
			</Flex>
			<Flex
				direction="column"
				p={isMobile ? 2 : 3}
				bg="white"
				borderRadius="0px 0px 4px 4px">
				<Stack spacing={isMobile ? 1 : 2}>
					<Flex
						width="100%"
						p={isMobile ? 1 : 2}
						fontSize={isMobile ? '9pt' : '10pt'}
						fontWeight={700}>
						<Flex direction="column" flexGrow={1}>
							<Text>
								{communityData.numberOfMembers.toLocaleString()}
							</Text>
							<Text>Members</Text>
						</Flex>
						<Flex direction="column" flexGrow={1}>
							<Text>1</Text>
							<Text>Online</Text>
						</Flex>
					</Flex>
					<Divider />
					<Flex
						align="center"
						width="100%"
						p={1}
						fontWeight={500}
						fontSize={isMobile ? '9pt' : '10pt'}>
						<Icon
							as={RiCakeLine}
							fontSize={isMobile ? 16 : 18}
							mr={2}
						/>
						{communityData.createdAt && (
							<Text>
								Created{' '}
								{moment(
									new Date(communityData.createdAt.seconds * 1000)
								).format('MMM DD, YYYY')}
							</Text>
						)}
					</Flex>
					{!isMobile && (
						<Link href={`/h/${communityData.id}/submit`}>
							<Button mt={3} height="30px">
								Create Post
							</Button>
						</Link>
					)}
					{/* Admin Controls Section */}
					{user?.uid === communityData.creatorId && (
						<>
							<Divider />
							<Stack spacing={1} fontSize="10pt">
								<Text fontWeight={600}>Admin</Text>
								<Flex align="center" justify="space-between">
									<Text
										color="blue.500"
										cursor="pointer"
										_hover={{ textDecoration: 'underline' }}
										onClick={() => selectedFileRef.current?.click()}>
										Change Image
									</Text>
									{communityData.imageURL || selectedFile ? (
										<Image
											src={selectedFile || communityData.imageURL}
											borderRadius="full"
											boxSize="40px"
											alt="Community Image"
										/>
									) : (
										<Icon
											as={FaHeartbeat}
											fontSize={40}
											color="brand.100"
											mr={2}
										/>
									)}
								</Flex>
								{selectedFile &&
									(uploadingImage ? (
										<Spinner />
									) : (
										<Text cursor="pointer" onClick={onUpdateImage}>
											Save Changes
										</Text>
									))}
								<Input
									id="file-upload"
									type="file"
									accept="image/x-png,image/gif,image/jpeg"
									hidden
									ref={selectedFileRef}
									onChange={onSelectFile}
								/>
							</Stack>
						</>
					)}
				</Stack>
			</Flex>
			{isMobile && <CreatePostLink />}{' '}
			{/* Show CreatePostLink below About on mobile */}
		</Box>
	);
};
export default About;
