import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getCurrentUser, type User } from "../api/users";

export type UserRole = "admin" | "teacher" | "student";

interface AuthContextValue {
    user: User | null;
    role: UserRole | null;
    loading: boolean;
    refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const refresh = async () => {
        try {
            const token = localStorage.getItem("access_token");
            if (!token) {
                setUser(null);
                return;
            }
            const data = await getCurrentUser();
            setUser(data);
        } catch {
            setUser(null);
            localStorage.removeItem("access_token");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void refresh();
    }, []);

    const role = user?.role ?? null;

    return (
        <AuthContext.Provider value={{ user, role, loading, refresh }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return ctx;
}

// Helper hooks for role checks
export function useIsAdmin(): boolean {
    const { role } = useAuth();
    return role === "admin";
}

export function useIsTeacher(): boolean {
    const { role } = useAuth();
    return role === "teacher";
}

export function useIsStudent(): boolean {
    const { role } = useAuth();
    return role === "student";
}

export function useCanEdit(): boolean {
    const { role } = useAuth();
    return role === "admin" || role === "teacher";
}
