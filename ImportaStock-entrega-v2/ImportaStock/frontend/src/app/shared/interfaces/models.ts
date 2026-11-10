export interface Proveedor { id?: number; codigo: string; razonSocial: string; pais: string; contacto?: string; email?: string; telefono?: string; direccion?: string; activo: boolean; }
export interface Categoria { id?: number; nombre: string; descripcion?: string; }
export interface Producto { id?: number; sku: string; nombre: string; descripcion?: string; categoria?: Categoria; categoriaId?: number; marca?: string; paisOrigen?: string; unidad: string; precioReferencia: number; stockMinimo: number; stockActual?: number; activo: boolean; }
export interface DetalleImportacion { id?: number; producto: Producto; cantidadSolicitada: number; cantidadRecibida: number; precioUnitario: number; subtotal: number; }
export interface Importacion { id?: number; numero: string; proveedor: Proveedor; fechaRegistro: string; fechaPrevista?: string; moneda: string; estado: string; total: number; detalles: DetalleImportacion[]; }
