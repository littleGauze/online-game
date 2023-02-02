import { _decorator, Component, Node, Label } from 'cc';
import { IPlayer } from '../Common';
const { ccclass, property } = _decorator;

@ccclass('PlayerManager')
export class PlayerManager extends Component {
  init({ id, nickname, rid }: IPlayer) {
    const label = this.getComponent(Label)
    label.string = nickname
  }
}

