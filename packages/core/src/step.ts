import chalk from "chalk";
import log from "./log.js";

export default async function step<T>({
  initialMessage,
  execute,
  successMessage,
  failMessage,
}: {
  initialMessage?: () => string;
  execute: () => Promise<T>;
  successMessage: (returnValue: T) => string;
  failMessage: () => string;
}): Promise<T> {
  const start = Date.now();

  if (initialMessage) log.info(initialMessage());

  try {
    const returnValue: T = await execute();

    const stop = Date.now();
    log.success(
      `${successMessage(returnValue)} ${chalk.yellow(`${stop - start}ms`)}`
    );
    return returnValue;
  } catch (e) {
    const error = e as Error;

    const stop = Date.now();
    log.error(`${failMessage()} ${chalk.yellow(`${stop - start}ms`)}
        ${error.message}
      `);
    process.exit(1);
  }
}
