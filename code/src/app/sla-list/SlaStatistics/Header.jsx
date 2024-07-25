import React, { useState, useCallback, useEffect } from 'react'
import { Input, Select, Button, Row, Col, Form, DatePicker, Modal } from '@uyun/components'
import { DownOutlined } from '@uyun/icons'
import LazySelect from '~/components/lazyLoad/lazySelect'
import Export from '../components/Export'
import classnames from 'classnames'
import moment from 'moment'
import { getSlaStatusName } from '~/logic/olaAndSla'
import styles from '../index.module.less'

const Search = Input.Search
const Option = Select.Option
const FormItem = Form.Item
const RangePicker = DatePicker.RangePicker
const formItemLayout = { labelCol: { span: 6 }, wrapperCol: { span: 18 } }
const timeFormat = 'YYYY-MM-DD HH:mm:ss'

const Header = ({
  configAuthor,
  list = [],
  selectedRowKeys = [],
  deleteLoading,
  onDelete,
  values = {},
  onFieldChange = () => {},
  onFieldsChange = () => {},
  onSubmit = () => {}
}) => {
  const { keyword, strategyId, status, startTime, endTime, overdueStatus } = values
  const [visible, setVisible] = useState(false)
  const [selectedStrategy, setSelectedStrategy] = useState(undefined)

  const getSlaStrategy = useCallback(async (query, callback) => {
    const { pageNo, pageSize, ...rest } = query
    const params = { page_num: pageNo, page_size: pageSize, ...rest }
    const res = (await axios.get(API.getPolicyList, { params })) || {}
    let list = res.strategy_list || []

    list = list.map((item) => ({ name: item.name, id: item.id }))
    callback(list)
  }, [])

  const getSelectedStrategy = useCallback(async (id) => {
    const res = await axios.get(API.get_strategy_policy, { params: { id } })
    if (res) {
      setSelectedStrategy({ key: res.id, label: res.name })
    }
  }, [])

  useEffect(() => {
    if (strategyId && !selectedStrategy) {
      getSelectedStrategy(strategyId)
    }
  }, [strategyId])

  const handleDelete = () => {
    Modal.confirm({
      title: '确认删除选中的SLA执行记录？',
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
      <LazySelect
        style={{ width: 200, marginLeft: 10 }}
        placeholder="请选择SLA策略"
        getList={getSlaStrategy}
        value={selectedStrategy}
        onChange={(value) => {
          setSelectedStrategy(value)
          onFieldChange(value ? value.key : undefined, 'strategyId', true)
        }}
      />
      <Select
        style={{ width: 200, marginLeft: 10 }}
        placeholder="请选择任务状态"
        allowClear
        value={status}
        onChange={(value) => onFieldChange(value, 'status', true)}
      >
        <Option key="0" value={0}>
          {getSlaStatusName(0)}
        </Option>
        <Option key="1" value={1}>
          {getSlaStatusName(1)}
        </Option>
        <Option key="2" value={2}>
          {getSlaStatusName(2)}
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
        {configAuthor.slaRecordExport && (
          <Export ids={selectedRowKeys} source="sla" disabled={list.length === 0} />
        )}
        {configAuthor.slaRecordDelete && (
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
                    onFieldChange(value, 'startTime')
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
                    onFieldChange(value, 'endTime')
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
                  <Option key="0" value={0}>
                    未逾期
                  </Option>
                  <Option key="1" value={1}>
                    已逾期
                  </Option>
                  <Option key="2" value={2}>
                    逾期已恢复
                  </Option>
                </Select>
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
                  overdueStatus: undefined
                })
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
