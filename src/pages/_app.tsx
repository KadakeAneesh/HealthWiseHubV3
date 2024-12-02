import '../styles/globals.css';
import { useEffect, useState } from 'react';
import type { AppProps } from 'next/app';
import {
	ChakraProvider,
	Button,
	Box,
	useToast,
} from '@chakra-ui/react';
import { theme } from '../chakra/theme';
import Layout from '../components/Layout/Layout';
import { RecoilRoot } from 'recoil';
import Head from 'next/head';
import { DownloadIcon } from '@chakra-ui/icons';

interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function App({ Component, pageProps }: AppProps) {
	const [deferredPrompt, setDeferredPrompt] =
		useState<BeforeInstallPromptEvent | null>(null);
	const toast = useToast();

	useEffect(() => {
		const handleBeforeInstallPrompt = (e: Event) => {
			// Prevent Chrome 67 and earlier from automatically showing the prompt
			e.preventDefault();
			// Stash the event so it can be triggered later
			setDeferredPrompt(e as BeforeInstallPromptEvent);

			toast({
				title: 'App is installable!',
				description:
					'Click the install button to add it to your device',
				status: 'info',
				duration: 5000,
				isClosable: true,
				position: 'bottom-right',
			});
		};

		window.addEventListener(
			'beforeinstallprompt',
			handleBeforeInstallPrompt
		);

		return () => {
			window.removeEventListener(
				'beforeinstallprompt',
				handleBeforeInstallPrompt
			);
		};
	}, []);

	const handleInstallClick = async () => {
		if (!deferredPrompt) return;

		// Show the install prompt
		deferredPrompt.prompt();

		// Wait for the user to respond to the prompt
		const { outcome } = await deferredPrompt.userChoice;

		if (outcome === 'accepted') {
			toast({
				title: 'Thank you for installing!',
				status: 'success',
				duration: 3000,
				isClosable: true,
			});
		}

		// Clear the deferredPrompt for the next time
		setDeferredPrompt(null);
	};

	return (
		<RecoilRoot>
			<ChakraProvider theme={theme}>
				<Head>
					<meta
						name="viewport"
						content="width=device-width, initial-scale=1"
					/>
					<meta name="theme-color" content="#4299E1" />
					<link rel="manifest" href="/manifest.json" />
					<link
						rel="apple-touch-icon"
						href="/icons/icon-192x192.png"
					/>
					<meta name="apple-mobile-web-app-capable" content="yes" />
					<meta
						name="apple-mobile-web-app-status-bar-style"
						content="default"
					/>
					<meta
						name="apple-mobile-web-app-title"
						content="HealthWise Hub"
					/>
					<meta name="application-name" content="HealthWise Hub" />
					<meta name="apple-mobile-web-app-capable" content="yes" />
					<meta
						name="apple-mobile-web-app-status-bar-style"
						content="default"
					/>
					<meta
						name="apple-mobile-web-app-title"
						content="HealthWise Hub"
					/>
					<meta name="mobile-web-app-capable" content="yes" />
					<meta name="msapplication-TileColor" content="#4299E1" />
					<meta name="msapplication-tap-highlight" content="no" />
					<meta name="theme-color" content="#4299E1" />

					<link
						rel="apple-touch-icon"
						sizes="192x192"
						href="/icons/ios/192.ico"
					/>
					<link
						rel="apple-touch-icon"
						sizes="512x512"
						href="/icons/ios/512.ico"
					/>
					<link
						rel="icon"
						type="image/x-icon"
						sizes="32x32"
						href="/icons/ios/32.ico"
					/>
					<link
						rel="shortcut icon"
						type="image/x-icon"
						href="/icons/ios/32.ico"
					/>
				</Head>
				<Layout>
					{deferredPrompt && (
						<Box position="fixed" bottom={4} right={4} zIndex={999}>
							<Button
								onClick={handleInstallClick}
								colorScheme="blue"
								size="md"
								leftIcon={<DownloadIcon />}
								shadow="md">
								Install App
							</Button>
						</Box>
					)}
					<Component {...pageProps} />
				</Layout>
			</ChakraProvider>
		</RecoilRoot>
	);
}
