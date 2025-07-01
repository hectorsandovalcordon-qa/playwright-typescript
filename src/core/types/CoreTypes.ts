export interface TestEnvironment {
  name: string;
  baseUrl: string;
  apiUrl?: string;
  database?: DatabaseConfig;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

export interface TestData {
  users: UserData[];
  products: ProductData[];
  [key: string]: any;
}

export interface UserData {
  username: string;
  password: string;
  email: string;
  role: string;
}

export interface ProductData {
  id: string;
  name: string;
  price: number;
  category: string;
}
