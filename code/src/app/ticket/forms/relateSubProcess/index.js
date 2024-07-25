import React from 'react'
import { Collapse } from '@uyun/components'
import RelateSubTask from '~/ticket/relateSubProcess'
import styles from '../index.module.less'
import classnames from 'classnames'

function RelateSubProcess(props) {
  const { field, relateSubProcessErr, isInLayout } = props
  const { name, height = 500, styleAttribute, fold, isRequired } = field || {}
  if (isInLayout) {
    return (
      <div
        style={
          Number(height) === 0
            ? { overflow: 'visible' }
            : { maxHeight: height + 'px', overflow: 'scroll' }
        }
      >
        <RelateSubTask {...props} />
        {relateSubProcessErr ? (
          <span className="relate-ticket-mes">{name || '关联任务流程'}字段值不能为空</span>
        ) : null}
      </div>
    )
  }
  return (
    <Collapse
      defaultActiveKey={fold === 0 ? ['1'] : []}
      className={classnames({
        [styles.noBorderSubprocess]: !styleAttribute
      })}
    >
      <Collapse.Card
        key="1"
        header={
          <span>
            {isRequired === 1 ? <span className="required-item-icon">*</span> : null}
            {name}
          </span>
        }
        forceRender
      >
        <div
          style={
            Number(height) === 0
              ? { overflow: 'visible' }
              : { maxHeight: height + 'px', overflow: 'scroll' }
          }
        >
          <RelateSubTask {...props} />
          {relateSubProcessErr ? <span className="relate-ticket-mes">{name}字段值为空</span> : null}
        </div>
      </Collapse.Card>
    </Collapse>
  )
}

export default RelateSubProcess
