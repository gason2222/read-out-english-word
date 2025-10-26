class MongoDBManager {
    constructor() {
        this.client = null;
        this.db = null;
        this.collection = null;
        this.isConnected = false;
        this.connectionString = '';
    }

    async connect(connectionString) {
        try {
            this.connectionString = connectionString;
            
            // MongoDBクライアントを動的に読み込み
            if (typeof MongoClient === 'undefined') {
                await this.loadMongoDBDriver();
            }

            // ドライバーが読み込まれているか再確認
            if (typeof MongoClient === 'undefined') {
                throw new Error('MongoDB driverが読み込まれませんでした');
            }

            this.client = new MongoClient(connectionString);
            await this.client.connect();
            
            this.db = this.client.db('english-word');
            this.collection = this.db.collection('words');
            this.isConnected = true;
            
            console.log('MongoDB Atlasに接続しました');
            return true;
        } catch (error) {
            console.error('MongoDB接続エラー:', error);
            this.isConnected = false;
            
            // より詳細なエラーメッセージを提供
            if (error.message.includes('driver')) {
                throw new Error('MongoDBドライバーの読み込みに失敗しました。ネットワーク接続を確認してください。');
            } else if (error.message.includes('connection')) {
                throw new Error('MongoDB Atlasへの接続に失敗しました。接続文字列とネットワーク設定を確認してください。');
            } else {
                throw error;
            }
        }
    }

    async loadMongoDBDriver() {
        return new Promise((resolve, reject) => {
            // 既に読み込まれているかチェック
            if (typeof MongoClient !== 'undefined') {
                resolve();
                return;
            }

            // 複数のCDNを試行
            const cdnUrls = [
                'https://unpkg.com/mongodb@6.0.0/dist/browser.umd.js',
                'https://cdn.jsdelivr.net/npm/mongodb@6.0.0/dist/browser.umd.js',
                'https://cdnjs.cloudflare.com/ajax/libs/mongodb/6.0.0/browser.umd.js'
            ];

            let currentIndex = 0;

            const tryLoadScript = () => {
                if (currentIndex >= cdnUrls.length) {
                    reject(new Error('すべてのCDNからMongoDB driverの読み込みに失敗しました'));
                    return;
                }

                const script = document.createElement('script');
                script.src = cdnUrls[currentIndex];
                script.onload = () => {
                    console.log(`MongoDB driver loaded from: ${cdnUrls[currentIndex]}`);
                    resolve();
                };
                script.onerror = () => {
                    console.warn(`Failed to load MongoDB driver from: ${cdnUrls[currentIndex]}`);
                    currentIndex++;
                    tryLoadScript();
                };
                document.head.appendChild(script);
            };

            tryLoadScript();
        });
    }

    async disconnect() {
        if (this.client) {
            await this.client.close();
            this.isConnected = false;
            console.log('MongoDB接続を切断しました');
        }
    }

    async uploadWordsFromCSV(csvData) {
        if (!this.isConnected) {
            throw new Error('MongoDBに接続されていません');
        }

        try {
            const lines = csvData.trim().split('\n');
            const words = [];

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                const parts = line.split(',');
                if (parts.length >= 2) {
                    const english = parts[0].trim();
                    const japanese = parts.slice(1).join(',').trim();
                    
                    if (english && japanese) {
                        words.push({
                            english: english,
                            japanese: japanese,
                            createdAt: new Date(),
                            source: 'csv-upload'
                        });
                    }
                }
            }

            if (words.length === 0) {
                throw new Error('有効な単語データが見つかりませんでした');
            }

            // 既存のデータを削除（オプション）
            await this.collection.deleteMany({ source: 'csv-upload' });

            // 新しいデータを挿入
            const result = await this.collection.insertMany(words);
            
            console.log(`${result.insertedCount}個の単語をデータベースに登録しました`);
            return result.insertedCount;

        } catch (error) {
            console.error('データベース登録エラー:', error);
            throw error;
        }
    }

    async getAllWords() {
        if (!this.isConnected) {
            throw new Error('MongoDBに接続されていません');
        }

        try {
            const words = await this.collection.find({}).toArray();
            console.log(`${words.length}個の単語をデータベースから取得しました`);
            return words;
        } catch (error) {
            console.error('データベース取得エラー:', error);
            throw error;
        }
    }

    async getWordCount() {
        if (!this.isConnected) {
            throw new Error('MongoDBに接続されていません');
        }

        try {
            const count = await this.collection.countDocuments();
            return count;
        } catch (error) {
            console.error('単語数取得エラー:', error);
            throw error;
        }
    }

    async deleteAllWords() {
        if (!this.isConnected) {
            throw new Error('MongoDBに接続されていません');
        }

        try {
            const result = await this.collection.deleteMany({});
            console.log(`${result.deletedCount}個の単語を削除しました`);
            return result.deletedCount;
        } catch (error) {
            console.error('データベース削除エラー:', error);
            throw error;
        }
    }
}
