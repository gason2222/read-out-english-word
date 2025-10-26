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
            return false;
        }
    }

    async loadMongoDBDriver() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/mongodb@6.0.0/dist/browser.umd.js';
            script.onload = () => {
                console.log('MongoDB driver loaded');
                resolve();
            };
            script.onerror = () => {
                reject(new Error('MongoDB driverの読み込みに失敗しました'));
            };
            document.head.appendChild(script);
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
