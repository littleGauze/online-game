import { _decorator, Component, Node, director, Scheduler, RichText } from 'cc';
import { ApiMsgEnum } from '../Common';
import { EventEnum, ScenceEnum } from '../Enum';
import DataManager from '../Global/DataManager';
import EventManager from '../Global/EventManager';
import NetworkManager from '../Global/NetworkManager';
const { ccclass, property } = _decorator;

@ccclass('ResultManager')
export class ResultManager extends Component {
    @property(RichText)
    text: RichText = null

    async handleBackToHall() {
        const { id } = DataManager.Instance.roomInfo
        await NetworkManager.Instance.callApi(ApiMsgEnum.ApiRoomLeave, { rid: id })
        DataManager.Instance.roomInfo = null
        director.loadScene(ScenceEnum.Hall)
        this.node.active = false
    }
}

