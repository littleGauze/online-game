import { _decorator, Component, Node, input, SystemEvent, Input, EventTouch, Vec2, UITransform, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('JoyStick')
export class JoyStick extends Component {
  private _body: Node = null
  private _stick: Node = null
  private _defaultPos: Vec2 = null
  private _radius: number = 0

  input: Vec2 = null

  onLoad() {
    input.on(Input.EventType.TOUCH_START, this._touchStart, this)
    input.on(Input.EventType.TOUCH_MOVE, this._touchMove, this)
    input.on(Input.EventType.TOUCH_END, this._touchEnd, this)

    this._body = this.node.getChildByName('Body')
    this._stick = this._body.getChildByName('Stick')
    this._defaultPos = new Vec2(this._body.position.x, this._body.position.y)
    this._radius = this._body.getComponent(UITransform).contentSize.x / 2
  }

  onDestroy() {
    input.off(Input.EventType.TOUCH_START, this._touchStart, this)
    input.off(Input.EventType.TOUCH_MOVE, this._touchMove, this)
    input.off(Input.EventType.TOUCH_END, this._touchEnd, this)
  }

  private _touchStart(event: EventTouch) {
    const touchPos = event.getUILocation()
    this._body.setPosition(touchPos.x, touchPos.y)
  }

  private _touchMove(event: EventTouch) {
    const touchPos = event.getUILocation()
    const pos = new Vec2(touchPos.x - this._body.position.x, touchPos.y - this._body.position.y)
    if (pos.length() > this._radius) {
      pos.multiplyScalar(this._radius / pos.length())
    }
    this._stick.setPosition(pos.x, pos.y)
    this.input = pos.clone().normalize()
  }

  private _touchEnd() {
    this._body.setPosition(this._defaultPos.x, this._defaultPos.y)
    this._stick.position = Vec3.ZERO
    this.input = Vec2.ZERO
  }
}

