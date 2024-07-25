import React, { Component } from 'react'
import { Dropdown, Form } from '@uyun/components'
import colorList from '../config/actionColorList'
import ColorPicker from '~/components/ColorPicker'
const FormItem = Form.Item

class Time extends Component {
    renderContent = () => {
      const { item, index } = this.props
      const { color } = item
      return (
        <ColorPicker
          color={color}
          colors={colorList}
          onChange={color => {
            this.props.handleChange(_.assign({}, item, { color }), index)
          }} />
      )
    }

    // 删除颜色
    handleDel = () => {
      const { item, index } = this.props
      const types = _.filter(item.types, type => type !== '1') || []
      this.props.handleChange(_.assign({}, item, { types, color: '#ff0000' }), index)
    }

    render () {
      const { item } = this.props
      const { color } = item
      return (
        <div className="sla-policy-action-wrap">
          <FormItem label="标记工单颜色" colon={false}>
            <Dropdown overlay={this.renderContent()}>
              <div className="sla-policy-action-color" style={{ background: color }} />
            </Dropdown>
          </FormItem>
          <i onClick={this.handleDel} className="iconfont icon-shanchu" />
        </div>
      )
    }
}

export default Time
