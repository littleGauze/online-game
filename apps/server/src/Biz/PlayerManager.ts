import Singleton from "../Base/Singleton";
import { IApiPlayerJoinReq, IPlayer } from "../Common";
import { Connection } from "../Core";
import { Player } from "./Player";
import { ApiMsgEnum } from "../Common/Enum";
import { RoomManager } from "./RoomManager";

export class PlayerManager extends Singleton {
  static get Instance() {
    return super.GetInstance<PlayerManager>()
  }

  private _players: Set<Player> = new Set()
  private _idPlayerMap: Map<number, Player> = new Map()

  nextPlayerId = 1

  get players() {
    return this._players
  }

  getPlayerById(id: number) {
    return this._idPlayerMap.get(id)
  }

  createPlayer({ nickname, conn }: IApiPlayerJoinReq & { conn: Connection }) {
    const player = new Player({ id: this.nextPlayerId++, nickname, conn })
    this._players.add(player)
    this._idPlayerMap.set(player.id, player)
    return player
  }

  removePlayer(pid: number) {
    const player = this._idPlayerMap.get(pid)
    if (player && player.rid) {
      const room = RoomManager.Instance.getRoomById(player.rid)
      room.leave(player.id)
      room.sync()
    }

    if (player) {
      this._players.delete(player)
      this._idPlayerMap.delete(pid)
    }
  }

  getPlayerView({ id, nickname, rid }: Player) {
    return { id, nickname, rid }
  }

  getPlayersView(players: Set<IPlayer> = this._players) {
    return Array.from(players).map(this.getPlayerView)
  }

  playerSync() {
    for (const player of this._players) {
      player.conn.sendMsg(ApiMsgEnum.MsgPlayerSync, {
        list: this.getPlayersView()
      })
    }
  }
}