import React, { forwardRef, useRef, useEffect, useCallback } from 'react'

const simditor_opts = {
  toolbar: [
    'title',
    'bold',
    'italic',
    'underline',
    'strikethrough',
    'fontScale',
    'color',
    'ol',
    'ul',
    'blockquote',
    'table',
    'link',
    'image',
    'indent',
    'outdent',
    'alignment'
  ],
  toolbarFloat: false,
  pasteImage: true,
  //cleanPaste: true,
  imageButton: 'upload'
}
/**
 * ticketId      工单的id，上传图片用
 * value         当前富文本的value       required
 * onChange      富文本改变时触发        required
 * code          富文本绑定的id          required
 * className     富文本的className
 * fileName      上传文件的默认名称
 */
function SimpEditor(props) {
  const {
    className,
    ticketId,
    code,
    value,
    onChange = () => {},
    fileName,
    placeholder,
    maxRowHeight = 9
  } = props
  const ref = useRef()
  const editor = useRef()
  const valueRef = useRef()

  const createSimpEditor = useCallback(async () => {
    const { default: Simditor } = await import(/* webpackChunkName: "simditor" */ 'simditor')
    if (editor.current) editor.current.destroy()

    editor.current = new Simditor({
      textarea: ref.current,
      upload: {
        url: API.UPLOAD,
        params: {
          type: '*',
          outId: ticketId,
          fileName: fileName || 'mailbox.jpg',
          fieldCode: code
        },
        fileKey: 'file',
        connectionCount: 3
      },
      placeholder,
      ...simditor_opts
    })
    value && editor.current.setValue(value)
    editor.current.on('valuechanged', (e, src) => {
      valueRef.current = editor.current.getValue()
      onChange(valueRef.current)
    })

    editor.current.uploader.on('uploadsuccess', (file, request, response) => {
      if (response.errCode === 200) {
        request.img.get(0).src = `${API.DOWNLOAD}/${_.get(response, 'data.fileId')}/${_.get(
          response,
          'data.fileName'
        )}`
      }
    })
  }, [ticketId])

  useEffect(() => {
    createSimpEditor()
  }, [createSimpEditor])

  useEffect(() => {
    if (editor.current && value && value !== valueRef.current) {
      editor.current.setValue(value)
    }
  }, [value])

  useEffect(() => {
    return () => {
      if (editor.current) editor.current.destroy()
    }
  }, [])

  return <div className={className} style={{ maxHeight: maxRowHeight * 40 }} ref={ref} id={code} />
}

export default forwardRef(SimpEditor)
