export enum InputTypeEnum {
  ActorMove,
  WeaponShoot,
  TimePast,
}

export enum EntityTypeEnum {
  Actor1 = 'Actor1',
  Map = 'Map',
  Weapon1 = 'Weapon1',
  Bullet1 = 'Bullet1',
  Bullet2 = 'Bullet2',
  Explosion = 'Explosion',
}

export enum ApiMsgEnum {
  ApiPlayerJoin,
  ApiRoomView,
  ApiPlayerList,
  ApiRoomCreate,
  ApiRoomList,
  ApiRoomJoin,
  ApiRoomLeave,
  ApiGameStart,

  MsgClientSync,
  MsgServerSync,
  MsgPlayerSync,
  MsgRoomPlayerSync,
  MsgRoomSync,
  MsgRoomViewSync,
  MsgGamgeStart,
}

export enum EventEnum {

}