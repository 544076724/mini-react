import { enqueueSetState } from './setState';
import {renderComponent} from './utills';
export class Component {
    constructor(props = {}) {
        this.state = {};
        this.props = props;
    }
    setState(stateChange){
        console.log('state')
       
        enqueueSetState(stateChange, this);//异步合并state，并更新组件得方法
        // renderComponent(this)
    }
}