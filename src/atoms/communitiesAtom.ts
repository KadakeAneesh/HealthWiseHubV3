import { Timestamp } from '@google-cloud/firestore';
import { atom } from 'recoil';

export interface Community {
	id: string;
	creatorId: string;
	numberOfMembers: number;
	privacyType: 'public' | 'restricted' | 'private';
	createdAt?: Timestamp;
	imageURL?: string;
}

export interface CommunitySnippet {
	communityId: string;
	isModerator?: boolean;
	imageURL?: string;
}

interface CommunityState {
	mySnippets: CommunitySnippet[];
	currentCommunity?: Community;
	snippetsFetched: boolean;
}

const defaultCommunityState: CommunityState = {
	mySnippets: [],
	snippetsFetched: false,
};

export const CommunityState = atom<CommunityState>({
	key: 'communitiesState',
	default: defaultCommunityState,
});
