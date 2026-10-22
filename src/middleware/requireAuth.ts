import { NextFunction, Request , Response } from "express";
import { verifyAccessToken } from "../lib/token";
import { User } from "../models/user.model";

async function requireAuth(req: Request, res: Response , next: NextFunction){
    const authHeader = req.headers.authorization;
     if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({message : "you are not auth user, you cant enter the building"});
     }
     const token = authHeader.split(" ")[1];
    try{
        const payload = verifyAccessToken(token);
        const user = await User.findById(payload.sub);

        if(!user){
            return res.status(401).json({
                "message":"user not authenticated"
            })
        }
        if(user.tokenVersion !== payload.tokenVersion){
            return res.status(401).json({
                message : 'token Invalidated'
            })
        }
        const authReq = req as any;
        authReq.user = {
            id : user.id,
            email : user.email,
            name : user.name,
            role : user.role,
            isEmailVerified : user.isEmailVerified
        }
        next()

    }catch(error){
        return res.status(401).json(
            {message : "Invalid Token"}
        )
    }

}

export default requireAuth;