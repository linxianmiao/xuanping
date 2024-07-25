import React, { useState } from 'react'
import { InfoCircleFilled } from '@uyun/icons'
import { Button, Modal, AltForm as Form } from '@uyun/components'
import { MentionEditor } from '~/ticket/mention/MentionWithOption'
import axios from 'axios'

export default function MyApproveButton({
  children,
  approvalResult,
  ticketIdList,
  tacheIdList,
  disabled,
  reload
}) {
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm() // 创建表单实例

  const [isSaving, setIsSaving] = useState(false)
  const onOk = () => {
    form
      .validateFields()
      .then((values) => {
        setIsSaving(true)

        axios
          .post('/itsm/api/v2/ticket/batchApproveTicket', {
            ticketIdMap: {
              ticketIdList,
              tacheIdList
            },
            approvalResult, //1：同意   2：驳回
            message: {
              content: values.message
            }
          })
          .then((res) => {
            if (res) {
              setOpen(false)
              reload()
            }
          })
          .finally(() => {
            setIsSaving(false)
            form.resetFields()
          })
        setOpen(false)
      })
      .catch((info) => {
        console.log('Validate Failed:', info)
      })
  }
  return (
    <>
      <Button onClick={() => setOpen(true)} disabled={disabled} type="default">
        {children}
      </Button>

      <Modal
        okButtonProps={{
          loading: isSaving
        }}
        onCancel={() => {
          setOpen(false)
          form.resetFields()
        }}
        onOk={onOk}
        title={false}
        closable={false}
        open={open}
      >
        <p style={{ fontSize: 16, textAlign: 'center', fontWeight: 500, marginBottom: 40 }}>
          <InfoCircleFilled style={{ color: '#FFCD3D', marginRight: 8 }} />
          {`批量${children}${ticketIdList.length}条流程单`}
        </p>
        <Form form={form}>
          <Form.Item rules={[{ required: true }]} name="message" label="意见">
            <MentionEditor />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
