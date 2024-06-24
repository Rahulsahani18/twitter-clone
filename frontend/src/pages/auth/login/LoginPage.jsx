import { useState } from "react"; // Importing useState hook from React
import { Link } from "react-router-dom"; // Importing Link component from react-router-dom

import XSvg from "../../../components/svgs/X"; // Importing custom SVG component

import { MdOutlineMail } from "react-icons/md"; // Importing mail icon from react-icons/md
import { MdPassword } from "react-icons/md"; // Importing password icon from react-icons/md

import { useMutation, useQueryClient } from "@tanstack/react-query"; // Importing useMutation and useQueryClient hooks from react-query

const LoginPage = () => {
	const [formData, setFormData] = useState({ // State for form data
		username: "", // Initial value for username
		password: "", // Initial value for password
	});
	const queryClient = useQueryClient(); // Accessing the query client from react-query

	const { // Destructuring properties from useMutation hook
		mutate: loginMutation, // Mutate function for login
		isPending, // Boolean indicating whether mutation is pending
		isError, // Boolean indicating whether mutation encountered an error
		error, // Error object containing details of the error
	} = useMutation({ // Defining mutation
		mutationFn: async ({ username, password }) => { // Mutation function to perform login
			try {
				const res = await fetch("/api/auth/login", { // Fetching login endpoint
					method: "POST", // HTTP method
					headers: {
						"Content-Type": "application/json", // Setting content type
					},
					body: JSON.stringify({ username, password }), // Sending username and password in request body
				});

				const data = await res.json(); // Parsing response JSON

				if (!res.ok) { // If response is not ok
					throw new Error(data.error || "Something went wrong"); // Throw an error with appropriate message
				}
			} catch (error) { // Catching any errors that occur during login
				throw new Error(error); // Throw an error with the error message
			}
		},
		onSuccess: () => { // Function to execute on successful login
			// refetch the authUser
			queryClient.invalidateQueries({ queryKey: ["authUser"] }); // Invalidate authUser query to trigger refetch
		},
	});

	const handleSubmit = (e) => { // Function to handle form submission
		e.preventDefault(); // Prevent default form submission behavior
		loginMutation(formData); // Call the loginMutation function with form data
	};

	const handleInputChange = (e) => { // Function to handle input change
		setFormData({ ...formData, [e.target.name]: e.target.value }); // Update form data with new input value
	};

	return (
		// Main container for login page
		<div className='max-w-screen-xl mx-auto flex h-screen'> 
		
			<div className='flex-1 hidden lg:flex items-center justify-center'> 
				<XSvg className='lg:w-2/3 fill-white' /> 
			</div>
			<div className='flex-1 flex flex-col justify-center items-center'> 
			{/* // Form element */}
				<form className='flex gap-4 flex-col' onSubmit={handleSubmit}> 
				{/* // Render SVG component for small screens */}
					<XSvg className='w-24 lg:hidden fill-white' /> 
					<h1 className='text-4xl font-extrabold text-white'>{"Let's"} go.</h1> 
					<label className='input input-bordered rounded flex items-center gap-2'> 
						<MdOutlineMail /> 
						<input
							type='text'
							className='grow'
							placeholder='username'
							name='username'
							onChange={handleInputChange}
							value={formData.username}
						/> 
					</label>

					<label className='input input-bordered rounded flex items-center gap-2'> 
					{/* // Render password icon */}
						<MdPassword /> 
						<input
							type='password'
							className='grow'
							placeholder='Password'
							name='password'
							onChange={handleInputChange}
							value={formData.password}
						/> 
					</label>
					<button className='btn rounded-full btn-primary text-white'>
					{/* // Render loading text if pending, otherwise 'Login' */}
						{isPending ? "Loading..." : "Login"} 
					</button>
					{isError && <p className='text-red-500'>{error.message}</p>} 
				</form>
				<div className='flex flex-col gap-2 mt-4'> 
					<p className='text-white text-lg'>{"Don't"} have an account?</p> 
					<Link to='/signup'> 
						<button className='btn rounded-full btn-primary text-white btn-outline w-full'>Sign up</button> 
					</Link>
				</div>
			</div>
		</div>
	);
};
export default LoginPage;
