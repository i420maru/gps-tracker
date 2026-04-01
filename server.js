
// 必要なライブラリを読み込む
const express = require('express');  // Webサーバー用
const http    = require('http');     // Node.js 標準の HTTP モジュール
const path    = require('path');     // ファイルパス操作用（標準モジュール）

const WebSocket = require('ws'); // WebSocket サーバー用

const app    = express();              // Express アプリを作成
const server = http.createServer(app); // Express を HTTP サーバーに乗せる
const wss = new WebSocket.Server({ server }); // HTTP サーバーに WebSocket を相乗りさせる

const PORT = process.env.PORT || 3000; // Render は環境変数 PORT を自動設定。ローカルは 3000

// public/ フォルダの中のファイルをそのまま配信する
app.use(express.static(path.join(__dirname, 'public')));

// サーバーを起動する
server.listen(PORT, () => {
  console.log(`サーバー起動: http://localhost:${PORT}`);
});

// クライアント（スマホ or PC）が WebSocket で接続してきたとき
wss.on('connection', (ws) => {
  console.log('クライアント接続');

  // そのクライアントからメッセージが届いたとき
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message); // JSON 文字列 → JavaScript オブジェクトに変換

      if (data.type === 'location') {
        console.log(`座標受信: ${data.deviceName} → ${data.lat}, ${data.lng}`);

        // 接続中の全クライアントに転送（ブロードキャスト）
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) { // 接続が生きているか確認
            client.send(message); // 受け取ったメッセージをそのまま転送
          }
        });
      }

    } catch (e) {
      console.error('JSON パースエラー:', e);
    }
  });

}); 