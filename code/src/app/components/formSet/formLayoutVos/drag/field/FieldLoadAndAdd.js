import React, { Component } from 'react'
import { DownOutlined } from '@uyun/icons';
import { Dropdown, Menu, Icon } from '@uyun/components'
import Load from './load'
import Add from './add'
export default class FieldLoadAndAdd extends Component {
  constructor(props) {
    super(props)
    this.load = React.createRef()
    this.add = React.createRef()
  }

  onLoad = () => {
    if (this.load.current.wrappedInstance) {
      this.load.current.wrappedInstance.handleChangeVisible(true)
    } else {
      this.load.current.handleChangeVisible(true)
    }
  }

  onAdd = () => {
    if (this.add.current.wrappedInstance) {
      this.add.current.wrappedInstance.handleChangeVisible(true)
    } else {
      this.add.current.handleChangeVisible(true)
    }
  }

  render() {
    const menu = (
      <Menu onClick={this.onAdd}>
        <Menu.Item>{i18n('new_field', '新建字段')}</Menu.Item>
      </Menu>
    )
    return (
      <React.Fragment>
        <div className="field-load-add-wrap">
          <span onClick={this.onLoad}>{i18n('conf.model.load.field', '载入字段')}</span>
          <Dropdown placement="bottomRight" type="primary" overlay={menu}>
            <DownOutlined />
          </Dropdown>
        </div>
        <Load ref={this.load} />
        <Add ref={this.add} />
      </React.Fragment>
    );
  }
}