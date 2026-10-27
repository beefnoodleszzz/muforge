#!/bin/zsh
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
cd "${0:A:h}"
node scripts/local.mjs start && open http://127.0.0.1:5679/local-production
if [ $? -ne 0 ]; then
  echo '启动失败，请查看上方提示和 .local/server.log。按回车关闭。'
  read
fi
