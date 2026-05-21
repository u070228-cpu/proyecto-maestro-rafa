import { Category, Product, User, Pedido, DetallePedido, InventarioItem, VentaItem } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  { id_categoria: 'C1', nombre_categoria: 'Bebidas', descripcion: 'Refrescos, jugos, aguas de sabor y bebidas energéticas' },
  { id_categoria: 'C2', nombre_categoria: 'Botanas', descripcion: 'Botanas saladas, papas sabritas, cacahuates y botanas de maíz' },
  { id_categoria: 'C3', nombre_categoria: 'Lácteos y Huevos', descripcion: 'Leche entera, quesos selectos, yogur y huevo fresco' },
  { id_categoria: 'C4', nombre_categoria: 'Limpieza', descripcion: 'Detergentes biodegradables, jabón líquido y limpiadores' },
  { id_categoria: 'C5', nombre_categoria: 'Frutas y verduras', descripcion: 'Manzanas frescas, aguacate del huerto y vegetales seleccionados' },
  { id_categoria: 'C6', nombre_categoria: 'Dulces y Galletas', descripcion: 'Chocolates crocantes, gomitas suaves y galletas con chispas' }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id_producto: 'P1',
    id: 'P1',
    nombre_producto: 'Leche Entera Alpura 1L',
    name: 'Leche Entera Alpura 1L',
    descripcion: 'Leche de vaca ultrapasteurizada adicionada con vitaminas A y D.',
    precio: 24.50,
    price: 24.50,
    stock: 50,
    foto: '🥛',
    codigo_barras: '7501020304051',
    marca: 'Alpura',
    disponible: true,
    id_categoria: 'C3',
    category: 'Lácteos y Huevos'
  },
  {
    id_producto: 'P2',
    id: 'P2',
    nombre_producto: 'Huevo Blanco Docena',
    name: 'Huevo Blanco Docena',
    descripcion: 'Doce piezas de huevo fresco seleccionado de granja de libre pastoreo.',
    precio: 42.00,
    price: 42.00,
    stock: 24,
    foto: '🥚',
    codigo_barras: '7501020304068',
    marca: 'San Juan',
    disponible: true,
    id_categoria: 'C3',
    category: 'Lácteos y Huevos'
  },
  {
    id_producto: 'P3',
    id: 'P3',
    nombre_producto: 'Refresco Coca-Cola 600ml',
    name: 'Refresco Coca-Cola 600ml',
    descripcion: 'Bebida carbonatada refrescante sabor cola original.',
    precio: 18.00,
    price: 18.00,
    stock: 60,
    foto: '🥤',
    codigo_barras: '7501020304075',
    marca: 'Coca-Cola',
    disponible: true,
    id_categoria: 'C1',
    category: 'Bebidas'
  },
  {
    id_producto: 'P4',
    id: 'P4',
    nombre_producto: 'Papas Sabritas con Sal 110g',
    name: 'Papas Sabritas con Sal 110g',
    descripcion: 'Deliciosas papas fritas naturales crujientes con sal.',
    precio: 19.50,
    price: 19.50,
    stock: 4, // Set low stock for verification (below minimum of 8)
    foto: '🥔',
    codigo_barras: '7501020304082',
    marca: 'Sabritas',
    disponible: true,
    id_categoria: 'C2',
    category: 'Botanas'
  },
  {
    id_producto: 'P5',
    id: 'P5',
    nombre_producto: 'Lavatrastes Salvo Gel 900ml',
    name: 'Lavatrastes Salvo Gel 900ml',
    descripcion: 'Jabón en gel de alto rendimiento con activo cortagrasa cítrico.',
    precio: 32.00,
    price: 32.00,
    stock: 9,
    foto: '🧴',
    codigo_barras: '7501020304099',
    marca: 'Salvo',
    disponible: true,
    id_categoria: 'C4',
    category: 'Limpieza'
  },
  {
    id_producto: 'P6',
    id: 'P6',
    nombre_producto: 'Aguacate Hass Premium 1kg',
    name: 'Aguacate Hass Premium 1kg',
    descripcion: 'Aguacates cremosos seleccionados de Michoacán.',
    precio: 45.00,
    price: 45.00,
    stock: 15,
    foto: '🥑',
    codigo_barras: '7501020304105',
    marca: 'Campo Fresco',
    disponible: true,
    id_categoria: 'C5',
    category: 'Frutas y verduras'
  },
  {
    id_producto: 'P7',
    id: 'P7',
    nombre_producto: 'Chocolates M&M con Cacahuate',
    name: 'Chocolates M&M con Cacahuate',
    descripcion: 'Pralinés de cacahuate cubiertos de chocolate de leche.',
    precio: 16.00,
    price: 16.00,
    stock: 35,
    foto: '🍫',
    codigo_barras: '7501020304112',
    marca: 'Mars',
    disponible: true,
    id_categoria: 'C6',
    category: 'Dulces y Galletas'
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: '1',
    id_usuario: '1',
    username: 'Admin #04',
    nombre: 'Admin #04',
    email: 'admin@cetis7.edu.mx',
    correo: 'admin@cetis7.edu.mx',
    password: 'admin123',
    role: 'Administrador',
    tipo_usuario: 'administrador',
    status: 'approved',
    phone: '55-1234-5678',
    telefono: '55-1234-5678',
    address: 'Administración Cetis 7',
    direccion: 'Administración Cetis 7'
  },
  {
    id: '2',
    id_usuario: '2',
    username: 'Empleado_Ventas',
    nombre: 'Empleado_Ventas',
    email: 'empleado@cetis7.edu.mx',
    correo: 'empleado@cetis7.edu.mx',
    password: 'ventas123',
    role: 'Empleado',
    tipo_usuario: 'empleado',
    status: 'approved',
    phone: '55-2345-6789',
    telefono: '55-2345-6789',
    address: 'Mostrador Central Abarrotes',
    direccion: 'Mostrador Central Abarrotes'
  },
  {
    id: '3',
    id_usuario: '3',
    username: 'Cliente_Demo',
    nombre: 'Cliente_Demo',
    email: 'cliente@cetis7.edu.mx',
    correo: 'cliente@cetis7.edu.mx',
    password: 'cliente123',
    role: 'Cliente',
    tipo_usuario: 'cliente',
    status: 'approved',
    phone: '55-3456-7890',
    telefono: '55-3456-7890',
    address: 'Av. Paseo Verde #450 Int. B',
    direccion: 'Av. Paseo Verde #450 Int. B'
  }
];

export const INITIAL_PEDIDOS: Pedido[] = [
  {
    id_pedido: 'PED-001',
    id_usuario: '3',
    nombre_usuario: 'Cliente_Demo',
    fecha_pedido: '2026-05-20',
    estado_pedido: 'entregado',
    metodo_pago: 'efectivo',
    total: 91.00
  },
  {
    id_pedido: 'PED-002',
    id_usuario: '3',
    nombre_usuario: 'Cliente_Demo',
    fecha_pedido: '2026-05-21',
    estado_pedido: 'pendiente',
    metodo_pago: 'tarjeta',
    total: 42.50
  }
];

export const INITIAL_DETALLES: DetallePedido[] = [
  {
    id_detalle: 'D1',
    id_pedido: 'PED-001',
    id_producto: 'P1',
    nombre_producto: 'Leche Entera Alpura 1L',
    cantidad: 2,
    precio_unitario: 24.50,
    subtotal: 49.00
  },
  {
    id_detalle: 'D2',
    id_pedido: 'PED-001',
    id_producto: 'P2',
    nombre_producto: 'Huevo Blanco Docena',
    cantidad: 1,
    precio_unitario: 42.00,
    subtotal: 42.00
  },
  {
    id_detalle: 'D3',
    id_pedido: 'PED-002',
    id_producto: 'P1',
    nombre_producto: 'Leche Entera Alpura 1L',
    cantidad: 1,
    precio_unitario: 24.50,
    subtotal: 24.50
  },
  {
    id_detalle: 'D4',
    id_pedido: 'PED-002',
    id_producto: 'P3',
    nombre_producto: 'Refresco Coca-Cola 600ml',
    cantidad: 1,
    precio_unitario: 18.00,
    subtotal: 18.00
  }
];

export const INITIAL_INVENTARIO: InventarioItem[] = [
  { id_inventario: 'INV-1', id_producto: 'P1', nombre_producto: 'Leche Entera Alpura 1L', cantidad_actual: 50, stock_minimo: 10, proveedor: 'Distribuidora Lácteos Monterrey S.A.', fecha_actualizacion: '2026-05-21' },
  { id_inventario: 'INV-2', id_producto: 'P2', nombre_producto: 'Huevo Blanco Docena', cantidad_actual: 24, stock_minimo: 5, proveedor: 'Avícola San Cristóbal Valle', fecha_actualizacion: '2026-05-21' },
  { id_inventario: 'INV-3', id_producto: 'P3', nombre_producto: 'Refresco Coca-Cola 600ml', cantidad_actual: 60, stock_minimo: 15, proveedor: 'Coca-Cola FEMSA S.A. de C.V.', fecha_actualizacion: '2026-05-21' },
  { id_inventario: 'INV-4', id_producto: 'P4', nombre_producto: 'Papas Sabritas con Sal 110g', cantidad_actual: 4, stock_minimo: 8, proveedor: 'PepsiCo Alimentos México', fecha_actualizacion: '2026-05-20' },
  { id_inventario: 'INV-5', id_producto: 'P5', nombre_producto: 'Lavatrastes Salvo Gel 900ml', cantidad_actual: 9, stock_minimo: 5, proveedor: 'Procter and Gamble S.C.', fecha_actualizacion: '2026-05-20' },
  { id_inventario: 'INV-6', id_producto: 'P6', nombre_producto: 'Aguacate Hass Premium 1kg', cantidad_actual: 15, stock_minimo: 5, proveedor: 'Frutícolas Uruapan Selectos', fecha_actualizacion: '2026-05-21' },
  { id_inventario: 'INV-7', id_producto: 'P7', nombre_producto: 'Chocolates M&M con Cacahuate', cantidad_actual: 35, stock_minimo: 10, proveedor: 'Distribuidora Mars Dulces', fecha_actualizacion: '2026-05-19' }
];

export const INITIAL_VENTAS: VentaItem[] = [
  { id_venta: 'VTA-001', id_pedido: 'PED-001', fecha: '2026-05-20', total: 91.00 },
  { id_venta: 'VTA-002', id_pedido: 'PED-002', fecha: '2026-05-21', total: 42.50 }
];
