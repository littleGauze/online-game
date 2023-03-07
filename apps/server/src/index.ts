import { WebSocketServer } from "ws";
import { PlayerManager } from "./Biz/PlayerManager";
import { RoomManager } from "./Biz/RoomManager";
import { ApiMsgEnum, IApiGameStartReq, IApiGameStartRes, IApiPlayerJoinReq, IApiPlayerJoinRes, IApiPlayerListReq, IApiPlayerListRes, IApiRoomCreateReq, IApiRoomCreateRes, IApiRoomJoinReq, IApiRoomJoinRes, IApiRoomLeaveReq, IApiRoomLeaveRes, IApiRoomListReq, IApiRoomListRes, IApiRoomViewReq, IApiRoomViewRes } from "./Common";
import { Connection, MySever } from "./Core";
import { symlinkCommon } from "./Utils";

symlinkCommon();

declare module './Core' {
  interface Connection {
    playerId: number
  }
}

const port = 9876

const server = new MySever(port)
server.start()

server.on('connected', (conn: Connection) => {
  console.log('connection size ', server.connectionSize)
})

server.on('disconnected', (conn: Connection) => {
  if (conn.playerId) {
    PlayerManager.Instance.removePlayer(conn.playerId)
    PlayerManager.Instance.playerSync()
    console.log('connection size ', server.connectionSize)
  }
})

// set api
server.setApi(ApiMsgEnum.ApiPlayerJoin, (conn: Connection, data: IApiPlayerJoinReq): IApiPlayerJoinRes => {
  const { nickname } = data
  const player = PlayerManager.Instance.createPlayer({ nickname, conn })
  conn.playerId = player.id
  PlayerManager.Instance.playerSync()
  return { player: PlayerManager.Instance.getPlayerView(player) }
})

server.setApi(ApiMsgEnum.ApiPlayerList, (conn: Connection, data: IApiPlayerListReq): IApiPlayerListRes => {
  const list = PlayerManager.Instance.getPlayersView()
  return { list }
})

server.setApi(ApiMsgEnum.ApiRoomCreate, (conn: Connection, data: IApiRoomCreateReq): IApiRoomCreateRes => {
  const room = RoomManager.Instance.createRoom()
  if (!conn.playerId) throw new Error('未登录')
  room.join(conn.playerId)
  RoomManager.Instance.roomSync()
  return { room: RoomManager.Instance.getRoomView(room) }
})

server.setApi(ApiMsgEnum.ApiRoomList, (conn: Connection, data: IApiRoomListReq): IApiRoomListRes => {
  const list = RoomManager.Instance.getRoomsView()
  return { list }
})

server.setApi(ApiMsgEnum.ApiRoomView, (conn: Connection, data: IApiRoomViewReq): IApiRoomViewRes => {
  const room = RoomManager.Instance.getRoomById(data.rid)
  return { room: RoomManager.Instance.getRoomView(room) }
})

server.setApi(ApiMsgEnum.ApiRoomJoin, (conn: Connection, data: IApiRoomJoinReq): IApiRoomJoinRes => {
  const { rid } = data
  const room = RoomManager.Instance.getRoomById(rid)
  room.join(conn.playerId)
  room.sync()
  return { room: RoomManager.Instance.getRoomView(room) }
})

server.setApi(ApiMsgEnum.ApiRoomLeave, (conn: Connection, data: IApiRoomLeaveReq): IApiRoomLeaveRes => {
  const { rid } = data
  const room = RoomManager.Instance.getRoomById(rid)
  room.leave(conn.playerId)
  room.sync()
  return { room: RoomManager.Instance.getRoomView(room) }
})

server.setApi(ApiMsgEnum.ApiGameStart, (conn: Connection, data: IApiGameStartReq): IApiGameStartRes => {
  if (conn.playerId) {
    const player = PlayerManager.Instance.getPlayerById(conn.playerId)
    if (player.rid) {
      const room = RoomManager.Instance.getRoomById(player.rid)
      room.gameStart()
    }
  }
  return {}
})

// wss.on('connection', socket => {
//   socket.on('message', buffer => {
//     const str = buffer.toString()
//     try {
//       const msg = JSON.parse(str)
//       const { name, data } = msg
//       const { frameId, input } = data
//       inputs.push(input)
//     } catch (err) {
//       console.log(err)
//     }
//   })

//   setInterval(() => {
//     const temp = inputs.slice()
//     inputs.length = 0
//     const data = {
//       name: ApiMsgEnum.MsgServerSync,
//       data: {
//         inputs: temp
//       }
//     }
//     socket.send(JSON.stringify(data))
//   }, 100)
// })
