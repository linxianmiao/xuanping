import React from 'react'
import { Row, Col } from '@uyun/components'
import { ReactSortable } from 'react-sortablejs'

import { sortButtonList } from './logic'
import ConfigBaseInfo from './ConfigBaseInfo'
import ConfigSubInfo from './ConfigSubInfo'
import styles from './index.module.less'

const COL_LEFT = 20
const COL_RIGHT = 4

const CardContent = (props) => {
  const {
    buttonList,
    typeButtonList,
    type,
    fixedRollbackTache,
    hideTypeButtons,
    onChange,
    coOperation
  } = props
  return (
    <div className={styles.cardContent}>
      <div className={styles.head}>
        <Row className={styles.rowHead}>
          <Col span={COL_LEFT} className={styles.colLeft}>
            {'按钮名称'}
          </Col>
          <Col span={COL_RIGHT} className={styles.colRight}>
            {'操作'}
          </Col>
        </Row>
      </div>
      <div className={styles.body}>
        <ReactSortable
          list={typeButtonList}
          setList={(value) => {
            const newValue = sortButtonList(value, buttonList, type)
            onChange(newValue)
          }}
          group={'SORT'}
          animation={200}
        >
          {typeButtonList.map((item, i) => {
            return (
              <Row
                key={`${type}_${i}`}
                className={styles.rowRecord}
                style={{ display: hideTypeButtons.includes(item.type) ? 'none' : 'flex' }}
              >
                <Col span={COL_LEFT}>
                  <ConfigBaseInfo
                    record={{ ...item }}
                    onChange={onChange}
                    buttonList={buttonList}
                    coOperation={coOperation}
                  />
                </Col>
                <Col span={COL_RIGHT} className={styles.colRight}>
                  <ConfigSubInfo
                    record={{ ...item }}
                    onChange={onChange}
                    buttonList={buttonList}
                    fixedRollbackTache={fixedRollbackTache}
                    coOperation={coOperation}
                  >
                    {item.configSub ? '配置' : null}
                  </ConfigSubInfo>
                </Col>
              </Row>
            )
          })}
        </ReactSortable>
      </div>
    </div>
  )
}

CardContent.defaultProps = {
  buttonList: [],
  typeButtonList: [],
  type: '',
  fixedRollbackTache: [],
  hideTypeButtons: [],
  onChange: () => {}
}

export default CardContent
