import { _decorator, Component, Node, Label, director } from 'cc';
import { ApiMsgEnum, IPlayer, IRoom, RoomStatusEnum } from '../Common';
import { ScenceEnum } from '../Enum';
import DataManager from '../Global/DataManager';
import NetworkManager from '../Global/NetworkManager';
const { ccclass, property } = _decorator;

@ccclass('RoomManager')
export class RoomManager extends Component {
  private rid: number = null
  private status: RoomStatusEnum = null
  private plyers: IPlayer[] = null

  init({ id, status, players }: IRoom) {
    const label = this.getComponent(Label)
    label.string = `Room: ${id} --- ${RoomStatusEnum[status]}`
    this.rid = id
    this.status = status
    this.plyers = players
  }

  async handleJoinRoom() {
    if (this.status === RoomStatusEnum.Gaming || this.plyers.length >= 4) return
    const ret = await NetworkManager.Instance.callApi(ApiMsgEnum.ApiRoomJoin, { rid: this.rid })
    DataManager.Instance.roomInfo = ret.res?.room
    director.loadScene(ScenceEnum.Room)
  }
}

