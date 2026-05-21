/**
 * Shared Type Definitions for the Abarrotes Store Management System
 */

export interface User {
  id: string;
  id_usuario: string; // relational key
  username: string; // local alias context
  nombre: string; // relational key
  email: string;
  correo: string; // relational key
  role: 'Administrador' | 'Cliente' | 'Empleado';
  tipo_usuario: 'administrador' | 'cliente' | 'empleado'; // relational key
  phone?: string;
  telefono?: string; // relational key
  address?: string;
  direccion?: string; // relational key
  status: 'approved' | 'pending' | 'denied';
  password?: string;
}

export interface Category {
  id_categoria: string;
  nombre_categoria: string;
  descripcion: string;
}

export interface Product {
  id_producto: string;
  id: string; // alias for compatibility
  nombre_producto: string;
  name: string; // alias for compatibility
  descripcion: string;
  precio: number;
  price: number; // alias for compatibility
  stock: number;
  foto: string;
  codigo_barras: string;
  marca: string;
  disponible: boolean;
  id_categoria: string;
  category: string; // alias for compatibility (Category Name)
}

export interface Pedido {
  id_pedido: string;
  id_usuario: string; // FK
  nombre_usuario?: string; // Denormalized for display ease
  fecha_pedido: string;
  estado_pedido: 'pendiente' | 'preparando' | 'enviado' | 'entregado' | 'cancelado';
  metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia';
  total: number;
}

export interface DetallePedido {
  id_detalle: string;
  id_pedido: string; // FK
  id_producto: string; // FK
  nombre_producto?: string; // Cache Join
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface InventarioItem {
  id_inventario: string;
  id_producto: string; // FK
  nombre_producto?: string; // Cache Join
  cantidad_actual: number;
  stock_minimo: number;
  proveedor: string;
  fecha_actualizacion: string;
}

export interface VentaItem {
  id_venta: string;
  id_pedido: string; // FK
  fecha: string;
  total: number;
}

export type Screen = 'welcome' | 'register' | 'sales' | 'users' | 'login' | 'landing' | 'signup' | 'db';
export type AppTheme = 'cyber' | 'market';
