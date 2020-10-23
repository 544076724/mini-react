import React from './react';
import ReactDom from './reactDom';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            type: 1
        }
    }
    componentDidMount() {

    }
    onclick() {

        this.setState({ type: 2 })
    }
    render() {
        const { type } = this.state;
        const element = type === 1 ? (<div>
            hello
            <span onClick={this.onclick.bind(this)}>world!</span>
            react
            <span>test</span>
        </div>) : (<span>333</span>)
        return (element);
    }
}
ReactDom.render(<App />, document.getElementById('root'))


console.log('aaa')
setTimeout(() => { console.log('bbb') }, 1000)
const start = new Date();
while (new Date() - start < 1000) {}
console.log('ccc')
setTimeout(()=>{console.log('ddd')},0)
new Promise(function(resolve,reject){
    console.log('eee');
    foo.bar(100)
}).then(()=>{console.log('fff')}).then(()=>{console.log('ggg')}).catch(()=>{console.log('hhh')})
console.log('iiii')
//aaa,ccc,eee,iiii,hhh,bbb,ddd