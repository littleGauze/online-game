import { _decorator, Node, UITransform, Vec2 } from 'cc';
import { EntityManager } from '../../Base/EntityManager';
import { IActor, InputTypeEnum } from '../../Common';
import { EntityStateEnum, EventEnum } from '../../Enum';
import DataManager from '../../Global/DataManager';
import EventManager from '../../Global/EventManager';
import { WeaponStateMachine } from './WeaponStateMachine';
const { ccclass, property } = _decorator;

@ccclass('WeaponManager')
export class WeaponManager extends EntityManager {
    private _body: Node = null
    private _anchor: Node = null
    private _point: Node = null
    private _owner: number = 0

    init(data: IActor) {
        const { id, weaponType } = data
        this._owner = id
        this._body = this.node.getChildByName('Body')
        this._anchor = this._body.getChildByName('Anchor')
        this._point = this._anchor.getChildByName('Point')
        this.fsm = this._body.addComponent(WeaponStateMachine)
        this.fsm.init(weaponType)
        this.state = EntityStateEnum.Idle
    }

    onLoad() {
        EventManager.Instance.on(EventEnum.WeaponShoot, this._handleWeaponShot, this)
        EventManager.Instance.on(EventEnum.BulletBorn, this._handleBulletBorn, this)
    }

    onDestroy() {
        EventManager.Instance.off(EventEnum.WeaponShoot, this._handleWeaponShot, this)
        EventManager.Instance.off(EventEnum.BulletBorn, this._handleBulletBorn, this)
    }

    private _handleBulletBorn(owner: number) {
        if (this._owner !== owner) return
        this.state = EntityStateEnum.Attack
    }

    private _handleWeaponShot() {
        if (this._owner !== DataManager.Instance.myPlayerId) return
        const pointWorldPos = this._point.getWorldPosition()
        const pointStagePos = DataManager.Instance.stage.getComponent(UITransform).convertToNodeSpaceAR(pointWorldPos)
        const anchorWorldPos = this._anchor.getWorldPosition()
        const dir = new Vec2(pointWorldPos.x - anchorWorldPos.x, pointWorldPos.y - anchorWorldPos.y).normalize()
        EventManager.Instance.emit(EventEnum.ClientSync, {
            owner: this._owner,
            type: InputTypeEnum.WeaponShoot,
            position: { x: pointStagePos.x, y: pointStagePos.y },
            direction: { x: dir.x, y: dir.y }
        })
    }
}

