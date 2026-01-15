const colors = require("colors/safe"); // optional for colored logs

const log = {
  info: (message, meta = {}) => {
    console.log(colors.blue(`[INFO] ${new Date().toISOString()} - ${message}`), meta);
  },
  warn: (message, meta = {}) => {
    console.warn(colors.yellow(`[WARN] ${new Date().toISOString()} - ${message}`), meta);
  },
  error: (message, meta = {}) => {
    console.error(colors.red(`[ERROR] ${new Date().toISOString()} - ${message}`), meta);
  },
  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV === "development") {
      console.log(colors.green(`[DEBUG] ${new Date().toISOString()} - ${message}`), meta);
    }
  },
};

module.exports = log;
