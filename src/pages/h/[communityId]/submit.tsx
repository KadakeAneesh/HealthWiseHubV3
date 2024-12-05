//import { CommunityState } from '@/src/atoms/communitiesAtom';
import About from '@/components/Community/About';
import PageContent from '@/components/Layout/PageContent';
import NewPostForm from '@/components/Posts/NewPostForm';
import { auth } from '@/firebase/clientApp';
import useCommunityData from '@/hooks/useCommunityData';
import { Box, Text } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
//import { useRecoilValue } from 'recoil';

const SubmitPostPage: React.FC = () => {
	const [user] = useAuthState(auth);
	//const CommunityStateValue = useRecoilValue(communityState);
	const { communityStateValue } = useCommunityData();
	const [sharedArticleData, setSharedArticleData] =
		useState<any>(null);
	console.log('COMMUNITY', communityStateValue);
	useEffect(() => {
		// Check for shared article data
		const storedData = sessionStorage.getItem('sharedArticleData');
		if (storedData) {
			const parsedData = JSON.parse(storedData);
			setSharedArticleData(parsedData);
			// Clear stored data
			sessionStorage.removeItem('sharedArticleData');
		}
	}, []);
	return (
		<PageContent>
			<>
				<Box p="14px 0px">
					<Text>
						{sharedArticleData ? 'Share Article' : 'Create a Post'}
					</Text>
				</Box>
				{user && (
					<NewPostForm
						user={user}
						communityImageURL={
							communityStateValue.currentCommunity?.imageURL
						}
						defaultValues={
							sharedArticleData
								? {
										title: sharedArticleData.title,
										body: sharedArticleData.body,
								  }
								: undefined
						}
						isSharedArticle={!!sharedArticleData}
					/>
				)}
			</>
			<>
				{communityStateValue.currentCommunity && (
					<About
						communityData={communityStateValue.currentCommunity}
					/>
				)}
			</>
		</PageContent>
	);
};
export default SubmitPostPage;
