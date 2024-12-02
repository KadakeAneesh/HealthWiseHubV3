import React, { useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
	DirectoryMenuItem,
	directoryMenuState,
} from '../atoms/directoryMenuAtom';
import { useRouter } from 'next/router';
import { CommunityState } from '../atoms/communitiesAtom';
import { FaHeartbeat } from 'react-icons/fa';

const useDirectory = () => {
	const [directoryState, setDirectoryState] = useRecoilState(
		directoryMenuState
	);
	const router = useRouter();
	const communityStateValue = useRecoilValue(CommunityState);

	const onSelectMenuItem = (menuItem: DirectoryMenuItem) => {
		setDirectoryState((prev) => ({
			...prev,
			selectedMenuItem: menuItem,
		}));
		router.push(menuItem.link);
		if (directoryState.isOpen) {
			toggleMenuOpen();
		}
	};

	const toggleMenuOpen = () => {
		setDirectoryState((prev) => ({
			...prev,
			isOpen: !directoryState.isOpen,
		}));
	};

	useEffect(() => {
		const { currentCommunity } = communityStateValue;

		if (currentCommunity) {
			setDirectoryState((prev) => ({
				...prev,
				selectedMenuItem: {
					displayText: `h/${currentCommunity.id}`,
					link: `/h/${currentCommunity.id}`,
					imageURL: currentCommunity.imageURL,
					icon: FaHeartbeat,
					iconColor: 'blue.500',
				},
			}));
		}
	}, [communityStateValue.currentCommunity]);

	return {
		directoryState,
		onSelectMenuItem,
		toggleMenuOpen,
	};
};
export default useDirectory;
