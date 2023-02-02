import { WebSocketServer } from "ws";
import { PlayerManager } from "./Biz/PlayerManager";
import { ApiMsgEnum, IApiPlayerJoinReq, IApiPlayerJoinRes, IApiPlayerListReq, IApiPlayerListRes } from "./Common";
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
