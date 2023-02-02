import { _decorator, Node, instantiate } from "cc";
import Singleton from "../Base/Singleton";
import { EntityTypeEnum } from "../Common";
import DataManager from "./DataManager";

export class ObjectPoolManager extends Singleton {
  static get Instance() {
    return super.GetInstance<ObjectPoolManager>();
  }

  private _objectPool: Node = null
  private _map: Map<EntityTypeEnum, Node[]> = new Map()

  get(type: EntityTypeEnum) {
    if (!this._objectPool) {
      this._objectPool = new Node('ObjectPool')
      this._objectPool.setParent(DataManager.Instance.stage)
    }

    if (!this._map.has(type)) {
      this._map.set(type, [])
      const container = new Node(type + 'Pool')
      container.setParent(this._objectPool)
    }

    const nodes = this._map.get(type)
    if (nodes.length) {
      const node = nodes.pop()
      node.active = true
      return node
    }

    const prefab = DataManager.Instance.prefabMap.get(type)
    const object = instantiate(prefab)
    object.name = type
    nodes.push(object)
    object.setParent(this._objectPool.getChildByName(type + 'Pool'))
    object.active = true
    return object
  }

  ret(object: Node) {
    object.active = false
    this._map.get(object.name as EntityTypeEnum).push(object)
  }
}
