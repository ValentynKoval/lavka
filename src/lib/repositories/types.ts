import type { CatalogPage } from "@/lib/catalog/filter";
import type { CartLine, CatalogFilters, Product, ProductInput, Profile, Shop, ShopInput } from "@/lib/types";

/** Read-side access to the public catalogue. */
export interface CatalogRepository {
  listProducts(filters: CatalogFilters): Promise<CatalogPage>;
  getProductBySlug(slug: string): Promise<Product | null>;
  getProductsByIds(ids: string[]): Promise<Product[]>;
  getFeaturedProducts(limit: number): Promise<Product[]>;
  getNewProducts(limit: number): Promise<Product[]>;
  getRelatedProducts(product: Product, limit: number): Promise<Product[]>;
  getPriceBounds(): Promise<{ min: number; max: number }>;
  listShops(): Promise<Shop[]>;
  getShopBySlug(slug: string): Promise<Shop | null>;
  getShopProducts(shopId: string): Promise<Product[]>;
}

/** Write-side access for a master managing their own shop. */
export interface SellerRepository {
  getShopByOwner(ownerId: string): Promise<Shop | null>;
  createShop(ownerId: string, input: ShopInput): Promise<Shop>;
  updateShop(shopId: string, input: ShopInput): Promise<Shop>;
  getOwnProduct(shopId: string, productId: string): Promise<Product | null>;
  listOwnProducts(shopId: string): Promise<Product[]>;
  createProduct(shopId: string, input: ProductInput): Promise<Product>;
  updateProduct(shopId: string, productId: string, input: ProductInput): Promise<Product>;
  updateStock(shopId: string, productId: string, stock: number): Promise<void>;
  deleteProduct(shopId: string, productId: string): Promise<void>;
  /** Stores an image and returns its public URL. */
  uploadImage(ownerId: string, file: File): Promise<string>;
}

/** Favourites and cart persisted per account (only when a user is signed in). */
export interface UserDataRepository {
  getFavorites(userId: string): Promise<string[]>;
  setFavorite(userId: string, productId: string, on: boolean): Promise<void>;
  getCart(userId: string): Promise<CartLine[]>;
  setCartLine(userId: string, productId: string, quantity: number): Promise<void>;
  clearCart(userId: string): Promise<void>;
}

export interface AuthResult {
  error?: string;
  /** Set when the account was created but needs e-mail confirmation first. */
  needsConfirmation?: boolean;
}

export interface AuthService {
  getCurrentUser(): Promise<Profile | null>;
  signIn(email: string, password: string): Promise<AuthResult>;
  signUp(email: string, password: string, fullName: string): Promise<AuthResult>;
  signOut(): Promise<void>;
}
