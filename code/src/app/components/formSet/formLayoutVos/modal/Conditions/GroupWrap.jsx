import React from 'react'
import classnames from 'classnames'

const GroupWrap = props => {
  const { children, level, header, extra } = props

  const clsName = classnames(
    'trigger-rule-condition-item',
    {
      'trigger-level': level !== 0
    }
  )

  return (
    <div className={clsName}>
      <header className="trigger-rule-condition-header">
        <div>{header}</div>
        <div>{extra}</div>
      </header>
      <section className="trigger-rule-condition-section" style={{ marginLeft: 30 }}>
        {children}
      </section>
    </div>
  )
}

GroupWrap.defaultProps = {
  level: 0, // 层级
  header: null,
  extra: null
}

export default GroupWrap
