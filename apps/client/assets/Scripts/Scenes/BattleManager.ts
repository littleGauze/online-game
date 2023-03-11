import { _decorator, Component, Node, Prefab, instantiate, SpriteFrame, UITransform, view } from 'cc';
import { ApiMsgEnum, EntityTypeEnum, IClientInput, IMsgClientSync, IMsgServerSync, InputTypeEnum } from '../Common';
import { ActorManager } from '../Entity/Actor/ActorManager';
import { BulletManager } from '../Entity/Bullet/BulletManager';
import { EventEnum, PrefabPathEnum, TexturePathEnum } from '../Enum';
import DataManager from '../Global/DataManager';
import EventManager from '../Global/EventManager';
import NetworkManager from '../Global/NetworkManager';
import { ObjectPoolManager } from '../Global/ObjectPoolManager';
import { ResourceManager } from '../Global/ResourceManager';
import { JoyStick } from '../UI/JoyStickManager';
import { ResultManager } from '../UI/ResultManager';
import { deepClone } from '../Utils';
const { ccclass, property } = _decorator;

@ccclass('BattleManager')
export class BattleManager extends Component {
    private _stage: Node = null
    private _ui: Node = null
    private _shouldUpdate = false

    @property(Node)
    result: Node = null

    private pendingMsg: IMsgClientSync[] = []

    private get _data() {
        return DataManager.Instance
    }

    onLoad() {
        // const { width, height } = view.getVisibleSize()
        // this._data.width = width
        // this._data.height = height
        // view.on('canvas-resize', () => {
        //     const { width, height } = view.getVisibleSize()
        //     this._data.width = width
        //     this._data.height = height
        // })
    }

    async start() {
        this._clearGame()
        await Promise.all([this._connectServer(), this._loadRes()])
        this._initGame()
    }

    private _initGame() {
        this._ui = this.node.getChildByName('UI')
        this._data.jm = this._ui.getComponentInChildren(JoyStick)
        this._loadMap()
        this._shouldUpdate = true

        EventManager.Instance.on(EventEnum.ShowResult, this.handleShowResult, this)
        EventManager.Instance.on(EventEnum.ClientSync, this._handleClientSync, this)
        NetworkManager.Instance.on(ApiMsgEnum.MsgServerSync, this._handleServerSync, this)
    }

    private _clearGame() {
        EventManager.Instance.off(EventEnum.ShowResult, this.handleShowResult, this)
        EventManager.Instance.off(EventEnum.ClientSync, this._handleClientSync, this)
        NetworkManager.Instance.off(ApiMsgEnum.MsgServerSync, this._handleServerSync, this)
        DataManager.Instance.stage = this._stage = this.node.getChildByName('Stage')
        this._stage.destroyAllChildren()
    }

    handleShowResult(isSuccess: boolean) {
        this.result.active = true
        this.result.getComponent(ResultManager).text.string = isSuccess ? '<color=#ffffff>You Win</color>' : '<color=#ffffff>You Lose</color>'
    }

    private async _connectServer() {
        if (!await NetworkManager.Instance.connect().catch(() => false)) {
            await new Promise(rs => setTimeout(rs, 1000))
            await this._connectServer()
        }
    }

    update(dt: number) {
        if (!this._shouldUpdate) return
        this._render()
        this._tick(dt)
    }

    private _tick(dt: number) {
        this._actorTick(dt);

        // EventManager.Instance.emit(EventEnum.ClientSync, {
        //     type: InputTypeEnum.TimePast,
        //     dt
        // })
    }

    private _actorTick(dt: number) {
        for (const d of this._data.state.actors) {
            let am = this._data.actorMap.get(d.id)
            am.tick(dt)
        }
    }

    private async _loadMap() {
        const prefab = this._data.prefabMap.get(EntityTypeEnum.Map)
        const map = instantiate(prefab)
        map.setParent(this._stage)
    }

    private async _loadRes() {
        const list = []
        for (const type in PrefabPathEnum) {
            const p = ResourceManager.Instance.loadRes(PrefabPathEnum[type], Prefab).then(prefab => {
                this._data.prefabMap.set(type, prefab)
            })
            list.push(p)
        }
        for (const type in TexturePathEnum) {
            const p = ResourceManager.Instance.loadDir(TexturePathEnum[type], SpriteFrame).then(frames => {
                this._data.textureMap.set(type, frames)
            })
            list.push(p)
        }
        await Promise.all(list)
    }

    private _render() {
        this._renderActor()
        this._renderBullet()
    }

    private _renderActor() {
        for (const d of this._data.state.actors) {
            let am = this._data.actorMap.get(d.id)
            if (!am) {
                const prefab = this._data.prefabMap.get(d.type)
                const actor = instantiate(prefab)
                actor.setParent(this._stage)
                am = actor.addComponent(ActorManager)
                this._data.actorMap.set(d.id, am)
                am.init(d)
            } else {
                am.render(d)
            }
        }
    }

    private _renderBullet() {
        for (const d of this._data.state.bullets) {
            let bm = this._data.bulletMap.get(d.id)
            if (!bm) {
                const bullet = ObjectPoolManager.Instance.get(d.type)
                bm = bullet.getComponent(BulletManager) || bullet.addComponent(BulletManager)
                this._data.bulletMap.set(d.id, bm)
                bm.init(d)
            } else {
                bm.render(d)
            }
        }
    }

    private _handleClientSync(input: IClientInput) {
        const data = {
            frameId: DataManager.Instance.frameId++,
            input,
        }
        NetworkManager.Instance.sendMsg(ApiMsgEnum.MsgClientSync, data)

        // predict input
        if (input.type === InputTypeEnum.ActorMove) {
            DataManager.Instance.applyInput(input)
            this.pendingMsg.push(data)
        }
    }

    private _handleServerSync({ inputs, lastFrameId }: IMsgServerSync) {
        // rollback to last server state
        DataManager.Instance.state = DataManager.Instance.lastState
        for (const input of inputs) {
            DataManager.Instance.applyInput(input)
        }

        // record last server state
        DataManager.Instance.lastState = deepClone(DataManager.Instance.state)

        // apply predict input
        const predictMsgs = this.pendingMsg.filter(input => input.frameId > lastFrameId)
        for (const msg of predictMsgs) {
            DataManager.Instance.applyInput(msg.input)
        }

    }
}

