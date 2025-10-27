#!/usr/bin/env python3
"""
MongoDB Atlas接続テストスクリプト
.envファイルのMONGODB_CONNECTION_STRINGで接続テストを実行
"""

import os
import sys
from datetime import datetime
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError, ConfigurationError
import urllib.parse

def load_env_file():
    """環境変数ファイルを読み込み"""
    env_vars = {}
    if os.path.exists('.env'):
        with open('.env', 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    env_vars[key.strip()] = value.strip()
    return env_vars

def test_mongodb_connection(connection_string):
    """MongoDB接続テスト"""
    print(f"🔍 MongoDB接続テスト開始")
    print(f"📅 実行時刻: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🔗 接続文字列: {connection_string[:50]}...")
    print("-" * 60)
    
    try:
        # 接続タイムアウトを短めに設定（テスト用）
        client = MongoClient(connection_string, serverSelectionTimeoutMS=10000)
        
        # 接続テスト
        print("⏳ 接続中...")
        client.admin.command('ping')
        print("✅ 接続成功！")
        
        # データベース情報取得
        print("\n📊 データベース情報:")
        db_list = client.list_database_names()
        print(f"   利用可能なデータベース: {len(db_list)}個")
        for db_name in db_list[:5]:  # 最初の5個のみ表示
            print(f"   - {db_name}")
        if len(db_list) > 5:
            print(f"   ... 他{len(db_list) - 5}個")
        
        # english-wordデータベースの確認
        if 'english-word' in db_list:
            print("\n📚 english-wordデータベース:")
            db = client['english-word']
            collections = db.list_collection_names()
            print(f"   コレクション数: {len(collections)}個")
            for collection_name in collections:
                collection = db[collection_name]
                count = collection.count_documents({})
                print(f"   - {collection_name}: {count}件")
        else:
            print("\n⚠️  english-wordデータベースが見つかりません")
        
        # 接続情報
        print(f"\n🔧 接続情報:")
        print(f"   ホスト: {client.address[0]}")
        print(f"   ポート: {client.address[1]}")
        print(f"   データベース: english-word")
        
        client.close()
        return True
        
    except ConnectionFailure as e:
        print(f"❌ 接続失敗: {e}")
        return False
    except ServerSelectionTimeoutError as e:
        print(f"⏰ 接続タイムアウト: {e}")
        return False
    except ConfigurationError as e:
        print(f"⚙️  設定エラー: {e}")
        return False
    except Exception as e:
        print(f"💥 予期しないエラー: {e}")
        return False

def main():
    """メイン処理"""
    print("🚀 MongoDB Atlas接続テストスクリプト")
    print("=" * 60)
    
    # 環境変数読み込み
    env_vars = load_env_file()
    
    if not env_vars:
        print("❌ .envファイルが見つかりません")
        print("💡 env.exampleをコピーして.envファイルを作成してください")
        return False
    
    connection_string = env_vars.get('MONGODB_CONNECTION_STRING', '').strip()
    
    if not connection_string:
        print("❌ MONGODB_CONNECTION_STRINGが設定されていません")
        print("💡 .envファイルにMongoDB Atlas接続文字列を設定してください")
        print("\n例:")
        print("MONGODB_CONNECTION_STRING=mongodb+srv://username:password@image2diary.abc123.mongodb.net/english-word?retryWrites=true&w=majority")
        return False
    
    # 接続テスト実行
    success = test_mongodb_connection(connection_string)
    
    print("\n" + "=" * 60)
    if success:
        print("🎉 接続テスト完了 - 成功！")
        print("💡 アプリでMongoDB Atlasに接続できます")
    else:
        print("💥 接続テスト完了 - 失敗")
        print("💡 接続文字列とネットワーク設定を確認してください")
    
    return success

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⏹️  テストを中断しました")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 スクリプトエラー: {e}")
        sys.exit(1)
