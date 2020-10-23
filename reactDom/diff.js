

import handleAttrs from '../reactDom/handleAttrs';
import {setComponentProps,createComponent} from '../components/utills';
/**
 * @param {HTMLElement} dom 真实DOM
 * @param {vnode} vnode 虚拟DOM
 * @param {HTMLElement} container 容器
 * @returns {HTMLElement} 更新后的DOM
 */
export function diffNode(dom, vnode) {//当前得dom 真实DOM，当前得vnode 虚拟DOM
    let out = dom;
    if (vnode === undefined || vnode === null || typeof vnode === 'boolean') {
        vnode = '';
    }
    if (typeof vnode === 'number') {
        vnode = String(vnode);
    }

    if (typeof vnode === 'string') {//diff  text node  文本节点
        if (dom && dom.nodeType === 3) {//当前dom就是文本节点
            if (dom.textContent !== vnode) {//如果内容和虚拟dom不一样，更改
                dom.textContent = vnode;
            }
        } else {//如果当前dom不是文本节点，创建一个新的文本节点，并更新;
            out = document.createTextNode(vnode);
            if (dom && dom.parentNode) {
                //https://www.w3school.com.cn/jsref/met_node_replacechild.asp
                dom.parentNode.replaceChild(out, dom);
            }
        }
        return out;//更新完，返回
    }

    if (typeof vnode.tag === 'function') {//因为会递归调用，如果某一次调用传入得是组件类型，也就是说调用过程中有一层得节点是组件，就对比组件更新
        return diffComponent(dom, vnode);
    }
    console.log(dom, vnode)
    if (!dom || !isSameNodeType(dom, vnode)) {//如果真实DOM要是不存在，或者当前元素标签层级有变化得话
        out = document.createElement(vnode.tag);

        if (dom) {
            [...dom.childNodes].map(item => out.appendChild(item)); // 将原来的子节点移到新节点下
            console.log(out, 'out', dom.childNodes)
            if (dom.parentNode) {
                dom.parentNode.replaceChild(out, dom); // 移除掉原来的DOM对象
            }
        }
    }

    if (
        (vnode.children && vnode.children.length > 0) ||
        (out.childNodes && out.childNodes.length > 0)
    ) {//如果 有子集的话，对比子集更新, 两个都要判断一种虚拟dom有子集，一种是虚拟DOM没子集，但是真实dom有子集
        diffChildren(out, vnode.children);
    }

    diffAttributes(out, vnode);//更新属性
    return out;

}
export function diffAttributes(dom, vnode) {
    const old = {}; // 当前DOM的属性
    const attrs = vnode.attrs; // 虚拟DOM的属性

    for (let i = 0; i < dom.attributes.length; i++) {
        const attr = dom.attributes[i];
        old[attr.name] = attr.value;
    }

    // 如果原来的属性不在新的属性当中，则将其移除掉（属性值设为undefined）
    for (let name in old) {
        if (!(name in attrs)) {
            handleAttrs(dom, name, undefined);
        }
    }

    // 更新新的属性值
    for (let name in attrs) {
        if (old[name] !== attrs[name]) {
            handleAttrs(dom, name, attrs[name]);
        }
    }
}
function diffChildren(dom, vchildren) {//父级真实dom，和虚拟DOM子集
    const domChildren = dom.childNodes;//真实DOM子集  和vchildren对应 同层次对比
    //没有key得真实DOM集合
    const children = [];
    //有key得集合
    const keyed = {};
    if (domChildren.length > 0) {//真实DOM有子集
        for (let i = 0; i < domChildren.length; i++) {
            const child = domChildren[i];
            const key = child.key;
            if (key) {//根据有没有key，把子集分一下
                keyed[key] = child;
            } else {
                children.push(child);
            }
        }
    }
    if (vchildren && vchildren.length > 0) {//虚拟dom子集有
        let min = 0;
        let childrenLen = children.length;//无key得长度
        for (let i = 0; i < vchildren.length; i++) {//循环虚拟dom
            const vchild = vchildren[i];
            const key = vchild.key;
            let child;
            if (key) {//有key
                if (keyed[key]) {//从真实dom里找一下，看有没有
                    child = keyed[key];//储存下
                    keyed[key] = undefined;//清空
                }
            } else if (min < childrenLen) {//否则没有key,从没key里找，并且开始childrenLen不是0
                for (let j = min; j < childrenLen; j++) {
                    let c = children[j];

                    if (c && isSameNodeType(c, vchild)) {//用真实DOM和虚拟DOM比对一下看是不是同一个节点类型和值相等，包括组件得比对
                        child = c;//是同一个找到了，存一下
                        children[j] = undefined;//清空下
                        if (j === childrenLen - 1) childrenLen--;//做下标记，这个元素找过了，下次略过这个元素min也一样
                        if (j === min) min++;
                        break;
                    }
                }
            }

            child = diffNode(child, vchild);//当前这项真实DOM和虚拟DOM做一个比对，更新如果里面还有子集又会调用diffChildren,返回真实Dom
            const f = domChildren[i];//获取原来真实dom集合中得当前项
            console.log(child, f)
            if (child && child !== f) {//如果比对完得child和当前这个f不一样
                if (!f) {//如果不存在，reacrDom第一次render时,直接添加到父级里
                    dom.appendChild(child);
                } else {//child 已经从真实dom找过一轮，并且和虚拟DOM对比生成过的了。
                    // dom.insertBefore(child, f);
                    // dom.removeChild(f);
                    dom.replaceChild(child, f);//替换掉
                }
            }

        }
        if (dom) {
            if (childrenLen > vchildren.length) {//删除多余节点
                for (let i = vchildren.length; i < childrenLen; i++) {
                    dom.removeChild(children[i]);
                }
            }
        }
    }
}

function isSameNodeType(dom, vnode) {//这个方法很多地方用到
    if (typeof vnode === 'string' || typeof vnode === 'number') {
        return dom.nodeType === 3 && dom === String(vnode); //查看是否是文本节点
    }
    if (typeof vnode.tag === 'string') {
        return dom.nodeName.toLowerCase() === vnode.tag.toLowerCase(); //查看当前层级是否标签换了
    }
    return dom && dom._component && dom._component.constructor === vnode.tag;//在renderComponent做过互相引用，
    //通过createComponent方法里实例化处理根据constructor判断是否是vbode.tag得实例,如果不是当前层级 组件更换了，
    //diffChildren里找对应组件时会用到这里
}
function diffComponent(dom, vnode) {
    let c = dom && dom._component;
    let oldDom = dom;
    // 如果组件类型没有变化，则重新set props
    if (c && c.constructor === vnode.tag) {
        setComponentProps(c, vnode.attrs);
        dom = c.base;
        // 如果组件类型变化，则移除掉原来组件，并渲染新的组件
    } else {
        if (c) {
            unmountComponent(c);
            oldDom = null;
        }

        c = createComponent(vnode.tag, vnode.attrs);

        setComponentProps(c, vnode.attrs);
        dom = c.base;

        if (oldDom && dom !== oldDom) {
            oldDom._component = null;
            removeNode(oldDom);
        }
    }
    return dom;
}

function removeNode(dom) {
    if (dom && dom.parentNode) {
        dom.parentNode.removeChild(dom);
    }
}