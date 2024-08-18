import dotenv from 'dotenv';
dotenv.config();
import {DEFAULT_TIMEZONE} from './db.config.js';
import moment from 'moment-timezone';
import logTimestamp from 'log-timestamp';
logTimestamp(() => `[${moment().tz(DEFAULT_TIMEZONE).format()}] %s`);
