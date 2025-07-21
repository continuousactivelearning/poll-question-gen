import { FirebaseAuthService } from "#root/modules/auth/services/FirebaseAuthService.js";
import { getFromContainer } from "routing-controllers";

export async function authorizationChecker(action, roles: string[]): Promise<boolean> {
    const firebaseAuthService = getFromContainer(FirebaseAuthService);
    const token = action.request.headers.authorization?.split(' ')[1];
    console.log('Authorization token:', token);
    if (!token) {
        return false; // No token provided
    }
    try {
        const user = await firebaseAuthService.getCurrentUserFromToken(token);

        // If no specific roles are required, just allow
        if (roles.length === 0) return true;
        // Check if user's role matches one of the required roles
        return roles.includes(user.role);
    }
    catch (error) {
        console.log('Authorization error:', error);
        return false; // Invalid token or user not found
    }
    return true; // Authorization successful
}