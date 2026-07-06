# TypeScript 标准模式库

> 本文档归纳 TypeScript 各知识点的**标准写法模板**。
> 配合 `cocos学习疑问解答.md` 使用——前者记录"避免什么"，本文档记录"应该怎么写"。
> 练习前速查一遍对应章节的模式，可有效减少"知道概念但写不出优雅代码"的情况。

---

## 类型断言与收窄

### 模式 1：类型守卫标准写法 —— `unknown` → 接口类型

**适用场景**：从 API、JSON、用户输入拿到 `unknown` 数据，需要在运行时校验它是否符合某接口形状。

**标准代码**：

```typescript
function isXxx(obj: unknown): obj is Xxx {
  // ① 排除 null 和非 object（typeof null === "object" 是 JS 历史 bug）
  if (typeof obj !== "object" || obj === null) return false;

  // ② 一次性向下转型，后续属性访问不再需要 as
  const o = obj as Record<string, unknown>;

  // ③ 逐属性检查：typeof 运行时校验 + 值域检查
  return (
    typeof o.prop1 === "string" &&
    typeof o.prop2 === "number" &&
    (o.prop3 === "a" || o.prop3 === "b")  // 字面量联合需显式枚举
    // Array.isArray(o.prop4)              // 数组类型用 Array.isArray
  );
}
```

**逐步拆解**：

| 步骤 | 代码 | 为什么 | 易错点 |
|------|------|--------|--------|
| ① 排除非法类型 | `typeof obj !== "object" \|\| obj === null` | `typeof null === "object"` 是 JS 遗留 bug，`null` 会穿过 `typeof === "object"` 检查 | 漏写 `\|\| obj === null` → 后续 `o.xxx` 对 null 抛 TypeError |
| ② 向下转型 | `as Record<string, unknown>` | `object` 类型太宽，TS 不允许随意点属性；集中转型一次，后续代码干净 | 不要用 `as any`——会完全放弃类型检查；不要每处访问都写 `(obj as any).xxx`——累赘 |
| ③-1 基础类型检查 | `typeof o.prop1 === "string"` | 运行时 `typeof` 是真正的安全保障；`unknown` 必须先收窄才能用 | `typeof` 只能返回 8 种 JS 基本类型字符串，**不能判断接口或自定义类型** |
| ③-2 字面量检查 | `o.prop3 === "a" \|\| o.prop3 === "b"` | 对联合字面量类型，必须显式枚举合法值 | 漏掉某个合法值 → 守卫拒绝合法数据 |
| ③-3 数组检查 | `Array.isArray(o.prop4)` | 数组不是基本类型，`typeof [] === "object"`，必须用 `Array.isArray` | 用 `typeof o.x === "array"` → 永远 false（不存在这个 typeof 返回值） |

**关键认知**：

- `as` 只是让编译器闭嘴——真正的安全保障是后面的 `typeof` / `===` / `Array.isArray` 运行时检查
- 类型守卫函数名以 `is` 开头是 TS 社区约定（`isPlayerData`、`isAssetInfo`）
- 返回值类型必须写 `obj is Xxx`（类型谓词），否则调用方 `if (isXxx(data))` 后 `data` 仍然是 `unknown`

**关联条目**：

- 疑问：Q5（typeof 能判断接口吗）→ `cocos学习疑问解答.md#类型断言与收窄`
- 疑问：Q6（后端数据能像 Java 一样转换吗）→ `cocos学习疑问解答.md#第三节接口`
- 易错：用 `as` 替代运行时校验 → `cocos学习疑问解答.md#类型断言与收窄`

---

## 泛型（Generic）

### 模式 2：泛型资源管理器 —— `Record<K, V>` + 泛型类

**适用场景**：管理一组同构资源（图片、音频、配置文件），通过 key 存取，支持批量异步加载。

**标准代码**：

```typescript
// 1. 资源信息接口
interface AssetInfo {
  url: string;
  type: "image" | "audio" | "json";
  size: number;
  loaded: boolean;
}

// 2. 用 Record 约束资源清单的键值类型
type AssetMap<K extends string> = Record<K, AssetInfo>;

// 3. 泛型类：接收具体资源清单，提供存取和加载方法
class AssetLoader<T extends AssetMap<string>> {
  private assets: T;

  constructor(assets: T) {
    this.assets = assets;
  }

  // 按 key 获取单个资源信息（返回类型精确到该 key 的 value 类型）
  getAsset<K extends keyof T>(key: K): T[K] {
    return this.assets[key];
  }

  // 异步加载全部资源
  async loadAll(): Promise<void> {
    const keys = Object.keys(this.assets) as (keyof T)[];
    for (const key of keys) {
      const info = this.assets[key];
      console.log(`加载 ${String(key)}: ${info.url}`);
      // 实际项目中这里发网络请求
      info.loaded = true;
    }
  }
}

// 4. satisfies 检查资源清单符合 AssetMap 形状，同时保留精确 key 名
const manifest = {
  hero: { url: "/hero.png", type: "image", size: 1024, loaded: false },
  bgm:  { url: "/bgm.mp3",  type: "audio", size: 2048, loaded: false },
} satisfies AssetMap<string>;

// 5. 实例化
const loader = new AssetLoader(manifest);
loader.loadAll();
const hero = loader.getAsset("hero");  // 类型精确推断为 AssetInfo
```

**逐步拆解**：

| 步骤 | 代码 | 为什么 | 易错点 |
|------|------|--------|--------|
| ① 定义 AssetMap | `Record<K, AssetInfo>` | `Record` 是纯类型——编译后消失，运行时就是普通 JS 对象。用它将"键名→资源信息"的映射关系固定下来 | `Record` ≠ `Map`——前者是类型约束（零运行时成本），后者是运行时数据结构（有 `.get()/.set()` 方法） |
| ② 泛型类定义 | `AssetLoader<T extends AssetMap<string>>` | `T extends AssetMap` 约束 T 必须是键值映射；`string` 保留灵活性（键名不写死） | 不要写成 `class AssetLoader<T>` 后把 T 当作单个值——泛型类管理的是**一组**资源，不是**一个** |
| ③ getAsset 签名 | `getAsset<K extends keyof T>(key: K): T[K]` | `keyof T` 让 key 只能传 T 实际拥有的键名；`T[K]` 是索引访问类型——传 `"hero"` 返回 `AssetInfo` | `keyof` 作用于类型，不是值。如果 T = `{ hero: AssetInfo; bgm: AssetInfo }`，则 `keyof T` = `"hero" \| "bgm"` |
| ④ loadAll 遍历 | `Object.keys(this.assets)` | `this.assets` 在运行时就是普通 JS 对象，`Object.keys()` 是标准 JS API，和类型系统无关 | `Object.keys()` 的类型推断返回 `string[]`，所以需要 `as (keyof T)[]` 断言 |
| ⑤ satisfies 检查 | `{ ... } satisfies AssetMap<string>` | `satisfies` 检查形状是否符合 AssetMap，但**不改变**推断出的精确 key 名类型 | 不要用 `: AssetMap<string>` 注解——会丢失 key 名的字面量类型（`"hero"` 变成 `string`） |

**关键认知**：

- `Record<K, V>` 编译后就是 `{ [key: string]: V }`——完全消失，零运行时成本
- `Object.keys()` 能遍历是因为运行时它就是普通对象——TS 的类型约束全部在编译时擦除了
- 泛型类的"泛"在于**调用时**绑定具体类型，而不是运行时有多态行为

**关联条目**：

- 疑问：Record<K, V> 编译成 JS 是什么样的 → `cocos学习疑问解答.md#第六节Utility-Types`
- 疑问：`keyof T` 是什么用法 → `cocos学习疑问解答.md#第四节泛型`
- 易错：`Pick` 键名写错 → `cocos学习疑问解答.md#第六节练习易错模式`

---

## 异步编程

### 模式 3：Promise.allSettled 分拣模式 —— 容错并发 + 成功/失败分类

**适用场景**：并发请求一批数据，个别失败不影响整体——需要分别收集成功的值和失败的 ID/原因。

**标准代码**：

```typescript
async function batchFetch<T>(
  ids: number[],
  fetcher: (id: number) => Promise<T>,  // 单个请求函数
): Promise<{ succeeded: T[]; failedIds: number[] }> {
  // 1. 并发发起全部请求（Promise.allSettled 永远不会 reject）
  const results = await Promise.allSettled(
    ids.map(id => fetcher(id)),
  );

  // 2. 分拣成功/失败
  const succeeded: T[] = [];
  const failedIds: number[] = [];

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.status === "fulfilled") {
      succeeded.push(result.value);       // fulfilled → 取 value
    } else {
      failedIds.push(ids[i]);             // rejected → 用索引对应回原始 id
    }
  }

  return { succeeded, failedIds };
}
```

**逐步拆解**：

| 步骤 | 代码 | 为什么 | 易错点 |
|------|------|--------|--------|
| ① 并发发起 | `Promise.allSettled(ids.map(id => fetcher(id)))` | `ids.map(fn)` 自动处理任意长度——3 个 id 发 3 个请求，100 个 id 发 100 个。`allSettled` 永远 resolve，不会因为个别失败而整体 reject | 不要用 `Promise.all`——一个失败整体抛异常，拿不到其他成功的结果 |
| ② await 取结果 | `const results = await Promise.allSettled(...)` | 等待全部请求完成（无论成败），拿到 `PromiseSettledResult<T>[]` | 不要用 try/catch 包 `allSettled`——它永远不会 reject，catch 永远触发不了 |
| ③ 分拣 | `if (result.status === "fulfilled")` | `allSettled` 返回的每个元素是 `{ status, value? } \| { status, reason? }`，通过 `status` 字段判别联合 | `result.value` 只在 `status === "fulfilled"` 时存在——直接访问 TS 会报错 |
| ④ 失败 ID 对应 | `failedIds.push(ids[i])` | `results[i]` 对应 `ids[i]`——用索引找回原始 id（失败结果只含 reason，不含 id） | 不要用 `result.reason.id`——reason 是 Error，不含业务 id |
| ⑤ 加入数组 | `succeeded.push(result.value)` | `result.value` 的类型是 `T`（泛型），直接 push | 不要 `push(results)` 或 `push(...results)`——`results` 是 `PromiseSettledResult[]`，不是 `T[]` |

**Promise.all vs allSettled 选择法则**：

| 场景 | 用 | 原因 |
|------|----|------|
| 必须全部成功，一个失败整体失败 | `Promise.all` | fail-fast，第一个 reject 立即传播 |
| 个别失败不影响整体，需要收集全部结果 | `Promise.allSettled` | 永不 reject，逐个检查 status |
| 并发但参数互相独立 | 二者都可以（先判断容错需求再选） | `ids.map(fn)` 自动处理任意长度 |

**关联条目**：

- 自总结：Promise.all 与 allSettled 的选择法则 → `cocos学习疑问解答.md#S3`
- 自总结：依赖分析法——并发的判断标准 → `cocos学习疑问解答.md#S4`
- 疑问：Promise.all fail-fast 策略 → `cocos学习疑问解答.md#Q12`
- 易错：忘记 await → `cocos学习疑问解答.md#第七节练习易错模式`

---

### 模式 4：try/catch 包裹位置法则 —— 只包可能抛异常的那一步

**适用场景**：async 函数中某一步（如网络保存）可能失败，但失败不应阻断整个流程。

**标准代码**：

```typescript
async function processAndSave(data: Data): Promise<Result> {
  // 前面的步骤正常 await（不包 try/catch——这些不该失败）
  const processed = transform(data);
  const validated = validate(processed);

  // try/catch 只包"可能失败且允许降级处理"的那一步
  try {
    await saveToServer(validated);
  } catch (err) {
    console.error("保存失败:", err);
    // 不 throw——降级处理，继续执行
  }

  // 保存失败不影响返回结果
  return { success: true, data: validated };
}
```

**逐步拆解**：

| 原则 | 说明 | 反模式 |
|------|------|--------|
| try 只包可能 reject 的 await | 同步代码（`transform`/`validate`）抛异常是 bug，不该被静默吞掉 | 整个函数体包一个大 try/catch → 把 bug 当业务异常吞了 |
| catch 后决定：throw 还是降级 | 降级 = 打印日志后继续；不降级 = throw new Error 向上传播 | 空 catch → 静默吞错，出了问题无法排查 |
| Promise.allSettled 不用 try/catch | 它永远不会 reject——try/catch 是浪费 | 给 allSettled 包 try/catch → 对机制理解有误 |

**关联条目**：

- 疑问：fire-and-forget 模式 → `cocos学习疑问解答.md#Q14`

---

*文档创建时间：2026-07-07*
*首次收录：验收练习（2026-06-29 发布）批改中暴露的薄弱点*
