import { RoomStatusEnum } from "./Enum"

export interface IPlayer {
  id: number
  rid: number
  nickname: string
}

export interface IRoom {
  id: number
  status: RoomStatusEnum
  players: IPlayer[]
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

export interface IApiRoomCreateReq {}
export interface IApiRoomCreateRes {
  room: IRoom
}

export interface IApiRoomListReq {}
export interface IApiRoomListRes {
  list: IRoom[]
}

export interface IApiRoomJoinReq {
  rid: number
}
export interface IApiRoomJoinRes {
  room: IRoom
}

export interface IApiRoomViewReq {
  rid: number
}
export interface IApiRoomViewRes {
  room: IRoom
}

export interface IApiRoomLeaveReq {
  rid: number
}
export interface IApiRoomLeaveRes {}

export interface IApiGameStartReq {}
export interface IApiGameStartRes {}
