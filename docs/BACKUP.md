# Backup Strategy

## Git Backup (Primary)

```bash
# Frequent commits during development
git add .
git commit -m "feat: add messaging system"

# Push after every feature
git push origin feature/messaging
```

## Local Auto Backup Script

Run manually or schedule via Task Scheduler:

```powershell
# scripts/backup.ps1
$date = Get-Date -Format "yyyy-MM-dd"
$source = "C:\Users\USER\OneDrive\Desktop\Classified ads"
$dest = "C:\Backups\classified-ads-$date.zip"
Compress-Archive -Path $source -DestinationPath $dest -Force
```

## Cloud Backup (Optional)

- Sync `uploads/` to cloud storage (Google Drive, Dropbox)
- Schedule `mysqldump` for daily database backups
- Use GitHub as offsite backup

## Recommended Schedule

| Frequency | Action                        |
|-----------|-------------------------------|
| Per commit| Push to GitHub                |
| Daily     | Database dump                 |
| Weekly    | Full project zip backup       |
| Monthly   | Archive old branches / logs   |
