import React, { Component } from 'react'
import { controlList } from '../../configuration'
import Item from './item'
export default class Control extends Component {
  render() {
    // 如果是表单模板则过滤掉子表单控件
    let list = controlList
    if (this.props.type === 'template') {
      list = _.filter(list, (item) => item.type !== 'subForm')
    }
    return (
      <div className="itsm-form-set-formLayoutVos-drag-control">
        <ul>
          {_.map(list, (item) => (
            <Item key={item.type} item={item} />
          ))}
        </ul>
      </div>
    )
  }
}
