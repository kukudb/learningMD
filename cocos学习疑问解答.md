# TypeScript 学习疑问解答

> 本文档记录学习过程中产生的疑问及解答，按知识章节分类存放。
> 配合 `cocos学习进度.md` 和 `learnCoCOs.md` 使用，便于回顾时快速理解易混淆点。

---

## 第三节：接口（Interface）

### Q1：属性类型接口的必要性是什么？为什么不用 class/struct 代替？

**问题背景**：接口只是描述对象形状，感觉上用一个类或者结构体也能做到，为什么需要接口？给的例子中，只有属性，没有方法。且隐式实现接口

**解答要点**：

1. **运行时成本不同**：接口编译后完全消失，零开销。类会生成 JavaScript 代码，有运行时成本。

2. **用途不同**：
   - 接口 → 描述数据结构（API 响应、游戏配置、道具表），只做类型约束
   - 类 → 需要有行为（方法实现、状态管理、生命周期），需要 `new` 实例

3. **和 Java 的关键区别**：

   | 方面 | Java 接口 | TypeScript 接口 |
   |------|----------|----------------|
   | 类型系统 | 名义类型（必须 implements） | 结构化类型（结构匹配即可） |
   | 运行时存在 | ✅ 在字节码中 | ❌ 完全擦除 |
   | 能否有方法实现 | ✅ default 方法 | ❌ 只能声明签名 |

4. **结构化类型的灵活性与风险**：结构匹配就能传，无需显式 implements——更灵活，但也可能把不该传的对象传进去（比如箱子被当成生物治疗）。

> **关联知识点**：参见下方 Q2（编译原理）理解"零开销"的具体含义。

---

### Q2：接口编译后完全消失是什么意思？怎么保证计算机知道这个接口？

**问题背景**：如果接口消失了，运行时怎么知道类型是否正确？

**解答要点**：

1. **TypeScript 不是直接运行的**：
   ```
   你写的 TS 代码 → tsc 编译 → JavaScript → 浏览器/Node 运行
   ```
   计算机只认识 JS，不认识 TS。

2. **类型检查仅在编译时**：
   - 编译时：TS 检查你的代码类型是否正确
   - 运行时：生成的 JS 里**所有类型信息（接口、类型注解、泛型）全部擦除**

3. **和 Java 的本质差异**：

   | | Java | TypeScript |
   |---|---|---|
   | 类型检查时机 | 编译时 + 运行时（JVM） | **仅编译时** |
   | 编译产物保留接口 | ✅ 在字节码里 | **❌ 完全擦除** |
   | 运行时检查类型 | ✅ instanceof、反射 | ❌ 没有运行时类型信息 |

4. **类比**：Java 像交警一直路上巡查；TypeScript 像出车库前检查一遍，上了路就不管了。

5. **这个机制导致的推论**：
   - 不能用 `instanceof` 检查接口（接口运行时不存在）
   - `as` 是类型断言，不是类型转换（不实际做任何事）
   - 从 JSON 解析的数据没有运行时类型保证

---

### Q3：Zod 是怎么做运行时校验的？它不需要接口信息吗？

**问题背景**：既然接口运行时不存在，Zod 怎么知道"应该有哪些字段"？

**解答要点**：

1. **Zod 完全没用你的 TypeScript 接口**——它自己定义了一套运行时类型系统：
   ```typescript
   const PlayerSchema = z.object({
     name: z.string(),    // 运行时真的会检查 typeof === "string"
     health: z.number(),  // 运行时真的会检查 typeof === "number"
   });
   ```

2. **Zod Schema 是活着的数据**：
   - `PlayerSchema` 编译后**还在**——它是一个真实的 JavaScript 对象，里面存了验证规则
   - `interface Player` 编译后**消失了**——只是编译时的一个影子

3. **Zod 和 interface 是互补关系**：

   | 方式 | 编译时检查 | 运行时检查 |
   |------|-----------|-----------|
   | `interface Player`（TS 类型断言） | ✅ | ❌ |
   | `PlayerSchema.parse()`（Zod） | ❌（但有 `z.infer` 补） | ✅ |

4. **最佳实践：Zod Schema 也可以生成 TS 类型**
   ```typescript
   const PlayerSchema = z.object({ name: z.string(), health: z.number() });
   type Player = z.infer<typeof PlayerSchema>; // 等价于手写 interface
   ```

> **一句话**：Zod 相当于在运行时**重新实现了一套接口系统**——用的是 `z.object()` 这样的 JS 调用，不是 `interface` 关键字。

---

### Q4：接口里可以定义方法吗？方法编译后也会被抹除吗？

**问题背景**：接口方法能不能有实现？编译后方法还在不在？

**解答要点**：

1. **接口可以声明方法，但不能提供实现**：
   ```typescript
   interface Player {
     name: string;
     attack(target: Player): number;    // 只有签名，没有实现
     takeDamage(amount: number): void;  // 只有签名，没有实现
   }
   ```

2. **方法签名编译后同样被擦除**，但方法实现（在对象字面量中）会保留：
   ```typescript
   // 编译前
   const player: Player = {
     name: "小明",
     attack(target) { return 10; }  // 实现部分
   };
   // 编译后——接口消失，只保留 JS 对象
   const player = { name: "小明", attack(target) { return 10; } };
   ```

3. **与 Java 的关键差异**：

   | | Java 接口 | TypeScript 接口 |
   |---|---|---|
   | 声明方法 | ✅ | ✅ |
   | default 方法（有实现） | ✅ | ❌ 不能 |
   | 编译后存在 | ✅ | ❌ 完全消失 |
   | instanceof 检查 | ✅ | ❌ |

4. **和抽象类的区别**：
   - `interface`：编译后消失，零开销，不能有方法实现
   - `abstract class`：编译后生成 JS 代码，可以有方法实现，不能 `new`

---

### Q5：typeof 能判断接口吗？

**问题背景**：想在运行时用 `typeof` 检查一个对象是不是某个接口类型。

**解答要点**：

1. **不能。`typeof` 是 JS 运行时操作符，接口运行时不存在**。

2. **JS 的 typeof 只能返回 8 种基本结果**：
   `"string"` | `"number"` | `"boolean"` | `"undefined"` | `"object"` | `"function"` | `"symbol"` | `"bigint"`
   **没有** `"player"`、`"interface"` 或自定义类型。

3. **源代码和编译后的对比**：
   ```typescript
   // 编译前
   const p: Player = { name: "小明", health: 100 };
   typeof p;  // 返回值是？ — 这是 JS 代码，运行时执行
   
   // 编译后（接口消失了）
   const p = { name: "小明", health: 100 };
   typeof p;  // 只返回 "object"
   ```

4. **注意区分：TS 中的 `typeof`（类型位置）是编译时操作符**：
   ```typescript
   const p = { name: "小明", health: 100 };
   // 这是 TS 的类型操作符，不是 JS 的运行时 typeof
   function clone(obj: typeof p) { ... }
   // 等价于：function clone(obj: { name: string; health: number }) { ... }
   ```

5. **运行时检查接口形状需要自己写类型守卫**：
   ```typescript
   function isPlayer(obj: any): obj is Player {
     return obj
       && typeof obj.name === "string"
       && typeof obj.health === "number";
   }
   // Zod 就是把这个过程自动化了
   ```

---

### Q6：后端传回来的数据，能像 Java 一样转换成接口吗？

**问题背景**：Java 里可以用 Jackson 把 JSON 直接反序列化成接口类型，TypeScript 可以吗？

**解答要点**：

1. **不能。这是 Java 和 TypeScript 的根本差异**。

   **Java 能做到的原因是**：
   - `Player.class` 在 JVM 里**运行时存在**
   - Jackson 用反射拿到接口的方法签名，动态生成代理类
   - 如果 JSON 缺字段，Jackson 会抛异常

   **TypeScript 不能的原因是**：
   - 接口编译后消失，没有运行时元数据
   - `JSON.parse(data) as Player` **不是转换**，是类型断言（让编译器闭嘴）

2. **`as Player` 不是转换，是"说谎"**：
   ```typescript
   const p = JSON.parse(json) as Player;
   // 编译后：
   const p = JSON.parse(json); // 就是一个普通对象
   // 如果后端返回了缺字段的数据，p.health 是 undefined
   // 编译器不报错，但运行时 p.health + 50 结果是 NaN
   ```

3. **和 Java 的对比**：

   | | Java 类型转换 | TypeScript 类型断言 |
   |---|---|---|
   | 实际做了什么？ | 运行时转换 | **什么都没做，编译时就没了** |
   | 会检查类型正确性吗？ | 会，失败抛异常 | **不会**，只是让编译器闭嘴 |
   | 错误使用会怎样？ | ClassCastException | 运行时无事发生，后续用错属性才出问题 |

4. **三种安全处理方案**：

   **方案一：类型守卫（小项目）**
   ```typescript
   function isPlayer(obj: any): obj is Player {
     return typeof obj?.name === "string" && typeof obj?.health === "number";
   }
   ```

   **方案二：Zod（推荐，中大型项目）**
   ```typescript
   const PlayerSchema = z.object({ name: z.string(), health: z.number() });
   const player = PlayerSchema.parse(raw); // 数据不对直接抛异常——和 Jackson 行为一致
   ```

   **方案三：类构造函数（最接近 Java 方式）**
   ```typescript
   class Player {
     constructor(public name: string, public health: number) {}
   }
   const player = new Player(raw.name, raw.health); // 明确创建
   ```

---

### Q7：`??` 空值合并运算符是什么？和 `||` 有什么区别？

**问题背景**：教学示例中多次出现 `??`，不清楚含义以及与 `||` 的差异。

**解答要点**：

1. **`??` 的含义**：`a ?? b` — 如果 a 不是 `null` 也不是 `undefined`，就用 a；否则用 b。

2. **`||` 的含义**：`a || b` — 如果 a 是**假值**（`false`、`0`、`""`、`null`、`undefined`、`NaN`），就用 b。

3. **核心差异**：
   - `||` 检查范围更宽，所有"假值"都触发默认值
   - `??` 只检查 `null` 和 `undefined`

4. **典型陷阱**：
   ```typescript
   const a = 0 || 10;    // 10 —— 0 是假值
   const b = 0 ?? 10;    // 0  —— 0 不是 null/undefined
   const c = "" || "默认"; // "默认" —— "" 是假值
   const d = "" ?? "默认"; // ""   —— "" 不是 null/undefined
   ```

5. **选择原则**：当合法值可能是 `0`、`""`、`false` 时，用 `??` 而非 `||`。

> **记忆口诀**：`??` 只看"空不空"（null/undefined），不管"假不假"。

---

### Q8：`"info" | "warn" | "error"` 是枚举类型吗？

**问题背景**：看到 `level: "info" | "warn" | "error"` 这种写法，以为是枚举。

**解答要点**：

1. **不是枚举，是字符串字面量联合类型（String Literal Union）**。

2. **与枚举的关键区别**：
   - 字符串字面量联合：编译后**完全消失**，运行时就是普通字符串，零开销
   - TS `enum`：编译后生成 IIFE 对象，有运行时开销
   - Java `enum`：编译后保留为 class

3. **为何社区推荐字符串字面量联合而非 enum**：
   - 零运行时开销（符合 TS"类型擦除"哲学）
   - 与后端 API 的字符串值天然对应
   - 更简洁，不生成额外代码

4. **局限性**：不能在运行时迭代（编译后就没了），无法像 `enum` 那样 `Object.keys()` 遍历所有可能值。

---

### Q9：为什么调用签名接口不能用 class 实现？

**问题背景**：练习二要求 `HealthPotion` 类实现 `ConsumableItem`（其中包含调用签名 `(target: string): string`），发现 class 无法满足。

**解答要点**：

1. **核心矛盾**：调用签名要求实例本身可被当函数调用，但 class 创建的实例是普通对象，永远不能加括号调用。

2. **class 做不到的原因**：
   - class 没有位置让你定义"当实例被调用时返回什么"
   - `new ClassName()` 返回的是 `{}`，不是 `function`

3. **正确方案：可调用对象（工厂函数模式）**：
   ```typescript
   function createXxx(): TheInterface {
     const instance = ((...args) => { /* ... */ }) as TheInterface;
     instance.prop1 = ...;
     instance.prop2 = ...;
     return instance;
   }
   ```
   因为 JS 函数也是对象，可以在函数上挂属性。然后用 `as` 类型断言告诉 TS。

4. **对照表**：

   | | 普通接口（只有属性+方法） | 调用签名接口 |
   |---|---|---|
   | class 能 `implements` | ✅ | ❌ |
   | 创建方式 | `new ClassName()` | 工厂函数 + `as` + 挂属性 |

> **关键认知**：TS 接口的 `implements` 能力受限于 JS 运行时的对象模型——JS 的 class 实例永远不是函数。

---

---

## 类型断言与收窄

### Q1：`const` 已经声明了常量，为什么还要 `as const`？有什么作用？

**问题背景**：`const config = { speed: 100, mode: "hard" } as const;` — config 已经是 `const` 变量了，为什么还要 `as const`？

**解答要点**：

1. **`const` 变量声明和 `as const` 类型断言管的是不同层面**：
   - `const` 管的是**变量绑定**：变量不能被重新赋值（`config = xxx` 报错）
   - `as const` 管的是**值本身的类型**：所有属性变为 `readonly`，值收窄为精确字面量类型

2. **对比**：
   ```typescript
   const a = { speed: 100 };          // a.speed 类型是 number，可修改
   const b = { speed: 100 } as const; // b.speed 类型是 100（字面量），readonly 不可修改
   ```

3. **实际用途**：让 TS 推断出最精确的类型，以便提取联合类型：
   ```typescript
   const DIRS = ["up", "down"] as const;
   type Direction = (typeof DIRS)[number]; // "up" | "down"
   ```
   没有 `as const` 的话，`Direction` 只会是 `string`。

4. **运行时真相**：`as const` 编译后消失，JS 中属性仍然可被修改。保护仅存在于编译时——TS 拒绝编译你的修改代码，所以修改语句永远不会进入 JS 文件。如果需要运行时保护，用 `Object.freeze()`。

---

### Q2：`typeof` 和 `instanceof` 的区别是什么？JS 编译后类还存在吗？`instanceof` 怎么判断类？

**问题背景**：`typeof` 用于类型判断，`instanceof` 用于类判断——两者分工不同，且不确定编译后类是否还存在。

**解答要点**：

1. **分工**：
   - `typeof` → 判断 JS 原始类型（`"string"` `"number"` `"boolean"` `"undefined"` `"object"` `"function"` 等）
   - `instanceof` → 判断是否为某类的实例（检查原型链）

2. **JS 编译后类仍然存在**：现代目标（ES2015+）原封不动保留 `class` 关键字；ES5 目标编译为构造函数 + 原型链，同样是运行时真实存在的。

3. **`instanceof` 是真实运行时检查，不是"告诉编译器"**：
   - JS 真的去查 `ClassName.prototype` 是否在对象的原型链上
   - TS 只是"蹭"这个检查结果来自动收窄类型
   - 与 `as` 完全不同——`as` 运行时消失，`instanceof` 运行时真实执行

4. **与 Java 的对比**：Java `instanceof` 也是运行时检查（JVM 的 `checkcast`），但检查后仍需手动强转 `(Dog) animal`。TS 的 `instanceof` 检查后**自动收窄**，无需写 `as`。

---

### Q3：开发场景下推荐使用断言，还是做真正的判断（如判别联合）？

**问题背景**：`as` 方便但有风险，判别联合更安全但需要设计——实战中怎么选择？

**解答要点**：

1. **优先级排序**：
   ```
   类型收窄(判别联合/instanceof/typeof/in) > 非空断言 ! > as 断言 > as unknown as T
   首选 ✅                                 慎用 ⚠️     少用 ⚠️   最后手段 🚨
   ```

2. **必须用 `as` 的少数场景**（无法用运行时检查表达）：
   - Cocos `getComponent(Sprite) as Sprite`
   - 后端 JSON 数据 `data as PlayerData`（但推荐加 Zod 校验）
   - DOM API 返回值

3. **不应使用 `as`，应用收窄的场景**：
   - 联合类型的分支处理 → 判别联合
   - 判断是否为某类实例 → `instanceof`
   - 判断基础类型 → `typeof`
   - 检查属性是否存在 → `in`
   - 判空后调用 → `if (value)` 真值收窄

4. **一句话原则**：能用 `if` + `typeof`/`instanceof`/`in`/判别联合完成类型判断，就**不要**用 `as`。`as` 是最后一根稻草——当你确实比编译器知道得更多且无法用运行时检查表达时，才用它。

---

### Q4：`as const` 编译后消失，那 JS 中属性不就可以改了吗？

**问题背景**：既然 `as` 编译时擦除，`const config = { speed: 100, mode: "hard" } as const;` 编译成 JS 后就是一个普通对象，属性在运行时完全可以被修改。

**解答要点**：

1. **确实是这样的**。编译后的 JS：
   ```javascript
   const config = { speed: 100, mode: "hard" };
   config.speed = 999; // JS 中完美运行
   ```

2. **`as const` 保护的机制不是运行时，而是编译时拦截**：
   - 你在 TS 中写 `config.speed = 200` → TS 拒绝编译
   - 这行修改代码永远不会进入 JS 文件
   - 所以**你的代码**不会在运行时修改它

3. **它防不住的情况**：
   - 其他 JS 文件直接操作这个对象
   - 外部库或运行时反射修改
   - 通过 `(config as any).speed = 999` 绕过

4. **需要运行时保护时**：用 `Object.freeze()`：
   ```typescript
   const config = Object.freeze({ speed: 100, mode: "hard" } as const);
   // 运行时 config.speed = 999 也被拒绝（严格模式报错）
   ```

5. **核心认知**：TypeScript 所有类型系统的东西（`as`、`!`、`as const`、泛型、interface）编译后全部消失。运行时安全只能靠 JS 自身机制（`instanceof`、`typeof`、`in`、`Object.freeze`、Zod 等）来保证。

---

## 第四节：泛型（Generic）

### Q1：泛型编译后是什么样的？

**问题背景**：知道接口编译后消失，泛型的 `<T>` 编译后变成什么？

**解答要点**：

1. **编译后 `<T>` 和所有类型参数全部消失，和 interface 完全一样**。

2. **编译前后对比**：
   ```typescript
   // TS
   function identity<T>(value: T): T { return value; }
   class Cache<T> { private data = new Map<string, T>(); }
   ```
   ```javascript
   // JS 产物——无任何 T，无任何类型信息
   function identity(value) { return value; }
   class Cache { data = new Map(); }
   ```

3. 泛型的所有"通用性"仅存在于编译时。JS 产物就是一个普通的、无类型的函数/类。

---

### Q2：JS 怎么做到一个方法适用多个类型？泛型不是必须的吗？

**问题背景**：如果泛型编译后消失了，一个函数怎么能接受 `string`、`number` 等多种类型？

**解答要点**：

1. **JS 天生就是动态类型的**——变量没有固定类型，函数天然接受任何参数：
   ```javascript
   function identity(value) { return value; }
   identity("hello"); // 可以
   identity(42);      // 也可以
   identity({});      // 完美运行
   ```

2. **泛型不是让函数"能"接受多种类型——JS 本来就能。泛型是"记录"传入的类型，让编译器在调用处给你类型保护**。

3. **认知反转**：你以为泛型让函数多态，实际上泛型只是给 JS 的动态行为加了一层编译时的类型追踪。

---

### Q3：泛型编译后没有约束，JS 代码里如何保护泛型的使用？

**问题背景**：泛型 `<T>` 编译后消失，运行时无约束，传入错误类型怎么办？

**解答要点**：

1. **靠运行时类型判断和收窄**。这正是断言/收窄章节学到的内容的使用场景。

2. **典型模式**——在泛型函数体内用运行时检查保护：
   ```typescript
   function process<T>(value: T): number | null {
     if (typeof value === "number") return value * 2;  // typeof 保护
     if (typeof value === "string") return parseInt(value) * 2;
     return null;
   }
   ```

3. **两层保护体系**：
   - 编译时：泛型 `extends` 约束 → 防止你写出不安全的代码
   - 运行时：`typeof`/`instanceof`/`in`/类型谓词/Zod → 防止外部数据破坏

---

### Q4：类型谓词 `is` 和内联收窄有什么区别？不用谓词也能收窄吧？

**问题背景**：`isPlayer` 方法如果不写 `obj is Player` 只返回 `boolean`，把判断逻辑直接写进 `if` 里照样能收窄。那谓词有什么用？

**解答要点**：

1. **内联收窄管函数内部，谓词管调用方**。

2. **对比**：
   ```typescript
   // 只返回 boolean——调用方收窄不了
   function isPlayer(obj: unknown): boolean { return "name" in obj; }
   if (isPlayer(data)) { data.name; } // ❌ data 仍是 unknown

   // 类型谓词——调用方获得收窄
   function isPlayer(obj: unknown): obj is Player { return "name" in obj; }
   if (isPlayer(data)) { data.name; } // ✅ data 收窄为 Player
   ```

3. **谓词的本质**：把函数内部的收窄结论"透传"给调用方。TS 的控制流分析无法穿透函数边界，`obj is Player` 就是在这道边界上开的门。

4. **两个核心用途**：
   - **复用**：一段判断逻辑多处使用，不复制粘贴 `&&` 链
   - **`.filter()` 类型收窄**：`arr.filter((x): x is T => ...)` 让过滤后的数组自动收窄类型，普通 `boolean` 做不了这件事

---

### Q5：`keyof T` 是什么用法？

**问题背景**：在泛型函数中看到 `key: keyof T` 的写法，不清楚含义——它是约束还是类型？

**解答要点**：

1. **`keyof` 是类型操作符（纯编译时，编译后消失）**：从一个类型上提取所有键名，组成字面量联合。

2. **示例**：
   ```typescript
   interface GameConfig { version: number; debug: boolean; }
   type Keys = keyof GameConfig; // "version" | "debug"
   ```

3. **在泛型中的用法**：
   ```typescript
   function get<T extends object>(obj: T, key: keyof T): T[keyof T] { ... }
   //                                key 的类型 = T 的所有键名的联合
   //                                只有 T 实际拥有的属性名才能传进去
   ```

4. **本质**：`key: keyof T` 把变量的合法值限制在 T 的键名范围内——和 `x: number` 把 x 限制在数字范围内是同一种类型约束。

---

### Q6：`<T>` 是约束吗？为什么不加 `<T>` 会报错？

**问题背景**：习惯把 `<T>` 当成"泛型约束"，不理解为啥 `function fn(value: T): T` （不写 `<T>`）会报错。

**解答要点**：

1. **`<T>` 不是约束，是声明——"引入一个类型变量 T"**。约束是 `extends` 的事。

2. **对比**：
   ```typescript
   function fn<T>(value: T): T;    // ✅ 声明了 T，然后在参数和返回值中使用
   function fn(value: T): T;       // ❌ T 未定义——TS 去全局找叫 T 的类型
   ```

3. **类比**：`<T>` 相当于 `let T = ???`——先声明变量，才能使用。不声明直接用，和 JS 的 `x = 1`（没有 let/const）一样是未定义引用。

4. **不加约束的 `<T>` 等价于接受所有类型，但和 `any` 完全不同**——`<T>` 保留了类型追踪链，`any` 截断了。

---

### Q7：泛型一旦确定具体类型，就能对类型进行检查吗？

**问题背景**：泛型和 `any` 在使用过程中的区别——泛型确定类型后是否就获得了完整的类型检查？

**解答要点**：

1. **是的，这就是泛型的核心价值**。

2. **对比**：
   ```typescript
   // any：类型链全断
   function wrapAny(v: any): any { return { data: v }; }
   const r1 = wrapAny("hello");
   r1.data.toFixed(); // ✅ 编译通过，运行时崩溃——TS 不知道 data 是 string

   // 泛型：类型信息完整穿过
   function wrap<T>(v: T): { data: T } { return { data: v }; }
   const r2 = wrap("hello");
   r2.data.toUpperCase(); // ✅ 编译通过，安全
   r2.data.toFixed();     // ❌ 编译报错！TS 知道 data 是 string
   ```

3. **过程**：调用 `wrap("hello")` → TS 推断 `T = string` → 参数类型 `string`（检查传入）→ 返回值 `{ data: string }`（确定形状）→ 调用方获得完整类型保护。

4. **一句话**：`<T>` 让类型信息完整穿过函数。`any` 是截断——进去截断一次，出来再截断一次。

---

### Q8：为什么用 `const` 不用 `var`？变量提升是什么？

**问题背景**：练习二对象池中用 `var data = this.factory()`，被指出应改用 `const`。不理解 `var` 的问题和"变量提升"的含义。

**解答要点**：

1. **变量提升（Hoisting）**：`var` 声明的变量会被 JS 引擎"提"到函数顶部，但赋值还在原位。
   ```javascript
   // 你写的
   if (true) { var x = 1; }
   // JS 实际看到的
   var x;          // 声明提升到顶部，值为 undefined
   if (true) { x = 1; }
   ```

2. **`var` 三大坑**：

   | 问题 | `var` | `const` |
   |------|-------|---------|
   | 变量提升 | 声明提到函数顶，值为 `undefined`，声明前访问不报错 | 声明前访问直接 `ReferenceError` |
   | 块级作用域 | 无，`if`/`for` 块关不住 | 有 |
   | 重复声明 | 允许，静默覆盖 | 直接报错 |

3. **选择原则**：默认 `const`，只有确实需要重新赋值才用 `let`。TS 项目里没有理由用 `var`。

4. **本场景**：`data` 只赋一次值、之后不改——`const data = this.factory()`。

---

### 概念混淆点（泛型学习期间暴露）

| 混淆点 | 现象 | 澄清 |
|-------|------|------|
| `<T>` 是约束 | 以为 `<T>` 在"限制"泛型 | `<T>` 是声明类型变量；`extends` 才是约束 |
| 泛型让函数接受多类型 | 以为没了泛型函数就不能多态 | JS 天生接受任何类型；泛型只是编译时追踪 |
| 类型谓词创造收窄 | 以为 `is` 让 TS 学会了新的推理 | 谓词只是把函数内部收窄传出去；内联判断同样能收窄 |

### 练习易错模式（泛型）

**根因**：下意识把 `<T>` 当成 `any`——"先声明泛型，后面再想办法收窄"。但 `<T>` 是精确承诺，签名说了什么就必须做到。

| 易错模式 | 具体表现 | 正确做法 |
|---------|---------|---------|
| 签名承诺太多，实现只覆盖两三种 | `getTopScores<T>(type: T): T[]` 只处理 string/number | 用 `extends` 收紧签名，或补齐所有分支 |
| 实现硬编码具体类型，泛型变摆设 | `getConfigValue<T extends GameConfig>` 体内直接 `config.version` | 用 `keyof T` 泛化 key 参数 |
| 调用处打补丁而不改类本身 | Stack 用 `any`，调用处加 `typeof` 保护 | 类本身改成 `Stack<T>` |
| fallback 返回不匹配类型 | `doubleValue<T>` fallback 返回字符串当 T 不是 string | fallback 返回原值保持类型一致，或收紧 T 的约束 |
| `==` / `var` 等 JS 陋习 | 对象池中用 `==` 比较、`var` 声明 | TS 项目中统一 `===` 和 `const` |

---

*文档创建时间：2026-06-08*
*首次关联章节：第三节：接口（Interface）*

*文档更新时间：2026-06-11*
