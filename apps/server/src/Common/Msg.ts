import { IClientInput } from '../Common/State'
import { IPlayer } from './Api'

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
