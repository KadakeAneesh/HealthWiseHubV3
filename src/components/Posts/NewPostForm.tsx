/**
 * NewPostForm Component
 * Handles creation of new posts with multiple formats (text, image, link)
 * Manages form state and submission to Firestore
 */
import React, { useState } from 'react';
import {
	Alert,
	AlertDescription,
	AlertIcon,
	AlertTitle,
	CloseButton,
	Flex,
	Icon,
} from '@chakra-ui/react';
import { BiPoll } from 'react-icons/bi';
import { BsLink45Deg, BsMic } from 'react-icons/bs';
import { IoDocumentText, IoImageOutline } from 'react-icons/io5';
import { AiFillCloseCircle } from 'react-icons/ai';
import TextInputs from './PostForm/TextInputs';
import ImageUpload from './PostForm/ImageUpload';
import { Post } from '@/atoms/postsAtom';
import { User } from 'firebase/auth';
import { useRouter } from 'next/router';
import {
	addDoc,
	collection,
	serverTimestamp,
	updateDoc,
	Timestamp,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import { db, storage } from '@/firebase/clientApp';
import useSelectFile from '@/hooks/useSelectFile';
import TabItemComponent from './TabItem'; // Renamed import to avoid conflict

// Move type definitions to the top
export interface TabItemType {
	title: string;
	icon: typeof Icon.arguments;
}

type NewPostFormProps = {
	user: User;
	communityImageURL?: string;
};

const formTabs: TabItemType[] = [
	{
		title: 'Post',
		icon: IoDocumentText,
	},
	{
		title: 'Images & Video',
		icon: IoImageOutline,
	},
	{
		title: 'Link',
		icon: BsLink45Deg,
	},
	{
		title: 'Talk',
		icon: BsMic,
	},
];

const NewPostForm: React.FC<NewPostFormProps> = ({
	user,
	communityImageURL,
}) => {
	const router = useRouter();
	const [selectedTab, setSelectedTab] = useState(formTabs[0].title);
	const [textInputs, setTextInputs] = useState({
		title: '',
		body: '',
	});
	const { selectedFile, setSelectedFile, onSelectFile } =
		useSelectFile();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(false);

	const handleCreatePost = async () => {
		const { communityId } = router.query;

		const newPost: Post = {
			communityId: communityId as string,
			communityImageURL: communityImageURL || '',
			creatorId: user?.uid,
			creatorDisplayName: user.email!.split('@')[0],
			title: textInputs.title,
			body: textInputs.body,
			numberOfComments: 0,
			voteStatus: 0,
			createdAt: serverTimestamp() as Timestamp,
			id: '',
		};

		setLoading(true);
		try {
			const postDocRef = await addDoc(
				collection(db, 'posts'),
				newPost
			);

			if (selectedFile) {
				const imageRef = ref(storage, `posts/${postDocRef.id}/image`);
				await uploadString(imageRef, selectedFile, 'data_url');
				const downloadURL = await getDownloadURL(imageRef);

				await updateDoc(postDocRef, {
					imageURL: downloadURL,
				});
			}
			router.back();
		} catch (error: any) {
			console.log('handleCreatePost error', error.message);
			setError(true);
		}
		setLoading(false);
	};

	const onTextChange = (
		event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const {
			target: { name, value },
		} = event;
		setTextInputs((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	return (
		<Flex direction="column" bg="white" borderRadius={4} mt={2}>
			<Flex width="100%">
				{formTabs.map((item) => (
					<TabItemComponent
						key={item.title}
						item={item}
						selected={item.title === selectedTab}
						setSelectedTab={setSelectedTab}
					/>
				))}
			</Flex>
			<Flex p={4}>
				{selectedTab === 'Post' && (
					<TextInputs
						textInputs={textInputs}
						handleCreatePost={handleCreatePost}
						onChange={onTextChange}
						loading={loading}
					/>
				)}
				{selectedTab === 'Images & Video' && (
					<ImageUpload
						selectedFile={selectedFile}
						onSelectImage={onSelectFile}
						setSelectedTab={setSelectedTab}
						setSelectedFile={setSelectedFile}
					/>
				)}
			</Flex>
			{error && (
				<Alert status="error">
					<AlertIcon />
					<AlertTitle mr={2}>Error creating post</AlertTitle>
				</Alert>
			)}
		</Flex>
	);
};

export default NewPostForm;
