// MongoDB Atlas Data API Manager
// MongoDBドライバーが読み込めない場合の代替手段

class MongoDBDataAPIManager {
    constructor() {
        this.apiKey = '';
        this.clusterName = '';
        this.baseUrl = '';
        this.isConnected = false;
    }

    async connect(apiKey, clusterName) {
        try {
            this.apiKey = apiKey;
            this.clusterName = clusterName;
            this.baseUrl = `https://data.mongodb-api.com/app/data-${clusterName}/endpoint/data/v1`;
            
            // 接続テスト
            await this.testConnection();
            
            this.isConnected = true;
            console.log('MongoDB Atlas Data APIに接続しました');
            return true;
        } catch (error) {
            console.error('MongoDB Data API接続エラー:', error);
            this.isConnected = false;
            throw error;
        }
    }

    async testConnection() {
        const response = await fetch(`${this.baseUrl}/action/find`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': this.apiKey
            },
            body: JSON.stringify({
                collection: 'words',
                database: 'english-word',
                filter: {},
                limit: 1
            })
        });

        if (!response.ok) {
            throw new Error(`API接続エラー: ${response.status} ${response.statusText}`);
        }
    }

    async uploadWordsFromCSV(csvData) {
        if (!this.isConnected) {
            throw new Error('MongoDB Data APIに接続されていません');
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
                            createdAt: new Date().toISOString(),
                            source: 'csv-upload'
                        });
                    }
                }
            }

            if (words.length === 0) {
                throw new Error('有効な単語データが見つかりませんでした');
            }

            // 既存のデータを削除
            await this.deleteAllWords();

            // 新しいデータを挿入
            const result = await fetch(`${this.baseUrl}/action/insertMany`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': this.apiKey
                },
                body: JSON.stringify({
                    collection: 'words',
                    database: 'english-word',
                    documents: words
                })
            });

            if (!result.ok) {
                throw new Error(`データ挿入エラー: ${result.status} ${result.statusText}`);
            }

            const data = await result.json();
            console.log(`${data.insertedIds.length}個の単語をデータベースに登録しました`);
            return data.insertedIds.length;

        } catch (error) {
            console.error('データベース登録エラー:', error);
            throw error;
        }
    }

    async getAllWords() {
        if (!this.isConnected) {
            throw new Error('MongoDB Data APIに接続されていません');
        }

        try {
            const response = await fetch(`${this.baseUrl}/action/find`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': this.apiKey
                },
                body: JSON.stringify({
                    collection: 'words',
                    database: 'english-word',
                    filter: {}
                })
            });

            if (!response.ok) {
                throw new Error(`データ取得エラー: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log(`${data.documents.length}個の単語をデータベースから取得しました`);
            return data.documents;
        } catch (error) {
            console.error('データベース取得エラー:', error);
            throw error;
        }
    }

    async getWordCount() {
        if (!this.isConnected) {
            throw new Error('MongoDB Data APIに接続されていません');
        }

        try {
            const response = await fetch(`${this.baseUrl}/action/countDocuments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': this.apiKey
                },
                body: JSON.stringify({
                    collection: 'words',
                    database: 'english-word',
                    filter: {}
                })
            });

            if (!response.ok) {
                throw new Error(`単語数取得エラー: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data.count;
        } catch (error) {
            console.error('単語数取得エラー:', error);
            throw error;
        }
    }

    async deleteAllWords() {
        if (!this.isConnected) {
            throw new Error('MongoDB Data APIに接続されていません');
        }

        try {
            const response = await fetch(`${this.baseUrl}/action/deleteMany`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': this.apiKey
                },
                body: JSON.stringify({
                    collection: 'words',
                    database: 'english-word',
                    filter: {}
                })
            });

            if (!response.ok) {
                throw new Error(`データ削除エラー: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log(`${data.deletedCount}個の単語を削除しました`);
            return data.deletedCount;
        } catch (error) {
            console.error('データベース削除エラー:', error);
            throw error;
        }
    }

    disconnect() {
        this.isConnected = false;
        this.apiKey = '';
        this.clusterName = '';
        this.baseUrl = '';
        console.log('MongoDB Data APIから切断しました');
    }
}
