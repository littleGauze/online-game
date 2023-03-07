import { instantiate, IVec2, tween, Tween, Vec3, _decorator } from 'cc';
import { EntityManager } from '../../Base/EntityManager';
import { EntityTypeEnum, IBullet } from '../../Common';
import { EntityStateEnum, EventEnum } from '../../Enum';
import { BulletStateMachine } from './BulletStateMachine';
import { arc2dgree } from '../../Utils';
import EventManager from '../../Global/EventManager';
import DataManager from '../../Global/DataManager';
import { ExplosionManager } from '../Explosion/ExplosionManager';
import { ObjectPoolManager } from '../../Global/ObjectPoolManager';
const { ccclass } = _decorator;

@ccclass('BulletManager')
export class BulletManager extends EntityManager {
    private id: number = null
    private tw: Tween<unknown>
    private targetPos: Vec3

    init(data: IBullet) {
        this.id = data.id
        const { type, position } = data
        this.fsm = this.addComponent(BulletStateMachine)
        this.fsm.init(type)
        this.state = EntityStateEnum.Idle
        this.node.active = false
        this.targetPos = undefined

        EventManager.Instance.on(EventEnum.ExplosionBorn, this.handleExplosionBorn, this)
    }

    handleExplosionBorn(id: number, { x, y }: IVec2) {
        if (this.id !== id) return

        const explosion = ObjectPoolManager.Instance.get(EntityTypeEnum.Explosion)
        const em = explosion.getComponent(ExplosionManager) || explosion.addComponent(ExplosionManager)
        em.init(EntityTypeEnum.Explosion, { x, y })

        EventManager.Instance.off(EventEnum.ExplosionBorn, this.handleExplosionBorn, this)
        DataManager.Instance.bulletMap.delete(this.id)
        ObjectPoolManager.Instance.ret(this.node)
    }

    render(bullet: IBullet) {
        this.renderPos(bullet)
        this.renderDir(bullet)
    }

    renderPos(bullet: IBullet) {
        const { position } = bullet
        const pos = new Vec3(position.x, position.y)
        if (!this.targetPos) {
            this.node.active = true
            this.node.setPosition(pos)
            this.targetPos = new Vec3(pos)
        } else if (!this.targetPos.equals(pos)) {
            this.tw?.stop()
            this.node.setPosition(this.targetPos)
            this.targetPos.set(pos)
            this.tw = tween(this.node)
                .to(0.1, { position: this.targetPos })
                .start()
        }
    }

    renderDir(bullet: IBullet) {
        const { direction } = bullet
        if (direction.x !== 0) {
            const side = Math.sqrt(direction.x ** 2 + direction.y ** 2)
            let angle = arc2dgree(Math.asin(direction.y / side))
            if (direction.x < 0) {
                angle *= -1
                angle += 180
            }
            this.node.setRotationFromEuler(0, 0, angle)
        }
    }
}

