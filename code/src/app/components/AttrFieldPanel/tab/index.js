import React from 'react'
import { Tabs } from '@uyun/components'

import Attr from './attr'
import Field from './field'

import styles from '../index.module.less'

const list = [
  {
    name: '通用属性',
    value: 'attr',
    Content: Attr
  },
  {
    name: '工单字段',
    value: 'field',
    Content: Field
  }
]

function TabContent({
  value,
  onChange,
  attrList,
  disabledType,
  tabPane,
  modelIds,
  lockCondition = [],
  forbiddenFields
}) {
  return (
    <Tabs defaultActiveKey={tabPane[0]} className={styles.tabContent}>
      {list.map((item) => {
        const Content = item.Content
        if (tabPane.indexOf(item.value) === -1) return null
        return (
          <Tabs.TabPane key={item.value} tab={item.name}>
            <Content
              value={value}
              onChange={onChange}
              attrList={attrList}
              disabledType={disabledType}
              modelIds={modelIds}
              lockCondition={lockCondition}
              forbiddenFields={forbiddenFields}
            />
          </Tabs.TabPane>
        )
      })}
    </Tabs>
  )
}

TabContent.defaultProps = {
  value: [],
  onChange: () => {},
  attrList: [],
  disabledType: [],
  tabPane: [],
  modelIds: [],
  lockCondition: []
}

export default TabContent
