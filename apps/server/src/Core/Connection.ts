import { EventEmitter } from "stream";
import { WebSocket } from "ws";
import { ApiMsgEnum, IModel, strdecode, binaryEncode, binaryDecode } from "../Common";
import { buffer2arrayBuffer } from "../Utils";
import { MySever } from "./MyServer";

interface IItem {
  cb: Function;
  ctx: unknown;
}

export class Connection extends EventEmitter {
  private _msgMap: Map<ApiMsgEnum, IItem[]> = new Map()

  constructor(private _server: MySever, private _ws: WebSocket) {
    super()
    _ws.on('close', () => this.emit('close'))
    _ws.on('message', (buffer: Buffer) => {
      try {
        const msg = binaryDecode(buffer2arrayBuffer(buffer))
        const { name, data } = msg

        if (this._server.apiMap.has(name)) {
          try {
            const cb = this._server.apiMap.get(name)
            const res = cb.call(null, this, data)
            this.sendMsg(name, { success: true, res })
          } catch (err) {
            this.sendMsg(name, { success: false, err })
          }
        }

        if (this._msgMap.has(name)) {
          try {
            const cbs = this._msgMap.get(name)
            cbs.forEach((it: IItem) => {
              it.cb.call(it.ctx, this, data)
            })
          } catch (err) {
            console.error(err)
          }
        }

      } catch (err) {
        console.error(err)
      }
    })
  }

  sendMsg<T extends keyof IModel['msg']>(name: T, data: IModel['msg'][T]) {
    const ab = binaryEncode(name, data)
    const buffer = Buffer.from(ab.buffer)
    this._ws.send(buffer)
  }

  listenMsg<T extends keyof IModel['msg']>(name: T, cb: (conn: Connection, args: IModel['msg'][T]) => void, ctx: unknown) {
    if (this._msgMap.has(name)) {
      this._msgMap.get(name).push({ cb, ctx });
    } else {
      this._msgMap.set(name, [{ cb, ctx }]);
    }
  }

  unListenMsg<T extends keyof IModel['msg']>(name: T, cb: (conn: Connection, args: IModel['msg'][T]) => void, ctx: unknown) {
    if (this._msgMap.has(name)) {
      const index = this._msgMap.get(name).findIndex((i) => cb === i.cb && i.ctx === ctx);
      index > -1 && this._msgMap.get(name).splice(index, 1);
    }
  }

}