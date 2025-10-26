class WordReader {
    constructor() {
        this.words = [];
        this.currentIndex = 0;
        this.isPlaying = false;
        this.isPaused = false;
        this.speechSynthesis = window.speechSynthesis;
        this.currentUtterance = null;
        this.speechSupported = false;
        this.speechErrorCount = 0;
        this.maxSpeechErrors = 3;
        this.mongoManager = new MongoDBManager();
        this.dataAPIManager = new MongoDBDataAPIManager();
        this.isMongoConnected = false;
        this.useDataAPI = false;
        this.envManager = new EnvironmentManager();
        
        this.initializeElements();
        this.bindEvents();
        this.checkSpeechSupport();
        this.initializeEnvironment();
    }

    initializeElements() {
        this.csvFileInput = document.getElementById('csvFile');
        this.fileInfo = document.getElementById('fileInfo');
        this.fileName = document.getElementById('fileName');
        this.wordCount = document.getElementById('wordCount');
        this.controls = document.getElementById('controls');
        this.progressSection = document.getElementById('progressSection');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.currentWord = document.getElementById('currentWord');
        this.englishWord = document.getElementById('englishWord');
        this.japaneseWord = document.getElementById('japaneseWord');
        this.wordList = document.getElementById('wordList');
        this.wordItems = document.getElementById('wordItems');
        
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.nextBtn = document.getElementById('nextBtn');
        
        // MongoDB関連の要素
        this.databaseSection = document.getElementById('databaseSection');
        this.mongoConnectionString = document.getElementById('mongoConnectionString');
        this.connectBtn = document.getElementById('connectBtn');
        this.disconnectBtn = document.getElementById('disconnectBtn');
        this.uploadToDbBtn = document.getElementById('uploadToDbBtn');
        this.loadFromDbBtn = document.getElementById('loadFromDbBtn');
        this.deleteDbBtn = document.getElementById('deleteDbBtn');
        this.dbStatusText = document.getElementById('dbStatusText');
        this.dbWordCount = document.getElementById('dbWordCount');
        
        // 環境変数関連の要素
        this.autoConnectCheckbox = document.getElementById('autoConnectCheckbox');
        this.saveConfigBtn = document.getElementById('saveConfigBtn');
        this.loadConfigBtn = document.getElementById('loadConfigBtn');
        this.resetConfigBtn = document.getElementById('resetConfigBtn');
    }

    bindEvents() {
        this.csvFileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        this.startBtn.addEventListener('click', () => this.startReading());
        this.pauseBtn.addEventListener('click', () => this.pauseReading());
        this.stopBtn.addEventListener('click', () => this.stopReading());
        this.nextBtn.addEventListener('click', () => this.nextWord());
        
        // MongoDB関連のイベント
        this.connectBtn.addEventListener('click', () => this.connectToMongoDB());
        this.disconnectBtn.addEventListener('click', () => this.disconnectFromMongoDB());
        this.uploadToDbBtn.addEventListener('click', () => this.uploadToDatabase());
        this.loadFromDbBtn.addEventListener('click', () => this.loadFromDatabase());
        this.deleteDbBtn.addEventListener('click', () => this.deleteAllFromDatabase());
        
        // 環境変数関連のイベント
        this.saveConfigBtn.addEventListener('click', () => this.saveConfiguration());
        this.loadConfigBtn.addEventListener('click', () => this.loadConfiguration());
        this.resetConfigBtn.addEventListener('click', () => this.resetConfiguration());
        this.autoConnectCheckbox.addEventListener('change', () => this.toggleAutoConnect());
    }

    checkSpeechSupport() {
        if (!('speechSynthesis' in window)) {
            this.showSpeechError('お使いのブラウザは音声合成機能をサポートしていません。Chrome、Firefox、Safariなどの最新ブラウザをご利用ください。');
            return;
        }

        // 音声合成の基本的なサポートをチェック
        try {
            // 音声合成オブジェクトの存在とメソッドの確認
            if (this.speechSynthesis && typeof this.speechSynthesis.speak === 'function') {
                console.log('Speech synthesis is available');
                
                // 音声リストの取得を試行（非同期）
                this.loadVoices();
            } else {
                this.speechSupported = false;
                this.showSpeechWarning();
            }
        } catch (error) {
            console.error('Speech synthesis check error:', error);
            this.speechSupported = false;
            this.showSpeechWarning();
        }
    }

    loadVoices() {
        // 音声リストの読み込み
        const voices = this.speechSynthesis.getVoices();
        if (voices.length > 0) {
            console.log('Voices loaded:', voices.length);
            this.speechSupported = true;
            this.availableVoices = voices;
        } else {
            // 音声リストが空の場合は、イベントを待つ
            this.speechSynthesis.addEventListener('voiceschanged', () => {
                const voices = this.speechSynthesis.getVoices();
                console.log('Voices loaded after event:', voices.length);
                
                if (voices.length > 0) {
                    this.speechSupported = true;
                    this.availableVoices = voices;
                    console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));
                } else {
                    console.warn('No voices available - speech synthesis may not work properly');
                    this.speechSupported = false;
                    this.showLinuxVoiceWarning();
                }
            });
            
            // タイムアウト設定（5秒）
            setTimeout(() => {
                if (!this.speechSupported) {
                    console.warn('Voice loading timeout - proceeding with limited functionality');
                    this.speechSupported = true; // 音声がなくてもテキスト表示は可能
                }
            }, 5000);
        }
    }

    showLinuxVoiceWarning() {
        const warningDiv = document.createElement('div');
        warningDiv.className = 'speech-warning';
        warningDiv.innerHTML = `
            <div class="warning-content">
                <h3>⚠️ Linux環境での音声合成警告</h3>
                <p>音声エンジンが見つかりません。Linux環境では以下の設定が必要な場合があります：</p>
                <ul style="text-align: left; margin: 10px 0;">
                    <li>espeak-ng のインストール: <code>sudo apt install espeak-ng</code></li>
                    <li>festival のインストール: <code>sudo apt install festival</code></li>
                    <li>Chrome の音声設定確認</li>
                </ul>
                <p>テキスト表示モードで学習を続けることができます。</p>
                <div class="warning-buttons">
                    <button onclick="this.parentElement.parentElement.parentElement.style.display='none'">了解</button>
                    <button onclick="window.wordReader.retrySpeechSupport()" class="retry-btn">音声を再試行</button>
                </div>
            </div>
        `;
        document.querySelector('.container').insertBefore(warningDiv, document.querySelector('main'));
    }

    showSpeechError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'speech-error';
        errorDiv.innerHTML = `
            <div class="error-content">
                <h3>⚠️ 音声機能エラー</h3>
                <p>${message}</p>
                <p>テキスト表示モードで学習を続けることができます。</p>
            </div>
        `;
        document.querySelector('.container').insertBefore(errorDiv, document.querySelector('main'));
    }

    showSpeechWarning() {
        const warningDiv = document.createElement('div');
        warningDiv.className = 'speech-warning';
        warningDiv.innerHTML = `
            <div class="warning-content">
                <h3>⚠️ 音声機能の警告</h3>
                <p>音声合成に問題が発生する可能性があります。Linux環境では特に注意が必要です。</p>
                <p>音声が再生されない場合は、テキスト表示で学習を続けてください。</p>
                <div class="warning-buttons">
                    <button onclick="this.parentElement.parentElement.parentElement.style.display='none'">了解</button>
                    <button onclick="window.wordReader.retrySpeechSupport()" class="retry-btn">音声を再試行</button>
                </div>
            </div>
        `;
        document.querySelector('.container').insertBefore(warningDiv, document.querySelector('main'));
    }

    retrySpeechSupport() {
        console.log('Retrying speech support...');
        this.speechErrorCount = 0;
        this.speechSupported = true;
        
        // 警告メッセージを非表示
        const warning = document.querySelector('.speech-warning');
        if (warning) {
            warning.style.display = 'none';
        }
        
        // 成功メッセージを表示
        this.showSpeechSuccess();
    }

    showSpeechSuccess() {
        const successDiv = document.createElement('div');
        successDiv.className = 'speech-success';
        successDiv.innerHTML = `
            <div class="success-content">
                <h3>✅ 音声機能が有効になりました</h3>
                <p>音声合成を再試行しました。学習を開始してください。</p>
                <button onclick="this.parentElement.parentElement.style.display='none'">了解</button>
            </div>
        `;
        document.querySelector('.container').insertBefore(successDiv, document.querySelector('main'));
        
        // 3秒後に自動で非表示
        setTimeout(() => {
            if (successDiv.parentElement) {
                successDiv.style.display = 'none';
            }
        }, 3000);
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith('.csv')) {
            alert('CSVファイルを選択してください。');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                this.parseCSV(e.target.result);
                this.displayFileInfo(file.name);
                this.showControls();
                this.displayWordList();
            } catch (error) {
                alert('CSVファイルの読み込みに失敗しました。ファイル形式を確認してください。');
                console.error('CSV parsing error:', error);
            }
        };
        reader.readAsText(file, 'UTF-8');
    }

    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        this.words = [];

        for (let line of lines) {
            line = line.trim();
            if (!line) continue;

            // カンマで分割（シンプルな実装）
            const parts = line.split(',');
            if (parts.length >= 2) {
                const english = parts[0].trim();
                const japanese = parts.slice(1).join(',').trim(); // 複数のカンマがある場合も対応
                
                if (english && japanese) {
                    this.words.push({ english, japanese });
                }
            }
        }

        if (this.words.length === 0) {
            throw new Error('有効な単語データが見つかりませんでした。');
        }
    }

    displayFileInfo(fileName) {
        this.fileName.textContent = fileName;
        this.wordCount.textContent = this.words.length;
        this.fileInfo.style.display = 'block';
    }

    showControls() {
        this.controls.style.display = 'flex';
        this.progressSection.style.display = 'block';
        this.currentWord.style.display = 'block';
        this.wordList.style.display = 'block';
        this.databaseSection.style.display = 'block';
    }

    // 環境変数初期化
    initializeEnvironment() {
        // 保存された設定を読み込み
        this.loadConfiguration();
        
        // 自動接続が有効で接続文字列がある場合、自動接続を試行
        if (this.envManager.getAutoConnect() && this.envManager.hasConnectionString()) {
            setTimeout(() => {
                this.autoConnectToMongoDB();
            }, 1000);
        }
    }

    // 設定保存
    saveConfiguration() {
        const connectionString = this.mongoConnectionString.value.trim();
        const autoConnect = this.autoConnectCheckbox.checked;
        
        this.envManager.setConnectionString(connectionString);
        this.envManager.setAutoConnect(autoConnect);
        
        this.showDatabaseSuccess('設定を保存しました');
    }

    // 設定読み込み
    loadConfiguration() {
        const connectionString = this.envManager.getConnectionString();
        const autoConnect = this.envManager.getAutoConnect();
        
        this.mongoConnectionString.value = connectionString;
        this.autoConnectCheckbox.checked = autoConnect;
        
        if (connectionString) {
            this.showDatabaseSuccess('設定を読み込みました');
        }
    }

    // 設定リセット
    resetConfiguration() {
        if (!confirm('すべての設定をリセットしますか？この操作は元に戻せません。')) {
            return;
        }
        
        this.envManager.reset();
        this.mongoConnectionString.value = '';
        this.autoConnectCheckbox.checked = false;
        
        // MongoDB接続も切断
        if (this.isMongoConnected) {
            this.disconnectFromMongoDB();
        }
        
        this.showDatabaseSuccess('設定をリセットしました');
    }

    // 自動接続の切り替え
    toggleAutoConnect() {
        const autoConnect = this.autoConnectCheckbox.checked;
        this.envManager.setAutoConnect(autoConnect);
        
        if (autoConnect) {
            this.showDatabaseSuccess('自動接続が有効になりました');
        } else {
            this.showDatabaseSuccess('自動接続が無効になりました');
        }
    }

    // 自動接続
    async autoConnectToMongoDB() {
        const connectionString = this.envManager.getConnectionString();
        if (!connectionString) {
            return;
        }

        this.mongoConnectionString.value = connectionString;
        
        try {
            const success = await this.mongoManager.connect(connectionString);
            if (success) {
                this.isMongoConnected = true;
                this.updateDatabaseStatus(true);
                this.updateDatabaseButtons();
                await this.updateWordCount();
                this.showDatabaseSuccess('MongoDB Atlasに自動接続しました');
            }
        } catch (error) {
            console.warn('自動接続に失敗:', error);
        }
    }

    // MongoDB操作メソッド
    async connectToMongoDB() {
        const connectionString = this.mongoConnectionString.value.trim();
        if (!connectionString) {
            alert('MongoDB Atlas接続文字列を入力してください');
            return;
        }

        this.connectBtn.disabled = true;
        this.connectBtn.textContent = '接続中...';

        try {
            // まず通常のMongoDBドライバーで接続を試行
            const success = await this.mongoManager.connect(connectionString);
            if (success) {
                this.isMongoConnected = true;
                this.useDataAPI = false;
                this.updateDatabaseStatus(true);
                this.updateDatabaseButtons();
                await this.updateWordCount();
                this.showDatabaseSuccess('MongoDB Atlasに接続しました（ドライバー使用）');
            } else {
                this.showDatabaseError('MongoDB Atlasへの接続に失敗しました');
            }
        } catch (error) {
            console.error('MongoDB接続エラー:', error);
            
            // ドライバー読み込みエラーの場合、Data APIを試行
            if (error.message.includes('driver') || error.message.includes('CDN')) {
                this.showDriverErrorWithDataAPIOption();
            } else {
                // より詳細なエラーメッセージを表示
                let errorMessage = 'MongoDB Atlasへの接続に失敗しました';
                
                if (error.message.includes('connection')) {
                    errorMessage = 'MongoDB Atlasへの接続に失敗しました。接続文字列とネットワーク設定を確認してください。';
                } else if (error.message.includes('authentication')) {
                    errorMessage = '認証に失敗しました。ユーザー名とパスワードを確認してください。';
                } else if (error.message.includes('network')) {
                    errorMessage = 'ネットワークエラーが発生しました。インターネット接続を確認してください。';
                }
                
                this.showDatabaseError(errorMessage);
            }
        } finally {
            this.connectBtn.disabled = false;
            this.connectBtn.textContent = '接続';
        }
    }

    async disconnectFromMongoDB() {
        try {
            await this.mongoManager.disconnect();
            this.isMongoConnected = false;
            this.updateDatabaseStatus(false);
            this.updateDatabaseButtons();
            this.showDatabaseSuccess('MongoDB Atlasから切断しました');
        } catch (error) {
            this.showDatabaseError(`切断エラー: ${error.message}`);
        }
    }

    async uploadToDatabase() {
        if (!this.isMongoConnected) {
            alert('MongoDB Atlasに接続してください');
            return;
        }

        if (this.words.length === 0) {
            alert('CSVファイルを先に読み込んでください');
            return;
        }

        this.uploadToDbBtn.disabled = true;
        this.uploadToDbBtn.textContent = '登録中...';

        try {
            // CSVデータを文字列に変換
            const csvData = this.words.map(word => `${word.english},${word.japanese}`).join('\n');
            
            let count;
            if (this.useDataAPI) {
                count = await this.dataAPIManager.uploadWordsFromCSV(csvData);
            } else {
                count = await this.mongoManager.uploadWordsFromCSV(csvData);
            }
            await this.updateWordCount();
            this.showDatabaseSuccess(`${count}個の単語をデータベースに登録しました`);
        } catch (error) {
            this.showDatabaseError(`登録エラー: ${error.message}`);
        } finally {
            this.uploadToDbBtn.disabled = false;
            this.uploadToDbBtn.textContent = 'CSVをDBに登録';
        }
    }

    async loadFromDatabase() {
        if (!this.isMongoConnected) {
            alert('MongoDB Atlasに接続してください');
            return;
        }

        this.loadFromDbBtn.disabled = true;
        this.loadFromDbBtn.textContent = '読み込み中...';

        try {
            let dbWords;
            if (this.useDataAPI) {
                dbWords = await this.dataAPIManager.getAllWords();
            } else {
                dbWords = await this.mongoManager.getAllWords();
            }
            
            if (dbWords.length === 0) {
                this.showDatabaseError('データベースに単語がありません');
                return;
            }

            // データベースの単語をアプリの形式に変換
            this.words = dbWords.map(word => ({
                english: word.english,
                japanese: word.japanese
            }));

            this.displayFileInfo('データベース', this.words.length);
            this.showControls();
            this.displayWordList();
            this.showDatabaseSuccess(`${this.words.length}個の単語をデータベースから読み込みました`);
        } catch (error) {
            this.showDatabaseError(`読み込みエラー: ${error.message}`);
        } finally {
            this.loadFromDbBtn.disabled = false;
            this.loadFromDbBtn.textContent = 'DBから読み込み';
        }
    }

    async deleteAllFromDatabase() {
        if (!this.isMongoConnected) {
            alert('MongoDB Atlasに接続してください');
            return;
        }

        if (!confirm('データベースのすべての単語を削除しますか？この操作は元に戻せません。')) {
            return;
        }

        this.deleteDbBtn.disabled = true;
        this.deleteDbBtn.textContent = '削除中...';

        try {
            const count = await this.mongoManager.deleteAllWords();
            await this.updateWordCount();
            this.showDatabaseSuccess(`${count}個の単語を削除しました`);
        } catch (error) {
            this.showDatabaseError(`削除エラー: ${error.message}`);
        } finally {
            this.deleteDbBtn.disabled = false;
            this.deleteDbBtn.textContent = 'DB全削除';
        }
    }

    updateDatabaseStatus(connected) {
        const statusElement = document.getElementById('dbStatus');
        if (connected) {
            this.dbStatusText.textContent = '接続済み';
            statusElement.className = 'db-status connected';
        } else {
            this.dbStatusText.textContent = '未接続';
            statusElement.className = 'db-status disconnected';
            this.dbWordCount.textContent = '';
        }
    }

    updateDatabaseButtons() {
        const connected = this.isMongoConnected;
        this.connectBtn.disabled = connected;
        this.disconnectBtn.disabled = !connected;
        this.uploadToDbBtn.disabled = !connected;
        this.loadFromDbBtn.disabled = !connected;
        this.deleteDbBtn.disabled = !connected;
    }

    async updateWordCount() {
        if (this.isMongoConnected) {
            try {
                const count = await this.mongoManager.getWordCount();
                this.dbWordCount.textContent = `(${count}単語)`;
            } catch (error) {
                console.error('単語数取得エラー:', error);
            }
        }
    }

    showDatabaseSuccess(message) {
        this.showDatabaseMessage(message, 'success');
    }

    showDatabaseError(message) {
        this.showDatabaseMessage(message, 'error');
    }

    showDatabaseMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `database-message ${type}`;
        messageDiv.innerHTML = `
            <div class="message-content">
                <h4>${type === 'success' ? '✅' : '❌'} ${message}</h4>
                <button onclick="this.parentElement.parentElement.remove()">閉じる</button>
            </div>
        `;
        
        const container = document.querySelector('.container');
        container.insertBefore(messageDiv, document.querySelector('main'));
        
        // 3秒後に自動で非表示
        setTimeout(() => {
            if (messageDiv.parentElement) {
                messageDiv.remove();
            }
        }, 3000);
    }

    showDriverErrorWithDataAPIOption() {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'database-message error driver-error';
        messageDiv.innerHTML = `
            <div class="message-content">
                <h4>⚠️ MongoDBドライバー読み込みエラー</h4>
                <p>MongoDBドライバーの読み込みに失敗しました。代替手段としてMongoDB Atlas Data APIを使用できます：</p>
                <ul>
                    <li>MongoDB Atlas Data APIを使用（推奨）</li>
                    <li>ローカルファイルを配置</li>
                    <li>別のブラウザで試行</li>
                </ul>
                <div class="driver-error-actions">
                    <button onclick="window.wordReader.showDataAPISetup()" class="btn btn-outline">Data API設定</button>
                    <button onclick="location.reload()" class="btn btn-outline">ページ再読み込み</button>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" class="btn btn-outline">閉じる</button>
                </div>
                <p class="driver-error-note">
                    <small>詳細な解決方法は <code>mongodb-driver-troubleshooting.md</code> を参照してください</small>
                </p>
            </div>
        `;
        
        const container = document.querySelector('.container');
        container.insertBefore(messageDiv, document.querySelector('main'));
        
        // 15秒後に自動で非表示
        setTimeout(() => {
            if (messageDiv.parentElement) {
                messageDiv.remove();
            }
        }, 15000);
    }

    showDataAPISetup() {
        const apiKey = prompt('MongoDB Atlas Data API Keyを入力してください:');
        const clusterName = prompt('MongoDB Atlas Cluster Nameを入力してください:');
        
        if (apiKey && clusterName) {
            this.connectWithDataAPI(apiKey, clusterName);
        }
    }

    async connectWithDataAPI(apiKey, clusterName) {
        this.connectBtn.disabled = true;
        this.connectBtn.textContent = 'Data API接続中...';

        try {
            await this.dataAPIManager.connect(apiKey, clusterName);
            this.isMongoConnected = true;
            this.useDataAPI = true;
            this.updateDatabaseStatus(true);
            this.updateDatabaseButtons();
            await this.updateWordCount();
            this.showDatabaseSuccess('MongoDB Atlas Data APIに接続しました');
        } catch (error) {
            console.error('Data API接続エラー:', error);
            this.showDatabaseError(`Data API接続エラー: ${error.message}`);
        } finally {
            this.connectBtn.disabled = false;
            this.connectBtn.textContent = '接続';
        }
    }

    displayWordList() {
        this.wordItems.innerHTML = '';
        
        this.words.forEach((word, index) => {
            const wordItem = document.createElement('div');
            wordItem.className = 'word-item';
            wordItem.innerHTML = `
                <div class="english">${word.english}</div>
                <div class="japanese">${word.japanese}</div>
            `;
            wordItem.dataset.index = index;
            this.wordItems.appendChild(wordItem);
        });
    }

    updateWordList() {
        const items = this.wordItems.querySelectorAll('.word-item');
        items.forEach((item, index) => {
            item.classList.remove('current', 'completed');
            
            if (index === this.currentIndex) {
                item.classList.add('current');
            } else if (index < this.currentIndex) {
                item.classList.add('completed');
            }
        });
    }

    startReading() {
        if (this.words.length === 0) return;

        this.isPlaying = true;
        this.isPaused = false;
        this.currentIndex = 0;

        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        this.stopBtn.disabled = false;
        this.nextBtn.disabled = false;

        this.readCurrentWord();
    }

    pauseReading() {
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.speechSynthesis.pause();
            this.pauseBtn.textContent = '再開';
        } else {
            this.speechSynthesis.resume();
            this.pauseBtn.textContent = '一時停止';
        }
    }

    stopReading() {
        this.isPlaying = false;
        this.isPaused = false;
        this.speechSynthesis.cancel();

        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.stopBtn.disabled = true;
        this.nextBtn.disabled = true;
        this.pauseBtn.textContent = '一時停止';

        this.updateProgress();
        this.updateWordList();
    }

    nextWord() {
        if (this.currentIndex < this.words.length - 1) {
            this.speechSynthesis.cancel();
            this.currentIndex++;
            this.readCurrentWord();
        } else {
            this.stopReading();
        }
    }

    readCurrentWord() {
        if (this.currentIndex >= this.words.length) {
            this.stopReading();
            return;
        }

        const word = this.words[this.currentIndex];
        this.displayCurrentWord(word);
        this.updateProgress();
        this.updateWordList();

        // 英単語を読み上げ
        this.speak(word.english, 'en-US', () => {
            if (!this.isPlaying || this.isPaused) return;
            
            // 1秒待機
            setTimeout(() => {
                if (!this.isPlaying || this.isPaused) return;
                
                // 日本語訳を読み上げ
                this.speak(word.japanese, 'ja-JP', () => {
                    if (!this.isPlaying || this.isPaused) return;
                    
                    // 1秒待機して次の単語へ
                    setTimeout(() => {
                        if (this.isPlaying && !this.isPaused) {
                            this.currentIndex++;
                            this.readCurrentWord();
                        }
                    }, 1000);
                });
            }, 1000);
        });
    }

    speak(text, lang, onEnd) {
        // 音声合成がサポートされていない場合、テキスト表示のみ
        if (!this.speechSupported || this.speechErrorCount >= this.maxSpeechErrors) {
            console.log(`Text display only: ${text}`);
            if (onEnd) {
                setTimeout(onEnd, 1000); // 1秒待機してから次へ
            }
            return;
        }

        // 音声合成が利用可能か再チェック
        if (!this.speechSynthesis || typeof this.speechSynthesis.speak !== 'function') {
            console.log('Speech synthesis not available, falling back to text display');
            this.speechSupported = false;
            if (onEnd) {
                setTimeout(onEnd, 1000);
            }
            return;
        }

        // Stack Overflowの解決策: 必ずcancel()を呼ぶ
        this.speechSynthesis.cancel();

        try {
            // 日本語の場合は漢字をひらがなに変換
            let processedText = text;
            if (lang.startsWith('ja')) {
                processedText = this.convertKanjiToHiragana(text);
                console.log(`Original: ${text} → Processed: ${processedText}`);
            }

            this.currentUtterance = new SpeechSynthesisUtterance(processedText);
            this.currentUtterance.lang = lang;
            
            // レートを2以下に制限（Chromeの制限）
            this.currentUtterance.rate = Math.min(0.8, 2);
            this.currentUtterance.pitch = 1;
            this.currentUtterance.volume = 1;

            // 利用可能な音声を設定
            if (this.availableVoices && this.availableVoices.length > 0) {
                const voice = this.selectBestVoice(lang);
                if (voice) {
                    this.currentUtterance.voice = voice;
                    console.log(`Using voice: ${voice.name} (${voice.lang})`);
                }
            }

            // タイムアウト設定（8秒）
            const timeoutId = setTimeout(() => {
                console.warn('Speech synthesis timeout');
                this.speechSynthesis.cancel();
                if (onEnd) {
                    setTimeout(onEnd, 1000);
                }
            }, 8000);

            this.currentUtterance.onend = () => {
                clearTimeout(timeoutId);
                this.speechErrorCount = 0; // 成功時はエラーカウントをリセット
                console.log(`Finished speaking: ${processedText}`);
                if (onEnd) onEnd();
            };

            this.currentUtterance.onerror = (event) => {
                clearTimeout(timeoutId);
                console.error('Speech synthesis error:', event.error);
                this.speechErrorCount++;
                
                if (this.speechErrorCount >= this.maxSpeechErrors) {
                    this.showSpeechFallback();
                }
                
                // エラーが発生しても次の処理を続行
                if (onEnd) {
                    setTimeout(onEnd, 1000);
                }
            };

            this.currentUtterance.onstart = () => {
                console.log(`Speaking: ${processedText}`);
            };

            // 音声合成の実行（Stack Overflowの解決策に従って）
            this.speechSynthesis.speak(this.currentUtterance);
            
        } catch (error) {
            console.error('Speech synthesis exception:', error);
            this.speechErrorCount++;
            if (onEnd) {
                setTimeout(onEnd, 1000);
            }
        }
    }

    convertKanjiToHiragana(text) {
        // 基本的な漢字からひらがなへの変換マッピング
        const kanjiMap = {
            '川': 'かわ',
            '山': 'やま',
            '海': 'うみ',
            '森': 'もり',
            '砂漠': 'さばく',
            '湖': 'みずうみ',
            '谷': 'たに',
            '島': 'しま',
            '橋': 'はし',
            '道路': 'どうろ',
            '家': 'いえ',
            '学校': 'がっこう',
            '病院': 'びょういん',
            '図書館': 'としょかん',
            '公園': 'こうえん',
            '庭': 'にわ',
            '木': 'き',
            '花': 'はな',
            '鳥': 'とり',
            '魚': 'さかな',
            '猫': 'ねこ',
            '犬': 'いぬ',
            '馬': 'うま',
            '牛': 'うし',
            '豚': 'ぶた',
            '鶏': 'にわとり',
            '象': 'ぞう',
            'ライオン': 'らいおん',
            'トラ': 'とら',
            '熊': 'くま',
            'うさぎ': 'うさぎ',
            'ネズミ': 'ねずみ',
            'ヘビ': 'へび',
            'カエル': 'かえる',
            '蝶': 'ちょう',
            '蜂': 'はち',
            'アリ': 'あり',
            'クモ': 'くも',
            '太陽': 'たいよう',
            '月': 'つき',
            '星': 'ほし',
            '雲': 'くも',
            '雨': 'あめ',
            '雪': 'ゆき',
            '風': 'かぜ',
            '火': 'ひ',
            '水': 'みず',
            '地球': 'ちきゅう',
            '空': 'そら',
            '地面': 'じめん',
            '岩': 'いわ',
            '砂': 'すな',
            '氷': 'こおり',
            '煙': 'けむり',
            '光': 'ひかり',
            '暗い': 'くらい',
            '熱い': 'あつい',
            '冷たい': 'つめたい',
            '大きい': 'おおきい',
            '小さい': 'ちいさい',
            '速い': 'はやい',
            '遅い': 'おそい',
            '良い': 'よい',
            '悪い': 'わるい',
            '幸せ': 'しあわせ',
            '悲しい': 'かなしい',
            '怒っている': 'おこっている',
            '驚いた': 'おどろいた',
            '怖い': 'こわい',
            '興奮した': 'こうふんした',
            '疲れた': 'つかれた',
            'お腹が空いた': 'おなかがすいた',
            '喉が渇いた': 'のどがかわいた',
            '眠い': 'ねむい',
            '起きている': 'おきている',
            '古い': 'ふるい',
            '新しい': 'あたらしい',
            '若い': 'わかい',
            'きれい': 'きれい',
            '汚い': 'きたない',
            '満杯': 'まんぱい',
            '空': 'から',
            '開いている': 'あいている',
            '閉じている': 'とじている',
            '高い': 'たかい',
            '低い': 'ひくい',
            '長い': 'ながい',
            '短い': 'みじかい',
            '広い': 'ひろい',
            '狭い': 'せまい',
            '厚い': 'あつい',
            '薄い': 'うすい',
            '重い': 'おもい',
            '軽い': 'かるい',
            '強い': 'つよい',
            '弱い': 'よわい',
            '硬い': 'かたい',
            '柔らかい': 'やわらかい',
            '滑らか': 'なめらか',
            '粗い': 'あらい',
            '鋭い': 'するどい',
            '鈍い': 'にぶい',
            '明るい': 'あかるい',
            '静か': 'しずか',
            'うるさい': 'うるさい',
            '甘い': 'あまい',
            '酸っぱい': 'すっぱい',
            '塩辛い': 'しおからい',
            '苦い': 'にがい',
            '辛い': 'からい',
            '温かい': 'あたたかい',
            '涼しい': 'すずしい',
            '凍るほど寒い': 'こおるほどさむい',
            '沸騰するほど熱い': 'ふっとうするほどあつい',
            '不器用': 'ふきよう',
            '改修': 'かいしゅう',
            '隠れる': 'かくれる',
            'ごみ': 'ごみ',
            'きらめき': 'きらめき',
            '絶望的な': 'ぜつぼうてきな',
            '一方': 'いっぽう',
            '強引': 'ごういん',
            '隠者': 'いんじゃ',
            '法外な': 'ほうがいな',
            '推測する': 'すいそくする',
            '消し去る': 'けしさる',
            '逃げた': 'にげた',
            '卑劣に': 'ひれつに',
            '上院の対決': 'じょういんのたいけつ',
            '偏向したボルト': 'へんこうしたボルト',
            '外で騒いでいる迷惑な仲間たち': 'そとでさわいでいるめいわくななかまたち',
            '適度に巨大な': 'てきどにきょだいな',
            'パートナーシップの拡大を正当化する': 'パートナーシップのかくだいをせいとうかする',
            '共犯者と': 'きょうはんしゃと',
            'どちらも痛い': 'どちらもいたい',
            'ねじれた回路': 'ねじれたかいろ',
            '不良たち': 'ふりょうたち',
            '消費': 'しょうひ',
            '無生物': 'むせいぶつ',
            '引き出す': 'ひきだす',
            '見つめる': 'みつめる',
            'かんしゃく': 'かんしゃく',
            '分子的に': 'ぶんしてきに',
            'おいしい': 'おいしい',
            '閉じ込められた': 'とじこめられた',
            '出場者': 'しゅつじょうしゃ',
            '追求': 'ついきゅう',
            '咳をする': 'せきをする',
            '厄介な': 'やっかいな',
            '宣誓した': 'せんせいした',
            '消化不良': 'しょうかふりょう',
            '剥がれ落ちる': 'はがれおちる',
            '跳ねる': 'はねる',
            '差し迫った': 'さしせまった',
            'フローラ': 'フローラ',
            '抑圧的な': 'よくあつてきな',
            '奇妙な': 'きみような',
            '瓦礫': 'がれき',
            'ジャミング': 'ジャミング',
            '破壊者': 'はかいしゃ',
            '復讐': 'ふくしゅう',
            '居眠り': 'いねむり',
            '責任': 'せきにん',
            '重要な': 'じゅうような',
            '慣習的な': 'かんしゅうてきな',
            'ゴロゴロ': 'ゴロゴロ',
            'お腹': 'おなか',
            '船に荷物を積む': 'ふねににもつをつむ',
            '会話': 'かいわ',
            '突き出ている': 'つきでている',
            '大失敗': 'だいしっぱい',
            '繁栄する': 'はんえいする',
            '密輸': 'みつゆ',
            '粉々に': 'こなごなに',
            '腐った': 'くさった',
            '叩きのめす': 'たたきのめす',
            '奇妙な男たち': 'きみようなおとこたち',
            'みんな': 'みんな',
            '味がしない': 'あじがしない',
            '安全性': 'あんぜんせい',
            'ブリッジレバー': 'ブリッジレバー',
            '石油掘削装置': 'せきゆくっさくそうち',
            'オーブン': 'オーブン',
            '閾値': 'いきち',
            '悪臭を放つ': 'あくしゅうをはなつ',
            '縞模様': 'しまもよう',
            'しみ': 'しみ',
            '浸透する': 'しんとうする',
            '不可逆': 'ふかぎゃく',
            '行為': 'こうい',
            '正気': 'せいき',
            'チューブ': 'チューブ',
            '取りつかれた': 'とりつかれた',
            '機敏な': 'きびんな',
            '暗くなる': 'くらくなる',
            '困惑した': 'こんわくした',
            '矛盾': 'むじゅん',
            '不屈の精神': 'ふくつのせいしん',
            '悪魔': 'あくま',
            '潜む': 'ひそむ',
            'サーバント': 'サーバント',
            '誘拐された': 'ゆうかいされた',
            '注ぎ出された': 'そそぎだされた',
            '熱々を注いだ': 'あつあつをそそいだ',
            'シラミ': 'シラミ',
            '虐殺': 'ぎゃくさつ',
            '登る': 'のぼる',
            '芽生え': 'めばえ',
            '飲み込んだ': 'のみこんだ',
            '汚された': 'けがされた',
            '息苦しい': 'いきぐるしい',
            '回避する': 'かいひする',
            '振るった': 'ふるった',
            '途方もない': 'とほうもない',
            '空中': 'くうちゅう',
            '祀る': 'まつる',
            '祭壇': 'さいだん',
            '増殖する': 'ぞうしょくする',
            '頑丈': 'がんじょう',
            '苦痛': 'くつう',
            '身もだえした': 'みもだえした',
            '多様に': 'たように',
            '計量する': 'けいりょうする',
            '謎めいた': 'なぞめいた',
            '大言壮語': 'たいげんそうご',
            '横暴な': 'おうぼうな',
            '不器用な': 'ふきような',
            '人質': 'ひとじち',
            '卑劣な': 'ひれつな',
            '放棄': 'ほうき',
            '忌まわしいもの': 'いまわしいもの',
            'たくさんの': 'たくさんの',
            '落ち着く': 'おちつく',
            '娘': 'むすめ',
            '補償する': 'ほしょうする',
            '侵入した': 'しんにゅうした',
            '礼儀正しさ': 'れいぎただしさ',
            '注ぐ': 'そそぐ',
            '郊外': 'こうがい',
            'ちくしょう': 'ちくしょう',
            '老人': 'ろうじん',
            '強盗': 'ごうとう',
            '戦利品': 'せんりひん',
            '発明する': 'はつめいする',
            '努力する': 'どりょくする',
            '回避': 'かいひ',
            '五線譜': 'ごせんふ',
            '記章': 'きしょう',
            '死すべき者': 'しすべきもの',
            '持ち上げる': 'もちあげる',
            '下船する': 'げせんする',
            '割れ目': 'われめ',
            '反響した': 'はんきょうした',
            '群がる': 'むらがる',
            '激怒した': 'げきどした',
            '案内係': 'あんないがかり',
            '考える': 'かんがえる',
            '睡眠状態': 'すいみんじょうたい',
            '強風': 'きょうふう',
            '王位': 'おうい',
            '追放する': 'ついほうする',
            '地区': 'ちく',
            'こっそり抜け出した': 'こっそりぬけだした',
            '穴あき': 'あなあき',
            '挑戦する': 'ちょうせんする',
            '大陸': 'たいりく',
            '屈服する': 'くっぷくする',
            '減少する': 'げんしょうする',
            '人間': 'にんげん',
            '貪り食う': 'むさぼりくう',
            '殴る': 'なぐる',
            '地形': 'ちけい',
            '解き放つ': 'ときはなつ',
            '冗談': 'じょうだん',
            '予感': 'よかん',
            '急落': 'きゅうらく',
            '燃え上がった': 'もえあがった',
            '授ける': 'さずける',
            'きらめくガラス': 'きらめくガラス',
            '陰謀を企む': 'いんぼうをたくらむ',
            '不衛生な': 'ふえいせいな',
            '迷惑': 'めいわく',
            '羊毛のような': 'ようもうのような',
            '渦潮': 'うずしお',
            '炉': 'ろ',
            '安定させる': 'あんていさせる',
            '舐める': 'なめる',
            '授けられた': 'さずけられた',
            '信条': 'しんじょう',
            'きらめき': 'きらめき',
            '解決する': 'かいけつする',
            '診療所': 'しんりょうじょ',
            '厚かましい': 'あつかましい',
            '復讐': 'ふくしゅう',
            '詮索好きな': 'せんさくずきな',
            '傲慢': 'ごうまん',
            '浸透した': 'しんとうした',
            '滲み出る': 'にじみでる',
            '駆け落ち': 'かけおち',
            '小屋': 'こや',
            'すすり泣く': 'すすりなく',
            '活力': 'かつりょく',
            '満ち溢れる': 'みちあふれる',
            '知覚する': 'ちかくする',
            '残念': 'ざんねん',
            '震える': 'ふるえる',
            'あごひげ': 'あごひげ',
            'まぶしさ': 'まぶしさ',
            '予言した': 'よげんした',
            'のんびりする': 'のんびりする',
            '溝': 'みぞ',
            '作物': 'さくもつ',
            '無謀な': 'むぼうな',
            '羊飼い': 'ひつじかい',
            '干渉する': 'かんしょうする',
            '干渉': 'かんしょう',
            '混乱した': 'こんらんした',
            '風の竜': 'かぜのりゅう',
            '停滞した': 'ていたいした',
            '繁栄した': 'はんえいした',
            '推定された': 'すいていされた',
            '吟遊詩人': 'ぎんゆうしじん',
            '突風': 'とっぷう',
            '壷': 'つぼ',
            '私は認める': 'わたしはみとめる',
            '食欲': 'しょくよく',
            '慰め': 'なぐさめ',
            '落ち込む': 'おちこむ',
            '懇願する': 'こんがんする',
            'ガキ': 'ガキ',
            '悪質な': 'あくしつな',
            '子孫': 'しそん',
            'セット': 'セット',
            '富': 'とみ',
            'チャンバー': 'チャンバー',
            '抽出': 'ちゅうしゅつ',
            '潜入する': 'せんにゅうする',
            '兄弟': 'きょうだい',
            '使い手': 'つかいて',
            '押し出す': 'おしだす',
            '反抗する': 'はんこうする',
            '乱用': 'らんよう',
            '倒れる': 'たおれる',
            '興奮した': 'こうふんした',
            'そのような': 'そのような',
            '煮る': 'にる',
            '特異な': 'とくいな',
            '嫌悪': 'けんお',
            '必死に': 'ひっしに',
            '軍': 'ぐん',
            '性急な': 'せいきゅうな',
            '瀬戸際': 'せとぎわ',
            '冷笑する': 'れいしょうする',
            '醜い': 'みにくい',
            '降伏': 'こうふく',
            '持ち主': 'もちぬし',
            '視線': 'しせん',
            '忠誠': 'ちゅうせい',
            '誓う': 'ちかう',
            '全く': 'まったく',
            '穀物': 'こくもつ',
            '偵察': 'ていさつ',
            '臭い': 'くさい',
            '倒された': 'たおされた',
            '魅了する': 'みりょうする',
            '山賊': 'さんぞく',
            '伝承': 'でんしょう',
            '悪い': 'わるい',
            '下に': 'したに',
            '推定する': 'すいていする',
            '略奪': 'りゃくだつ',
            'ゾッとする': 'ゾッとする',
            '引き渡す': 'ひきわたす',
            '配る': 'くばる',
            '下品な人々': 'げひんなひとびと',
            '口論': 'こうろん',
            '非難する': 'ひなんする',
            '布告': 'ふこく',
            '刈り取る': 'かりとる',
            'スラグの山': 'スラグのやま',
            '悲しむ': 'かなしむ',
            '巡礼者': 'じゅんれいしゃ',
            '腕章': 'わんしょう',
            'プルーン': 'プルーン',
            'ステーク': 'ステーク',
            '擦り切れた': 'すりきれた',
            '微妙': 'びみょう',
            '裏切り者': 'うらぎりもの',
            '彼女の代わりをする': 'かのじょのかわりをする',
            '汚い': 'きたない',
            '後退': 'こうたい',
            '挑発': 'ちょうはつ',
            '見下ろす': 'みおろす',
            '職人技': 'しょくにんわざ',
            '金': 'きん',
            '切望する': 'せつぼうする',
            'ビジネスの回復': 'ビジネスのかいふく',
            '共犯者': 'きょうはんしゃ',
            '運命': 'うんめい',
            '刺す': 'さす',
            '墓': 'はか',
            'ラード': 'ラード',
            '遠征': 'えんせい',
            '束': 'たば',
            'プレイした': 'プレイした',
            '雹': 'ひょう',
            '装身具': 'そうしんぐ',
            'ハゲ': 'ハゲ',
            'リダンス': 'リダンス',
            '磨き': 'みがき',
            '介入': 'かいにゅう',
            '難破した': 'なんぱした',
            '斑点': 'はんてん',
            'ビーズ': 'ビーズ',
            '誓い': 'ちかい',
            '不自由': 'ふじゆう',
            '突き刺された': 'つきさされた',
            '全面的': 'ぜんめんてき',
            '気になる': 'きになる',
            '余裕ある': 'よゆうある',
            '我慢する': 'がまんする',
            '送信': 'そうしん',
            '汚染': 'おせん',
            '威厳': 'いげん',
            'パーレイ': 'パーレイ',
            '謙虚な': 'けんきょな',
            '評価': 'ひょうか',
            '準備ができて': 'じゅんびができて',
            '転生': 'てんせい',
            '錯乱': 'さくらん',
            '押収する': 'おうしゅうする',
            '異常': 'いじょう',
            '墓地': 'ぼち',
            '宝庫': 'ほうこ',
            '浚渫船': 'しゅんせつせん',
            '侵略': 'しんりゃく',
            '混乱': 'こんらん',
            '子宮': 'しきゅう',
            '絶滅': 'ぜつめつ',
            '便所': 'べんじょ',
            '避難': 'ひなん',
            '打たれた': 'うたれた',
            '侵略': 'しんりゃく',
            '儀式': 'ぎしき',
            '暴動': 'ぼうどう',
            '趣のある': 'おもむきのある',
            '真髄': 'しんずい',
            '下位': 'かい',
            '潜む': 'ひそむ',
            '放棄する': 'ほうきする',
            '簒奪': 'さんだつ',
            '繁栄する': 'はんえいする',
            '巨大な': 'きょだいな',
            '遺産': 'いさん',
            '源泉': 'げんせん',
            'ほんのわずか': 'ほんのわずか',
            '滅びる': 'ほろびる',
            '償い': 'つぐない',
            'ひたむきな': 'ひたむきな',
            '故意に': 'こいに',
            '所持': 'しょじ',
            '深遠な': 'しんえんな',
            '再構成する': 'さいこうせいする',
            '無傷': 'むきず',
            'ためらい': 'ためらい',
            '軌道': 'きどう',
            'しっかりと': 'しっかりと',
            '戦い': 'たたかい',
            '外向き': 'そとむき'
        };

        // 漢字をひらがなに変換
        let result = text;
        for (const [kanji, hiragana] of Object.entries(kanjiMap)) {
            result = result.replace(new RegExp(kanji, 'g'), hiragana);
        }

        return result;
    }

    selectBestVoice(lang) {
        if (!this.availableVoices || this.availableVoices.length === 0) {
            return null;
        }

        // 日本語の場合は特に注意深く音声を選択
        if (lang.startsWith('ja')) {
            // 日本語専用の音声を優先的に探す
            let voice = this.availableVoices.find(v => 
                v.lang === 'ja-JP' || 
                v.lang === 'ja' || 
                v.name.toLowerCase().includes('japanese') ||
                v.name.toLowerCase().includes('japan')
            );
            
            if (voice) {
                console.log(`Selected Japanese voice: ${voice.name} (${voice.lang})`);
                return voice;
            }
        }

        // 指定された言語の音声を探す
        let voice = this.availableVoices.find(v => v.lang.startsWith(lang.split('-')[0]));
        
        // 見つからない場合は、デフォルト音声を使用
        if (!voice) {
            voice = this.availableVoices.find(v => v.default) || this.availableVoices[0];
        }

        return voice;
    }

    showSpeechFallback() {
        const fallbackDiv = document.createElement('div');
        fallbackDiv.className = 'speech-fallback';
        fallbackDiv.innerHTML = `
            <div class="fallback-content">
                <h3>🔇 音声機能が無効になりました</h3>
                <p>音声合成でエラーが続発したため、テキスト表示モードに切り替えました。</p>
                <p>学習は継続できますが、音声は再生されません。</p>
                <button onclick="this.parentElement.parentElement.style.display='none'">了解</button>
            </div>
        `;
        document.querySelector('.container').insertBefore(fallbackDiv, document.querySelector('main'));
    }

    displayCurrentWord(word) {
        this.englishWord.textContent = word.english;
        this.japaneseWord.textContent = word.japanese;
    }

    updateProgress() {
        const progress = ((this.currentIndex + 1) / this.words.length) * 100;
        this.progressFill.style.width = `${progress}%`;
        this.progressText.textContent = `${this.currentIndex + 1} / ${this.words.length} 単語`;
    }
}

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
    window.wordReader = new WordReader();
});
