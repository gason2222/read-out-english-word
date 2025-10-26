#!/bin/bash

# MongoDBドライバーファイルのダウンロードスクリプト
# このスクリプトを実行してMongoDBドライバーをローカルに配置できます

echo "MongoDBドライバーファイルをダウンロードしています..."

# 複数のCDNからダウンロードを試行
download_urls=(
    "https://unpkg.com/mongodb@6.0.0/dist/browser.umd.js"
    "https://cdn.jsdelivr.net/npm/mongodb@6.0.0/dist/browser.umd.js"
    "https://cdnjs.cloudflare.com/ajax/libs/mongodb/6.0.0/browser.umd.js"
)

for url in "${download_urls[@]}"; do
    echo "試行中: $url"
    if curl -o mongodb-browser.umd.js "$url" 2>/dev/null; then
        echo "✅ MongoDBドライバーのダウンロードが完了しました: mongodb-browser.umd.js"
        echo "ファイルサイズ: $(du -h mongodb-browser.umd.js | cut -f1)"
        break
    else
        echo "❌ ダウンロードに失敗しました: $url"
    fi
done

# ファイルが存在するかチェック
if [ -f "mongodb-browser.umd.js" ]; then
    echo ""
    echo "🎉 MongoDBドライバーファイルが正常にダウンロードされました！"
    echo ""
    echo "次の手順:"
    echo "1. index.htmlファイルを編集して以下の行を追加:"
    echo "   <script src=\"mongodb-browser.umd.js\"></script>"
    echo ""
    echo "2. この行を他のスクリプトタグより前に配置してください"
    echo ""
    echo "3. ブラウザでアプリを再読み込みしてください"
else
    echo ""
    echo "❌ MongoDBドライバーのダウンロードに失敗しました"
    echo ""
    echo "手動での解決方法:"
    echo "1. ブラウザで以下のURLにアクセス:"
    for url in "${download_urls[@]}"; do
        echo "   - $url"
    done
    echo ""
    echo "2. ページの内容をコピーして mongodb-browser.umd.js として保存"
    echo ""
    echo "3. index.htmlファイルを編集してスクリプトタグを追加"
fi
