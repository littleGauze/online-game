import Singleton from "../Base/Singleton";
import { IApiPlayerJoinReq, IPlayer, IRoom } from "../Common";
import { Connection } from "../Core";
import { Room } from "./Room";
import { ApiMsgEnum } from "../Common/Enum";
import { PlayerManager } from "./PlayerManager";
import { Player } from "./Player";

export class RoomManager extends Singleton {
  static get Instance() {
    return super.GetInstance<RoomManager>()
  }

  private _rooms: Set<Room> = new Set()
  private _idRoomMap: Map<number, Room> = new Map()

  nextRoomId = 1

  getRoomById(id: number) {
    return this._idRoomMap.get(id)
  }

  createRoom() {
    const room = new Room(this.nextRoomId++)
    this._rooms.add(room)
    this._idRoomMap.set(room.id, room)
    return room
  }

  removeRoom(rid: number) {
    const room = this._idRoomMap.get(rid)
    if (room) {
      this._rooms.delete(room)
      this._idRoomMap.delete(rid)
    }
  }

  getRoomByPlayerId(player: Player) {
    for (const room of this._rooms) {
      if (room.players.has(player)) return room
    }
  }

  getRoomView({ id, status, players }: Room) {
    return { id, status, players: PlayerManager.Instance.getPlayersView(players) }
  }

  getRoomsView(rooms: Set<Room> = this._rooms) {
    return Array.from(rooms).map(this.getRoomView)
  }

  roomSync() {
    for (const player of PlayerManager.Instance.players) {
      player.conn.sendMsg(ApiMsgEnum.MsgRoomSync, {
        list: this.getRoomsView()
      })
    }
  }
}