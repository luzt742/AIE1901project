#!/bin/bash

# 停止预览服务器
if pgrep -f "npm run preview" > /dev/null; then
  echo "正在停止预览服务器..."
  pkill -f "npm run preview"
  sleep 2
fi

# 提示用户输入GitHub用户名
echo "请输入你的GitHub用户名:"
read github_username

# 检查用户是否输入了用户名
if [ -z "$github_username" ]; then
  echo "错误：GitHub用户名不能为空！"
  exit 1
fi

# 设置Git配置
echo "正在设置Git用户名和邮箱..."
git config --global user.name "$github_username"
echo "请输入你的GitHub邮箱:"
read github_email
git config --global user.email "$github_email"

echo "Git配置已更新："
git config --list | grep -E "user.name|user.email"

# 添加正确的远程仓库
echo "\n正在添加远程仓库..."
git remote add origin https://github.com/$github_username/AIE1901project.git

echo "\n远程仓库配置:"
git remote -v

# 更新vite.config.js中的base路径（如果需要）
current_base=$(grep -o "base: '[^']*'" vite.config.js | cut -d "'" -f 2)
expected_base="/$github_username/AIE1901project/"

if [ "$current_base" != "$expected_base" ]; then
  echo "\n正在更新vite.config.js中的base路径..."
  sed -i '' "s|base: '[^']*'|base: '$expected_base'|" vite.config.js
  echo "已更新base路径为: $expected_base"
else
  echo "\nvite.config.js中的base路径已经正确配置。"
fi

# 执行部署
echo "\n开始部署到GitHub Pages..."
npm run deploy

if [ $? -eq 0 ]; then
  echo "\n部署成功！你的应用将很快在以下地址可用："
  echo "https://$github_username.github.io/AIE1901project/"
  echo "\n注意：首次部署可能需要几分钟时间才能在GitHub Pages上完全生效。"
else
  echo "\n部署失败！请检查错误信息并尝试解决问题。"
  exit 1
fi