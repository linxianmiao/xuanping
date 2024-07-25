import React, { useState } from 'react'
import { Modal, Form, Radio, Input, message, Select, Checkbox } from '@uyun/components'

import RollbackConfig from './RollbackConfig'
import RemoteTicketConfig from './RemoteTicketConfig'
import { changRecordInfo, getUuid } from './logic'
import LazySelect from '~/components/lazyLoad/lazySelect'

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 }
}

const ROLLBACK = 'rollback'
const REMOTETICKET = 'remote_ticket'
const btnMaxLength = 10
const suggestionLength = 20
const { Option } = Select

// 配置附属信息（处理意见，关联名称等）
const ConfigSubInfo = ({
  record,
  buttonList,
  children,
  fixedRollbackTache,
  onChange,
  coOperation
}) => {
  const { label, defaultAntonym, type, activityFlowId } = record
  const [visible, setVisible] = useState(false)
  const [info, setInfo] = useState(record)

  const rollbackTacheValue = info.rollbackTache
    ? {
        key: info.rollbackTache.rollbackTacheId,
        label: info.rollbackTache.rollbackTacheName
      }
    : undefined
  return (
    <>
      <a
        onClick={() => {
          setVisible(true)
          setInfo(record)
        }}
      >
        {children}
      </a>
      <Modal
        visible={visible}
        title={`${label}按钮配置`}
        onCancel={() => {
          setVisible(false)
          setInfo({ ...record })
        }}
        onOk={() => {
          // 驳回 定点回退
          if (info.rejectType === 4 && !info.rollbackTache) {
            message.error('请选择回退节点')
            return false
          }
          // 回退按钮：定点回退时，回退节点不能为空
          if (info.rollbackWay === 2 && !info.rollbackTache) {
            message.error('请选择回退节点')
            return false
          }
          // 远程工单：选择固定节点，则租户必选
          if (
            type === REMOTETICKET &&
            info.remoteNodeMode === 0 &&
            (!info.remoteNodeInfos || info.remoteNodeInfos.length === 0)
          ) {
            message.error('请选择租户')
            return false
          }
          const value = changRecordInfo(buttonList, getUuid(activityFlowId, type), info, record)
          onChange(value)
          setVisible(false)
        }}
      >
        {type !== 'CoOrganizer' && (
          <>
            <Form.Item {...formItemLayout} label="处理意见">
              <Radio.Group
                value={info.isRequiredHandingSuggestion}
                onChange={(e) => {
                  info.isRequiredHandingSuggestion = e.target.value
                  setInfo({ ...info })
                }}
              >
                <Radio value={0}>{'选填'}</Radio>
                <Radio value={1}>{'必填'}</Radio>
                <Radio value={2}>{'隐藏'}</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item {...formItemLayout} label="处理意见重命名">
              <Input
                placeholder={'处理意见'}
                maxLength={suggestionLength}
                value={info.dealSuggestionText}
                onChange={(e) => {
                  info.dealSuggestionText = e.target.value
                  setInfo({ ...info })
                }}
              />
            </Form.Item>
          </>
        )}

        {defaultAntonym && (
          <Form.Item {...formItemLayout} label="关联按钮重命名">
            <Input
              placeholder={defaultAntonym}
              maxLength={btnMaxLength}
              value={info.buttonNameAntonym}
              onChange={(e) => {
                info.buttonNameAntonym = e.target.value
                setInfo({ ...info })
              }}
            />
          </Form.Item>
        )}
        {type === ROLLBACK && (
          <Form.Item {...formItemLayout} label="回退规则">
            <RollbackConfig
              record={info}
              fixedRollbackTache={fixedRollbackTache}
              onChange={(field, value) => {
                info[field] = value
                setInfo({ ...info })
              }}
            />
          </Form.Item>
        )}
        {type === REMOTETICKET && (
          <Form.Item {...formItemLayout} label="远程工单规则">
            <RemoteTicketConfig
              record={info}
              onChange={(field, value) => {
                info[field] = value
                setInfo({ ...info })
              }}
            />
          </Form.Item>
        )}
        {type === 'reject' && (
          <Form.Item {...formItemLayout} label="按钮操作相应">
            <Select
              style={{ width: 150, marginRight: 8 }}
              value={info.rejectType}
              placeholder={i18n('globe.select', '请选择')}
              onSelect={(val) => {
                info.rejectType = val
                setInfo({ ...info })
              }}
            >
              <Option key={1} value={1}>
                {i18n('conf.model.rollback.option2', '逐级回退')}
              </Option>
              <Option key={2} value={2}>
                {i18n('globe.submit', '提交')}
              </Option>
              <Option key={3} value={3}>
                {i18n('globe.close', '关闭')}
              </Option>
              <Option key={4} value={4}>
                定点回退
              </Option>
            </Select>
            {info.rejectType === 4 && (
              <Select
                placeholder={'请选择节点'}
                style={{ width: 150 }}
                labelInValue
                value={rollbackTacheValue}
                onChange={(e) => {
                  const rollbackTache = {
                    rollbackTacheId: e.value,
                    rollbackTacheName: e.label
                  }
                  setInfo((prev) => ({
                    ...prev,
                    rollbackTache
                  }))
                }}
              >
                {fixedRollbackTache.map((item) => (
                  <Select.Option key={item.id} value={item.id}>
                    {item.text}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
        )}

        {type === 'remote_roll_back' && (
          <Form.Item {...formItemLayout} label="回退规则">
            <Select
              value={info.rollbackWay || 1}
              placeholder={i18n('globe.select', '请选择')}
              onSelect={(val) => {
                info.rollbackWay = val
                setInfo({ ...info })
              }}
            >
              <Option key={1} value={1}>
                自由回退
              </Option>
              <Option key={3} value={3}>
                回退到发起方开始环节
              </Option>
            </Select>
          </Form.Item>
        )}
        {type === 'CoOrganizer' && (
          <Form.Item {...formItemLayout} label="关联模型">
            <LazySelect
              mode="multiple"
              value={coOperation.coOrganizerModels || []}
              onChange={(value) => {
                coOperation.handleChange('coOrganizerModels', value)
              }}
              placeholder={i18n('pl_select_modal', '请选择模型')}
              getList={coOperation.getList}
            />
          </Form.Item>
        )}
      </Modal>
    </>
  )
}

ConfigSubInfo.defaultProps = {
  record: {},
  buttonList: [],
  children: '',
  fixedRollbackTache: [],
  onChange: () => {}
}

export default ConfigSubInfo
