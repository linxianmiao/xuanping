import React from 'react'
import { Collapse, Title } from '@uyun/components'
import styles from '../index.module.less'
import classnames from 'classnames'
import Comment from '~/ticket/comment'

function TicketComment(props) {
  const { field, isInLayout } = props
  const { name, height = 500, styleAttribute, fold, isRequired } = field || {}
  if (isInLayout) {
    return (
      <div
        style={
          Number(height) === 0
            ? { overflow: 'visible' }
            : { maxHeight: height + 'px', overflow: 'scroll', minHeight: 135 }
        }
      >
        <Comment {...props} formMode="new" />
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
            {!styleAttribute ? <Title>{name}</Title> : name}
          </span>
        }
        forceRender
      >
        <div
          style={
            Number(height) === 0
              ? { overflow: 'visible' }
              : { maxHeight: height + 'px', overflow: 'scroll', minHeight: 135 }
          }
        >
          <Comment {...props} formMode="new" />
        </div>
      </Collapse.Card>
    </Collapse>
  )
}

export default TicketComment
