import { _decorator, Component, Node, Prefab, instantiate, director } from 'cc';
import { ApiMsgEnum, IApiPlayerListRes, IApiRoomViewRes, IMsgGameStart } from '../Common';
import { ScenceEnum } from '../Enum';
import DataManager from '../Global/DataManager';
import NetworkManager from '../Global/NetworkManager';
import { PlayerManager } from '../UI/PlayerManager';
import { deepClone } from '../Utils';
const { ccclass, property } = _decorator;

@ccclass('RoomManager')
export class RoomManager extends Component {
    @property(Node)
    playerContainer: Node

    @property(Prefab)
    playerPrefab: Prefab

    async start() {
        NetworkManager.Instance.on(ApiMsgEnum.MsgRoomViewSync, this._renderPlayers, this)
        NetworkManager.Instance.on(ApiMsgEnum.MsgGamgeStart, this._handleGameStart, this)
        this.playerContainer.removeAllChildren()
        await this._getPlayers()
    }

    onDestroy() {
        NetworkManager.Instance.off(ApiMsgEnum.MsgRoomViewSync, this._renderPlayers, this)
        NetworkManager.Instance.off(ApiMsgEnum.MsgGamgeStart, this._handleGameStart, this)
    }

    async _getPlayers() {
        const { id: rid } = DataManager.Instance.roomInfo
        const { success, res, err } = await NetworkManager.Instance.callApi(ApiMsgEnum.ApiRoomView, { rid })
        if (!success) {
            console.error(err)
            return
        }
        this._renderPlayers(res)
    }

    private _renderPlayers({ room }: IApiRoomViewRes) {
        const list = room.players
        for (const player of this.playerContainer.children) {
            player.active = false
        }
        while (this.playerContainer.children.length < list.length) {
            const player = instantiate(this.playerPrefab)
            player.setParent(this.playerContainer)
        }
        for (let i = 0; i < list.length; i++) {
            const player = this.playerContainer.children[i]
            player.getComponent(PlayerManager).init(list[i])
            player.active = true
        }
    }

    async _handleGameStart({ state }: IMsgGameStart) {
        DataManager.Instance.state = state
        DataManager.Instance.lastState = deepClone(state)
        director.loadScene(ScenceEnum.Battle)
    }

    async handleLeve() {
        const { id } = DataManager.Instance.roomInfo
        await NetworkManager.Instance.callApi(ApiMsgEnum.ApiRoomLeave, { rid: id })
        DataManager.Instance.roomInfo = null
        director.loadScene(ScenceEnum.Hall)
    }

    async handleStart() {
        const { players } = DataManager.Instance.roomInfo
        if (players.length < 2) return
        await NetworkManager.Instance.callApi(ApiMsgEnum.ApiGameStart, {})
    }
}
