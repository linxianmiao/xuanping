import React from 'react'
import { Tag, Empty } from '@uyun/components'
import { ReactSortable } from 'react-sortablejs'
import classnames from 'classnames'

import styles from '../index.module.less'

function SelectedContent({ value, onChange, sortable, forbiddenFields }) {
  const length = value.length
  return (
    <div className={classnames(styles.selectedContent, !sortable ? styles.notSortable : '')}>
      <div className={styles.title}>
        <span className={styles.num}>{`已选(${length})`}</span>
        <span className={styles.des}>{sortable ? '(可拖动排序)' : null}</span>
      </div>
      {length ? (
        <ReactSortable
          list={value}
          setList={(value) => sortable && onChange(value)}
          sort={sortable}
          className={styles.sortable}
        >
          {value.map((item) => (
            <Tag
              key={item.id || item.code}
              closable={
                Array.isArray(forbiddenFields) ? !forbiddenFields.includes(item.code) : true
              }
              onClose={() =>
                onChange(value.filter((s) => (s.id && s.id !== item.id) || s.code !== item.code))
              }
            >
              {item.name}
            </Tag>
          ))}
        </ReactSortable>
      ) : (
        <Empty type="data" description="暂无数据，请选择属性或字段" />
      )}
    </div>
  )
}

SelectedContent.defaultProps = {
  value: [],
  sortable: true,
  onChange: () => {}
}

export default SelectedContent
