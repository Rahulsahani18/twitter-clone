import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (userId, res) => {
	const secret= process.env.JWT_SECRET || '5jhzbbzOTU8okF43mlAijE4i7+6/lH8Ph4Y0cv8iOMc='
	const token = jwt.sign({ userId }, secret, {
		expiresIn: "15d",

	});
     console.log(token);
	res.cookie("jwt", token, {
		maxAge: 15 * 24 * 60 * 60 * 1000, //MS
		httpOnly: true, // prevent XSS attacks cross-site scripting attacks
		sameSite: "strict", // CSRF attacks cross-site request forgery attacks
		secure: process.env.NODE_ENV !== "development",
	});
};
