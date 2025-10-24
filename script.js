class WordReader {
    constructor() {
        this.words = [];
        this.currentIndex = 0;
        this.isPlaying = false;
        this.isPaused = false;
        this.speechSynthesis = window.speechSynthesis;
        this.currentUtterance = null;
        
        this.initializeElements();
        this.bindEvents();
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
    }

    bindEvents() {
        this.csvFileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        this.startBtn.addEventListener('click', () => this.startReading());
        this.pauseBtn.addEventListener('click', () => this.pauseReading());
        this.stopBtn.addEventListener('click', () => this.stopReading());
        this.nextBtn.addEventListener('click', () => this.nextWord());
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
        if (this.currentUtterance) {
            this.speechSynthesis.cancel();
        }

        this.currentUtterance = new SpeechSynthesisUtterance(text);
        this.currentUtterance.lang = lang;
        this.currentUtterance.rate = 0.8;
        this.currentUtterance.pitch = 1;
        this.currentUtterance.volume = 1;

        this.currentUtterance.onend = onEnd;
        this.currentUtterance.onerror = (event) => {
            console.error('Speech synthesis error:', event.error);
            if (onEnd) onEnd();
        };

        this.speechSynthesis.speak(this.currentUtterance);
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
    new WordReader();
});

// ブラウザの音声合成サポートチェック
if (!('speechSynthesis' in window)) {
    alert('お使いのブラウザは音声合成機能をサポートしていません。Chrome、Firefox、Safariなどの最新ブラウザをご利用ください。');
}
