import React from 'react'
import classnames from 'classnames'
import { Modal, Form } from '@uyun/components'
const FormItem = Form.Item

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 12 }
}

const getNotifyNames = (list) => {
  return _.map(list, (item) => item.name).toString()
}
export default function EntrustMessage(props) {
  const { details, onChangeEntrustmessage, currentTab } = props
  const {
    modelName,
    auditorName,
    consigneeName,
    entrustStatus,
    beginTime,
    endTime,
    entrustStatusDesc,
    auditStatus,
    auditStatusDesc,
    consignorName,
    createTime,
    entrustReason,
    notifyType
  } = details || {}
  return (
    <Modal
      title="委托详情"
      destroyOnClose
      maskClosable
      footer={null}
      visible={Boolean(details)}
      onCancel={() => {
        onChangeEntrustmessage()
      }}
    >
      <Form>
        {currentTab !== 'Entrust-force' && (
          <FormItem {...formItemLayout} label="模型名称">
            {modelName}
          </FormItem>
        )}
        <FormItem {...formItemLayout} label="被委托人">
          {consigneeName}
        </FormItem>
        <FormItem {...formItemLayout} label="通知方式">
          {getNotifyNames(notifyType)}
        </FormItem>
        <FormItem {...formItemLayout} label="委托开始时间">
          {beginTime}
        </FormItem>
        <FormItem {...formItemLayout} label="委托结束时间">
          {endTime}
        </FormItem>
        <FormItem {...formItemLayout} label="委托状态">
          <span
            className={classnames('entrust-status-desc', {
              bg0: entrustStatus === 0,
              bg1: entrustStatus === 1,
              bg2: entrustStatus === 2
            })}
          >
            {' '}
            {entrustStatusDesc}
          </span>
        </FormItem>
        {currentTab !== 'Entrust-force' && (
          <FormItem {...formItemLayout} label="审核状态">
            <span
              className={classnames('audit-status-desc', {
                bg0: auditStatus === 0,
                bg1: auditStatus === 1,
                bg2: auditStatus === 2
              })}
            >
              {auditStatusDesc}
            </span>
          </FormItem>
        )}
        <FormItem {...formItemLayout} label="委托人">
          {consignorName}
        </FormItem>
        {currentTab !== 'Entrust-force' && (
          <FormItem {...formItemLayout} label="审核人">
            {auditorName}
          </FormItem>
        )}
        <FormItem {...formItemLayout} label="委托创建时间">
          {createTime}
        </FormItem>
        <FormItem {...formItemLayout} label="委托理由">
          {entrustReason}
        </FormItem>
      </Form>
    </Modal>
  )
}
