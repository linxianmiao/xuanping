import React from 'react'
import { Card } from '@uyun/components'
import CodeMirror from './CodeMirror'
import './index.less'
/**
 * title         Card的标题，不传不显示Card
 * extra         Card的右侧的扩展，不传不显示
 * value         当前值
 * onChange      修改当前值函数
 * placeholder   占位符
 */

export default function CodeEditor(props) {
  const { title, extra, ...rest } = props
  return (
    <Card type="inner" title={title} extra={extra} className="code-editor-card">
      <CodeMirror {...rest} />
    </Card>
  )
}
