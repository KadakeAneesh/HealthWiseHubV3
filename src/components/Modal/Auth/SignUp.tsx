/**
 * SignUp Component
 * Handles new user registration through email and password
 * Includes password confirmation and validation
 */
import { authModalState } from '@/atoms/authModalAtom';
import { auth } from '@/firebase/clientApp';
import { FIREBASE_ERRORS } from '@/firebase/errors';
import { Text, Input, Button, Flex } from '@chakra-ui/react';
import React, { useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth';

const SignUp: React.FC = () => {
	const setAuthModalState = useSetRecoilState(authModalState);

	const [signUpForm, setSignUpForm] = useState({
		email: '',
		password: '',
		confirmPassword: '',
	});

	//general fn to flag errors
	const [error, setError] = useState('');

	const [createUserWithEmailAndPassword, user, loading, userError] =
		useCreateUserWithEmailAndPassword(auth);

	//Firebase Logic
	const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (error) setError('');
		if (signUpForm.password !== signUpForm.confirmPassword) {
			setError('Passwords do not match!');
			return;
		}
		//passwords match
		createUserWithEmailAndPassword(
			signUpForm.email,
			signUpForm.password
		);
	};

	const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		//update form state
		setSignUpForm((prev) => ({
			...prev,
			[event.target.name]: event.target.value,
		}));
	};

	return (
		<form onSubmit={onSubmit}>
			<Input
				required
				name="email"
				placeholder="Email"
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
				placeholder="Password"
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
			<Input
				required
				name="confirmPassword"
				placeholder="Confirm Password"
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
				{error ||
					FIREBASE_ERRORS[
						userError?.message as keyof typeof FIREBASE_ERRORS
					]}
			</Text>

			<Button
				width="100%"
				height="36px"
				mt={2}
				mb={2}
				type="submit"
				isLoading={loading}>
				Sign Up
			</Button>
			<Flex fontSize="9pt" justifyContent="center">
				<Text mr={1}>Already have an account?</Text>
				<Text
					color="blue.500"
					fontWeight={700}
					cursor="pointer"
					onClick={() =>
						setAuthModalState((prev) => ({
							...prev,
							view: 'login',
						}))
					}>
					LOG IN
				</Text>
			</Flex>
		</form>
	);
};
export default SignUp;
