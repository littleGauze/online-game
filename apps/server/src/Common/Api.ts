export interface IPlayer {
  id: number
  rid: number
  nickname: string
}

export interface IApiPlayerJoinReq {
  nickname: string
}
export interface IApiPlayerJoinRes {
  player: IPlayer
}

export interface IApiPlayerListReq {}
export interface IApiPlayerListRes {
  list: IPlayer[]
}
