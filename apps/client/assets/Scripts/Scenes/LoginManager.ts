import { _decorator, Component, Node, EditBox, director } from 'cc';
import { ApiMsgEnum } from '../Common';
import { ScenceEnum } from '../Enum';
import DataManager from '../Global/DataManager';
import NetworkManager from '../Global/NetworkManager';
const { ccclass, property } = _decorator;

@ccclass('LoginManager')
export class LoginManager extends Component {
    editBox: EditBox

    onLoad() {
        this.editBox = this.node.getComponentInChildren(EditBox)
        director.preloadScene(ScenceEnum.Hall)
    }

    async start() {
        await NetworkManager.Instance.connect()
    }

    async handleLogin() {
        if (!NetworkManager.Instance.isConnected) {
            await NetworkManager.Instance.connect()
            console.warn('Need connect')
            return
        }
        const nickname = this.editBox.string
        if (!nickname)  {
            console.warn('Need nickname!')
            return
        }

        const { success, res, err } = await NetworkManager.Instance.callApi(ApiMsgEnum.ApiPlayerJoin, { nickname })
        if (!success) {
            console.error(err)
            return
        }
        const { id } = res.player
        DataManager.Instance.myPlayerId = id

        console.log("res ", res)
        
        director.loadScene(ScenceEnum.Hall)
    }
}

