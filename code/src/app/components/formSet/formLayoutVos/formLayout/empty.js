import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { DropTarget } from 'react-dnd'
import classnames from 'classnames'
import SpinCenter from '~/components/spin'
import Type from '../type'

const fieldTarget = {
  drop(props, monitor, component) {
    let item = monitor.getItem()
    const { index, length, formSetGridStore } = props
    const { currentGrid } = formSetGridStore
    let { formLayoutVos } = currentGrid

    const { id, beginField, beginLayoutIndex, beginTabsIndex, beginFieldIndex, action, beginParentType } = item
    if (action === 'move') {
      if (beginParentType === 'layout') {
        item = _.nth(formLayoutVos, beginLayoutIndex)
        formLayoutVos = _.filter(formLayoutVos, formLayout => formLayout.id !== id)
      } else {
        formSetGridStore.deleteField(beginLayoutIndex, beginTabsIndex, beginFieldIndex, beginParentType)
        item = beginField
      }
    }
    formLayoutVos = [
      ...formLayoutVos.slice(0, index + 1),
      item,
      ...formLayoutVos.slice(index + 1, length)
    ]
    formSetGridStore.setData(_.assign({}, currentGrid, { formLayoutVos }), 'currentGrid')
  },
  canDrop(props, monitor, component) {
    const item = monitor.getItem()
    return _.some(props.dropList, type => type === item.type)
  }
}
@inject('formSetGridStore')
@DropTarget(Type, fieldTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  item: monitor.getItem(),
  canDrop: monitor.canDrop()
}))
@observer
export default class Empty extends Component {
  renderName = () => {
    const { currentGrid } = this.props.formSetGridStore
    const { formLayoutVos } = currentGrid || {}
    const { isOver, canDrop } = this.props
    if (isOver) {
      return canDrop ? i18n('formSet-drop-tip1', '请拖放到这里') : i18n('formSet-drop-tip2', '无法放置在该区域')
    } else {
      return _.isEmpty(formLayoutVos) ? i18n('formSet-drop-tip1', '请拖放到这里') : ''
    }
  }

  render() {
    const { currentGrid } = this.props.formSetGridStore
    const { connectDropTarget, isOver, length, index } = this.props
    const { formLayoutVos } = currentGrid || {}
    const { type } = this.props.formSetGridStore
    return (
      (index === -1 && type !== 'template' && _.isEmpty(currentGrid))
        ? <SpinCenter />
        : connectDropTarget(
          <div className="layout-empty">
            <div className={classnames({
              show: isOver,
              hide: !isOver,
              empty: _.isEmpty(formLayoutVos),
              last: index !== 0 && index === length
            })}>
              {this.renderName()}
            </div>
          </div>
        )
    )
  }
}