import { Prefab, SpriteFrame, Node, Input } from "cc";
import Singleton from "../Base/Singleton";
import { EntityTypeEnum, IActorMove, IBullet, IClientInput, InputTypeEnum, IRoom, IState, toFixed } from "../Common";
import EventManager from "../Global/EventManager";
import { ActorManager } from "../Entity/Actor/ActorManager";
import { BulletManager } from "../Entity/Bullet/BulletManager";
import { EventEnum } from "../Enum";
import { JoyStick } from "../UI/JoyStickManager";
import { randomBySeed } from "../Utils";

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
  roomInfo: IRoom = null

  width: number = SCREEN_WIDTH
  height: number = SCREEN_HEIGHT

  myPlayerId = 1
  frameId = 1

  state: IState = null
  lastState: IState = null

  private _random: () => number
  get random() {
    if (!this._random) {
      this._random = randomBySeed(1)
    }
    return this._random
  }

  applyInput(input: IClientInput) {
    switch (input.type) {
      case InputTypeEnum.ActorMove:
        const { id, dt, direction: { x, y } } = input
        const actor = this.state.actors.find(it => it.id === id)
        actor.direction.x = x
        actor.direction.y = y

        actor.position.x = toFixed(actor.position.x + x * dt * ACTOR_SPEED)
        actor.position.y = toFixed(actor.position.y + y * dt * ACTOR_SPEED)
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
        this.state.bullets.push(bullet)
        EventManager.Instance.emit(EventEnum.BulletBorn, owner)
        break
      case InputTypeEnum.TimePast:
        const { dt: _dt } = input
        const bullets = this.state.bullets
        const actors = this.state.actors

        for (let i = bullets.length - 1; i >= 0; i--) {
          const bullet = bullets[i]
          const me = actors.find(a => a.id === this.myPlayerId)
          for (const actor of actors) {
            if (actor.id === bullet.owner) continue
            if (((actor.position.x - bullet.position.x) ** 2 + (actor.position.y - bullet.position.y) ** 2) < ((ACTOR_RADIUS + BULLET_RADIUS) / 2) ** 2) {
              if (DataManager.Instance.random() > 0.7) {
                actor.hp -= WEAPON_DAMAGE * 2
              } else {
                actor.hp -= WEAPON_DAMAGE
              }

              // lose
              if (actor.hp <= 0 && actor.id === this.myPlayerId) {
                EventManager.Instance.emit(EventEnum.ShowResult, false)
              }

              EventManager.Instance.emit(EventEnum.ExplosionBorn, bullet.id, {
                x: toFixed((actor.position.x + bullet.position.x) / 2),
                y: toFixed((actor.position.y + bullet.position.y) / 2),
              })
              bullets.splice(i, 1)
              break
            }
          }

          // win
          const enemy = actors.filter(a => a.id !== this.myPlayerId)
          if (enemy.every(e => e.hp <= 0) && me.hp > 0) {
            EventManager.Instance.emit(EventEnum.ShowResult, true)
          }

          if (Math.abs(bullet.position.x) > this.width / 2 || Math.abs(bullet.position.y) > this.height / 2) {
            bullets.splice(i, 1)

            EventManager.Instance.emit(EventEnum.ExplosionBorn, bullet.id, bullet.position)
            break
          }
        }

        for (const bullet of bullets) {
          bullet.position.x = toFixed(bullet.position.x + _dt * bullet.direction.x * BULLET_SPEED)
          bullet.position.y = toFixed(bullet.position.y + _dt * bullet.direction.y * BULLET_SPEED)
        }
        break
    }
  }
}
