/**
 * Login Component
 * Handles user authentication through email and password
 * Provides form validation and error handling for the login process
 */
import { authModalState } from '@/atoms/authModalAtom';
import { auth } from '@/firebase/clientApp';
import { FIREBASE_ERRORS } from '@/firebase/errors';
import { Button, Flex, Input, Text } from '@chakra-ui/react';
import React, { useState } from 'react';
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { useSetRecoilState } from 'recoil';

type LoginProps = {};

const Login: React.FC<LoginProps> = () => {
	const setAuthModalState = useSetRecoilState(authModalState);

	const [loginForm, setLoginForm] = useState({
		email: '',
		password: '',
	});
	const [signInWithEmailAndPassword, user, loading, error] =
		useSignInWithEmailAndPassword(auth);

	//Firebase Logic
	const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		signInWithEmailAndPassword(loginForm.email, loginForm.password);
	};

	const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		//update form state
		setLoginForm((prev) => ({
			...prev,
			[event.target.name]: event.target.value,
		}));
	};

	return (
		<form>
			<Input
				required
				name="email"
				placeholder="email"
				type="email"
				onChange={onChange}
				mb={2}
				fontSize="10pt"
				_placeholder={{ color: 'gray.500' }}
				_hover={{
					bg: 'white',
					border: '1px solid',
					borderColor: 'blue.500',
				}}
				_focus={{
					outline: 'none',
					bg: 'white',
					border: '1px solid',
					borderColor: 'blue.500',
				}}
				bg="gray.50"
			/>
			<Input
				required
				name="password"
				placeholder="password"
				type="password"
				onChange={onChange}
				mb={2}
				fontSize="10pt"
				_placeholder={{ color: 'gray.500' }}
				_hover={{
					bg: 'white',
					border: '1px solid',
					borderColor: 'blue.500',
				}}
				_focus={{
					outline: 'none',
					bg: 'white',
					border: '1px solid',
					borderColor: 'blue.500',
				}}
				bg="gray.50"
			/>
			<Text textAlign="center" color="red" fontSize="10pt">
				{
					FIREBASE_ERRORS[
						error?.message as keyof typeof FIREBASE_ERRORS
					]
				}
			</Text>
			<Button
				width="100%"
				height="36px"
				mt={2}
				mb={2}
				type="submit"
				isLoading={loading}>
				Log In
			</Button>
			<Flex justifyContent="center" mb={2}>
				<Text fontSize="9pt" mr={1}>
					Forgot your Password?
				</Text>
				<Text
					fontSize="9pt"
					color="blue.500"
					cursor="pointer"
					onClick={() =>
						setAuthModalState((prev) => ({
							...prev,
							view: 'resetPassword',
						}))
					}>
					Reset
				</Text>
			</Flex>
			<Flex fontSize="9pt" justifyContent="center">
				<Text mr={1}>New here?</Text>
				<Text
					color="blue.500"
					fontWeight={700}
					cursor="pointer"
					onClick={() =>
						setAuthModalState((prev) => ({
							...prev,
							view: 'signup',
						}))
					}>
					SIGN UP
				</Text>
			</Flex>
		</form>
	);
};
export default Login;
