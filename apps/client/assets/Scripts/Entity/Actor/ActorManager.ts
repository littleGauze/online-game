import { _decorator, Component, Node, instantiate, Vec3, ProgressBar } from 'cc';
import { EntityManager } from '../../Base/EntityManager';
import { EntityTypeEnum, IActor, InputTypeEnum } from '../../Common';
import { EntityStateEnum, EventEnum } from '../../Enum';
import DataManager from '../../Global/DataManager';
import { ActorStateMachine } from './ActorStateMachine';
import { WeaponManager } from '../Weapon/WeaponManager'
import { arc2dgree } from '../../Utils';
import EventManager from '../../Global/EventManager';
const { ccclass, property } = _decorator;

@ccclass('ActorManager')
export class ActorManager extends EntityManager {
    private _wm: WeaponManager = null
    private id: number = null
    private _hp: ProgressBar = null

    bulletType: EntityTypeEnum = null

    init(data: IActor) {
        this.id = data.id
        const { type, weaponType, bulletType } = data
        this.bulletType = bulletType
        this.fsm = this.addComponent(ActorStateMachine)
        this.fsm.init(type)
        this.state = EntityStateEnum.Idle

        const prefab = DataManager.Instance.prefabMap.get(weaponType)
        const weapon = instantiate(prefab)
        weapon.setParent(this.node)
        this._wm = weapon.addComponent(WeaponManager)
        this._wm.init(data)

        this._hp = this.node.getChildByName('Hp').getComponent(ProgressBar)
    }

    tick(dt: number) {
        if (this.id !== DataManager.Instance.myPlayerId) return
        const input = DataManager.Instance.jm.input
        if (input && input.length()) {
            EventManager.Instance.emit(EventEnum.ClientSync, {
                id: 1,
                type: InputTypeEnum.ActorMove,
                direction: { x: input.x, y: input.y },
                dt,
            })
            return this.state = EntityStateEnum.Run
        }
        this.state = EntityStateEnum.Idle
    }

    render(data: IActor) {
        const { position, direction, hp } = data
        if (direction.x !== 0) {
            this.node.setScale(direction.x > 0 ? 1 : -1, 1)
            this._hp.node.setScale(direction.x > 0 ? 1 : -1, 1)
            const side = Math.sqrt(direction.x ** 2 + direction.y ** 2)
            const angle = arc2dgree(Math.asin(direction.y / side))
            this._wm.node.setRotationFromEuler(0, 0, angle)
        }
        this.node.setPosition(position.x, position.y)
        this._hp.progress = hp / this._hp.totalLength
    }
}

