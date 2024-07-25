import React, { forwardRef } from 'react'
import CodeEditor from '~/components/codeEditor'
import classnames from 'classnames'

export default forwardRef(
  function JSONText(props) {
    const { disabled, value, ...rest } = props
    if (disabled) {
      return <span className="pre-wrap disabled-ticket-form">{value}</span>
    }
    return (
      <CodeEditor
        className={classnames({ 'disabled-item': disabled })}
        title="JSON"
        value={value}
        {...rest}
      />
    )
  }
)