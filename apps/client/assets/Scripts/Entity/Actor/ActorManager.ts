import { _decorator, Component, Node, instantiate, Vec3, ProgressBar, Tween, TERRAIN_HEIGHT_BASE, tween } from 'cc';
import { EntityManager } from '../../Base/EntityManager';
import { EntityTypeEnum, IActor, InputTypeEnum, toFixed } from '../../Common';
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

    private targetPos: Vec3
    private tw: Tween<unknown>

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

        this.node.active = false
        this.targetPos = undefined
    }

    tick(dt: number) {
        if (this.id !== DataManager.Instance.myPlayerId) return
        const input = DataManager.Instance.jm.input
        if (input && input.length()) {
            EventManager.Instance.emit(EventEnum.ClientSync, {
                id: DataManager.Instance.myPlayerId,
                type: InputTypeEnum.ActorMove,
                direction: {
                    x: toFixed(input.x),
                    y: toFixed(input.y)
                },
                dt: toFixed(dt),
            })
            return this.state = EntityStateEnum.Run
        }
        this.state = EntityStateEnum.Idle
    }

    render(actor: IActor) {
        this.renderPos(actor)
        this.renderDir(actor)
        this.renderHp(actor)
    }

    renderPos(actor: IActor) {
        const { position } = actor
        const pos = new Vec3(position.x, position.y)
        if (!this.targetPos) {
            this.node.setPosition(pos)
            this.targetPos = new Vec3(pos)
            this.node.active = true
        } else if (!this.targetPos.equals(pos)) {
            this.tw?.stop()
            this.node.setPosition(this.targetPos)
            this.targetPos.set(pos)
            this.state = EntityStateEnum.Run
            this.tw = tween(this.node)
                .to(0.1, { position: this.targetPos })
                .call(() => {
                    this.state = EntityStateEnum.Idle
                })
                .start()
        }
    }

    renderDir(actor: IActor) {
        const { direction } = actor
        if (direction.x !== 0) {
            this.node.setScale(direction.x > 0 ? 1 : -1, 1)
            this._hp.node.setScale(direction.x > 0 ? 1 : -1, 1)
            const side = Math.sqrt(direction.x ** 2 + direction.y ** 2)
            const angle = arc2dgree(Math.asin(direction.y / side))
            this._wm.node.setRotationFromEuler(0, 0, angle)
        }
    }

    renderHp(actor: IActor) {
        const { hp } = actor
        this._hp.progress = hp / this._hp.totalLength
    }
}

