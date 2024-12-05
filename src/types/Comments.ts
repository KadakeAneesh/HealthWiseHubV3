import { Timestamp } from 'firebase/firestore';

export interface Comment {
	id: string;
	postId: string;
	creatorId: string;
	creatorDisplayText: string;
	communityId: string;
	postTitle: string;
	text: string;
	createdAt: Timestamp;
}
