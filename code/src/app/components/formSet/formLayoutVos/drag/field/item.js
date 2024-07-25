import React, { Component } from 'react'
import DataType from '~/create-field/config/dataType'
import { DragSource } from 'react-dnd'
import classnames from 'classnames'
import { EXCLUSIVE_FIELD, REQUIRE_FIELD_CODE, AEAD_ONLY_FIELD_CODE } from '../../configuration'
import Type from '../../type'

const fieldSource = {
  beginDrag(props) {
    const fieldLayoutMul =
      props.item.type === 'multiRowText' ||
      (props.item.type === 'resource' && props.item.isSingle === '1')
        ? 24
        : 12
    const item = _.assign({}, props.item, {
      fieldLayout: { col: fieldLayoutMul },
      fieldLabelLayout: props.formLayoutType ? 'horizontal' : 'vertical',
      isRequired: 0
    })
    // 部分字段只能独占一行
    if (_.includes(EXCLUSIVE_FIELD, item.type)) {
      item.fieldLayout = { col: 24 }
    }
    // 必须为必填的字段
    if (_.includes(REQUIRE_FIELD_CODE, item.code)) {
      item.isRequired = 1
    }
    // 只读code
    if (_.includes(AEAD_ONLY_FIELD_CODE, item.code)) {
      item.isRequired = 2
    }

    return item
  },
  canDrag(props) {
    return props.canDrag
  }
}

@DragSource(Type, fieldSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))
class LeftItem extends Component {
  // 部分内置字段没有icon，特殊判断
  // NH的定制字段，特殊判断

  switchIcon = (type) => {
    switch (type) {
      case 'business':
        return 'iconfont icon-xiala'
      case 'flowNo':
        return 'iconfont icon-danxingwenben'
      case 'treeSel':
        return 'iconfont icon-jilian'
      case 'layer':
        return 'iconfont icon-ziyuanfenlei'
      case 'excelImport':
        return 'field-type-commons iconfont icon-Excelgeshi'
      default:
        return DataType[type] ? DataType[type].icon.replace('field-type-commons ', '') : ''
    }
  }

  render() {
    const { connectDragSource, canDrag } = this.props
    const { name, type } = this.props.item
    const liIcon = this.switchIcon(type)
    return connectDragSource(
      <li
        className={classnames('list-item shenglue', {
          disabled: !canDrag
        })}
        title={name}
      >
        <i className={liIcon} />
        {name}
      </li>
    )
  }
}

export default LeftItem
