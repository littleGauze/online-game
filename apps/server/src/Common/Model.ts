import { ApiMsgEnum } from '../Common/Enum'
import { IApiGameStartReq, IApiGameStartRes, IApiPlayerJoinReq, IApiPlayerJoinRes, IApiPlayerListReq, IApiPlayerListRes, IApiRoomCreateReq, IApiRoomCreateRes, IApiRoomJoinReq, IApiRoomJoinRes, IApiRoomLeaveReq, IApiRoomLeaveRes, IApiRoomListReq, IApiRoomListRes, IApiRoomViewReq, IApiRoomViewRes } from './Api'
import { IMsgClientSync, IMsgGameStart, IMsgPlayerSync, IMsgRoomSync, IMsgRoomViewSync, IMsgServerSync } from './Msg'

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
    [ApiMsgEnum.ApiRoomCreate]: {
      req: IApiRoomCreateReq
      res: IApiRoomCreateRes
    }
    [ApiMsgEnum.ApiRoomList]: {
      req: IApiRoomListReq
      res: IApiRoomListRes
    },
    [ApiMsgEnum.ApiRoomJoin]: {
      req: IApiRoomJoinReq
      res: IApiRoomJoinRes
    },
    [ApiMsgEnum.ApiRoomView]: {
      req: IApiRoomViewReq
      res: IApiRoomViewRes
    },
    [ApiMsgEnum.ApiRoomLeave]: {
      req: IApiRoomLeaveReq
      res: IApiRoomLeaveRes
    },
    [ApiMsgEnum.ApiGameStart]: {
      req: IApiGameStartReq
      res: IApiGameStartRes
    },
  }
  msg: {
    [ApiMsgEnum.MsgClientSync]: IMsgClientSync
    [ApiMsgEnum.MsgServerSync]: IMsgServerSync
    [ApiMsgEnum.MsgPlayerSync]: IMsgPlayerSync
    [ApiMsgEnum.MsgRoomSync]: IMsgRoomSync
    [ApiMsgEnum.MsgRoomViewSync]: IMsgRoomViewSync
    [ApiMsgEnum.MsgGamgeStart]: IMsgGameStart
  }
}