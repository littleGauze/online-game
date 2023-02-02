import { Connection } from "../Core"

export class Player {
  id: number
  nickname: string
  rid: number
  conn: Connection

  constructor({ id, conn, nickname }: Pick<Player, 'id' | 'conn' | 'nickname'>) {
    this.id = id
    this.nickname = nickname
    this.conn = conn
  }
}