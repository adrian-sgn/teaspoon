import React from 'react';
import { render, findDOMNode } from 'react-dom';
import $ from '../src';

describe('DOM rendering specific', ()=> {
  let Stateless = props => <div onClick={props.onClick}>{props.children}</div>
  let List = class extends React.Component {
    render(){
      return (
        <div onClick={this.props.onClick}>
          Hello there
          <Stateless onClick={this.props.onClick}>
            <span className='stateless-inner' onClick={this.props.onClick}/>
          </Stateless>
          <ul onClick={this.props.onClick}>
            <li className='item' onClick={this.props.onClick}>hi 1</li>
            <li onClick={this.props.onClick}>hi 2</li>
            <li>hi 3</li>
          </ul>
        </div>
      )
    }
  }

  let Component = class extends React.Component {
    render(){
      return (
        <div>
          <span>hi</span>
          <div className='list-wrapper'>
            <List onClick={this.props.onClick}/>
          </div>
        </div>
      )
    }
  }

  it('should wrap existing mounted component', ()=> {
    class Div extends React.Component {
      render(){ return <div {...this.props} /> }
    }
    let mount = document.createElement('div')
      , instance = render(<Div className='test'><span/></Div>, mount)

    let $inst = $(instance);

    expect($inst[0]).to.equal(instance);
    expect($inst._mountPoint).to.equal(mount)

    /* this works in react@15 but not 14 */
    let span = findDOMNode(instance).children[0];
    $inst = $(span);

    expect($inst[0]).to.equal(span);
    expect($inst._mountPoint).to.equal(mount)
  })

  it('should unmount', ()=> {
    let mount = document.createElement('div')
    let instance = $(<div className='test'/>).render(true, mount)

    document.querySelectorAll('.test').length.should.equal(1)

    let next = instance.unmount()

    document.querySelectorAll('.test').length.should.equal(0)
    expect(instance.root).to.not.exist
    expect(mount.parentNode).to.not.exist

    expect(next[0].type).to.equal('div')
  })



  it('should return DOM node from Component', ()=> {
    let instance = $(<div className='test'/>).render()

    expect(instance.dom()).to.be.an.instanceof(HTMLElement)
  })

  it('should return DOM node from HTMLElement', ()=> {
    let div = document.createElement('div')
    expect($.dom(div)).to.equal(div)
  })

  it('should throw when retrieving state from a stateless node', ()=> {
    let msg = 'You are trying to inspect or set state on a stateless component ' +
              'such as a DOM node or functional component'

    ;(() => $(<Component />).render().find('div').state())
      .should.throw(msg)

    ;(() => $(<Component />).render().find(Stateless).state())
      .should.throw(msg)
  })

  it('should trigger event', ()=> {
    let clickSpy = sinon.spy();
    let instance = $(<Component className='test' onClick={clickSpy}/>).render()

    instance.find(List).trigger('click', { clickedYo: true })

    clickSpy.should.have.been.calledOnce
  })
})
