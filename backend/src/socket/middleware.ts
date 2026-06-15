import { Socket } from "socket.io";
import jwt from "jsonwebtoken";
export const socketAuthMiddleware = (socket: Socket, next: (err?: Error) => void) => {

    try {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error("Authentication error: No token provided"));
        }
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as any;
        socket.data.userId = decoded.id;
        next();
    }
    catch (err) {
        next(new Error("Authentication error : Invalid Token"));
    }

};