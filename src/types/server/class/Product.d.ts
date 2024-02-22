import { Prisma } from "@prisma/client";
import { product as include } from "../prisma/include";
import { Category } from "./Category";
import { Supplier } from "./Supplier";
import { Socket } from "socket.io";
import { Dimensions } from "./Dimensions";
import { Image } from "./Image";
import { Variation } from "./Variation";
import { WithoutFunctions } from "./methodizer";
export type ProductPrisma = Prisma.ProductGetPayload<{
    include: typeof include;
}>;
export type ProductForm = Omit<WithoutFunctions<Product>, "id" | "active" | "rating" | "ratings" | "sold" | "dimensions_id" | "supplier"> & {
    id?: number;
    active?: boolean;
    rating?: number;
    ratings?: number;
    sold?: number;
    dimensions_id?: number;
};
export declare class Product {
    id: number;
    active: boolean;
    sku: string;
    name: string;
    description: string;
    technical: string;
    brand: string;
    stock: number;
    price: number;
    promotion: number;
    profit: number;
    cost: number;
    rating: number;
    ratings: number;
    sold: number;
    categories: Category[];
    supplier_id: number;
    supplier: Supplier;
    dimensions_id: number;
    dimensions: Dimensions;
    gallery: Image[];
    variations: Variation[];
    constructor(id: number);
    init(): Promise<void>;
    static list(socket: Socket): Promise<void>;
    static new(socket: Socket, data: ProductForm): Promise<void>;
    load(data: ProductPrisma): this;
}
