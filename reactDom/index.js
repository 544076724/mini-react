import handleAttrs from './handleAttrs';
import {createComponent,setComponentProps} from '../components/utills';
const ReactDom = {};
//传入虚拟dom节点和真实包裹节点，把虚拟dom节点通过_render方法转换成真实dom节点，然后插入到包裹节点中，这个就是react的初次渲染
const render = function (vnode, container) {
    return container.appendChild(_render(vnode));
};
ReactDom.render = render;
export function _render(vnode) {
    console.log('reactDom render', vnode);
    
    if (vnode === undefined || vnode === null || typeof vnode === 'boolean') {//做个防错
        vnode = '';
    }
    if (typeof vnode === 'number') {
        vnode = String(vnode);
    }
    if (typeof vnode === 'string') {//如果是最里面一层或者就是个字符串的话，转化成Node类型，遵从appendChild要求
        let textNode = document.createTextNode(vnode);
        return textNode;
    }
    if (typeof vnode.tag === 'function') {//是一个组件<app></app>这种  babel会给我们做转换 vnode.tag得类型
        //hooks
        const component = createComponent(vnode.tag, vnode.attrs);//组件类型的话，创建组件
        setComponentProps(component, vnode.attrs);//设置组件属性，并且转换为真实dom，component.base里存着真实dom
        
        return component.base;
    }
    // vnode= {tag,props,children}
    // {tag:"li",attrs:{xxx:},children:1}   这几种情况都排除之后，那就是html元素了
    const dom = document.createElement(vnode.tag);
    if (vnode.attrs) {//但是有可能传入的是个div标签，而且它有属性。那么需要处理属性，由于这个处理属性的函数需要大量复用，我们单独定义成一个函数：   
        Object.keys(vnode.attrs).forEach(key => {
            const value = vnode.attrs[key];
            handleAttrs(dom, key, value);//如果有属性，例如style标签、onClick事件等，都会通过这个函数，挂在到dom上
        });
    }
    vnode.children && vnode.children.forEach(child => render(child, dom)); // 有子集的话，递归渲染子节点
    return dom;
}

export default ReactDom;