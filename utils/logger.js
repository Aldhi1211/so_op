import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Di serverless (Vercel) hanya /tmp yang writable; lokal pakai folder logs/
const IS_SERVERLESS = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
const LOG_DIR = IS_SERVERLESS
    ? '/tmp/logs'
    : path.join(__dirname, '..', 'logs');

try {
    if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
} catch (_) {}

const pad = (n) => String(n).padStart(2, '0');

const timestamp = () => {
    const now = new Date();
    const date = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;
    const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    return { date, time, full: `${date} ${time}` };
};

const write = (level, message) => {
    const { date, full } = timestamp();
    const line = `[${full}] ${level.padEnd(5)} ${message}\n`;

    // Console output
    if (level === 'ERROR') {
        process.stderr.write(line);
    } else {
        process.stdout.write(line);
    }

    // File output → logs/YYYY-MM-DD.log
    const logFile = path.join(LOG_DIR, `${date}.log`);
    try {
        fs.appendFileSync(logFile, line, 'utf8');
    } catch (_) {}
};

const logger = {
    info:  (msg) => write('INFO',  msg),
    warn:  (msg) => write('WARN',  msg),
    error: (msg) => write('ERROR', msg),
    debug: (msg) => write('DEBUG', msg),
};

// Express middleware: log setiap HTTP request
export const requestLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const ms      = Date.now() - start;
        const status  = res.statusCode;
        const level   = status >= 500 ? 'ERROR' : status >= 400 ? 'WARN' : 'INFO';
        const body    = (req.method !== 'GET' && req.body)
            ? ` | body: ${JSON.stringify(req.body).slice(0, 200)}`
            : '';
        write(level, `${req.method} ${req.originalUrl} → ${status} (${ms}ms)${body}`);
    });
    next();
};

export default logger;
