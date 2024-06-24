import { Link } from "react-router-dom"; // Importing Link component from react-router-dom
import { useQuery } from "@tanstack/react-query"; // Importing useQuery hook from react-query

import useFollow from "../../hooks/useFollow"; // Importing useFollow custom hook

import RightPanelSkeleton from "../skeletons/RightPanelSkeleton"; // Importing RightPanelSkeleton component
import LoadingSpinner from "./LoadingSpinner"; // Importing LoadingSpinner component

const RightPanel = () => {
	// Fetching suggested users data using useQuery
	const { data: suggestedUsers, isLoading } = useQuery({
		queryKey: ["suggestedUsers"], // Unique key for the query
		queryFn: async () => {
			try {
				const res = await fetch("/api/users/suggested"); // Fetching suggested users from the API
				const data = await res.json(); // Parsing response JSON
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong!"); // Handling errors
				}
				return data; // Returning fetched data
			} catch (error) {
				throw new Error(error.message); // Throwing error if fetching fails
			}
		},
	});

	// Using custom hook to handle follow functionality
	const { follow, isPending } = useFollow();

	// If there are no suggested users, return an empty div
	if (suggestedUsers?.length === 0) return <div className='md:w-64 w-0'></div>;

	return (
		<div className='hidden lg:block my-4 mx-2'>
			<div className='bg-[#16181C] p-4 rounded-md sticky top-2'>
				<p className='font-bold'>Who to follow</p>
				<div className='flex flex-col gap-4'>
					{/* Render skeleton loaders while data is loading */}
					{isLoading && (
						<>
							<RightPanelSkeleton />
							<RightPanelSkeleton />
							<RightPanelSkeleton />
							<RightPanelSkeleton />
						</>
					)}
					{/* Render suggested users */}
					{!isLoading &&
						suggestedUsers?.map((user) => (
							<Link
								to={`/profile/${user.username}`} // Link to the profile of the suggested user
								className='flex items-center justify-between gap-4'
								key={user._id} // Unique key for each suggested user
							>
								<div className='flex gap-2 items-center'>
									<div className='avatar'>
										<div className='w-8 rounded-full'>
										{/* // Render profile image of the suggested user */}
											<img src={user.profileImg || "/avatar-placeholder.png"} alt='' /> 
										</div>
									</div>
									<div className='flex flex-col'>
										<span className='font-semibold tracking-tight truncate w-28'>
										{/* // Render full name of the suggested user */}
											{user.fullName} 
										</span>
										{/* // Render username of the suggested user */}
										<span className='text-sm text-slate-500'>@{user.username}</span> 
									</div>
								</div>
								<div>
									<button
										className='btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm'
										onClick={(e) => {
											e.preventDefault(); // Prevent default click behavior
											follow(user._id); // Call follow function to follow the suggested user
										}}
									>
										{/* // Render follow button or loading spinner if pending */}
										{isPending ? <LoadingSpinner size='sm' /> : "Follow"} 
									</button>
								</div>
							</Link>
						))}
				</div>
			</div>
		</div>
	);
};
export default RightPanel;
