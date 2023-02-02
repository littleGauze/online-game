import { ApiMsgEnum } from '../Common/Enum'
import { IApiPlayerJoinReq, IApiPlayerJoinRes, IApiPlayerListReq, IApiPlayerListRes } from './Api'
import { IMsgClientSync, IMsgPlayerSync, IMsgServerSync } from './Msg'

export interface IModel {
  api: {
    [ApiMsgEnum.ApiPlayerJoin]: {
      req: IApiPlayerJoinReq
      res: IApiPlayerJoinRes
    }
    [ApiMsgEnum.ApiPlayerList]: {
      req: IApiPlayerListReq
      res: IApiPlayerListRes
    }
  }
  msg: {
    [ApiMsgEnum.MsgClientSync]: IMsgClientSync
    [ApiMsgEnum.MsgServerSync]: IMsgServerSync
    [ApiMsgEnum.MsgPlayerSync]: IMsgPlayerSync
  }
}