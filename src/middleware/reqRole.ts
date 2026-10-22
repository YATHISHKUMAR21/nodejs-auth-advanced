import { NextFunction, Request , Response } from "express";

function requireRole(role : 'user'| 'admin'){
    return (req: Request , res: Response , next: NextFunction)=>{
        const authReq = req as any;
        const authUser = authReq.user;
        if(!authUser){
            return res.status(401).json({
                message : "you are not auth User , you cannot enter the building"
            })
        }
        if(authUser.role!=role){
            return res.status(403).json({
                message: "You dont have the correct role to access"
            })
        }
        next();

    }
}

export default requireRole;