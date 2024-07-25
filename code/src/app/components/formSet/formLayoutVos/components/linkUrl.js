import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import PropTypes from 'prop-types'
import { Input, Button, Dropdown, Menu, Tooltip } from '@uyun/components'
import './linkUrl.less'

const MenuItemGroup = Menu.ItemGroup
export function stringCompare (kw, value) {
  return value.toLowerCase().indexOf(kw.toLowerCase()) !== -1
}

@inject('triggerStore')
@observer
class LinkUrl extends Component {
  static contextTypes = {
    modelId: PropTypes.string
  }

  state = {
    kw: '',
    menuList: [],
    visible: false,
    tipVisible: false
  }

  renderMenu = () => {
    const { menuList, kw } = this.state
    const { params } = this.props.triggerStore
    return (
      <div className="link-url-dropdown-wrap">
        <Input.Search
          allowClear
          value={kw}
          placeholder={i18n('globe.keywords', '请输入关键字')}
          onClick={e => { e.stopPropagation() }}
          onChange={(e) => {
            const kw = e.target.value
            const list = _.map(params, item => {
              const data = _.filter(item.list, menuItem => {
                const code = menuItem.code || ''
                const name = menuItem.name || ''
                return stringCompare(kw, code) || stringCompare(kw, name)
              })
              return {
                list: data,
                value: item.value,
                name: item.name
              }
            })
            this.setState({ menuList: list, kw })
          }} />
        <div className="link-url-dropdown-list">
          <Menu style={{ maxWidth: 300 }} mode="vertical" inlineIndent="30" onClick={this.handleClickMenu}>
            {_.map(menuList, param => (
              <MenuItemGroup key={param.value} title={param.name}>
                {_.map(param.list, item => (
                  <Menu.Item key={item.code} title={item.name}>
                    <span>{item.name}</span>
                  </Menu.Item>
                ))}
              </MenuItemGroup>
            ))}
          </Menu>
        </div>
      </div>
    )
  }

  handleClick = async () => {
    const { params } = this.props.triggerStore
    if (_.isEmpty(params)) {
      await this.props.triggerStore.getFieldParams(this.context.modelId)
    }
    this.setState({ menuList: _.cloneDeep(this.props.triggerStore.params) })
  }

  handleClickMenu = (item) => {
    const value = this.props.value + '${ticket.' + item.key + '}'
    this.props.onChange(value)
  }

  handleVisibleChange = (flag) => {
    this.setState({ visible: flag })
  }

  componentDidMount() {
    // 侧滑css使用了动画导致Tooltip定位的位置有问题
    setTimeout(() => {
      this.setState({ tipVisible: !_.isEmpty(this.props.value) })
    }, 500)
  }

  render () {
    const { value } = this.props
    const { tipVisible } = this.state
    return (
      <div className="link-url">
        <Tooltip
          visible={tipVisible}
          title={value}
          placement="left">
          <Input
            value={value}
            onChange={(e) => {
              this.props.onChange(e.target.value)
            }}
            placeholder={`${i18n('ticket.forms.pinput', '请输入')}${i18n('ticket.relateTicket.url', '访问url')}`} />
        </Tooltip>
        <Dropdown
          onVisibleChange={this.handleVisibleChange}
          visible={this.state.visible}
          overlay={this.renderMenu()}>
          <Button onClick={() => {
            this.handleClick()
          }}><i className="icon-code iconfont" /></Button>
        </Dropdown>
      </div>
    )
  }
}

export default LinkUrl
