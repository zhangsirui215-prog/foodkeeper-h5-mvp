# 部署到 GitHub 的两种方式

## 方式一：网页上传

适合没有安装 Git 的电脑。

1. 打开 https://github.com/new
2. Repository name 填：`foodkeeper-h5-mvp`
3. 选择 Public 或 Private
4. 点击 Create repository
5. 进入仓库后点击 uploading an existing file
6. 将 `github-pages-site` 目录里的文件全部拖进去
7. Commit changes
8. 打开 Settings -> Pages
9. Source 选择 Deploy from a branch
10. Branch 选择 main，Folder 选择 /root

## 方式二：Git 命令

适合已安装 Git 的电脑。

```bash
git init
git add .
git commit -m "Deploy FoodKeeper H5 MVP"
git branch -M main
git remote add origin https://github.com/YOUR_NAME/foodkeeper-h5-mvp.git
git push -u origin main
```

然后在 Settings -> Pages 中启用 GitHub Pages。
