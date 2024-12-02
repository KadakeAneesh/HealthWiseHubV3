/**
 * Custom hook for managing auth state
 */
import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth } from '@/firebase/clientApp';
import { useAuthState } from 'react-firebase-hooks/auth';

interface AuthState {
	user: User | null;
	loading: boolean;
	error: Error | undefined;
}

export function useAuth(): AuthState & {
	isAuthenticated: boolean;
	userId: string | undefined;
} {
	const [authUser, authLoading, authError] = useAuthState(auth);
	const [authState, setAuthState] = useState<AuthState>({
		user: null,
		loading: true,
		error: undefined,
	});

	useEffect(() => {
		setAuthState({
			user: authUser || null,
			loading: authLoading,
			error: authError,
		});
	}, [authUser, authLoading, authError]);

	return {
		...authState,
		isAuthenticated: !!authUser,
		userId: authUser?.uid,
	};
}
