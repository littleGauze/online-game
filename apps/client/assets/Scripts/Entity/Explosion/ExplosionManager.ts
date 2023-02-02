import { Vec2, _decorator } from 'cc';
import { EntityManager } from '../../Base/EntityManager';
import { EntityTypeEnum, IBullet, IVec2 } from '../../Common';
import { EntityStateEnum } from '../../Enum';
import { ExplosionStateMachine } from './ExplosionStateMachine';
import { arc2dgree } from '../../Utils';
const { ccclass } = _decorator;

@ccclass('ExplosionManager')
export class ExplosionManager extends EntityManager {
    init(type: EntityTypeEnum, { x, y }: IVec2) {
        this.fsm = this.addComponent(ExplosionStateMachine)
        this.fsm.init(type)
        this.state = EntityStateEnum.Idle
        this.node.setPosition(x, y)
    }
}

