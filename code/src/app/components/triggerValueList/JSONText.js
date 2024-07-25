import React, { forwardRef } from 'react'
import CodeEditor from '~/components/codeEditor'

function JSONText(props) {
  const { value, disabled, handleChange } = props
  return (
    <CodeEditor
      disabled={disabled}
      value={value}
      onChange={handleChange}
    />
  )
}

JSONText.defaultProps = {
  value: undefined,
  handleChange: () => {}
}

export default forwardRef(JSONText)