// 環境変数管理クラス
class EnvironmentManager {
    constructor() {
        this.config = {
            mongodbConnectionString: '',
            mongodbDataApiKey: '',
            mongodbClusterName: '',
            autoConnectMongoDB: false,
            mongodbDatabase: 'english-word',
            mongodbCollection: 'words'
        };
        this.loadConfig();
    }

    loadConfig() {
        // 環境変数から設定を読み込み
        this.config.mongodbConnectionString = this.getEnvVar('MONGODB_CONNECTION_STRING') || '';
        this.config.mongodbDataApiKey = this.getEnvVar('MONGODB_DATA_API_KEY') || '';
        this.config.mongodbClusterName = this.getEnvVar('MONGODB_CLUSTER_NAME') || '';
        this.config.autoConnectMongoDB = this.getEnvVar('AUTO_CONNECT_MONGODB') === 'true';
        this.config.mongodbDatabase = this.getEnvVar('MONGODB_DATABASE') || 'english-word';
        this.config.mongodbCollection = this.getEnvVar('MONGODB_COLLECTION') || 'words';

        // ローカルストレージからも設定を読み込み（フォールバック）
        this.loadFromLocalStorage();
    }

    getEnvVar(name) {
        // ブラウザ環境では環境変数は直接アクセスできないため、
        // 事前に設定されたグローバル変数から読み込む
        if (typeof window !== 'undefined' && window.ENV) {
            return window.ENV[name];
        }
        return null;
    }

    loadFromLocalStorage() {
        try {
            const stored = localStorage.getItem('mongodb-config');
            if (stored) {
                const config = JSON.parse(stored);
                // 環境変数で設定されていない場合のみローカルストレージを使用
                if (!this.config.mongodbConnectionString && config.connectionString) {
                    this.config.mongodbConnectionString = config.connectionString;
                }
                if (!this.config.mongodbDataApiKey && config.dataApiKey) {
                    this.config.mongodbDataApiKey = config.dataApiKey;
                }
                if (!this.config.mongodbClusterName && config.clusterName) {
                    this.config.mongodbClusterName = config.clusterName;
                }
                if (!this.config.autoConnectMongoDB && config.autoConnect !== undefined) {
                    this.config.autoConnectMongoDB = config.autoConnect;
                }
            }
        } catch (error) {
            console.warn('ローカルストレージからの設定読み込みに失敗:', error);
        }
    }

    saveToLocalStorage() {
        try {
            const config = {
                connectionString: this.config.mongodbConnectionString,
                dataApiKey: this.config.mongodbDataApiKey,
                clusterName: this.config.mongodbClusterName,
                autoConnect: this.config.autoConnectMongoDB,
                database: this.config.mongodbDatabase,
                collection: this.config.mongodbCollection
            };
            localStorage.setItem('mongodb-config', JSON.stringify(config));
        } catch (error) {
            console.warn('ローカルストレージへの設定保存に失敗:', error);
        }
    }

    getConnectionString() {
        return this.config.mongodbConnectionString;
    }

    setConnectionString(connectionString) {
        this.config.mongodbConnectionString = connectionString;
        this.saveToLocalStorage();
    }

    getDataApiKey() {
        return this.config.mongodbDataApiKey;
    }

    setDataApiKey(dataApiKey) {
        this.config.mongodbDataApiKey = dataApiKey;
        this.saveToLocalStorage();
    }

    getClusterName() {
        return this.config.mongodbClusterName;
    }

    setClusterName(clusterName) {
        this.config.mongodbClusterName = clusterName;
        this.saveToLocalStorage();
    }

    getAutoConnect() {
        return this.config.autoConnectMongoDB;
    }

    setAutoConnect(autoConnect) {
        this.config.autoConnectMongoDB = autoConnect;
        this.saveToLocalStorage();
    }

    getDatabase() {
        return this.config.mongodbDatabase;
    }

    getCollection() {
        return this.config.mongodbCollection;
    }

    hasConnectionString() {
        return !!this.config.mongodbConnectionString;
    }

    hasDataApiConfig() {
        return !!(this.config.mongodbDataApiKey && this.config.mongodbClusterName);
    }

    // 設定をリセット
    reset() {
        this.config = {
            mongodbConnectionString: '',
            mongodbDataApiKey: '',
            mongodbClusterName: '',
            autoConnectMongoDB: false,
            mongodbDatabase: 'english-word',
            mongodbCollection: 'words'
        };
        localStorage.removeItem('mongodb-config');
    }
}
