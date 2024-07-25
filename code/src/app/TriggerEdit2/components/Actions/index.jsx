import React, { Component } from 'react'
import { Tabs, Checkbox } from '@uyun/components'
import Field from './Field'
import { isEqualAction } from '../../logic'
import { actionsInfo } from '../../constant'

const TabPane = Tabs.TabPane

export default class Actions extends Component {
  static defaultProps = {
    actions: [],
    value: [],
    onChange: () => {}
  }

  handleChange = async (fieldValue, key, action) => {
    const { value, onChange } = this.props
    const nextValue = [...value]
    const index = value.findIndex((item) => isEqualAction(item, action))

    // 当前动作值中没有该动作，则初始化一个
    if (index === -1) {
      const newValue = {
        type: action.type,
        actionCode: action.actionCode,
        useable: 0,
        [key]: fieldValue
      }
      nextValue.push(newValue)
    } else {
      nextValue[index][key] = fieldValue
    }

    onChange(nextValue)
  }

  renderTabPaneHeader = (action) => {
    const { value } = this.props
    const { name } = action
    const val = _.find(value, (item) => isEqualAction(item, action)) || {}
    return (
      <div>
        <Checkbox
          checked={val.useable === 1}
          onChange={(e) => this.handleChange(e.target.checked ? 1 : 0, 'useable', action)}
        />
        <span>{name}</span>
      </div>
    )
  }

  renderTabPaneContent = (action) => {
    const { value } = this.props
    const { fields } = action
    const val = _.find(value, (item) => isEqualAction(item, action)) || {}
    return fields.map((field) => {
      // 外部接口参数值包括formData和raw
      const fieldValue =
        field.key === 'params' ? { formData: val.formData, raw: val.raw } : val[field.key]

      return (
        <Field
          key={field.key}
          field={field}
          actionUsable={val.useable}
          value={fieldValue}
          onChange={(value, key) => this.handleChange(value, key, action)}
        />
      )
    })
  }

  render() {
    const { actions } = this.props
    const allowActions = _.map(actionsInfo, (d) => d.type)
    const actionsDetail = _.filter(actions, (d) => allowActions.includes(d.type))
    return (
      <Tabs type="card" className="trigger-action-wrap">
        {actionsDetail.map((item, index) => {
          return (
            <TabPane tab={this.renderTabPaneHeader(item)} key={index + ''}>
              {this.renderTabPaneContent(item)}
            </TabPane>
          )
        })}
      </Tabs>
    )
  }
}
