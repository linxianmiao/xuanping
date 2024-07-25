import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { DragSource } from 'react-dnd'
import Type from '../../type'
import uuid from '~/utils/uuid'

const fieldSource = {
  beginDrag (props) {
    const data = props.item
    data.id = uuid()
    return _.omit(data, ['icon'])
  }
}


@inject('formSetGridStore')
@DragSource(Type, fieldSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))
@observer
class Item extends Component {
  render () {
    const { connectDragSource } = this.props
    const { name, icon, type, unique } = this.props.item
    const { formLayoutVos } = this.props.formSetGridStore.currentGrid

    // sla和关联工单控件只能拖入一个
    if (unique) {
      const existed = formLayoutVos.some(formLayout => {
        if (formLayout.type === type) {
          return true
        } else if (formLayout.type === 'group') {
          return formLayout.fieldList.some(field => field.type === type)
        } else if (formLayout.type === 'tab') {
          return formLayout.tabs.some(tab => {
            return tab.fieldList.some(field => field.type === type)
          })
        }
      })

      if (existed) {
        return (
          <li className="shenglue disabled" title={name}>
            <i className={`${icon} iconfont`} />{name}
          </li>
        )
      }
    }
    
    return (
      connectDragSource(
        <li className="shenglue" title={name}><i className={`${icon} iconfont`} />{name}</li>
      )
    )
  }
}

export default Item
