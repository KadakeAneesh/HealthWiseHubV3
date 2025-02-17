import { Community, CommunityState } from '@/atoms/communitiesAtom';
import About from '@/components/Community/About';
import CreatePostLink from '@/components/Community/CreatePostLink';
import Header from '@/components/Community/Header';
import NotFound from '@/components/Community/NotFound';
import PageContent from '@/components/Layout/PageContent';
import Posts from '@/components/Posts/Posts';
import { db } from '@/firebase/clientApp';
import { doc, getDoc } from 'firebase/firestore';
import { GetServerSidePropsContext } from 'next';
import React, { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import safeJsonStringify from 'safe-json-stringify';

type CommunityPageProps = {
	communityData: Community;
};

const CommunityPage: React.FC<CommunityPageProps> = ({
	communityData,
}) => {
	console.log('here is data', communityData);
	const setCommunityStateValue = useSetRecoilState(CommunityState);

	// useEffect(() => {
	// 	setCommunityStateValue((prev) => ({
	// 		...prev,
	// 		currentCommunity: communityData,
	// 	}));
	// }, [communityData]);

	useEffect(() => {
		if (!communityData.id) return;
		setCommunityStateValue((prev) => ({
			...prev,
			currentCommunity: communityData,
		}));
	}, [communityData, setCommunityStateValue]);

	if (!communityData) {
		return <NotFound />;
	}

	return (
		<>
			<Header communityData={communityData} />
			<PageContent>
				<>
					<CreatePostLink />
					<Posts communityData={communityData} />
				</>
				<>
					<About communityData={communityData} />
				</>
			</PageContent>
		</>
	);
	//return <div>WELCOME TO {communityData.id}</div>;
};

export default CommunityPage;

export async function getServerSideProps(
	context: GetServerSidePropsContext
) {
	// get community data and pass it to client
	try {
		const communityDocRef = doc(
			db,
			'communities',
			context.query.communityId as string
		);
		const communityDoc = await getDoc(communityDocRef);

		return {
			props: {
				communityData: communityDoc.exists()
					? JSON.parse(
							safeJsonStringify({
								id: communityDoc.id,
								...communityDoc.data(),
							})
					  )
					: '',
			},
		};
	} catch (error) {
		//Could add error page here
		console.log('getServerSideProps error - [community]', error);
		return { props: {} };
		// return {
		// 	redirect: {
		// 		destination: '/login',
		// 		statusCode: 307,
		// 	},
		// };
	}
}
