import { _decorator, Component, Node, Prefab, instantiate } from 'cc';
const { ccclass, property } = _decorator;

// 赛道格子类型，坑（BT_NONE）或者实路（BT_STONE）
enum BlockType {
  BT_NONE,
  BT_STONE,
}

@ccclass('GameManager')
export class GameManager extends Component {
  //   赛道预制
  @property({ type: Prefab })
  public cubePre: Prefab | null = null;
  // 赛道长度
  @property
  public roadLength = 50;
  private _road: BlockType[] = [];

  start() {
    this.generateRoad();
  }

  update(deltaTime: number) {}

  generateRoad() {
    // 生成赛道

    // 防止游戏重新开始时，赛道还是旧的赛道
    // 因此，需要移除旧赛道，清除旧赛道数据
    this.node.removeAllChildren();
    this._road = [];
    // 确保游戏运行时，人物一定站在实路上
    this._road.push(BlockType.BT_STONE);

    // 确定好每一格赛道类型
    for (let i = 0; i < this.roadLength; i++) {
      // 如果上一格赛道是坑，那么这一格一定不能为坑
      if (this._road[i - 1] === BlockType.BT_NONE) {
        this._road.push(BlockType.BT_STONE);
      } else {
        this._road.push(Math.floor(Math.random() * 2));
      }
    }

    // 根据赛道类型生成赛道
    for (let j = 0; j < this._road.length; j++) {
      const block: Node = this.spawnBlockByType(this._road[j]);
      //   判断是否生成了道路，因为 spawnBlockByType 有可能返回坑（值为null）
      if (block) {
        this.node.addChild(block);
        block.setPosition(j, -1.5, 0);
      }
    }
  }

  spawnBlockByType(type: BlockType) {
    console.log('type :>> ', type);
    if (!this.cubePre) {
      return null;
    }

    let block: Node | null = null;
    switch (type) {
      case BlockType.BT_STONE:
        block = instantiate(this.cubePre);
        break;
    }

    return block;
  }
}
