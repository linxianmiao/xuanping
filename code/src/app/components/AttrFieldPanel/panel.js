import React, { memo } from 'react'

import SelectedContent from './selected'
import TabContent from './tab'

import styles from './index.module.less'

const AttrFieldPanel = (props) => {
  const {
    value,
    onChange,
    attrList,
    sortable,
    disabledType,
    tabPane,
    modelIds,
    lockCondition,
    forbiddenFields
  } = props
  return (
    <div className={styles.attrFieldPanelContent}>
      <div className={styles.left}>
        <SelectedContent
          value={value}
          sortable={sortable}
          onChange={(value) => onChange(value)}
          forbiddenFields={forbiddenFields}
        />
      </div>
      <div className={styles.rigth}>
        <TabContent
          attrList={attrList}
          value={value}
          disabledType={disabledType}
          tabPane={tabPane}
          modelIds={modelIds}
          onChange={(value) => onChange(value)}
          lockCondition={lockCondition}
          forbiddenFields={forbiddenFields}
        />
      </div>
    </div>
  )
}

AttrFieldPanel.defaultProps = {
  value: [],
  attrList: [],
  sortable: true,
  disabledType: [],
  tabPane: [],
  onChange: () => {},
  lockCondition: []
}

export default memo(AttrFieldPanel)
