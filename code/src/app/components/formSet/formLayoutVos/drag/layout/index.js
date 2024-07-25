import React, { Component } from 'react'
import { LAYOUT_LIST } from '../../configuration'
import Item from './item'
import './index.less'

export default class Layout extends Component {
  render() {
    return (
      <div className="itsm-form-set-formLayoutVos-drag-layout">
        {/* <h3>{i18n('model.field.edit.left.groups.tip0', '拖动分组和标签页,实现字段组成布局')}</h3> */}
        <ul>
          {_.map(LAYOUT_LIST, (item) => (
            <Item key={item.type} item={item} />
          ))}
        </ul>
      </div>
    )
  }
}
