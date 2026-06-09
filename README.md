# AI 食材管家 H5 MVP

这是一个可直接部署到 GitHub Pages 的静态 H5 demo。

## 功能范围

- 食材库存与临期提醒
- 模拟 OCR 包装食品识别
- iWatch / HealthKit 运动信息模拟同步
- 运动后菜谱推荐
- 饮食偏好筛选
- 家庭成员与老人关怀
- 老人冰箱健康监控
- 买菜需求模拟与人工编辑
- 餐食模拟 OCR 打卡

## GitHub Pages 部署

1. 在 GitHub 新建仓库，例如 `foodkeeper-h5-mvp`
2. 上传本目录下的全部文件到仓库根目录
3. 进入仓库 `Settings` -> `Pages`
4. `Build and deployment` 选择 `Deploy from a branch`
5. Branch 选择 `main`，Folder 选择 `/root`
6. 保存后等待 GitHub Pages 部署完成

部署完成后访问：

```text
https://你的用户名.github.io/foodkeeper-h5-mvp/
```

## 注意

当前版本是纯前端静态 demo，数据保存在浏览器 localStorage 中。
