/**
 * Authentication Modal State Management
 * Uses Recoil for managing the authentication modal's state across the application
 */
import { atom } from 'recoil';

export interface AuthModalState {
	open: boolean;
	view: ModalView;
}

export type ModalView = 'login' | 'signup' | 'resetPassword';

const defaultModalState: AuthModalState = {
	open: false,
	view: 'login',
};

export const authModalState = atom<AuthModalState>({
	key: 'authModalState',
	default: defaultModalState,
});
