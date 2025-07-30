export interface Product {
    id: string;
    name: string;
    price: number;
    description?: string;
    imageUrl?: string;
    category?: string;
    stock?: number;
}
export interface ProductState {
    products: Product[];
    loading: boolean;
    error: string | null;
    success: boolean;
}
export interface LoadProductsPayload {
    products: Product[];
}
export interface AddProductPayload {
    product: Product;
}
export interface UpdateProductPayload {
    productId: string;
    updates: Partial<Product>;
}
export interface RemoveProductPayload {
    productId: string;
}
