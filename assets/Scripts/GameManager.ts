import { _decorator, Component, Node, Prefab, instantiate, Vec3, Game, Label } from 'cc';
import { PlayerControl } from './PlayerControl';
const { ccclass, property } = _decorator;

// 赛道格子类型，坑（BT_NONE）或者实路（BT_STONE）
enum BlockType {
  BT_NONE,
  BT_STONE,
}

enum GameState {
  GS_INIT,
  GS_PLAYING,
  GS_END,
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

  @property({ type: PlayerControl })
  public playerCtrl: PlayerControl | null = null;

  @property({ type: Node })
  public startMenu: Node | null = null;

  @property({ type: Label })
  public stepsLabel: Label | null = null;

  set curState(value: GameState) {
    switch (value) {
      case GameState.GS_INIT:
        this.init();
        break;
      case GameState.GS_PLAYING:
        if (this.startMenu) {
          this.startMenu.active = false;
        }

        if (this.stepsLabel) {
          this.stepsLabel.string = '0';
        }
        // 设置active为true时会直接开始监听鼠标事件，此时鼠标抬起事件还未派发
        // 会出现的现象就是，游戏开始的瞬间人物已经开始移动
        // 因此，这里需要做延迟处理
        setTimeout(() => {
          if (this.playerCtrl) {
            this.playerCtrl.setInputActive(true);
          }
        }, 0.1);
        break;
      case GameState.GS_END:
        break;
    }
  }

  onStartButtonClicked() {
    this.curState = GameState.GS_PLAYING;
  }

  start() {
    this.curState = GameState.GS_INIT;

    this.playerCtrl?.node.on('JumpEnd', this.onPlayerJumpEnd, this);
  }

  update(deltaTime: number) {}

  init() {
    // 激活游戏主界面
    if (this.startMenu) {
      this.startMenu.active = true;
    }

    // 生成赛道
    this.generateRoad();

    if (this.playerCtrl) {
      // 禁止接收用户操作人物移动指令
      this.playerCtrl.setInputActive(false);
      // 重置人物位置
      this.playerCtrl.node.setPosition(Vec3.ZERO);
    }

    this.playerCtrl.reset();
  }

  onPlayerJumpEnd(moveIndex: number) {
    if (this.stepsLabel) {
      // 因为在最后一步可能出现步伐大的跳跃，但是此时无论跳跃是步伐大还是步伐小都不应该多增加分数
      this.stepsLabel.string = '' + (moveIndex >= this.roadLength ? this.roadLength : moveIndex);
    }
    this.checkResult(moveIndex);
  }

  generateRoad() {
    // 生成赛道

    // 防止游戏重新开始时，赛道还是旧的赛道
    // 因此，需要移除旧赛道，清除旧赛道数据
    this.node.removeAllChildren();
    this._road = [];
    // 确保游戏运行时，人物一定站在实路上
    this._road.push(BlockType.BT_STONE);

    // 确定好每一格赛道类型（注意：从索引1开始）
    for (let i = 1; i < this.roadLength; i++) {
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
    // console.log('type :>> ', type);
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

  checkResult(moveIndex: number) {
    if (moveIndex < this.roadLength) {
      // 跳到了坑上
      if (this._road[moveIndex] == BlockType.BT_NONE) {
        this.curState = GameState.GS_INIT;
      }
    } else {
      // 跳过了最大长度
      this.curState = GameState.GS_INIT;
    }
  }
}
