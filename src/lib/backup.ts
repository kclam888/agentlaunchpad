import { exec } from 'child_process'
import { promisify } from 'util'
import { S3 } from 'aws-sdk'
import { createGzip } from 'zlib'
import { pipeline } from 'stream'
import { createReadStream, createWriteStream } from 'fs'
import { PrismaClient } from '@prisma/client'

const execAsync = promisify(exec)
const pipelineAsync = promisify(pipeline)

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
})

const prisma = new PrismaClient()

interface BackupSchedule {
  frequency: 'daily' | 'weekly' | 'monthly'
  hour: number // 0-23
  minute: number // 0-59
  keepCount: number // Number of backups to retain
}

export async function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `backup-${timestamp}.sql.gz`
  const localPath = `/tmp/${filename}`

  try {
    // Create PostgreSQL dump
    await execAsync(
      `PGPASSWORD="${process.env.DATABASE_PASSWORD}" pg_dump -h ${process.env.DATABASE_HOST} -U ${process.env.DATABASE_USER} ${process.env.DATABASE_NAME} > ${localPath}`
    )

    // Compress the dump
    await pipelineAsync(
      createReadStream(localPath),
      createGzip(),
      createWriteStream(`${localPath}.gz`)
    )

    // Upload to S3
    await s3.upload({
      Bucket: process.env.AWS_BACKUP_BUCKET!,
      Key: filename,
      Body: createReadStream(`${localPath}.gz`),
    }).promise()

    return {
      success: true,
      filename,
    }
  } catch (error) {
    console.error('Backup failed:', error)
    throw error
  }
}

export async function restoreBackup(filename: string) {
  const localPath = `/tmp/${filename}`

  try {
    // Download from S3
    const s3Object = await s3.getObject({
      Bucket: process.env.AWS_BACKUP_BUCKET!,
      Key: filename,
    }).promise()

    // Save to local file
    await pipelineAsync(
      s3Object.Body as NodeJS.ReadableStream,
      createWriteStream(localPath)
    )

    // Decompress
    await execAsync(`gunzip ${localPath}`)

    // Restore database
    await execAsync(
      `PGPASSWORD="${process.env.DATABASE_PASSWORD}" psql -h ${process.env.DATABASE_HOST} -U ${process.env.DATABASE_USER} ${process.env.DATABASE_NAME} < ${localPath.replace('.gz', '')}`
    )

    return {
      success: true,
      filename,
    }
  } catch (error) {
    console.error('Restore failed:', error)
    throw error
  }
}

export async function scheduleBackup(schedule: BackupSchedule) {
  const cronExpression = getCronExpression(schedule)
  
  // Store schedule in database
  await prisma.systemConfig.upsert({
    where: { key: 'backup_schedule' },
    update: { value: JSON.stringify(schedule) },
    create: {
      key: 'backup_schedule',
      value: JSON.stringify(schedule)
    }
  })

  // Clean up old backups
  await cleanupOldBackups(schedule.keepCount)
}

async function cleanupOldBackups(keepCount: number) {
  try {
    const response = await s3.listObjects({
      Bucket: process.env.AWS_BACKUP_BUCKET!,
      Prefix: 'backup-'
    }).promise()

    if (!response.Contents) return

    // Sort by date, newest first
    const backups = response.Contents
      .sort((a, b) => (b.LastModified?.getTime() || 0) - (a.LastModified?.getTime() || 0))

    // Delete old backups
    const toDelete = backups.slice(keepCount)
    
    if (toDelete.length > 0) {
      await s3.deleteObjects({
        Bucket: process.env.AWS_BACKUP_BUCKET!,
        Delete: {
          Objects: toDelete.map(obj => ({ Key: obj.Key! }))
        }
      }).promise()
    }
  } catch (error) {
    console.error('Cleanup failed:', error)
    throw error
  }
}

function getCronExpression(schedule: BackupSchedule): string {
  const { frequency, hour, minute } = schedule
  
  switch (frequency) {
    case 'daily':
      return `${minute} ${hour} * * *`
    case 'weekly':
      return `${minute} ${hour} * * 0`
    case 'monthly':
      return `${minute} ${hour} 1 * *`
    default:
      throw new Error('Invalid frequency')
  }
} 