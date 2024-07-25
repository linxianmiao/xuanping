import React, { useRef, useCallback, useEffect } from 'react'

function CodeEditor(props) {
  const { placeholder, value, disabled, onChange } = props

  const text = useRef()
  const editor = useRef()
  const currentValue = useRef()

  function setTeme() {
    const editorTheme = document.querySelector('html').classList.contains('blue')
      ? 'monokai'
      : 'default'
    editor.current.setOption('theme', `${editorTheme}`)
  }

  const createCodeMirror = useCallback(async () => {
    const { default: CodeMirror } = await import(/* webpackChunkName: "codemirror" */ './lib')
    editor.current = CodeMirror.fromTextArea(text.current, {
      mode: {
        name: 'javascript',
        json: true,
        jsonld: true
      },
      lineNumbers: true, // 显示行数
      matchBrackets: true, // 括号匹配
      lineWrapping: true // 代码折叠
    })
    setTeme()
    editor.current.on('change', (e, change) => {
      currentValue.current = editor.current.getValue()
      if (change.origin !== 'setValue') {
        onChange(currentValue.current)
      }
    })
  }, [])

  useEffect(() => {
    createCodeMirror()
  }, [createCodeMirror])

  // useEffect(() => {
  //   console.log(value)
  //   if (editor.current && propsValue.current !== value && value !== currentValue.current) {
  //     editor.current.setValue(value)
  //   }
  //   return () => {
  //     console.log(value)
  //     propsValue.current = value
  //   }
  // }, [value])

  useEffect(() => {
    window.changeSkin_hook_pending_distributed = () => {
      setTeme()
    }
  }, [])

  return (
    <div className="components-code-editor">
      <textarea
        ref={text}
        disabled={disabled}
        value={value}
        autoComplete="off"
        placeholder={placeholder}
      />
    </div>
  )
}
CodeEditor.defaultProps = {
  onChange: () => {}
}
export default CodeEditor
