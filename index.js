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


