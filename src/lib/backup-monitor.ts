import { S3 } from 'aws-sdk'
import { prisma } from './prisma'
import { captureError } from './monitoring'

interface BackupStatus {
  lastBackup: Date | null
  backupCount: number
  oldestBackup: Date | null
  totalSize: number
}

export async function checkBackupStatus(): Promise<BackupStatus> {
  const s3 = new S3()
  
  try {
    const response = await s3.listObjects({
      Bucket: process.env.AWS_BACKUP_BUCKET!,
      Prefix: 'backup-'
    }).promise()

    if (!response.Contents) {
      return {
        lastBackup: null,
        backupCount: 0,
        oldestBackup: null,
        totalSize: 0
      }
    }

    const backups = response.Contents.sort((a, b) => 
      (b.LastModified?.getTime() || 0) - (a.LastModified?.getTime() || 0)
    )

    const status = {
      lastBackup: backups[0]?.LastModified || null,
      backupCount: backups.length,
      oldestBackup: backups[backups.length - 1]?.LastModified || null,
      totalSize: backups.reduce((sum, obj) => sum + (obj.Size || 0), 0)
    }

    // Store status in database
    await prisma.systemStatus.upsert({
      where: { key: 'backup_status' },
      update: { value: JSON.stringify(status) },
      create: {
        key: 'backup_status',
        value: JSON.stringify(status)
      }
    })

    return status
  } catch (error) {
    captureError(error as Error, { context: 'backup-monitor' })
    throw error
  }
} 