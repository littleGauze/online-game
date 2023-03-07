import { ApiMsgEnum, EntityTypeEnum, IClientInput, IMsgClientSync, InputTypeEnum, IState, toFixed } from "../Common"
import { Connection } from "../Core"
import { Player } from "./Player"
import { PlayerManager } from "./PlayerManager"
import { RoomManager } from "./RoomManager"

export class Room {
  id: number
  players: Set<Player> = new Set()
  playerInputs: IClientInput[] = []
  lastTimer: number
  lastPlayerFrameIdMap: Map<number, number> = new Map()

  constructor(id: number) {
    this.id = id
  }

  join(playerId: number) {
    const player = PlayerManager.Instance.getPlayerById(playerId)
    if (player) {
      player.rid = this.id
      this.players.add(player)
    }
  }

  leave(playerId: number) {
    const player = PlayerManager.Instance.getPlayerById(playerId)
    if (player) {
      this.players.delete(player)
    }
  }

  sync() {
    for (const player of this.players) {
      player.conn.sendMsg(ApiMsgEnum.MsgRoomViewSync, { room: RoomManager.Instance.getRoomView(this) })
    }
    if (!this.players.size) {
      this.close()
      RoomManager.Instance.roomSync()
    }
  }

  close() {
    this.players.clear()
    RoomManager.Instance.removeRoom(this.id)
  }

  gameStart() {
    const state = {
      nextBulletId: 1,
      bullets: [],
      actors: [...this.players].map((player, idx) => ({
        id: player.id,
        hp: 100,
        type: EntityTypeEnum.Actor1,
        weaponType: EntityTypeEnum.Weapon1,
        bulletType: EntityTypeEnum.Bullet2,
        position: { x: -150 + 300 * idx, y: -150 + 300 * idx },
        direction: { x: 0, y: 0 }
      }))
    }

    for (const player of this.players) {
      player.conn.sendMsg(ApiMsgEnum.MsgGamgeStart, { state })
      player.conn.listenMsg(ApiMsgEnum.MsgClientSync, this.handleClientInput, this)
    }

    const timer1 = setInterval(() => {
      this.sendServerMsg()
    }, 100)
  
    const timer2 = setInterval(() => {
      this.timePast()
    }, 16)
  }

  timePast() {
    const now = process.uptime()
    const dt = now - (this.lastTimer ?? now)
    this.playerInputs.push({
      dt: toFixed(dt),
      type: InputTypeEnum.TimePast
    })
    this.lastTimer = now
  }

  sendServerMsg() {
    const inputs = this.playerInputs
    this.playerInputs = []
    for (const player of this.players) {
      player.conn.sendMsg(ApiMsgEnum.MsgServerSync, {
        inputs,
        lastFrameId: this.lastPlayerFrameIdMap.get(player.id) ?? 0
      })
    }
  }

  handleClientInput(conn: Connection, { input, frameId }: IMsgClientSync) {
    this.playerInputs.push(input)
    this.lastPlayerFrameIdMap.set(conn.playerId, frameId)
  }
}