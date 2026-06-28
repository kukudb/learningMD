// ====== TypeScript 基础综合验收练习 ======
// 场景：迷你游戏数据系统
// 三道题：代码诊断 / 类型设计 / 异步编码
// 完成后在对话中告知"提交"

// ====================================================================
// 题目一：代码诊断（5 处错误）
// 请在错误行添加注释标注 // ❌ 错误原因，然后在下方写出修正后的完整代码
// ====================================================================

// ====== 类型定义模块 types.ts ======
export interface PlayerData {
  id: number;
  name: string;
  hp: number;
  maxHp: number;
  inventory: Item[];
}

export interface Item {
  id: number;
  name: string;
  type: "weapon" | "potion" | "armor";
}

// ====== 工具模块 utils.ts ======
import { PlayerData } from "./types";

export function getPlayerName(player: PlayerData): string {
  return player.name;
}

export function updatePlayer(
  player: PlayerData,
  changes: Pick<PlayerData, "name" | "score">  // 错误①
): PlayerData {
  return { ...player, ...changes };
}

// ====== 游戏管理器 game.ts ======
import { PlayerData, Item } from "./types";
import { updatePlayer } from "./utils";

class GameManager {
  private cache: Map<number, PlayerData> = new Map();

  addToCache(data: PlayerData) {
    this.cache.set(data.id, data);
  }

  getFromCache(id: number): PlayerData | undefined {
    return this.cache.get(id);
  }
}

const gm = new GameManager();

// 模拟：从服务器拿到未知类型的数据
function processServerResponse(raw: unknown) {
  // 我们期望 raw 是 PlayerData
  const player = raw as PlayerData;  // 错误②

  // 错误③：类型收窄使用错误
  if (typeof player === "PlayerData") {
    gm.addToCache(player);
  }
}

// 模拟：战斗事件系统
type BattleEvent =
  | { type: "attack"; damage: number }
  | { type: "heal"; amount: number }
  | { type: "flee" };

function handleBattleEvent(event: BattleEvent) {
  switch (event.type) {
    case "attack":
      console.log("收到攻击，伤害:", event.damage);
      break;
    case "heal":
      console.log("收到治疗，回复量:", event.damage);  // 错误④
      break;
    // 错误⑤：缺少 flee 分支，但编译器不报错（非 exhaustive check）
  }
}


// ====================================================================
// 题目二：类型设计 —— 异步资源加载器类型系统
// ====================================================================

// 前置类型（可直接使用）
interface AssetInfo {
  url: string;
  type: "image" | "audio" | "json";
  size: number;
  loaded: boolean;
}

// TODO: 根据需求写出以下类型的完整定义
// 1. AssetMap<K>（使用 Record）
// 2. AssetLoader<T>（泛型类，含 loadAll / getAsset 方法）
// 3. 用 satisfies 检查资源清单


// ====================================================================
// 题目三：异步编码 —— 道具补给系统
// ====================================================================

// 前置类型（可直接使用）
interface Item_Async {
  id: number;
  name: string;
  type: "weapon" | "potion";
}

interface Player_Async {
  id: number;
  items: Item_Async[];
}

// 模拟 API：根据 id 获取道具，50ms 后返回（有 20% 概率 reject）
declare function fetchItem(id: number): Promise<Item_Async>;
// 模拟 API：将道具保存到服务端
declare function saveItemsToServer(playerId: number, items: Item_Async[]): Promise<void>;

// TODO: 编写 resupply 函数
// 要求：
// 1. 使用 Promise.allSettled 并发请求所有 itemIds
// 2. 成功 → 加入 player.items；失败 → 收集 id
// 3. 将成功的道具整体 saveItemsToServer（await）
// 4. 用 try/catch 包裹保存：失败打印错误但不抛出
// 5. 返回 { addedCount: number; failedIds: number[] }
