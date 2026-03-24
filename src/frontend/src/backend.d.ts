import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface SalonService {
    name: string;
    description: string;
    durationMinutes: bigint;
    category: ServiceCategory;
    price: bigint;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface InventoryItem {
    threshold: bigint;
    name: string;
    quantity: bigint;
    category: string;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Booking {
    status: BookingStatus;
    customer: Principal;
    stylistId: string;
    advancePayment: bigint;
    timestamp: Time;
    serviceId: string;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface StylistProfile {
    bio: string;
    name: string;
    experienceYears: bigint;
    beforeAfterPhotos: Array<ExternalBlob>;
    specialties: Array<string>;
    rating: number;
}
export enum BookingStatus {
    cancelled = "cancelled",
    pending = "pending",
    completed = "completed",
    confirmed = "confirmed"
}
export enum ServiceCategory {
    popular = "popular",
    seasonal = "seasonal",
    classic = "classic",
    trending = "trending"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addInventoryItem(item: InventoryItem): Promise<void>;
    addService(service: SalonService): Promise<void>;
    addStylist(stylist: StylistProfile): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createBooking(serviceId: string, stylistId: string, timestamp: Time, advancePayment: bigint): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    deleteInventoryItem(itemId: string): Promise<void>;
    deleteService(serviceId: string): Promise<void>;
    deleteStylist(stylistId: string): Promise<void>;
    getAllBookings(): Promise<Array<Booking>>;
    getBooking(bookingId: string): Promise<Booking>;
    getBookingsByStatus(status: BookingStatus): Promise<Array<Booking>>;
    getBookingsByStylist(stylistId: string): Promise<Array<Booking>>;
    getCallerUserRole(): Promise<UserRole>;
    getCustomerBookings(customer: Principal): Promise<Array<Booking>>;
    getDailyEarnings(): Promise<bigint>;
    getEarningsByCategory(): Promise<Array<[ServiceCategory, bigint]>>;
    getInventoryItems(): Promise<Array<InventoryItem>>;
    getLowStockItems(): Promise<Array<InventoryItem>>;
    getService(serviceId: string): Promise<SalonService | null>;
    getServices(): Promise<Array<SalonService>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getStylist(stylistId: string): Promise<StylistProfile | null>;
    getStylists(): Promise<Array<StylistProfile>>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateBookingStatus(bookingId: string, status: BookingStatus): Promise<void>;
    updateInventoryItem(item: InventoryItem): Promise<void>;
    updateService(service: SalonService): Promise<void>;
    updateStylist(stylist: StylistProfile): Promise<void>;
}
