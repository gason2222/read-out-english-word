# MongoDBドライバー読み込みエラーの解決方法

## エラーの原因

MongoDBドライバーの読み込みエラーは以下の原因で発生する可能性があります：

1. **ネットワーク接続の問題**
2. **CDNサーバーの障害**
3. **ブラウザのセキュリティ制限**
4. **CORS設定の問題**

## 解決方法

### 1. ネットワーク接続の確認

- インターネット接続を確認
- ファイアウォールやプロキシの設定を確認
- ブラウザの開発者ツールでネットワークタブを確認

### 2. 代替CDNの使用

アプリは複数のCDNを自動的に試行します：
- `https://unpkg.com/mongodb@6.0.0/dist/browser.umd.js`
- `https://cdn.jsdelivr.net/npm/mongodb@6.0.0/dist/browser.umd.js`
- `https://cdnjs.cloudflare.com/ajax/libs/mongodb/6.0.0/browser.umd.js`

### 3. ローカルファイルの配置

CDNが利用できない場合は、ローカルにMongoDBドライバーファイルを配置：

1. MongoDBドライバーファイルをダウンロード：
   ```bash
   curl -o mongodb-browser.umd.js https://unpkg.com/mongodb@6.0.0/dist/browser.umd.js
   ```

2. プロジェクトルートに配置

3. HTMLファイルを修正：
   ```html
   <script src="mongodb-browser.umd.js"></script>
   <script src="environment-manager.js"></script>
   <script src="mongodb-manager.js"></script>
   <script src="script.js"></script>
   ```

### 4. ブラウザの設定確認

- **Chrome**: セキュリティ設定で外部スクリプトの読み込みを許可
- **Firefox**: プライベートブラウジングモードを無効化
- **Safari**: クロスオリジンリクエストを許可

### 5. 開発環境での解決

#### Node.js環境でのテスト

```bash
# MongoDBドライバーをインストール
npm install mongodb

# テストスクリプトを作成
node test-mongodb.js
```

#### テストスクリプト（test-mongodb.js）

```javascript
const { MongoClient } = require('mongodb');

async function testConnection() {
    try {
        const client = new MongoClient('your-connection-string');
        await client.connect();
        console.log('MongoDB接続成功');
        await client.close();
    } catch (error) {
        console.error('MongoDB接続エラー:', error);
    }
}

testConnection();
```

### 6. 本番環境での解決

#### Netlifyでの設定

1. **Build settings**でビルドコマンドを設定：
   ```bash
   npm install mongodb
   ```

2. **Environment variables**でMongoDB接続文字列を設定

#### Vercelでの設定

1. **Settings** → **Environment Variables**で設定
2. **Build Command**でMongoDBドライバーをインストール

### 7. 代替実装

MongoDBドライバーが読み込めない場合の代替手段：

#### REST API経由での接続

```javascript
// MongoDB Atlas Data APIを使用
const API_KEY = 'your-api-key';
const CLUSTER_NAME = 'your-cluster';

async function connectViaAPI() {
    const response = await fetch(`https://data.mongodb-api.com/app/data-${CLUSTER_NAME}/endpoint/data/v1/action/find`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'api-key': API_KEY
        },
        body: JSON.stringify({
            collection: 'words',
            database: 'english-word',
            filter: {}
        })
    });
    
    return await response.json();
}
```

#### ローカルストレージでの代替

```javascript
// MongoDBが利用できない場合の代替
class LocalStorageManager {
    constructor() {
        this.storageKey = 'english-words';
    }
    
    async saveWords(words) {
        localStorage.setItem(this.storageKey, JSON.stringify(words));
    }
    
    async loadWords() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }
}
```

## トラブルシューティング手順

### 1. エラーログの確認

ブラウザの開発者ツールでコンソールエラーを確認：

```javascript
// エラーの詳細を確認
console.error('MongoDB driver error:', error);
```

### 2. ネットワークタブの確認

- リクエストが送信されているか
- レスポンスステータスコード
- レスポンス内容

### 3. 段階的なテスト

1. **基本的な接続テスト**
2. **ドライバー読み込みテスト**
3. **データベース接続テスト**
4. **データ操作テスト**

## 予防策

### 1. エラーハンドリングの強化

```javascript
try {
    await this.loadMongoDBDriver();
} catch (error) {
    console.warn('MongoDB driver読み込み失敗:', error);
    // 代替手段を実行
    this.useFallbackMethod();
}
```

### 2. 接続プールの管理

```javascript
class ConnectionPool {
    constructor() {
        this.connections = new Map();
        this.maxConnections = 5;
    }
    
    async getConnection(connectionString) {
        if (this.connections.has(connectionString)) {
            return this.connections.get(connectionString);
        }
        
        const connection = await this.createConnection(connectionString);
        this.connections.set(connectionString, connection);
        return connection;
    }
}
```

### 3. 定期的なヘルスチェック

```javascript
setInterval(async () => {
    try {
        await this.healthCheck();
    } catch (error) {
        console.warn('MongoDB接続のヘルスチェック失敗:', error);
        await this.reconnect();
    }
}, 30000); // 30秒ごと
```

## サポート

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [MongoDB Driver Documentation](https://docs.mongodb.com/drivers/)
- [Browser Compatibility](https://docs.mongodb.com/drivers/browser/)
