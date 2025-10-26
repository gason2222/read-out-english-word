# MongoDB Atlas Data API Key取得手順

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

- **API Key**: `実際のAPI_Key`（生成されたキーをコピー）
- **Cluster Name**: `image2diary`
- **Database**: `english-word`
- **Collection**: `words`

### 4. .envファイルの設定

```env
# MongoDB Atlas Data API設定
MONGODB_DATA_API_KEY=実際のAPI_Key
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
3. API Key: `実際のAPI_Key`
4. Cluster Name: `image2diary`
5. 接続完了！

### 6. 実際のAPI Key取得手順

1. **MongoDB Atlasダッシュボード**にログイン
2. **Data Services** → **Data API**をクリック
3. **Enable Data API**をクリック
4. **Generate API Key**をクリック
5. **API Key Name**: `english-word-app`
6. **API Key Description**: `English Word App Data API Key`
7. **Access List**: `0.0.0.0/0`
8. **Generate**をクリック
9. **API Key**をコピー
10. **Cluster Name**を確認（`image2diary`）

### 7. 設定例

実際のAPI Keyを取得したら、以下の形式で設定してください：

```env
MONGODB_DATA_API_KEY=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
MONGODB_CLUSTER_NAME=image2diary
MONGODB_DATABASE=english-word
MONGODB_COLLECTION=words
AUTO_CONNECT_MONGODB=true
```

### 8. セキュリティ注意事項

- API Keyを他人と共有しないでください
- 本番環境では特定のIPアドレスのみ許可することを推奨
- 定期的にAPI Keyを更新してください

### 9. トラブルシューティング

#### API Keyが取得できない場合
- MongoDB Atlasのアカウントが有効か確認
- Data APIが有効化されているか確認
- クラスターが存在するか確認

#### 接続エラーが発生する場合
- API Keyが正しいか確認
- Cluster Nameが正しいか確認
- ネットワーク接続を確認
