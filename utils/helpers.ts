/**
 * 药品管理系统 - 工具函数
 */
import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';
import { zhCN } from 'date-fns/locale';

/**
 * 格式化日期
 */
export const formatDate = (date: string | Date, pattern: string = 'yyyy-MM-dd'): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '-';
    return format(dateObj, pattern, { locale: zhCN });
  } catch {
    return '-';
  }
};

/**
 * 格式化日期时间
 */
export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'yyyy-MM-dd HH:mm:ss');
};

/**
 * 格式化相对时间
 */
export const formatRelativeTime = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '-';
    return formatDistanceToNow(dateObj, { locale: zhCN, addSuffix: true });
  } catch {
    return '-';
  }
};

/**
 * 格式化金额（保留两位小数）
 */
export const formatMoney = (amount: number): string => {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '¥0.00';
  }
  return `¥${amount.toFixed(2)}`;
};

/**
 * 格式化数量
 */
export const formatQuantity = (quantity: number): string => {
  if (isNaN(quantity) || quantity === null || quantity === undefined) {
    return '0';
  }
  return quantity.toLocaleString('zh-CN');
};

/**
 * 格式化百分比
 */
export const formatPercent = (value: number, decimals: number = 0): string => {
  if (isNaN(value) || value === null || value === undefined) {
    return '0%';
  }
  return `${value.toFixed(decimals)}%`;
};

/**
 * 格式化手机号
 */
export const formatPhone = (phone: string): string => {
  if (!phone || phone.length !== 11) return phone;
  return `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7)}`;
};

/**
 * 隐藏手机号中间四位
 */
export const hidePhoneMiddle = (phone: string): string => {
  if (!phone || phone.length < 7) return phone;
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
};

/**
 * 截取字符串并添加省略号
 */
export const truncate = (str: string, maxLength: number = 20): string => {
  if (!str || str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
};

/**
 * 生成订单号
 */
export const generateOrderNo = (): string => {
  const now = new Date();
  const dateStr = format(now, 'yyyyMMddHHmmss');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD${dateStr}${random}`;
};

/**
 * 生成批次号
 */
export const generateBatchNo = (): string => {
  const now = new Date();
  const dateStr = format(now, 'yyyyMMdd');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `BATCH${dateStr}${random}`;
};

/**
 * 验证手机号
 */
export const isValidPhone = (phone: string): boolean => {
  return /^1[3-9]\d{9}$/.test(phone);
};

/**
 * 验证邮箱
 */
export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * 验证金额
 */
export const isValidMoney = (money: string): boolean => {
  return /^\d+(\.\d{0,2})?$/.test(money);
};

/**
 * 生成唯一ID
 */
export const generateId = (): string => {
  return `${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * 深度克隆对象
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * 从对象数组中根据key获取值并去重
 */
export const getUniqueValues = <T>(arr: T[], key: keyof T): T[keyof T][] => {
  return [...new Set(arr.map(item => item[key]))];
};

/**
 * 根据key对数组进行分组
 */
export const groupBy = <T>(arr: T[], key: keyof T): Record<string, T[]> => {
  return arr.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

/**
 * 计算数组中某个属性的总和
 */
export const sumBy = <T>(arr: T[], key: keyof T): number => {
  return arr.reduce((total, item) => total + (Number(item[key]) || 0), 0);
};

/**
 * 获取数组中某个属性的最大值
 */
export const maxBy = <T>(arr: T[], key: keyof T): number => {
  if (arr.length === 0) return 0;
  return Math.max(...arr.map(item => Number(item[key]) || 0));
};

/**
 * 获取数组中某个属性的最小值
 */
export const minBy = <T>(arr: T[], key: keyof T): number => {
  if (arr.length === 0) return 0;
  return Math.min(...arr.map(item => Number(item[key]) || 0));
};

/**
 * 防抖函数
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * 节流函数
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * 延迟函数
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * 安全执行异步函数
 */
export const safeExecute = async <T>(
  asyncFn: () => Promise<T>,
  fallback: T
): Promise<T> => {
  try {
    return await asyncFn();
  } catch (error) {
    console.error('safeExecute error:', error);
    return fallback;
  }
};

/**
 * 获取颜色（根据状态）
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'in':
    case 'active':
    case 'success':
      return '#52c41a';
    case 'out':
    case 'inactive':
    case 'warning':
      return '#faad14';
    case 'return':
    case 'danger':
      return '#ff4d4f';
    default:
      return '#1890ff';
  }
};

/**
 * 获取状态文本
 */
export const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    in: '入库',
    out: '出库',
    return: '退货',
    adjust: '调整',
    retail: '零售',
    wholesale: '批发',
    hospital: '医院',
    clinic: '诊所',
  };
  return statusMap[status] || status;
};
