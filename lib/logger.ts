/**
 * 环境化的日志工具
 * 在生产环境中禁用 log 和 debug 级别的日志
 */

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const IS_DEV = process.env.NODE_ENV === 'development';

export const logger = {
  /**
   * 普通日志 - 生产环境禁用
   */
  log: (...args: any[]) => {
    if (!IS_PRODUCTION) {
      console.log(...args);
    }
  },

  /**
   * 调试日志 - 生产环境禁用
   */
  debug: (...args: any[]) => {
    if (IS_DEV) {
      console.debug(...args);
    }
  },

  /**
   * 信息日志 - 所有环境启用
   */
  info: (...args: any[]) => {
    console.info(...args);
  },

  /**
   * 警告日志 - 所有环境启用
   */
  warn: (...args: any[]) => {
    console.warn(...args);
  },

  /**
   * 错误日志 - 所有环境启用
   */
  error: (...args: any[]) => {
    console.error(...args);
  },

  /**
   * 性能计时开始
   */
  time: (label: string) => {
    if (!IS_PRODUCTION) {
      console.time(label);
    }
  },

  /**
   * 性能计时结束
   */
  timeEnd: (label: string) => {
    if (!IS_PRODUCTION) {
      console.timeEnd(label);
    }
  },

  /**
   * 表格输出 - 仅开发环境
   */
  table: (data: any) => {
    if (IS_DEV) {
      console.table(data);
    }
  },
};

// 默认导出
export default logger;
