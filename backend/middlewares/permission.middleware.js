import { StatusCodes } from "http-status-codes";
export const ROLE_LIST = {
  ADMIN: "admin",
  USER: "user",
  GUEST: "guest",
  SUPERADMIN: "superadmin",
  EMPLOYEE: "employee",
};

export const checkPermissions = (requiredPermissions) => {
    return (req, res, next) => {
        const userRole = req.user.role;
        console.log(userRole);
        
        if (!userRole || !requiredPermissions.includes(userRole)) {
            return res.status(StatusCodes.FORBIDDEN).json({ message: "Permission denied" });
        }
        
        next();
    };
};
