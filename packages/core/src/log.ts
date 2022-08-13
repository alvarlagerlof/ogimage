import chalk from "chalk";
import logSymbols from "log-symbols";

export interface LogInterface {
  info: (...messages: string[]) => void;
  success: (...messages: string[]) => void;
  warning: (...messages: string[]) => void;
  error: (...messages: string[]) => void;
}

function base(level: string, ...message: string[]) {
  console.log(chalk.grey("ogimage"), level, ...message);
}

const log: LogInterface = {
  info: (...message: string[]) => base(logSymbols.info, ...message),
  success: (...message: string[]) => base(logSymbols.success, ...message),
  warning: (...message: string[]) => base(logSymbols.warning, ...message),
  error: (...message: string[]) => base(logSymbols.error, ...message),
};

export default log;
