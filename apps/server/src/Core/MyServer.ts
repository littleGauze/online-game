import { EventEmitter } from "stream";
import { WebSocketServer, WebSocket } from "ws";
import { ApiMsgEnum, IModel } from "../Common";
import { Connection } from "./Connection";

export class MySever extends EventEmitter {
  private _port: number = 9876
  private _wss: WebSocketServer
  private _connections: Set<Connection> = new Set()

  apiMap: Map<ApiMsgEnum, Function> = new Map()

  get connectionSize() {
    return this._connections.size
  }

  constructor(port: number) {
    super()
    this._port = port
  }

  start() {
    const wss = this._wss = new WebSocketServer({ port: this._port })
    return new Promise((resolve, reject) => {
      wss.on('listening', () => resolve(true))
      wss.on('close', () => reject(false))
      wss.on('error', (e) => reject(e))
      wss.on('connection', (ws: WebSocket) => {
        const conn = new Connection(this, ws)
        this._connections.add(conn)
        this.emit('connected', conn)
        conn.on('close', () => {
          this._connections.delete(conn)
          this.emit('disconnected', conn)
        })
      })
    })
  }

  setApi<T extends keyof IModel['api']>(name: T, cb: (conn: Connection, args: IModel['api'][T]['req']) => void) {
    this.apiMap.set(name, cb)
  }
}