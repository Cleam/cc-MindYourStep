import { _decorator, Component, Animation, input, Input, EventMouse, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlayerControl')
export class PlayerControl extends Component {
  // 是否接收到跳跃指令
  private _startJump = false;
  // 跳跃步长
  private _jumpStep = 0;
  // 当前跳跃时间
  private _curJumpTime = 0;
  // 每次跳跃时长
  private _jumpTime = 0.3;
  // 当前跳跃速度
  private _curJumpSpeed = 0;
  // 当前橘色位置
  private _curPos = new Vec3();
  // 每次跳跃过程中，当前帧移动位置差
  private _deltaPos = new Vec3(0, 0, 0);
  // 角色目标位置
  private _targetPos = new Vec3();
  // 记录跳了多少步
  private _curMoveIndex = 0;

  @property({ type: Animation })
  public BodyAnim: Animation | null = null;

  start() {
    // init
    // input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
  }

  setInputActive(active: boolean) {
    if (active) {
      input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
    } else {
      input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
    }
  }

  update(deltaTime: number) {
    if (this._startJump) {
      this._curJumpTime += deltaTime;
      if (this._curJumpTime > this._jumpTime) {
        // end
        this.node.setPosition(this._targetPos);
        this._startJump = false;
        this.onOnceJumpEnd();
      } else {
        // tween
        this.node.getPosition(this._curPos);
        this._deltaPos.x = this._curJumpSpeed * deltaTime;
        Vec3.add(this._curPos, this._curPos, this._deltaPos);
        this.node.setPosition(this._curPos);
      }
    }
  }

  onMouseUp(event: EventMouse) {
    if (event.getButton() === 0) {
      // 鼠标左键
      this.jumpByStep(1);
    } else if (event.getButton() === 2) {
      // 鼠标右键
      this.jumpByStep(2);
    }
  }

  jumpByStep(step: number) {
    if (this._startJump) {
      return;
    }
    this._startJump = true;
    this._jumpStep = step;
    this._curJumpTime = 0;
    this._curJumpSpeed = this._jumpStep / this._jumpTime;
    this.node.getPosition(this._curPos);
    Vec3.add(this._targetPos, this._curPos, new Vec3(this._jumpStep, 0, 0));

    if (this.BodyAnim) {
      if (step === 1) {
        this.BodyAnim.play('oneStep');
      } else if (step === 2) {
        this.BodyAnim.play('twoStep');
      }
    }

    this._curMoveIndex += step;
  }

  onOnceJumpEnd() {
    this.node.emit('JumpEnd', this._curMoveIndex);
  }

  reset() {
    this._curMoveIndex = 0;
  }
}
