import { Component } from './component';
import {diffNode} from '../reactDom/diff';
export function createComponent(component, props) {
    let inst;
    //如果是类定义组件component是function，直接返回实例。
    if (component.prototype && component.prototype.render) {
        inst = new component(props);//实例化
    } else {//如果是函数组件
        inst = new Component(props);
        inst.constructor = component; //把函数组件储存下，方便统一render调用
        inst.render = function () {
            this.constructor(props);//调用函数
        }
    }
    return inst;//返回组件实例
}

export function setComponentProps(component, props) {//设置属性，并执行部分生命周期
    if (!component.base) {//首次加载
        if (component.componentWillMount) component.componentWillMount();//执行将要装载生命周期
    } else if (component.base && component.componentWillReceiveProps) {//props变化
        component.componentWillReceiveProps(props);
    }

    component.props = props;//props变化了,重新赋值
    renderComponent(component);//生成真实dom  
}

export function renderComponent(component) {
    console.log('renderComponent');
    let base;
    //调用render方法，返回jsx,通过createElement返回虚拟dom对象 这里会用到state 此时的state已经通过上面的setState时队列合并 更新了
    const renderer = component.render();
    if (component.base && component.shouldComponentUpdate) {//优化用得生命周期，根据返回值确定是否继续要渲染
        let result = true;
        result = component.shouldComponentUpdate({}, component.newState);//props得处理有点问题，后续要改进下
        if (!result) {
            return;
        }
    }

    if (component.base && component.componentWillUpdate) {//组件即将更新得时候触发生命周期函数,首次加载不触发
        component.componentWillUpdate();
    }

    //根据diff算法，得到真实dom对象
    base = diffNode(component.base, renderer);

    if (component.base) {
        if (component.componentDidUpdate) component.componentDidUpdate();//更新完毕生命周期,首次不加载
    } else {
        component.base = base;//base是真实DOM，将本次得真实DOM挂载到组件上，方便判断是否首次挂载。
        base._component = component;//互相引用，方便后续队列处理
        component.componentDidMount && component.componentDidMount();//首次挂载完后，真实dom生成后得生命周期
        return;
    }

    //不是首次加载，挂载真实的dom对象到对应的 组件上 方便后期对比
    component.base = base;

    //不是首次加载，挂载对应到组件到真实dom上 方便后期对比～
    base._component = component;
}