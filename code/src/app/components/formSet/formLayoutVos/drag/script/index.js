import React, { useState, forwardRef, useImperativeHandle } from 'react'
import { message } from '@uyun/components'
import CodeEditor from '~/components/codeEditor'

function CombineCustomScript(props, ref) {
  const { combineCustomScript } = props
  const [value, setValue] = useState(combineCustomScript)

  useImperativeHandle(ref, () => ({
    validateScript: (callback) => {
      let errors = ''
      try {
        value && eval(`(${value})`)
      } catch (e) {
        message.error(i18n('initCustomScript.error.tip1', '初始化脚本错误'))
        errors = i18n('initCustomScript.error.tip1', '初始化脚本错误')
      } finally {
        callback(errors, { combineCustomScript: value })
      }
    }
  }))
  return (
    <CodeEditor
      ref={ref}
      onChange={setValue}
      value={value}
    />
  )
}
export default forwardRef(CombineCustomScript)