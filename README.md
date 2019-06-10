# Shibaura
Deno版の [june29/takanawa](https://github.com/june29/takanawa) です。オンプレの環境にScrapboxを建てていて、GASが使えないので作成。
まだまだ実験版なので、設定ファイルの渡し方など大きく変更する可能性があります。 設定ファイル `config.ts` はなくすかもしれません。

## 使い方
Docker Imageに設定ファイル `config.ts` を内蔵してデプロイするようにしています。もし設定ファイルとかが嫌で環境変数で指定したければ、`config.ts` の値をすべて環境変数から取得するようにしてください。

### 設定ファイル
- `config.ts` に設定を記述します。`config.ts.example`からコピーして使うと簡単です。
  - `server.port`: サーバーのポート番号
  - `scrapbox.host`: Scrapboxのホスト名。 `https://scrapbox.io` など。
  - `scrapbox.project`: Scrapboxのプロジェクト名。 `mactkg-pub` など。
  - `scrapbox.cookie`: (任意) 鍵のついたScrapboxにアクセスする際のクッキー。`connect.sid`の値を入れてください。（取扱注意。）
  - `slack.webhook`: SlackのIncoming Webhookの値を入れてください。
  - `external.ruleScrapboxUrl`: (任意) マッチするルールを書いたCSVへのURLを入れるところです。後述。

### 設定ファイルをかいたら、起動してみる
- ローカルで起動
  - ローカルで `docker` が動くように用意してください。
  - `make run` で動きます。`ngrok`などのツールを使ってインターネットへ公開し、試してみるといいでしょう。
  - Docker使っていないひとは、`deno` が動くようにして、 `deno run ./src/server.ts` します。
- Docker Containerがデプロイ出来る環境で起動
  - `make build` でImageをBuildするので、そのままDeployすればうごきます。ポートは8080に指定してあります。
- GCP Cloud Runで動かす
  - MakefileにはGCPのCloud Runへデプロイするタスクが設定してあります。
  - GCPのプロジェクトを作って、プロジェクト名をメモしておきます。
  - 次の環境変数を設定してください。
    - `GCP_PROJECT`=GCPのプロジェクト名
    - `GCP_CLOUD_RUN_SERVICE_NAME`: Cloud Runのサービスの名前
    - `GCP_IMAGE_NAME`=デプロイするDocker Imageを上げる先。 きっと `gcr.io/${GCP_PROJECT}/${GCP_CLOUD_RUN_SERVICE_NAME}`
  - `$ make deploy_cloud_run`

## 処理ルールについて
基本 [june29/takanawa](https://github.com/june29/takanawa) のように動作しますが、処理ルールの書き方が違います。
Scrapboxに任意の設定用ページを作り、そのページに処理ルールを表形式で記述してください。（例: https://scrapbox.io/mactkg-pub/shibaura_config_for_test ）
`external.ruleScrapboxUrl`には、その表のCSVへのリンクを入れておきます。（例: https://scrapbox.io/api/table/mactkg-pub/shibaura_config_for_test/settings.csv )

`shibaura` に通知があったら、 `external.ruleScrapboxUrl` に処理ルールを取得しにいきます。5秒以内に処理ルールを取得していたら、新たに取得せず、これまでと同じルールを使うようにします。

### 表のとりきめ
表に関する取り決めは以下のとおりです。いまのところ、それぞれの列の順番は特に考慮しないです。

- `title` 列: タイトルがこの文字列にマッチしたときに通知
- `diff` 列: 変更行がこの文字列にマッチしたときに通知
- `body` 列: 文章全体がこの文字列にマッチしたときに通知
- `channel` 列: 通知したいチャンネル
