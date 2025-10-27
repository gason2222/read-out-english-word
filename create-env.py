#!/usr/bin/env python3
"""
.envファイル作成スクリプト
MongoDB Atlas接続文字列を設定
"""

import os

def create_env_file():
    """環境変数ファイルを作成"""
    print("🔧 .envファイル作成スクリプト")
    print("=" * 50)
    
    if os.path.exists('.env'):
        print("⚠️  既存の.envファイルが見つかりました")
        overwrite = input("上書きしますか？ (y/N): ").strip().lower()
        if overwrite != 'y':
            print("❌ 作成をキャンセルしました")
            return False
    
    print("\n📝 MongoDB Atlas接続文字列を入力してください")
    print("例: mongodb+srv://username:password@image2diary.abc123.mongodb.net/english-word?retryWrites=true&w=majority")
    
    connection_string = input("\n接続文字列: ").strip()
    
    if not connection_string:
        print("❌ 接続文字列が入力されていません")
        return False
    
    # .envファイルの内容
    env_content = f"""# MongoDB Atlas接続設定

# MongoDB Atlas接続文字列
# 形式: mongodb+srv://<username>:<password>@<cluster-url>/english-word?retryWrites=true&w=majority
# 例: mongodb+srv://english-word-user:yourpassword@image2diary.abc123.mongodb.net/english-word?retryWrites=true&w=majority
MONGODB_CONNECTION_STRING={connection_string}

# MongoDB Atlas Data API設定（代替手段）
# 実際のAPI Keyを取得して設定してください
MONGODB_DATA_API_KEY=
MONGODB_CLUSTER_NAME=image2diary

# 自動接続設定（true/false）
AUTO_CONNECT_MONGODB=true

# データベース設定
MONGODB_DATABASE=english-word
MONGODB_COLLECTION=words
"""
    
    # .envファイルを作成
    try:
        with open('.env', 'w', encoding='utf-8') as f:
            f.write(env_content)
        
        print("\n✅ .envファイルが作成されました！")
        print(f"📁 ファイル: {os.path.abspath('.env')}")
        print(f"🔗 接続文字列: {connection_string[:50]}...")
        
        return True
        
    except Exception as e:
        print(f"❌ .envファイルの作成に失敗しました: {e}")
        return False

if __name__ == "__main__":
    try:
        success = create_env_file()
        if success:
            print("\n💡 次のステップ:")
            print("1. python test-mongodb-connection.py で接続テストを実行")
            print("2. アプリを再起動してMongoDB Atlasに接続")
    except KeyboardInterrupt:
        print("\n\n⏹️  作成を中断しました")
    except Exception as e:
        print(f"\n💥 エラー: {e}")
