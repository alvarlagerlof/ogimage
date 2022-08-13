import chalk from "chalk";
import logSymbols from "log-symbols";

export interface LogInterface {
  info: (...messages) => void;
  success: (...messages) => void;
  warning: (...messages) => void;
  error: (...messages) => void;
}

function base(level: string, ...message) {
  console.log(chalk.grey("ogimage"), level, ...message);
}

const log: LogInterface = {
  info: (...message) => base(logSymbols.info, ...message),
  success: (...message) => base(logSymbols.success, ...message),
  warning: (...message) => base(logSymbols.warning, ...message),
  error: (...message) => base(logSymbols.error, ...message),
};

export default log;
