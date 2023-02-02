import { EntityTypeEnum, InputTypeEnum } from "./Enum"

export interface IVec2 {
  x: number
  y: number
}

export interface IActor {
  id: number
  hp: number,
  type: EntityTypeEnum,
  weaponType: EntityTypeEnum,
  bulletType: EntityTypeEnum,
  position: IVec2
  direction: IVec2
}

export interface IState {
  nextBulletId: number
  actors: IActor[],
  bulltes: IBullet[]
}

export interface IBullet {
  id: number
  type: EntityTypeEnum,
  owner: number
  position: IVec2
  direction: IVec2
}

export type IClientInput = IActorMove | IWeaponShoot | ITimePast

export interface IActorMove {
  id: number,
  type: InputTypeEnum.ActorMove,
  direction: IVec2
  dt: number,
}

export interface IWeaponShoot {
  owner: number,
  type: InputTypeEnum.WeaponShoot,
  direction: IVec2,
  position: IVec2,
}

export interface ITimePast {
  type: InputTypeEnum.TimePast,
  dt: number,
}

export interface IApiRect<T> {
  success: boolean
  res?: T,
  err?: Error
}
