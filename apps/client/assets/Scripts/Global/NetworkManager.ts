import { ApiMsgEnum, binaryDecode, binaryEncode, IModel, strdecode, strencode } from "../Common";
import { IApiRect } from "../Common/State";
import EventManager from "../Global/EventManager";

export default class NetworkManager extends EventManager {
  private static _ins: NetworkManager = null
  static get Instance() {
    if (!this._ins) {
      this._ins = new NetworkManager()
    }
    return this._ins
  }

  private _port = 9876
  private _ws: WebSocket = null

  isConnected = false

  connect() {
    return new Promise((resolve, reject) => {
      if (this.isConnected) return resolve(true)
      this._ws = new WebSocket(`ws://game.fun4l0ve.com/sync`)
      this._ws.binaryType = 'arraybuffer'
      this._ws.onopen = () => {
        resolve(true)
        this.isConnected = true
      }
      this._ws.onclose = () => {
        this.isConnected = false
        reject(false)
      }
      this._ws.onerror = e => {
        console.log(e)
        reject(false)
        this.isConnected = false
      }
      this._ws.onmessage = e => {
        try {
          const msg = binaryDecode(e.data)
          this.emit(msg.name, msg.data)
        } catch (err) {
          console.log(err)
        }
      }
    })
  }

  callApi<T extends keyof IModel['api']>(name: T, data: IModel['api'][T]['req']): Promise<IApiRect<IModel['api'][T]['res']>> {
    return new Promise(resolve => {
      try {
        const timer = setTimeout(() => {
          resolve({ success: false, err: new Error('Time out') })
        }, 5000)
        const cb = res => {
          resolve(res)
          clearTimeout(timer)
          this.off(name as any, cb, this)
        }
        this.on(name as any, cb, this)
        this.sendMsg(name as any, data)
      } catch (err) {
        resolve({ success: false, err })
      }
    })
  }

  async sendMsg<T extends keyof IModel['msg']>(name: T, data: IModel['msg'][T]) {
    // await new Promise(resolve => setTimeout(resolve, 2000))
    const ab = binaryEncode(name, data)
    this._ws.send(ab.buffer)
  }

  on<T extends keyof IModel['msg']>(name: T, cb: (args: IModel['msg'][T]) => void, ctx: unknown) {
    super.on(name, cb, ctx)
  }

  off<T extends keyof IModel['msg']>(name: T, cb: (args: IModel['msg'][T]) => void, ctx: unknown) {
    super.off(name, cb, ctx)
  }
}
