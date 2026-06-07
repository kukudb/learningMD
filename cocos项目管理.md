# Cocos Creator 项目 Git 管理指南（独立开发者版）

> 适用引擎：Cocos Creator 3.x  
> 核心理念：Git 只托管文本格式源码与配置，大型二进制资源（图片、视频、模型、音频）不纳入版本控制，通过外部存储（云盘/硬盘/素材库）按需恢复。

---

## 一、为什么这样管理？

- 大型二进制文件（.png、.fbx、.mp4 等）会导致 Git 仓库急剧膨胀，克隆和拉取极慢。
- 独立开发者场景下，资源通常稳定，修改频率低，只需在项目移植时手动恢复一次即可。
- 场景文件（.scene）、预制体（.prefab）、代码（.ts）、动画（.anim）、特效源码（.effect）均为文本格式，体积小，适合 Git 管理。

---

## 二、必须纳入 Git 托管的文件（最小集）

| 类别 | 文件/目录 | 原因 |
|------|-----------|------|
| 项目标识 | project.json | Cocos 识别项目的根文件 |
| 全局设置 | settings/ | 包含引擎配置、平台构建参数等 |
| 扩展插件 | packages/ | 确保协作者获得相同插件环境 |
| 自定义扩展 | extensions/ | 同上 |
| 场景文件 | assets/**/*.scene | 文本 JSON，记录场景层级和组件 |
| 预制体 | assets/**/*.prefab | 文本 JSON，可复用的节点模板 |
| 脚本代码 | assets/**/*.ts | 游戏逻辑 |
| 动画剪辑 | assets/**/*.anim | 文本 JSON，记录关键帧和曲线 |
| 特效源码 | assets/**/*.effect | 自定义着色器 |
| 配置文件 | assets/**/*.json / .plist / .xml | 游戏数据配置 |
| **所有 .meta 文件** | assets/**/*.meta | **极其重要**，存储 UUID 和导入设置，缺失会导致资源引用全部错乱 |
| 忽略规则 | .gitignore | 统一忽略规则 |
| TypeScript 配置 | tsconfig.json | 编译选项统一 |
| 项目说明 | README.md | 记录资源获取方式和恢复步骤 |

> 说明：assets/ 目录下，除了大型二进制文件（见下节忽略列表），其余文件（包括上述 .scene、.prefab、.ts、.anim、.effect、.json 等及其对应的 .meta）**全部需要提交**。

---

## 三、必须忽略的文件与目录（禁止提交）

| 类别 | 文件/目录 | 原因 |
|------|-----------|------|
| 引擎生成 | library/、temp/、local/ | 本地缓存，可随时删除并自动重建 |
| 构建产物 | build/ | 由源码构建生成，无需版本控制 |
| 依赖目录 | node_modules/ | 可通过 package.json 重新安装 |
| 编辑器临时文件 | .creator/、.editor/、.meta-cache/ | 无意义的本地缓存 |
| IDE 个人配置 | .vscode/、.idea/ | 可能包含个人偏好，不应强制统一 |
| 操作系统垃圾 | .DS_Store、Thumbs.db | 系统生成 |
| 日志文件 | *.log | 临时调试信息 |
| **大型二进制资源** | *.png、*.jpg、*.psd、*.tga、*.mp4、*.fbx、*.gltf、*.glb、*.mp3、*.wav、*.ogg、*.zip、*.7z | 体积极大，Git 不擅长处理，改用外部存储 |
| **运行时中间文件** | assets/**/*.cconb | 动画/特效的二进制缓存，由 .anim 构建生成，无需提交 |

---

## 四、推荐 .gitignore 模板

将以下内容保存为项目根目录下的 .gitignore：

```
# --- 编辑器/IDE ---
.idea/
.vscode/
*.code-workspace
.DS_Store
Thumbs.db

# --- Cocos 生成目录 ---
library/
temp/
local/
build/
packages/

# --- 开发依赖 ---
node_modules/
npm-debug.log*
creator.d.ts
.creator/
.editor/
.meta-cache/

# --- 构建产物 ---
publish/
release/
build-report.html
build-report.json
remote-debugger.log

# --- 大型资源（按需自行增删后缀）---
*.png
*.jpg
*.jpeg
*.psd
*.tga
*.mp4
*.fbx
*.gltf
*.glb
*.mp3
*.wav
*.ogg
*.zip
*.7z

# --- 运行时中间文件 ---
*.cconb

# --- 编译生成的 JS（可选，看团队习惯）---
# 若希望保留编译后的 JS 不提交，放开下面两行
# *.js
# *.js.map
# !assets/**/*.js
# !assets/**/*.js.map
```

> **注意**：上述规则会忽略所有图片、视频、模型、音频文件，但 **不会忽略 .meta 文件**，因为 .meta 后缀不同。这样确保每个资源的元数据被正确提交。

---

## 五、移植项目的标准流程

当你需要将项目迁移到新电脑或分享给协作者时：

1. **克隆仓库**  
   git clone <你的仓库地址>

2. **安装 npm 依赖**（如果有 package.json）  
   npm install

3. **恢复大型资源**  
   根据 README.md 中的说明，从你的云盘/移动硬盘/素材网站下载资源包，解压到 assets/ 对应的子目录中。  
   > 确保目录结构与原项目一致，例如：assets/textures/hero.png、assets/models/enemy.fbx 等。

4. **打开 Cocos Creator**  
   引擎会自动检测并生成缺失的 library/ 和 temp/ 文件夹，项目即可正常运行。

---

## 六、常见问题 FAQ

### Q1：我漏提交了某个 .meta 文件会怎样？
**A**：其他成员拉取代码后，该资源会丢失 UUID，导致场景或预制体中的引用变成 “Missing”。需要手动重新指定或从历史记录中恢复 .meta。**所以每次提交前务必检查 .meta 文件是否一并 add**。

### Q2：不小心把 library/ 或 build/ 提交了怎么办？
**A**：立即使用 git rm -r --cached library/ build/ 删除索引中的记录，再提交一次。若已推送到远程，确保其他人也拉取该更新。

### Q3：为什么 .cconb 文件不能提交？
**A**：它是从 .anim 构建时生成的中间二进制文件，不是源码。提交它不但无益，还可能因缓存问题导致动画不同步。构建时会自动重新生成。

### Q4：如果团队中有多人协作，这种方案还适用吗？
**A**：本方案针对独立开发者或极小团队。如果多人频繁修改资源，建议采用 Git LFS 或 Perforce，并启用文件锁定功能避免冲突。

### Q5：我想让某些特定的大型资源也纳入 Git 管理，怎么办？
**A**：可以使用 Git LFS。在 .gitattributes 中指定文件类型，例如 *.fbx filter=lfs diff=lfs merge=lfs -text。但独立开发者通常没必要。

---

## 七、快速检查清单（每次提交前核对）

- [ ] 所有 .ts、.scene、.prefab、.anim、.effect 等文本文件已 git add
- [ ] 所有对应的 .meta 文件已 git add
- [ ] 没有 library/、temp/、local/、build/ 出现在 git status 中
- [ ] 没有 .png、.fbx 等大型文件出现在 git status 中
- [ ] git commit -m "message" 之后，仓库大小没有异常增长（可用 git rev-list --objects --all | git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | awk '/^blob/ {print substr($0,6)}' | sort --numeric-sort --key=2 | tail -10 查看最大的10个文件）

---

## 八、附录：外部资源存储建议

- **百度网盘 / 阿里云盘 / OneDrive**：定期打包 assets/ 下的大型资源文件夹，命名规则如 ProjectName_Assets_2026-06-02.zip
- **移动硬盘**：本地冷备份，每月同步一次
- **素材管理工具**：如 Eagle、Billfish，可方便分类和检索

> 建议在项目根目录的 README.md 中写清楚资源下载链接和解压路径，方便未来自己或协作者恢复。

**文档结束**