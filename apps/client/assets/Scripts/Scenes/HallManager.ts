import { _decorator, Component, Node, Prefab, instantiate, Label } from 'cc';
import { ApiMsgEnum, IApiPlayerListRes } from '../Common';
import NetworkManager from '../Global/NetworkManager';
import { PlayerManager } from '../UI/PlayerManager';
const { ccclass, property } = _decorator;

@ccclass('HallManager')
export class HallManager extends Component {

    @property(Node)
    playerContainer: Node

    @property(Prefab)
    playerPrefab: Prefab

    async start() {
        NetworkManager.Instance.on(ApiMsgEnum.MsgPlayerSync, this._renderPlayers, this)
        this.playerContainer.removeAllChildren()
        await this._getPlayers()
    }

    onDestroy() {
        NetworkManager.Instance.off(ApiMsgEnum.MsgPlayerSync, this._renderPlayers, this)
    }

    async _getPlayers() {
        const { success, res, err } = await NetworkManager.Instance.apiCall(ApiMsgEnum.ApiPlayerList, {})
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
}
