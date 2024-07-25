import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import { Modal } from '@uyun/components'
// title  标题
// content 内容

export default function confirm (props) {
  const div = document.createElement('div')
  document.body.appendChild(div)

  function destroy() {
    const unmountResult = ReactDOM.unmountComponentAtNode(div)
    if (unmountResult && div.parentNode) {
      div.parentNode.removeChild(div)
    }
  }

  function render() {
    setTimeout(() => {
      ReactDOM.render(
        <ConfirmDialog {...props} destroy={destroy} />,
        div
      )
    })
  }

  render()

  return null
}

function ConfirmDialog(props) {
  const { title, content, destroy } = props
  const [visible, setVisible] = useState(true)
  return (
    <Modal
      maskClosable
      visible={visible}
      title={title}
      footer={null}
      onCancel={() => {
        setVisible(false)
        destroy()
      }}
    >
      {content}
    </Modal>
  )
}
