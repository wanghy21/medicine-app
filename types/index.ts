/**
 * 药品管理系统 - 类型定义
 */

// 药品类型
export interface Medicine {
  id: string;
  name: string;           // 药品名称
  code: string;           // 药品编码/条形码
  category: string;       // 药品分类
  spec: string;           // 规格
  unit: string;           // 单位
  price: number;          // 销售价格
  cost: number;           // 进货成本
  manufacturer: string;   // 生产商
  description: string;    // 药品说明
  stock: number;          // 当前库存
  minStock: number;       // 最低库存预警
  expiryDate: string;     // 有效期
  createdAt: string;
  updatedAt: string;
}

// 仓库类型
export interface Warehouse {
  id: string;
  name: string;           // 仓库名称
  location: string;       // 仓库位置
  capacity: number;       // 容量
  currentStock: number;   // 当前库存总量
  manager: string;        // 管理员
  phone: string;          // 联系电话
  description: string;    // 仓库说明
  createdAt: string;
  updatedAt: string;
}

// 客户类型
export interface Client {
  id: string;
  name: string;           // 客户名称
  type: 'retail' | 'wholesale' | 'hospital' | 'clinic';  // 客户类型
  phone: string;          // 联系电话
  address: string;        // 地址
  email: string;          // 邮箱
  credit: number;         // 信用额度
  balance: number;        // 账户余额
  totalPurchases: number; // 累计购买金额
  description: string;    // 备注
  createdAt: string;
  updatedAt: string;
}

// 交易记录类型
export interface Transaction {
  id: string;
  type: 'in' | 'out' | 'return' | 'adjust';  // 交易类型：入库、出库、退货、调整
  medicineId: string;     // 药品ID
  medicineName: string;   // 药品名称（冗余存储）
  warehouseId: string;    // 仓库ID
  warehouseName: string;  // 仓库名称（冗余存储）
  clientId: string;       // 客户ID（出库时）
  clientName: string;     // 客户名称（冗余存储）
  quantity: number;       // 数量
  unitPrice: number;      // 单价
  totalAmount: number;    // 总金额
  batchNo: string;        // 批次号
  operator: string;       // 操作员
  remark: string;         // 备注
  createdAt: string;
}

// 库存记录类型
export interface StockRecord {
  id: string;
  medicineId: string;
  medicineName: string;
  warehouseId: string;
  warehouseName: string;
  quantity: number;
  batchNo: string;
  expiryDate: string;
  createdAt: string;
  updatedAt: string;
}

// 统计报表类型
export interface Statistics {
  totalMedicines: number;      // 药品总数
  totalStockValue: number;     // 库存总价值
  totalClients: number;        // 客户总数
  todayTransactions: number;   // 今日交易数
  todayInAmount: number;       // 今日入库金额
  todayOutAmount: number;      // 今日出库金额
  monthlySales: number;        // 月销售额
  lowStockMedicines: number;   // 低库存药品数
  expiringMedicines: number;   // 即将过期药品数
}

// 查询参数类型
export interface QueryParams {
  keyword?: string;
  category?: string;
  warehouseId?: string;
  startDate?: string;
  endDate?: string;
  type?: string;
  page?: number;
  pageSize?: number;
}

// 分页结果类型
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 操作结果类型
export interface OperationResult {
  success: boolean;
  message: string;
  data?: any;
}
