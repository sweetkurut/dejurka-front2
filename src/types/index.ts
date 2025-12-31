export interface User {
    id: string;
    email: string;
    fullName: string;
    role: "admin" | "agent";
    apartmentCount: number;
    isActive: boolean;
    createdAt: string;
}

export interface Apartment {
    id: string;
    series: string;
    buildingCompany?: string;
    residentialComplex?: string;
    section?: "corner" | "not-corner";
    repair: "designer" | "euro" | "good" | "cosmetic" | "pso" | "old";
    district: string;
    address: string;
    rooms: 1 | 2 | 3 | 4 | 5;
    totalArea: number;
    floor: number;
    totalFloors: number;
    isBasement: boolean;
    isPenthouse: boolean;
    documents: string[];
    heating: string;
    description: string;
    furniture: "full" | "partial" | "none";
    price: number;
    priceNet?: number;
    photos: string[];
    userId: string;
    user: User;
    createdAt: string;
    updatedAt: string;
}

export interface Directory {
    id: string;
    name: string;
    type: "series" | "district" | "document" | "heating";
    createdAt: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isLoading: boolean;
    error: string | null;
    initialized: boolean;
}

export interface Theme {
    mode: "light" | "dark";
}

export interface ApartmentFilters {
    search?: string;
    series?: string;
    district?: string;
    rooms?: number;
    priceMin?: number;
    priceMax?: number;
    userId?: string;
}

export interface TableColumn {
    key: string;
    dataIndex: string;
    title: string;
    sorter?: boolean;
    filterable?: boolean;
    render?: (value: any, record: any) => React.ReactNode;
}

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: ("admin" | "agent")[];
    requireAuth?: boolean;
}
