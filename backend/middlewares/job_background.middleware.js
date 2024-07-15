import { authServices } from '../services/auth.service.js';

export const jobBackgroundMiddleware = async () =>{
    const thresholdTime = new Date(Date.now() - 5 * 60 * 1000);
    const result = await authServices.deleteUserNotVerify(thresholdTime);
}