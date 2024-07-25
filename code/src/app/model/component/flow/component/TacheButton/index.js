import React from 'react'
import { Collapse } from '@uyun/components'

import { operationList, getTaskTacheLinksButton, getFixedRollbackTache } from './logic'
import CardContent from './CardContent'

import styles from './index.module.less'

const TacheButton = ({ dataSource, tacheInfo, hideTypeButtons, onChange, coOperation }) => {
  const value = getTaskTacheLinksButton(dataSource.links, tacheInfo)
  return (
    <Collapse defaultActiveKey={[0, 1]} className={styles.tacheButtonCollapse}>
      {operationList.map((item) => {
        return (
          <Collapse.Card header={item.name} key={item.type}>
            <CardContent
              buttonList={value}
              typeButtonList={value.filter((record) => record.showMore === item.type)}
              type={item.type}
              // 定点回退中选择回退到的节点
              fixedRollbackTache={getFixedRollbackTache(dataSource.nodes || [], tacheInfo.id)}
              hideTypeButtons={hideTypeButtons}
              onChange={onChange}
              coOperation={coOperation}
            />
          </Collapse.Card>
        )
      })}
    </Collapse>
  )
}

TacheButton.defaultProps = {
  dataSource: {}, // {links: [], nodes: []} 所有的节点和所有的线
  tacheInfo: {}, // 当前节点数据
  hideTypeButtons: [], // 按钮无权限时，需要隐藏按钮
  onChange: () => {},
  coOperation: {}
}

export default TacheButton
