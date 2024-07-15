import { verifyToken, generateNewAccessToken } from "../utils/auth.util.js";
import { StatusCodes } from "http-status-codes";

export const authenticateAccessToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }

  const token = authHeader.replace("Bearer ", "");
  try {
    const decoded = await verifyToken(token);
    req.user = decoded;
    const currentTimestamp = Math.floor(Date.now() / 1000);

    if (decoded.exp < currentTimestamp) {
      throw new Error('jwt expired');
    }

    return next();
  } catch (error) {
    if (error.message === 'jwt expired') {
      // Access token is expired, attempt to refresh using refresh token

      const refreshToken = req.headers['refresh-token']; // Extract refresh token from headers
      if (!refreshToken) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Refresh token missing' });
      }

      try {
        const refreshDecoded = await verifyToken(refreshToken); // Verify refresh token

        const { userId, role } = refreshDecoded;
        const newAccessToken = await generateNewAccessToken(userId, role); // Generate new access token

        // Attach new access token to response headers
        res.setHeader('authorization', `Bearer ${newAccessToken}`);
        req.user = { userId, role };


        return next();
      } catch (refreshError) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid refresh token' });
      }
    }

    return res.status(StatusCodes.UNAUTHORIZED).json({ message: error.message });
  }
};
