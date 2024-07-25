import React, { createRef } from 'react'
import Sortable from 'sortablejs'
import { Tag } from '@uyun/components'
import styles from './index.module.less'

export default class SortableFields extends React.Component {
  sortRef = createRef()

  componentDidMount() {
    this.initSortable()
  }

  initSortable() {
    const wrapper = this.sortRef.current
    const tagClassName = `.${styles.tag}`
    this.sortable = new Sortable(wrapper, {
      handle: tagClassName,
      animation: 150,
      draggable: tagClassName,
      onEnd: e => {
        const { oldIndex, newIndex } = e
        this.props.onDrop(oldIndex, newIndex)
      }
    })
  }

  render() {
    const { checkedFields } = this.props
    return (
      <div className={styles.sorterWrapper} ref={this.sortRef}>
        {checkedFields.map(item => (
          <Tag
            closable={item.closable}
            onClose={() => this.props.onClose(item)}
            key={item.code}
            className={styles.tag}
          >
            {item.name}
          </Tag>
        ))}
      </div>
    )
  }
}
