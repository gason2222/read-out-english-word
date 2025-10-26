# MongoDBドライバーファイルのダウンロードスクリプト (PowerShell版)
# このスクリプトを実行してMongoDBドライバーをローカルに配置できます

Write-Host "MongoDBドライバーファイルをダウンロードしています..." -ForegroundColor Green

# 複数のCDNからダウンロードを試行
$downloadUrls = @(
    "https://unpkg.com/mongodb@6.0.0/dist/browser.umd.js",
    "https://cdn.jsdelivr.net/npm/mongodb@6.0.0/dist/browser.umd.js",
    "https://cdnjs.cloudflare.com/ajax/libs/mongodb/6.0.0/browser.umd.js"
)

$success = $false

foreach ($url in $downloadUrls) {
    Write-Host "試行中: $url" -ForegroundColor Yellow
    
    try {
        Invoke-WebRequest -Uri $url -OutFile "mongodb-browser.umd.js" -ErrorAction Stop
        Write-Host "✅ MongoDBドライバーのダウンロードが完了しました: mongodb-browser.umd.js" -ForegroundColor Green
        
        $fileSize = (Get-Item "mongodb-browser.umd.js").Length
        $fileSizeKB = [math]::Round($fileSize / 1KB, 2)
        Write-Host "ファイルサイズ: $fileSizeKB KB" -ForegroundColor Cyan
        
        $success = $true
        break
    }
    catch {
        Write-Host "❌ ダウンロードに失敗しました: $url" -ForegroundColor Red
        Write-Host "エラー: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# ファイルが存在するかチェック
if ($success -and (Test-Path "mongodb-browser.umd.js")) {
    Write-Host ""
    Write-Host "🎉 MongoDBドライバーファイルが正常にダウンロードされました！" -ForegroundColor Green
    Write-Host ""
    Write-Host "次の手順:" -ForegroundColor Yellow
    Write-Host "1. index.htmlファイルを編集して以下の行を追加:" -ForegroundColor White
    Write-Host "   <script src=`"mongodb-browser.umd.js`"></script>" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "2. この行を他のスクリプトタグより前に配置してください" -ForegroundColor White
    Write-Host ""
    Write-Host "3. ブラウザでアプリを再読み込みしてください" -ForegroundColor White
}
else {
    Write-Host ""
    Write-Host "❌ MongoDBドライバーのダウンロードに失敗しました" -ForegroundColor Red
    Write-Host ""
    Write-Host "手動での解決方法:" -ForegroundColor Yellow
    Write-Host "1. ブラウザで以下のURLにアクセス:" -ForegroundColor White
    foreach ($url in $downloadUrls) {
        Write-Host "   - $url" -ForegroundColor Cyan
    }
    Write-Host ""
    Write-Host "2. ページの内容をコピーして mongodb-browser.umd.js として保存" -ForegroundColor White
    Write-Host ""
    Write-Host "3. index.htmlファイルを編集してスクリプトタグを追加" -ForegroundColor White
}

Write-Host ""
Write-Host "詳細な解決方法は mongodb-driver-troubleshooting.md を参照してください" -ForegroundColor Magenta
