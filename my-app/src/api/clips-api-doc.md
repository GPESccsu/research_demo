# 素材管理 API 文档

## 概述
本文档说明如何通过后端自动添加素材到"阅读素材"模块。

## 数据结构

### Clip 对象
```javascript
{
  id: number,           // 自动生成，无需提供
  title: string,        // 必填：素材标题
  content: string,      // 必填：素材内容
  source: string,       // 可选：来源（如文献标题、PDF文件名等）
  tags: string[],       // 可选：标签数组
  type: 'manual' | 'auto',  // 必填：'manual'=手动添加，'auto'=自动提取
  createdAt: number     // 自动生成：时间戳
}
```

## 前端接口

### 1. 手动添加素材（已实现）
用户通过界面手动添加素材，type 自动设置为 'manual'。

### 2. 后端自动添加素材（预留接口）

#### 函数签名
```javascript
async function addAutoClip(clipData)
```

#### 参数
```javascript
clipData = {
  title: string,        // 必填
  content: string,      // 必填
  source?: string,      // 可选
  tags?: string[]       // 可选
}
```

#### 返回值
返回新添加素材的 ID (number)

#### 使用示例
```javascript
// 示例1：从PDF自动提取
const clipId = await addAutoClip({
  title: "锌空气电池催化剂研究进展",
  content: "过渡金属氧化物作为锌空气电池的催化剂...",
  source: "Zhang et al. 2024 - ACS Nano",
  tags: ["催化剂", "锌空气电池", "综述"]
});

// 示例2：从文献自动提取关键段落
const clipId = await addAutoClip({
  title: "实验方法 - Co₃O₄合成",
  content: "将0.05M Co(NO₃)₂溶液与0.1M尿素混合，在120°C水热反应12小时...",
  source: "实验记录 2024-03-06",
  tags: ["实验方法", "合成"]
});
```

## 后端实现建议

### 方案1：通过 HTTP API
后端可以提供 REST API 端点，前端定期轮询或通过 WebSocket 接收新素材：

```javascript
// 前端代码示例
async function fetchAutoClips() {
  const response = await fetch('/api/clips/auto-extract');
  const clips = await response.json();
  
  for (const clipData of clips) {
    await addAutoClip(clipData);
  }
}
```

### 方案2：通过消息队列
后端将提取的素材推送到消息队列，前端订阅并自动添加。

### 方案3：直接数据库写入
后端直接写入 IndexedDB（需要在同一域名下运行）。

## 数据库操作

### 底层数据库函数（已实现）
```javascript
// 获取所有素材
const clips = await getClips();

// 添加素材
const id = await addClip(clipData);

// 删除素材
await deleteClip(id);
```

## 注意事项

1. **type 字段**：手动添加的素材 type='manual'，自动提取的素材 type='auto'
2. **时间戳**：createdAt 会自动生成，无需后端提供
3. **标签格式**：tags 必须是字符串数组，不是逗号分隔的字符串
4. **内容长度**：建议 content 长度在 50-2000 字之间，过短或过长都不适合作为素材
5. **去重**：后端应该避免重复提取相同内容

## 未来扩展

- [ ] 支持素材分类（前言、方法、结果、讨论等）
- [ ] 支持素材评分和推荐
- [ ] 支持素材之间的关联
- [ ] 支持 AI 自动总结和改写
- [ ] 支持导出为 Word/Markdown
