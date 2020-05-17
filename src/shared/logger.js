import path from 'path'
import { createLogger, format, transports } from 'winston'
import electron from 'electron'

const app = (electron.app || electron.remote.app)
const logPath = path.join(app.getPath('userData'), 'logs')

const customFormat = format.printf(info => {
  const { level, message } = info
  const namespace = (info.namespace && ('[' + info.namespace + '] ')) || ''
  const duration = (info.durationMs && `${info.durationMs}ms`) || ''
  return `${level}: ${namespace}${message} ${duration}`
})

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.json(),
  ),
  // TODO: Figure out if the log file can be cleared without the use of a second file
  // or figure out how rotationFormat param works to use '_old' for the second file instead of '1'
  transports: [
    new transports.File({
      filename: path.join(logPath, 'error-log.txt'),
      level: 'error',
      maxFiles: 1,
      maxsize: 1000000,
      tailable: true,
    }),
    new transports.File({
      filename: path.join(logPath, 'info-log.txt'),
      level: 'info',
      maxFiles: 1,
      tailable: true,
    }),
  ],
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    level: process.env.RENDERER_REMOTE_DEBUGGING ? 'debug' : 'info',
    format: format.combine(
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      customFormat,
    ),
  }))
}

export default logger
