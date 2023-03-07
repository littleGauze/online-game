import { IClientInput, IState } from '../Common/State'
import { IPlayer, IRoom } from './Api'

export interface IMsgClientSync {
  frameId: number
  input: IClientInput
}

export interface IMsgServerSync {
  lastFrameId: number,
  inputs: IClientInput[]
}

export interface IMsgPlayerSync {
  list: IPlayer[]
}

export interface IMsgRoomSync {
  list: IRoom[]
}

export interface IMsgRoomViewSync {
  room: IRoom
}

export interface IMsgSync {
  room: IRoom
}

export interface IMsgGameStart {
  state: IState
}
