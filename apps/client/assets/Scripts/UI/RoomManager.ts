import { _decorator, Component, Node, Label, director } from 'cc';
import { ApiMsgEnum, IPlayer, IRoom } from '../Common';
import { ScenceEnum } from '../Enum';
import DataManager from '../Global/DataManager';
import NetworkManager from '../Global/NetworkManager';
const { ccclass, property } = _decorator;

@ccclass('RoomManager')
export class RoomManager extends Component {
  private rid: number = null

  init({ id }: IRoom) {
    const label = this.getComponent(Label)
    label.string = `Room: ${id}`
    this.rid = id
  }

  async handleJoinRoom() {
    const ret = await NetworkManager.Instance.callApi(ApiMsgEnum.ApiRoomJoin, { rid: this.rid })
    DataManager.Instance.roomInfo = ret.res?.room
    director.loadScene(ScenceEnum.Room)
  }
}

