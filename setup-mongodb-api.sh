#!/bin/bash

# MongoDB Atlas Data API設定スクリプト
# Cluster Name: image2diary

echo "MongoDB Atlas Data API設定スクリプト"
echo "Cluster Name: image2diary"
echo ""

# .envファイルの存在確認
if [ -f ".env" ]; then
    echo "既存の.envファイルが見つかりました。"
    read -p "上書きしますか？ (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "設定をキャンセルしました。"
        exit 1
    fi
fi

# API Keyの入力
echo "MongoDB Atlas Data API Keyを入力してください:"
read -p "API Key: " api_key

if [ -z "$api_key" ]; then
    echo "API Keyが入力されていません。"
    exit 1
fi

# .envファイルの作成
cat > .env << EOF
# MongoDB Atlas接続設定

# MongoDB Atlas接続文字列
# 形式: mongodb+srv://<username>:<password>@<cluster-url>/english-word?retryWrites=true&w=majority
# 例: mongodb+srv://english-word-user:yourpassword@image2diary.abc123.mongodb.net/english-word?retryWrites=true&w=majority
MONGODB_CONNECTION_STRING=

# MongoDB Atlas Data API設定（代替手段）
MONGODB_DATA_API_KEY=$api_key
MONGODB_CLUSTER_NAME=image2diary

# 自動接続設定（true/false）
AUTO_CONNECT_MONGODB=true

# データベース設定
MONGODB_DATABASE=english-word
MONGODB_COLLECTION=words
EOF

echo ""
echo "✅ .envファイルが作成されました！"
echo ""
echo "設定内容:"
echo "- API Key: ${api_key:0:10}..."
echo "- Cluster Name: image2diary"
echo "- Database: english-word"
echo "- Collection: words"
echo "- Auto Connect: true"
echo ""
echo "次の手順:"
echo "1. アプリを再起動してください"
echo "2. MongoDB Atlas Data APIに自動接続されます"
echo ""
echo "詳細な設定手順は mongodb-api-key-getting-started.md を参照してください"
