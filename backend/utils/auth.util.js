import jwt from "jsonwebtoken";
import { CustomError } from "../errors/custom.error.js";
import { StatusCodes } from "http-status-codes";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

// export const createTokenPair = async (payload, privateKey) => {
//   try {
//     const accessToken = jwt.sign(
//       { userId: payload.userId, role: payload.role },
//       privateKey,
//       {
//         expiresIn: "1 day",
//         algorithm: "RS256",
//       }
//     );
//     const refreshToken = jwt.sign(
//       { userId: payload.userId, role: payload.role },
//       privateKey,
//       {
//         expiresIn: "7 days",
//         algorithm: "RS256",
//       }
//     );
//     return { accessToken, refreshToken };
//   } catch (error) {
//     throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
//   }
// };

//create function to create reset password token
export function createTokenResetPassword () {
  const resetPasswordToken = crypto.randomBytes(20).toString("hex");
  const resetTokenExpiration = new Date(Date.now() + 10 * 60 * 1000);
  return { resetPasswordToken, resetTokenExpiration };
};

// export const verifyJwt = async (token, publicKey) => {
//   try {
//     const decoded = jwt.verify(token, publicKey, {
//       algorithms: ["RS256"],
//     });
//     return decoded;
//   } catch (error) {
//     throw new CustomError(StatusCodes.UNAUTHORIZED, error.message)
//   }
// };

// export const generateJwt = async (payload) => {
//   try {
//     const token = jwt.sign(payload, process.env.JWT_SECRET, {
//       expiresIn: "1h",
//     });
//     return token;
//   } catch (error) {
//     throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
//   }
// }

export const generateJwt = async (payload) => {
  try {
      const accessToken = jwt.sign(payload, process.env.JWT_SECRET,{
          expiresIn: '1d',
          algorithm: 'HS256'
      });

      const refreshToken = jwt.sign(payload, process.env.JWT_SECRET,{
          expiresIn: '7d',
          algorithm: 'HS256'
      });
      return { accessToken, refreshToken };
  } catch (error) {
      console.log("error in generateJwt: ", error.message);
      throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
}

export const generateNewAccessToken = (userId, role) => {
  return new Promise((resolve, reject) => {
    jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: '1d' }, (error, token) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
  });
};


export const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
      if (error) {
        reject(error);
      } else {
        resolve(decoded);
      }
    });
  });
};
