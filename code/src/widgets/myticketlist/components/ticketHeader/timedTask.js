import React, { Component } from 'react'
import { inject } from '@uyun/core'
import { DownOutlined, SyncOutlined } from '@uyun/icons'
import { Button, Dropdown, Menu } from '@uyun/components'

export default class TimedTask extends Component {
  @inject('i18n') i18n

  handleClick = (e) => {
    this.props.handleChangeTimer(Number(e.key) * 60)
  }

  render() {
    const { timer } = this.props
    const value = `${timer / 60}`
    const list = [
      { code: '0.5', name: this.i18n('half-minute', '30秒') },
      { code: '1', name: this.i18n('one-minute', '1分') },
      { code: '3', name: this.i18n('three-minute', '3分') },
      { code: '5', name: this.i18n('five-minute', '5分') },
      { code: '10', name: this.i18n('ten-minute', '10分') },
      { code: '30', name: this.i18n('thirty-minute', '30分') },
      { code: '60', name: this.i18n('sixty-minute', '60分') }
    ]
    const item = _.find(list, (item) => item.code === value) || {}
    const menu = (
      <Menu onClick={this.handleClick}>
        {_.map(list, (item) => (
          <Menu.Item key={item.code}>{item.name}</Menu.Item>
        ))}
      </Menu>
    )
    return (
      <Dropdown overlay={menu}>
        <Button style={{ marginRight: 16 }} icon={<SyncOutlined />}>
          {item.name} <DownOutlined />
        </Button>
      </Dropdown>
    )
  }
}