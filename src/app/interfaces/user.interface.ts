export interface User {
    id: string;
    email: string;
    name: string;
    coins: number;
    isGuest?: boolean;
} 