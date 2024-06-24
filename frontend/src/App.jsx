import { Navigate, Route, Routes } from "react-router-dom"; // Importing necessary components from react-router-dom
import HomePage from "./pages/home/HomePage"; // Importing HomePage component
import LoginPage from "./pages/auth/login/LoginPage"; // Importing LoginPage component
import SignUpPage from "./pages/auth/signup/SignUpPage"; // Importing SignUpPage component
import NotificationPage from "./pages/notification/NotificationPage"; // Importing NotificationPage component
import ProfilePage from "./pages/profile/ProfilePage"; // Importing ProfilePage component

import Sidebar from "./components/common/Sidebar"; // Importing Sidebar component
import RightPanel from "./components/common/RightPanel"; // Importing RightPanel component

import { Toaster } from "react-hot-toast"; // Importing Toaster component from react-hot-toast library
import { useQuery } from "@tanstack/react-query"; // Importing useQuery hook from @tanstack/react-query library
import LoadingSpinner from "./components/common/LoadingSpinner"; // Importing LoadingSpinner component

function App() {
	const { data: authUser, isLoading } = useQuery({
		//  use queryKey to give a unique name to our query and refer to it later
		queryKey: ["authUser"],
		queryFn: async () => {
			try {
				const res = await fetch("/api/auth/me"); // Fetching the authenticated user data
				const data = await res.json(); // Parsing the response JSON
				if (data.error) return null; // Handling error response
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong"); // Throwing an error if response is not OK
				}
				console.log("authUser is here:", data); // Logging the authenticated user data
				return data; // Returning the authenticated user data
			} catch (error) {
				throw new Error(error); // Throwing an error if fetching fails
			}
		},
		retry: false, // Disabling retry on error
	});

	if (isLoading) {
		// Rendering a loading spinner while data is being fetched
		return (
			<div className='h-screen flex justify-center items-center'>
				<LoadingSpinner size='lg' />
			</div>
		);
	}

	return (
		<div className='flex max-w-6xl mx-auto'>
			 {/* // Rendering Sidebar component if user is authenticated */}
			{authUser && <Sidebar />}
			
			<Routes>
				
				{/* // Rendering HomePage or redirecting to login page based on authentication status */}
				<Route path='/' element={authUser ? <HomePage /> : <Navigate to='/login' />} /> 
				 {/* // Rendering LoginPage or redirecting to home page if user is authenticated */}
				<Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to='/' />} />
				 {/* // Rendering SignUpPage or redirecting to home page if user is authenticated */}
				<Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to='/' />} />
				<Route path='/notifications' element={authUser ? <NotificationPage /> : <Navigate to='/login' />} /> // Rendering NotificationPage or redirecting to login page if user is not authenticated
				<Route path='/profile/:username' element={authUser ? <ProfilePage /> : <Navigate to='/login' />} /> // Rendering ProfilePage or redirecting to login page if user is not authenticated
			</Routes>
			{authUser && <RightPanel />} {/* Rendering RightPanel component if user is authenticated */}
			 
			<Toaster /> 	{/* // Rendering Toast notifications */}
		
		</div>
	);
}

export default App; // Exporting the App component
