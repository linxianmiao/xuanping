import React, { useState, useCallback, useEffect } from 'react'
import { Input, Select, Button, Row, Col, Form, DatePicker, Modal } from '@uyun/components'
import { DownOutlined } from '@uyun/icons'
import LazySelect from '~/components/lazyLoad/lazySelect'
import Export from '../components/ExportProcessOla'
import UserPicker from '~/components/userPicker'
import classnames from 'classnames'
import moment from 'moment'
import styles from '../index.module.less'

const Search = Input.Search
const Option = Select.Option
const FormItem = Form.Item
const RangePicker = DatePicker.RangePicker
const formItemLayout = { labelCol: { span: 6 }, wrapperCol: { span: 18 } }
const timeFormat = 'YYYY-MM-DD HH:mm:ss'

const Header = ({
  configAuthor = {},
  list = [], // 列表数据
  selectedRowKeys = [],
  deleteLoading,
  onDelete,
  values = {},
  onFieldChange = () => {},
  onFieldsChange = () => {},
  onSubmit = () => {}
}) => {
  const {
    keyword,
    olaType,
    olaStatus,
    startTime,
    endTime,
    overdueStatus,
    modelId,
    activityIds,
    executionDepart = undefined
  } = values
  const [visible, setVisible] = useState(false)
  const [selectedModel, setSelectedModel] = useState(undefined)

  const getModels = useCallback(async (query, callback) => {
    const res = (await axios.get(API.queryAuthModelList, { params: query })) || {}
    let list = res.list || []

    list = list.map((item) => ({ id: item.processId, name: item.processName }))
    callback(list)
  }, [])

  const getActivitys = async (query, callback) => {
    const res =
      (await axios.get(API.queryActivityDataList, {
        params: { ...query, modelIds: selectedModel.key }
      })) || []

    const list = res.map((item) => ({ id: item.activityId, name: item.activityName }))
    callback(list)
  }

  const getSelectedModel = useCallback(async (modelId) => {
    const res = await axios.get(API.getBaseModel(modelId))
    if (res) {
      setSelectedModel({ key: res.id, label: res.name })
    }
  }, [])

  useEffect(() => {
    if (modelId && !selectedModel) {
      getSelectedModel(modelId)
    }
  }, [modelId])

  const handleDelete = () => {
    Modal.confirm({
      title: '确认删除选中的OLA执行记录？',
      onOk: async () => {
        await onDelete()
      }
    })
  }

  return (
    <div style={{ paddingBottom: 12 }}>
      <Search
        style={{ width: 256 }}
        placeholder={i18n('globe.keywords', '请输入关键字')}
        allowClear
        enterButton
        value={keyword}
        onChange={(e) => onFieldChange(e.target.value, 'keyword')}
        onClear={() => onFieldChange(undefined, 'keyword', true)}
        onSearch={() => onSubmit()}
      />
      <Select
        style={{ width: 200, marginLeft: 10 }}
        placeholder="请选择OLA类型"
        allowClear
        value={olaType}
        onChange={(value) => onFieldChange(value, 'olaType', true)}
      >
        <Option key="0" value={0}>
          工单响应
        </Option>
        <Option key="1" value={1}>
          工单处理
        </Option>
        <Option key="2" value={2}>
          节点总时长
        </Option>
      </Select>
      <Select
        style={{ width: 200, marginLeft: 10 }}
        placeholder="请选择任务状态"
        allowClear
        value={olaStatus}
        onChange={(value) => onFieldChange(value, 'olaStatus', true)}
      >
        <Option key="0" value={0}>
          待执行
        </Option>
        <Option key="1" value={1}>
          执行中
        </Option>
        <Option key="2" value={2}>
          已完成
        </Option>
      </Select>
      {/* 更多筛选按钮 */}
      <div
        className={classnames(styles.moreBtn, { [styles.active]: visible })}
        style={{ marginLeft: 10 }}
        onClick={() => setVisible(!visible)}
      >
        <span>{i18n('ticket.list.filter', '更多筛选')}</span>
        <DownOutlined />
      </div>

      <div style={{ float: 'right' }}>
        {configAuthor.olaRecordExport && (
          <Export ids={selectedRowKeys} source="ola" disabled={list.length === 0} />
        )}
        {configAuthor.olaRecordDelete && (
          <Button
            style={{ marginLeft: 8 }}
            loading={deleteLoading}
            onClick={handleDelete}
            disabled={selectedRowKeys.length === 0}
            type="default"
          >
            删除
          </Button>
        )}
      </div>

      {/* 更多筛选按钮下拉框 */}
      {visible && (
        <div className={styles.moreWrap}>
          <Row gutter={20}>
            <Col span={8}>
              <FormItem label={i18n('start.time', '开始时间')} {...formItemLayout}>
                <RangePicker
                  style={{ width: '100%' }}
                  size="small"
                  showTime
                  value={
                    _.isEmpty(startTime) ? startTime : [moment(startTime[0]), moment(startTime[1])]
                  }
                  onChange={(date) => {
                    const value = _.isEmpty(date)
                      ? undefined
                      : [date[0].format(timeFormat), date[1].format(timeFormat)]
                    onFieldChange(value, 'actualStartTime')
                  }}
                />
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label={i18n('end.time', '结束时间')} {...formItemLayout}>
                <RangePicker
                  style={{ width: '100%' }}
                  size="small"
                  showTime
                  value={_.isEmpty(endTime) ? endTime : [moment(endTime[0]), moment(endTime[1])]}
                  onChange={(date) => {
                    const value = _.isEmpty(date)
                      ? undefined
                      : [date[0].format(timeFormat), date[1].format(timeFormat)]
                    onFieldChange(value, 'actualEndTime')
                  }}
                />
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label="是否逾期" {...formItemLayout}>
                <Select
                  size="small"
                  placeholder="请选择逾期状态"
                  allowClear
                  value={overdueStatus}
                  onChange={(value) => onFieldChange(value, 'overdueStatus')}
                >
                  <Option key="1" value={1}>
                    未逾期
                  </Option>
                  <Option key="2" value={2}>
                    已逾期
                  </Option>
                  <Option key="3" value={3}>
                    逾期已恢复
                  </Option>
                </Select>
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label={i18n('sla_ticket_type', '工单类型')} {...formItemLayout}>
                <LazySelect
                  placeholder="请选择工单类型"
                  size="small"
                  getList={getModels}
                  value={selectedModel}
                  onChange={(value) => {
                    setSelectedModel(value)
                    onFieldChange(value ? value.key : undefined, 'modelId')
                  }}
                />
              </FormItem>
            </Col>

            <Col span={8}>
              <FormItem label="当前阶段" {...formItemLayout}>
                <LazySelect
                  placeholder="请选择当前阶段"
                  size="small"
                  disabled={!selectedModel}
                  labelInValue={false}
                  mode="multiple"
                  getList={getActivitys}
                  value={activityIds}
                  onChange={(value) => {
                    onFieldChange(value, 'activityIds')
                  }}
                />
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label="处理人/组" {...formItemLayout}>
                <UserPicker
                  selectionType="radio"
                  tabs={[0, 1]}
                  showTypes={['groups', 'users']}
                  onChange={(user) => {
                    if (user && user.length > 0) {
                      if (user[0]?.type === 0) {
                        onFieldsChange({ executionGroup: user[0].id, executor: undefined })
                      } else {
                        onFieldsChange({ executor: user[0].id, executionGroup: undefined })
                      }
                    } else {
                      if (values.executor) {
                        onFieldChange('', 'executor')
                      } else {
                        onFieldChange('', 'executionGroup')
                      }
                    }
                  }}
                />
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label="处理部门" {...formItemLayout}>
                <UserPicker
                  selectionType="radio"
                  tabs={[2]}
                  showTypes={['departs_custom']}
                  modalTitle={'部门选择'}
                  value={executionDepart ? [executionDepart] : []}
                  onChange={(depart) => {
                    if (depart && depart.length > 0) {
                      onFieldChange(depart[0].id, 'executionDepart')
                    } else {
                      onFieldChange(undefined, 'executionDepart')
                    }
                  }}
                />
              </FormItem>
            </Col>
          </Row>
          <div className={styles.btns}>
            <Button type="primary" size="small" onClick={() => onSubmit()}>
              {i18n('globe.search', '查询')}
            </Button>
            <Button
              size="small"
              style={{ marginLeft: 10 }}
              onClick={() => {
                onFieldsChange({
                  startTime: undefined,
                  endTime: undefined,
                  overdueStatus: undefined,
                  modelId: undefined,
                  activityIds: undefined,
                  executionDepart: undefined
                })
                setSelectedModel(undefined)
              }}
            >
              {i18n('globe.reset', '重置')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Header
