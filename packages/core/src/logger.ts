import pc from "picocolors";

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4,
}

export class Logger {
  private static level: LogLevel = LogLevel.INFO;
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  public static setLevel(level: LogLevel) {
    Logger.level = level;
  }

  log(message: string) {
    this.print(LogLevel.INFO, message, pc.green, "LOG ");
  }

  info(message: string) {
    this.print(LogLevel.INFO, message, pc.blue, "INFO");
  }

  error(message: string, trace?: string) {
    this.print(LogLevel.ERROR, message, pc.red, "ERR ");
    if (trace && Logger.level <= LogLevel.ERROR) {
      console.error(pc.dim(pc.red(trace))); // Trace también en rojo pero dim
    }
  }

  warn(message: string) {
    this.print(LogLevel.WARN, message, pc.yellow, "WARN");
  }

  debug(message: string) {
    this.print(LogLevel.DEBUG, message, pc.magenta, "DBUG");
  }

  private print(
    level: LogLevel,
    message: string,
    colorFn: (s: string) => string,
    levelLabel: string
  ) {
    if (Logger.level > level) return;

    const prefix = pc.bold(pc.cyan("🦊"));
    const separator = pc.dim("│");

    const time = new Date().toLocaleTimeString("en-US", { hour12: false });
    const timestamp = pc.dim(time);

    const lvl = pc.bold(colorFn(levelLabel));

    const ctx = pc.yellow(this.context.padEnd(18));

    const coloredMessage = colorFn(message);

    console.log(
      `${prefix} ${separator} ${timestamp} ${separator} ${lvl} ${separator} ${ctx} ${coloredMessage}`
    );
  }
}
