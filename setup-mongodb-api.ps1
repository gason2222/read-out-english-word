# MongoDB Atlas Data API設定スクリプト (PowerShell版)
# Cluster Name: image2diary

Write-Host "MongoDB Atlas Data API設定スクリプト" -ForegroundColor Green
Write-Host "Cluster Name: image2diary" -ForegroundColor Cyan
Write-Host ""

# .envファイルの存在確認
if (Test-Path ".env") {
    Write-Host "既存の.envファイルが見つかりました。" -ForegroundColor Yellow
    $overwrite = Read-Host "上書きしますか？ (y/N)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "設定をキャンセルしました。" -ForegroundColor Red
        exit 1
    }
}

# API Keyの入力
Write-Host "MongoDB Atlas Data API Keyを入力してください:" -ForegroundColor Yellow
$apiKey = Read-Host "API Key"

if ([string]::IsNullOrEmpty($apiKey)) {
    Write-Host "API Keyが入力されていません。" -ForegroundColor Red
    exit 1
}

# .envファイルの作成
$envContent = @"
# MongoDB Atlas接続設定

# MongoDB Atlas接続文字列
# 形式: mongodb+srv://<username>:<password>@<cluster-url>/english-word?retryWrites=true&w=majority
# 例: mongodb+srv://english-word-user:yourpassword@image2diary.abc123.mongodb.net/english-word?retryWrites=true&w=majority
MONGODB_CONNECTION_STRING=

# MongoDB Atlas Data API設定（代替手段）
MONGODB_DATA_API_KEY=$apiKey
MONGODB_CLUSTER_NAME=image2diary

# 自動接続設定（true/false）
AUTO_CONNECT_MONGODB=true

# データベース設定
MONGODB_DATABASE=english-word
MONGODB_COLLECTION=words
"@

$envContent | Out-File -FilePath ".env" -Encoding UTF8

Write-Host ""
Write-Host "✅ .envファイルが作成されました！" -ForegroundColor Green
Write-Host ""
Write-Host "設定内容:" -ForegroundColor Cyan
Write-Host "- API Key: $($apiKey.Substring(0, [Math]::Min(10, $apiKey.Length)))..." -ForegroundColor White
Write-Host "- Cluster Name: image2diary" -ForegroundColor White
Write-Host "- Database: english-word" -ForegroundColor White
Write-Host "- Collection: words" -ForegroundColor White
Write-Host "- Auto Connect: true" -ForegroundColor White
Write-Host ""
Write-Host "次の手順:" -ForegroundColor Yellow
Write-Host "1. アプリを再起動してください" -ForegroundColor White
Write-Host "2. MongoDB Atlas Data APIに自動接続されます" -ForegroundColor White
Write-Host ""
Write-Host "詳細な設定手順は mongodb-api-key-getting-started.md を参照してください" -ForegroundColor Magenta
