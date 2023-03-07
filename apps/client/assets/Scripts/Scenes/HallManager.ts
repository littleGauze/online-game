import { _decorator, Component, Node, Prefab, instantiate, Label, director } from 'cc';
import { ApiMsgEnum, IApiPlayerListRes, IApiRoomListRes } from '../Common';
import { ScenceEnum } from '../Enum';
import DataManager from '../Global/DataManager';
import NetworkManager from '../Global/NetworkManager';
import { PlayerManager } from '../UI/PlayerManager';
import { RoomManager } from '../UI/RoomManager';
const { ccclass, property } = _decorator;

@ccclass('HallManager')
export class HallManager extends Component {

    @property(Node)
    playerContainer: Node

    @property(Prefab)
    playerPrefab: Prefab

    @property(Node)
    roomContainer: Node

    @property(Prefab)
    roomPrefab: Prefab

    async start() {
        NetworkManager.Instance.on(ApiMsgEnum.MsgPlayerSync, this._renderPlayers, this)
        this.playerContainer.removeAllChildren()
        await this._getPlayers()

        NetworkManager.Instance.on(ApiMsgEnum.MsgRoomSync, this._renderRooms, this)
        this.roomContainer.removeAllChildren()
        await this._getRooms()
    }

    onDestroy() {
        NetworkManager.Instance.off(ApiMsgEnum.MsgPlayerSync, this._renderPlayers, this)
        NetworkManager.Instance.off(ApiMsgEnum.MsgRoomSync, this._renderRooms, this)
    }

    async _getPlayers() {
        const { success, res, err } = await NetworkManager.Instance.callApi(ApiMsgEnum.ApiPlayerList, {})
        if (!success) {
            console.error(err)
            return
        }
        this._renderPlayers(res)
    }

    private _renderPlayers({ list }: IApiPlayerListRes) {
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

    async _getRooms() {
        const { success, res, err } = await NetworkManager.Instance.callApi(ApiMsgEnum.ApiRoomList, {})
        if (!success) {
            console.error(err)
            return
        }
        this._renderRooms(res)
    }

    private _renderRooms({ list }: IApiRoomListRes) {
        for (const room of this.roomContainer.children) {
            room.active = false
        }
        while (this.roomContainer.children.length < list.length) {
            const room = instantiate(this.roomPrefab)
            room.setParent(this.roomContainer)
        }
        for (let i = 0; i < list.length; i++) {
            const room = this.roomContainer.children[i]
            room.getComponent(RoomManager).init(list[i])
            room.active = true
        }
    }
    async handleCreateRoom() {
        const { success, err, res } = await NetworkManager.Instance.callApi(ApiMsgEnum.ApiRoomCreate, {})
        if (!success) {
            return console.error(err)
        }

        DataManager.Instance.roomInfo = res.room

        director.loadScene(ScenceEnum.Room)
    }
}
