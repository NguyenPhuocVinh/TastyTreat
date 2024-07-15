import { CustomError } from "./custom.error.js";
import { StatusCodes, getReasonPhrase } from "http-status-codes";

export class UnauthenticatedError extends CustomError {
  constructor(message = getReasonPhrase(StatusCodes.UNAUTHORIZED)) {
    super(message, StatusCodes.UNAUTHORIZED);
  }
}
