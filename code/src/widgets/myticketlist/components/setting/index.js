/**
 * 模型列表
 * 按模型分组分
 */
import React, { Component } from 'react'
import { inject } from '@uyun/core'
import { observer } from 'mobx-react'
import { Transfer, Form } from '@uyun/components'
import { TicketlistStore } from '../../ticketlist.store'
const FormItem = Form.Item
function getCookie(name) {
  var value = '; ' + document.cookie
  var parts = value.split('; ' + name + '=')
  if (parts.length === 2) {
    return parts.pop().split(';').shift()
  }
}
@observer
class Index extends Component {
  @inject('api') api

  @inject(TicketlistStore) store

  handleChange = (targetKeys, direction, moveKeys) => {
    this.props.changeStatus(targetKeys)
  }

  _renerName = (item) => (getCookie('language') === 'en_US' ? item.enName : item.zhName)

  render() {
    const { allMenuList = [] } = this.store
    const { selectCodes } = this.props
    const dataSource = allMenuList.map((menu) => ({ key: menu.code, title: this._renerName(menu) }))
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 }
      }
    }
    return (
      <div>
        <FormItem {...formItemLayout} label="查询器设置">
          <div>
            <div>{'设置当前部件可使用的查询器范围，不设置可选择全部查询器'}</div>
            <Transfer
              titles={['查询器列表', '已选择查询器']}
              dataSource={dataSource}
              showSearch
              targetKeys={selectCodes}
              onChange={this.handleChange}
              onSelectChange={this.onSelectChange}
              render={(item) => item.title}
            />
          </div>
        </FormItem>
      </div>
    )
  }
}

export default Index
