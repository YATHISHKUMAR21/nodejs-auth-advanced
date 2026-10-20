import { NextFunction, Request , Response } from "express";

async function requireAuth(req: Request, res: Response , next: NextFunction){
    const authHeader = req.headers.authorization;
     if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({message : "you are not auth user, you cant enter the building"});
     }
     const token = authHeader.split(" ")[1];
    try{
        
    }catch(error){

    }

}