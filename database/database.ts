/**
 * 药品管理系统 - 数据库模块
 */
import * as SQLite from 'expo-sqlite/legacy';
import { v4 as uuidv4 } from 'uuid';
import type {
  Medicine,
  Warehouse,
  Client,
  Transaction,
  StockRecord
} from '../types';

// 打开数据库
const db = SQLite.openDatabase('medicine.db');

/**
 * 初始化数据库表
 */
export const initDatabase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // 药品表
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS medicines (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          code TEXT UNIQUE NOT NULL,
          category TEXT,
          spec TEXT,
          unit TEXT,
          price REAL,
          cost REAL,
          manufacturer TEXT,
          description TEXT,
          stock INTEGER DEFAULT 0,
          minStock INTEGER DEFAULT 0,
          expiryDate TEXT,
          createdAt TEXT,
          updatedAt TEXT
        )`
      );

      // 仓库表
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS warehouses (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          location TEXT,
          capacity INTEGER,
          currentStock INTEGER DEFAULT 0,
          manager TEXT,
          phone TEXT,
          description TEXT,
          createdAt TEXT,
          updatedAt TEXT
        )`
      );

      // 客户表
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS clients (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          type TEXT,
          phone TEXT,
          address TEXT,
          email TEXT,
          credit REAL DEFAULT 0,
          balance REAL DEFAULT 0,
          totalPurchases REAL DEFAULT 0,
          description TEXT,
          createdAt TEXT,
          updatedAt TEXT
        )`
      );

      // 交易记录表
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS transactions (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL,
          medicineId TEXT,
          medicineName TEXT,
          warehouseId TEXT,
          warehouseName TEXT,
          clientId TEXT,
          clientName TEXT,
          quantity INTEGER,
          unitPrice REAL,
          totalAmount REAL,
          batchNo TEXT,
          operator TEXT,
          remark TEXT,
          createdAt TEXT,
          FOREIGN KEY (medicineId) REFERENCES medicines(id),
          FOREIGN KEY (warehouseId) REFERENCES warehouses(id),
          FOREIGN KEY (clientId) REFERENCES clients(id)
        )`
      );

      // 库存记录表
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS stock_records (
          id TEXT PRIMARY KEY,
          medicineId TEXT,
          medicineName TEXT,
          warehouseId TEXT,
          warehouseName TEXT,
          quantity INTEGER,
          batchNo TEXT,
          expiryDate TEXT,
          createdAt TEXT,
          updatedAt TEXT,
          FOREIGN KEY (medicineId) REFERENCES medicines(id),
          FOREIGN KEY (warehouseId) REFERENCES warehouses(id)
        )`
      );
    },
    (error) => {
      console.error('数据库初始化失败:', error);
      reject(error);
    },
    () => {
      console.log('数据库初始化成功');
      resolve();
    });
  });
};

/**
 * 获取当前时间字符串
 */
const getCurrentTime = (): string => {
  return new Date().toISOString();
};

// ==================== 药品操作 ====================

export const medicineOperations = {
  add: (medicine: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>): Promise<Medicine> => {
    return new Promise((resolve, reject) => {
      const newMedicine: Medicine = {
        ...medicine,
        id: uuidv4(),
        createdAt: getCurrentTime(),
        updatedAt: getCurrentTime(),
      };
      db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO medicines (id, name, code, category, spec, unit, price, cost, manufacturer, description, stock, minStock, expiryDate, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            newMedicine.id,
            newMedicine.name,
            newMedicine.code,
            newMedicine.category,
            newMedicine.spec,
            newMedicine.unit,
            newMedicine.price,
            newMedicine.cost,
            newMedicine.manufacturer,
            newMedicine.description,
            newMedicine.stock,
            newMedicine.minStock,
            newMedicine.expiryDate,
            newMedicine.createdAt,
            newMedicine.updatedAt,
          ],
          (_, result) => resolve(newMedicine),
          (_, error) => { reject(error); return false; }
        );
      });
    });
  },

  update: (id: string, data: Partial<Medicine>): Promise<Medicine | null> => {
    return new Promise((resolve, reject) => {
      const updates: string[] = [];
      const values: any[] = [];

      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'id' && key !== 'createdAt') {
          updates.push(`${key} = ?`);
          values.push(value);
        }
      });

      updates.push(`updatedAt = '${getCurrentTime()}'`);
      values.push(id);

      db.transaction(tx => {
        tx.executeSql(
          `UPDATE medicines SET ${updates.join(', ')} WHERE id = ?`,
          values,
          (_, result) => {
            if (result.rowsAffected > 0) {
              medicineOperations.getById(id).then(resolve).catch(reject);
            } else {
              resolve(null);
            }
          },
          (_, error) => { reject(error); return false; }
        );
      });
    });
  },

  delete: (id: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM medicines WHERE id = ?',
          [id],
          (_, result) => resolve(result.rowsAffected > 0),
          (_, error) => { reject(error); return false; }
        );
      });
    });
  },

  getById: (id: string): Promise<Medicine | null> => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM medicines WHERE id = ?',
          [id],
          (_, result) => {
            const rows = result.rows;
            if (rows.length > 0) {
              resolve(rows.item(0) as Medicine);
            } else {
              resolve(null);
            }
          },
          (_, error) => { reject(error); return false; }
        );
      });
    });
  },

  getByCode: (code: string): Promise<Medicine | null> => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM medicines WHERE code = ?',
          [code],
          (_, result) => {
            const rows = result.rows;
            if (rows.length > 0) {
              resolve(rows.item(0) as Medicine);
            } else {
              resolve(null);
            }
          },
          (_, error) => { reject(error); return false; }
        );
      });
    });
  },

  getAll: (keyword?: string): Promise<Medicine[]> => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        let sql = 'SELECT * FROM medicines';
        const params: string[] = [];

        if (keyword) {
          sql += ' WHERE name LIKE ? OR code LIKE ? OR category LIKE ?';
          const searchTerm = `%${keyword}%`;
          params.push(searchTerm, searchTerm, searchTerm);
        }

        sql += ' ORDER BY createdAt DESC';

        tx.executeSql(
          sql,
          params,
          (_, result) => {
            const medicines: Medicine[] = [];
            for (let i = 0; i < result.rows.length; i++) {
              medicines.push(result.rows.item(i) as Medicine);
            }
            resolve(medicines);
          },
          (_, error) => { reject(error); return false; }
        );
      });
    });
  },

  getLowStock: (): Promise<Medicine[]> => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM medicines WHERE stock <= minStock ORDER BY stock ASC',
          [],
          (_, result) => {
            const medicines: Medicine[] = [];
            for (let i = 0; i < result.rows.length; i++) {
              medicines.push(result.rows.item(i) as Medicine);
            }
            resolve(medicines);
          },
          (_, error) => { reject(error); return false; }
        );
      });
    });
  },

  getExpiringSoon: (days: number = 30): Promise<Medicine[]> => {
    return new Promise((resolve, reject) => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM medicines
           WHERE expiryDate <= ?
           ORDER BY expiryDate ASC`,
          [futureDate.toISOString().split('T')[0]],
          (_, result) => {
            const medicines: Medicine[] = [];
            for (let i = 0; i < result.rows.length; i++) {
              medicines.push(result.rows.item(i) as Medicine);
            }
            resolve(medicines);
          },
          (_, error) => { reject(error); return false; }
        );
      });
    });
  },

  updateStock: (id: string, quantity: number): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'UPDATE medicines SET stock = stock + ?, updatedAt = ? WHERE id = ?',
          [quantity, getCurrentTime(), id],
          (_, result) => resolve(result.rowsAffected > 0),
          (_, error) => { reject(error); return false; }
        );
      });
    });
  },
};

// ==================== 仓库操作 ====================

export const warehouseOperations = {
  add: (warehouse: Omit<Warehouse, 'id' | 'createdAt' | 'updatedAt'>): Promise<Warehouse> => {
    return new Promise((resolve, reject) => {
      const newWarehouse: Warehouse = {
        ...warehouse,
        id: uuidv4(),
        createdAt: getCurrentTime(),
        updatedAt: getCurrentTime(),
      };
      db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO warehouses (id, name, location, capacity, currentStock, manager, phone, description, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            newWarehouse.id,
            newWarehouse.name,
            newWarehouse.location,
            newWarehouse.capacity,
            newWarehouse.currentStock,
            newWarehouse.manager,
            newWarehouse.phone,
            newWarehouse.description,
            newWarehouse.createdAt,
            newWarehouse.updatedAt,
          ],
          (_, result) => resolve(newWarehouse),
          (_, error) => { reject(error); return false; }
        );
      });
    });
  },

  update: (id: string, data: Partial<Warehouse>): Promise<Warehouse | null> => {
    return new Promise((resolve, reject) => {
      const updates: string[] = [];
      const values: any[] = [];

      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'id' && key !== 'createdAt') {
          updates.push(`${key} = ?`);
          values.push(value);
        }
      });

      updates.push(`updatedAt = '${getCurrentTime()}'`);
      values.push(id);

      db.transaction(tx => {
        tx.executeSql(
          `UPDATE warehouses SET ${updates.join(', ')} WHERE id = ?`,
          values,
          (_, result) => {
            if (result.rowsAffected > 0) {
              warehouseOperations.getById(id).then(resolve).catch(reject);
            } else {
              resolve(null);
            }
          },
          (_, error) => { reject(error); return false; }
        );
      });
    });
  },

  delete: (id: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM warehouses WHERE id = ?',
          [id],
          (_, result) => resolve(result.rowsAffected > 0),
          (_, error) => { reject(error); return false; }
        );
      });
    });
  },

  getById: (id: string): Promise<Warehouse | null> => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM warehouses WHERE id = ?',
          [id],
          (_, result) => {
            const rows = result.rows;
            if (rows.length > 0) {
              resolve(rows.item(0) as Warehouse);
            } else {
              resolve(null);
            }
          },
          (_, error) => { reject(error); return false; }
        );
      });
    });
  },

  getAll: (): Promise<Warehouse[]> => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM warehouses ORDER BY name ASC',
          [],
          (_, result) => {
            const warehouses: Warehouse[] = [];
            for (let i = 0; i < result.rows.length; i++) {
              warehouses.push(result.rows.item(i) as Warehouse);
            }
            resolve(warehouses);
          },
          (_, error) => { reject(error); return false; }
        );
      });
    });
  },
};

// ==================== 客户操作 ====================

export const clientOperations = {
  add: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> => {
    return new Promise((resolve, reject) => {
      const newClient: Client = {
        ...client,
        id: uuidv4(),
        createdAt: getCurrentTime(),
        updatedAt: getCurrentTime(),
      };
      db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO clients (id, name, type, phone, address, email, credit, balance, totalPurchases, description, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            newClient.id,
            newClient.name,
            newClient.type,
            newClient.phone,
            newClient.address,
            newClient.email,
            newClient.credit,
            newClient.balance,
            newClient.totalPurchases,
            newClient.description,
            newClient.createdAt,
            newClient.updatedAt,
          ],
          (_, result) => resolve(newClient),
          (_, error) => { reject(error); return false; }
        );
      });
    });
  },

  update: (id: string, data: Partial<Client>): Promise<Client | null> => {
    return new Promise((resolve, reject) => {
      const updates: string[] = [];
      const values: any[] = [];

      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'id' && key !== 'createdAt') {
          updates.push(`${key} = ?`);
          values.push(value);
        }
      });

      updates.push(`updatedAt = '${getCurrentTime()}'`);
      values.push(id);

      db.transaction(tx => {
        tx.executeSql(
          `UPDATE clients SET ${updates.join(', ')} WHERE id = ?`,
          values,
          (_, result) => {
            if (result.rowsAffected > 0) {
              clientOperations.getById(id).then(resolve).catch(reject);
            } else {
              resolve(null);
            }
          },
          (_, error) => { reject(error); return false; }
        );
      });
    });
  },

  delete: (id: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM clients WHERE id = ?',
          [id],
          (_, result) => resolve(result.rowsAffected > 0),
          (_, error) => { reject(error); return false; }
        );
      });
    });
  },

  getById: (id: string): Promise<Client | null> => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM clients WHERE id = ?',
          [id],
          (_, result) => {
            const rows = result.rows;
            if (rows.length > 0) {
              resolve(rows.item(0) as Client);
            } else {
              resolve(null);
            }
          },
          (_, error) => { reject(error); return false; }
        );
      });
    });
  },

  getAll: (keyword?: string): Promise<Client[]> => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        let sql = 'SELECT * FROM clients';
        const params: string[] = [];

        if (keyword) {
          sql += ' WHERE name LIKE ? OR phone LIKE ?';
          const searchTerm = `%${keyword}%`;
          params.push(searchTerm, searchTerm);
        }

        sql += ' ORDER BY name ASC';

        tx.executeSql(
          sql,
          params,
          (_, result) => {
            const clients: Client[] = [];
            for (let i = 0; i < result.rows.length; i++) {
              clients.push(result.rows.item(i) as Client);
            }
            resolve(clients);
          },
          (_, error) => { reject(error); return false; }
        );
      });
    });
  },
};

// ==================== 交易操作 ====================

export const transactionOperations = {
  add: (transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> => {
    return new Promise((resolve, reject) => {
      const newTransaction: Transaction = {
        ...transaction,
        id: uuidv4(),
        createdAt: getCurrentTime(),
      };
      db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO transactions (id, type, medicineId, medicineName, warehouseId, warehouseName, clientId, clientName, quantity, unitPrice, totalAmount, batchNo, operator, remark, createdAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            newTransaction.id,
            newTransaction.type,
            newTransaction.medicineId,
            newTransaction.medicineName,
            newTransaction.warehouseId,
            newTransaction.warehouseName,
            newTransaction.clientId,
            newTransaction.clientName,
            newTransaction.quantity,
            newTransaction.unitPrice,
            newTransaction.totalAmount,
            newTransaction.batchNo,
            newTransaction.operator,
            newTransaction.remark,
            newTransaction.createdAt,
          ],
          (_, result) => resolve(newTransaction),
          (_, error) => { reject(error); return false; }
        );
      });
    });
  },

  getAll: (filters?: {
    type?: string;
    medicineId?: string;
    clientId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ transactions: Transaction[]; total: number }> => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        let sql = 'SELECT * FROM transactions WHERE 1=1';
        const params: any[] = [];

        if (filters?.type) {
          sql += ' AND type = ?';
          params.push(filters.type);
        }

        if (filters?.medicineId) {
          sql += ' AND medicineId = ?';
          params.push(filters.medicineId);
        }

        if (filters?.clientId) {
          sql += ' AND clientId = ?';
          params.push(filters.clientId);
        }

        if (filters?.startDate) {
          sql += ' AND createdAt >= ?';
          params.push(filters.startDate);
        }

        if (filters?.endDate) {
          sql += ' AND createdAt <= ?';
          params.push(filters.endDate);
        }

        sql += ' ORDER BY createdAt DESC';

        // 获取总数
        tx.executeSql(
          `SELECT COUNT(*) as total FROM (${sql})`,
          params,
          (_, result) => {
            const total = result.rows.item(0).total;

            // 分页
            const page = filters?.page || 1;
            const pageSize = filters?.pageSize || 20;
            const offset = (page - 1) * pageSize;
            sql += ` LIMIT ${pageSize} OFFSET ${offset}`;

            tx.executeSql(
              sql,
              params,
              (_, result) => {
                const transactions: Transaction[] = [];
                for (let i = 0; i < result.rows.length; i++) {
                  transactions.push(result.rows.item(i) as Transaction);
                }
                resolve({ transactions, total });
              },
              (_, error) => { reject(error); return false; }
            );
          },
          (_, error) => { reject(error); return false; }
        );
      });
    });
  },

  getTodaySummary: (): Promise<{ inAmount: number; outAmount: number; count: number }> => {
    return new Promise((resolve, reject) => {
      const today = new Date().toISOString().split('T')[0];

      db.transaction(tx => {
        tx.executeSql(
          `SELECT
             SUM(CASE WHEN type = 'in' THEN totalAmount ELSE 0 END) as inAmount,
             SUM(CASE WHEN type = 'out' THEN totalAmount ELSE 0 END) as outAmount,
             COUNT(*) as count
           FROM transactions
           WHERE createdAt LIKE ?`,
          [`${today}%`],
          (_, result) => {
            const row = result.rows.item(0);
            resolve({
              inAmount: row.inAmount || 0,
              outAmount: row.outAmount || 0,
              count: row.count || 0,
            });
          },
          (_, error) => { reject(error); return false; }
        );
      });
    });
  },

  getMonthlySales: (): Promise<number> => {
    return new Promise((resolve, reject) => {
      const date = new Date();
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
        .toISOString();

      db.transaction(tx => {
        tx.executeSql(
          `SELECT SUM(totalAmount) as total
           FROM transactions
           WHERE type = 'out' AND createdAt >= ?`,
          [firstDay],
          (_, result) => {
            const row = result.rows.item(0);
            resolve(row.total || 0);
          },
          (_, error) => { reject(error); return false; }
        );
      });
    });
  },
};

// ==================== 库存操作 ====================

export const stockOperations = {
  add: (record: Omit<StockRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<StockRecord> => {
    return new Promise((resolve, reject) => {
      const newRecord: StockRecord = {
        ...record,
        id: uuidv4(),
        createdAt: getCurrentTime(),
        updatedAt: getCurrentTime(),
      };
      db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO stock_records (id, medicineId, medicineName, warehouseId, warehouseName, quantity, batchNo, expiryDate, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            newRecord.id,
            newRecord.medicineId,
            newRecord.medicineName,
            newRecord.warehouseId,
            newRecord.warehouseName,
            newRecord.quantity,
            newRecord.batchNo,
            newRecord.expiryDate,
            newRecord.createdAt,
            newRecord.updatedAt,
          ],
          (_, result) => resolve(newRecord),
          (_, error) => { reject(error); return false; }
        );
      });
    });
  },

  getByMedicine: (medicineId: string): Promise<StockRecord[]> => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM stock_records WHERE medicineId = ? ORDER BY createdAt DESC',
          [medicineId],
          (_, result) => {
            const records: StockRecord[] = [];
            for (let i = 0; i < result.rows.length; i++) {
              records.push(result.rows.item(i) as StockRecord);
            }
            resolve(records);
          },
          (_, error) => { reject(error); return false; }
        );
      });
    });
  },

  getByWarehouse: (warehouseId: string): Promise<StockRecord[]> => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM stock_records WHERE warehouseId = ? ORDER BY createdAt DESC',
          [warehouseId],
          (_, result) => {
            const records: StockRecord[] = [];
            for (let i = 0; i < result.rows.length; i++) {
              records.push(result.rows.item(i) as StockRecord);
            }
            resolve(records);
          },
          (_, error) => { reject(error); return false; }
        );
      });
    });
  },
};

// 导出数据库实例
export { db };
