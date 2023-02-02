import { Prefab, SpriteFrame, Node, Input } from "cc";
import Singleton from "../Base/Singleton";
import { EntityTypeEnum, IActorMove, IBullet, IClientInput, InputTypeEnum, IState } from "../Common";
import EventManager from "../Global/EventManager";
import { ActorManager } from "../Entity/Actor/ActorManager";
import { BulletManager } from "../Entity/Bullet/BulletManager";
import { EventEnum } from "../Enum";
import { JoyStick } from "../UI/JoyStickManager";

const ACTOR_SPEED = 100
const BULLET_SPEED = 600
const SCREEN_WIDTH = 960
const SCREEN_HEIGHT = 640
const ACTOR_RADIUS = 50
const BULLET_RADIUS = 50
const WEAPON_DAMAGE = 5

export default class DataManager extends Singleton {
  static get Instance() {
    return super.GetInstance<DataManager>();
  }

  jm: JoyStick = null
  stage: Node = null
  prefabMap: Map<string, Prefab> = new Map()
  actorMap: Map<number, ActorManager> = new Map()
  bulletMap: Map<number, BulletManager> = new Map()
  textureMap: Map<string, SpriteFrame[]> = new Map()

  width: number = SCREEN_WIDTH
  height: number = SCREEN_HEIGHT

  myPlayerId = 1
  frameId = 1

  state: IState = {
    nextBulletId: 1,
    actors: [
      {
        id: 1,
        hp: 30,
        type: EntityTypeEnum.Actor1,
        weaponType: EntityTypeEnum.Weapon1,
        bulletType: EntityTypeEnum.Bullet2,
        position: { x: -150, y: -150 },
        direction: { x: 0, y: 0 },
      },
      {
        id: 2,
        hp: 100,
        type: EntityTypeEnum.Actor1,
        weaponType: EntityTypeEnum.Weapon1,
        bulletType: EntityTypeEnum.Bullet2,
        position: { x: 150, y: 150 },
        direction: { x: -1, y: 0 },
      },
    ],
    bulltes: []
  }

  applyInput(input: IClientInput) {
    switch (input.type) {
      case InputTypeEnum.ActorMove:
        const { id, dt, direction: { x, y } } = input
        const actor = this.state.actors.find(it => it.id === id)
        actor.direction.x = x
        actor.direction.y = y

        actor.position.x += x * dt * ACTOR_SPEED
        actor.position.y += y * dt * ACTOR_SPEED
        break
      case InputTypeEnum.WeaponShoot:
        const { owner, direction, position } = input
        const bullet: IBullet = {
          id: this.state.nextBulletId++,
          type: this.actorMap.get(owner).bulletType,
          owner,
          direction,
          position,
        }
        this.state.bulltes.push(bullet)
        EventManager.Instance.emit(EventEnum.BulletBorn, owner)
        break
      case InputTypeEnum.TimePast:
        const { dt: _dt } = input
        const bullets = this.state.bulltes
        const actors = this.state.actors

        for (let i = bullets.length - 1; i >= 0; i--) {
          const bullet = bullets[i]
          for (const actor of actors) {
            if (actor.id === bullet.owner) continue
            if (((actor.position.x - bullet.position.x) ** 2 + (actor.position.y - bullet.position.y) ** 2) < ((ACTOR_RADIUS + BULLET_RADIUS) / 2) ** 2) {
              actor.hp -= WEAPON_DAMAGE
              EventManager.Instance.emit(EventEnum.ExplosionBorn, bullet.id, {
                x: (actor.position.x + bullet.position.x) / 2,
                y: (actor.position.y + bullet.position.y) / 2,
              })
              bullets.splice(i, 1)
              break
            }
          }
          if (Math.abs(bullet.position.x) > this.width / 2 || Math.abs(bullet.position.y) > this.height / 2) {
            bullets.splice(i, 1)

            EventManager.Instance.emit(EventEnum.ExplosionBorn, bullet.id, bullet.position)
            break
          }
        }

        for (const bullet of bullets) {
          bullet.position.x += _dt * bullet.direction.x * BULLET_SPEED
          bullet.position.y += _dt * bullet.direction.y * BULLET_SPEED
        }
        break
    }
  }
}
