# Netlify環境変数設定ガイド

## MongoDB Atlas接続設定

### 必要な環境変数

Netlifyダッシュボードで以下の環境変数を設定してください：

```env
# MongoDB Atlas接続文字列（推奨）
MONGODB_CONNECTION_STRING=mongodb+srv://username:password@image2diary.nohnja5.mongodb.net/english-word?retryWrites=true&w=majority

# MongoDB Atlas Data API設定（代替手段）
MONGODB_DATA_API_KEY=your-api-key-here
MONGODB_CLUSTER_NAME=image2diary

# 自動接続設定
AUTO_CONNECT_MONGODB=true

# データベース設定
MONGODB_DATABASE=english-word
MONGODB_COLLECTION=words
```

### Netlifyでの設定手順

1. **Netlifyダッシュボード**にログイン
2. **プロジェクト**を選択
3. **Site settings** → **Environment variables**をクリック
4. **Add variable**をクリック
5. 上記の環境変数を1つずつ追加

### 設定例

#### 1. MongoDB Atlas接続文字列（推奨）
```
Name: MONGODB_CONNECTION_STRING
Value: mongodb+srv://english-word-user:NUAS2POj652rn2HDNobH@image2diary.nohnja5.mongodb.net/english-word?retryWrites=true&w=majority
```

#### 2. Data API設定（代替手段）
```
Name: MONGODB_DATA_API_KEY
Value: 7a3f12d5-2152-483c-bb92-860229d2a11b

Name: MONGODB_CLUSTER_NAME
Value: image2diary
```

#### 3. その他の設定
```
Name: AUTO_CONNECT_MONGODB
Value: true

Name: MONGODB_DATABASE
Value: english-word

Name: MONGODB_COLLECTION
Value: words
```

### 動作確認

1. **環境変数設定後**、サイトを再デプロイ
2. **アプリにアクセス**
3. **自動接続**が有効になっている場合、MongoDB Atlasに自動接続
4. **データベース操作**ボタンが有効になることを確認

### トラブルシューティング

#### 接続に失敗する場合
1. **接続文字列**が正しいか確認
2. **MongoDB Atlas**のIPアドレス制限を確認
3. **ネットワーク接続**を確認

#### Data APIを使用する場合
1. **MongoDB Atlas**でData APIが有効になっているか確認
2. **API Key**が正しいか確認
3. **Cluster Name**が正しいか確認

### セキュリティ注意事項

- **環境変数**は暗号化されて保存されます
- **接続文字列**にパスワードが含まれているため、適切に管理してください
- **API Key**を他人と共有しないでください
- 定期的に**パスワードやAPI Key**を更新してください

### 参考情報

- [MongoDB Atlas接続文字列の形式](https://docs.atlas.mongodb.com/driver-connection/)
- [MongoDB Atlas Data API](https://docs.atlas.mongodb.com/api/data-api/)
- [Netlify環境変数設定](https://docs.netlify.com/environment-variables/overview/)
