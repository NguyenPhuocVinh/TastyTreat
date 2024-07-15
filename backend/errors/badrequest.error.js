import { CustomError } from "./custom.error.js";
import { StatusCodes, getReasonPhrase } from "http-status-codes";

export class BadRequestError extends CustomError {
  constructor(message = getReasonPhrase(StatusCodes.BAD_REQUEST)) {
    super(message, StatusCodes.BAD_REQUEST);
  }
}
