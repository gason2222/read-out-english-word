# MongoDB Atlas Data API設定手順

## Cluster Name: image2diary

### 1. MongoDB Atlasダッシュボードでの設定

1. **MongoDB Atlas**にログイン
2. **Data Services** → **Data API**をクリック
3. **Enable Data API**をクリック
4. **Generate API Key**をクリック

### 2. API Keyの生成

1. **API Key Name**: `english-word-app`
2. **API Key Description**: `English Word App Data API Key`
3. **Access List**: `0.0.0.0/0`（すべてのIPからアクセス許可）
4. **Generate**をクリック

### 3. 接続情報の取得

- **API Key**: `abc123def456ghi789jkl012mno345pqr678stu901vwx234yz`（例）
- **Cluster Name**: `image2diary`
- **Database**: `english-word`
- **Collection**: `words`

### 4. .envファイルの設定

```env
# MongoDB Atlas Data API設定
MONGODB_DATA_API_KEY=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
MONGODB_CLUSTER_NAME=image2diary
MONGODB_DATABASE=english-word
MONGODB_COLLECTION=words

# MongoDB Atlas接続文字列（従来の方法）
MONGODB_CONNECTION_STRING=mongodb+srv://username:password@image2diary.abc123.mongodb.net/english-word?retryWrites=true&w=majority
AUTO_CONNECT_MONGODB=true
```

### 5. アプリでの使用方法

1. MongoDBドライバーの読み込みエラーが発生
2. **「Data API設定」ボタン**をクリック
3. API Key: `abc123def456ghi789jkl012mno345pqr678stu901vwx234yz`
4. Cluster Name: `image2diary`
5. 接続完了！

### 6. テスト用の接続情報

実際のAPI Keyを取得したら、以下の形式で設定してください：

```env
MONGODB_DATA_API_KEY=実際のAPI_Key
MONGODB_CLUSTER_NAME=image2diary
MONGODB_DATABASE=english-word
MONGODB_COLLECTION=words
```

### 7. セキュリティ注意事項

- API Keyを他人と共有しないでください
- 本番環境では特定のIPアドレスのみ許可することを推奨
- 定期的にAPI Keyを更新してください
