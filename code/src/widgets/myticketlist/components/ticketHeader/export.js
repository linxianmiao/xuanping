import React, { Component } from 'react'
import { qs } from '@uyun/utils'
import jstz from 'jstz'
import { inject } from '@uyun/core'
import { observer } from 'mobx-react'
import { Modal, Form, Select, Radio, Progress, message } from '@uyun/components'
import { TicketlistStore } from '../../ticketlist.store'
const removeFilter = [
  'extraParams',
  'modelId',
  'wd',
  'executor',
  'creator',
  'priority',
  'source',
  'status',
  'overdue',
  'filterOrg',
  'participantsDepartIds',
  'modelAndTacheId',
  'executionGroup',
  'name',
  'viewName',
  'viewId',
  'extParams',
  'create_time',
  'update_time',
  'orderBy',
  'sortRule',
  'filterType',
  'orderRule',
  'lockCondition'
]
const defaultFilter = [
  'modelId',
  'executor',
  'creator',
  'priority',
  'source',
  'status',
  'overdue',
  'create_time',
  'update_time',
  'filterOrg',
  'participantsDepartIds',
  'modelAndTacheId',
  'executionGroup',
  'wd',
  'ticketName',
  'ticketNum',
  'orderBy',
  'sortRule'
]

const momentArrayToStringArray = (times) => {
  const format = 'YYYY-MM-DD HH:mm:ss'
  if (_.isEmpty(times)) {
    return []
  }
  if (_.isString(times)) {
    return [times]
  }
  if (['CurrentDay', 'CurrentWeek', 'CurrentMonth'].includes(_.head(times))) {
    return times
  }

  return [
    // moment(times[0])
    //   .startOf('day')
    //   .format(format),
    // moment(times[1])
    //   .endOf('day')
    //   .format(format)
    times[0],
    times[1]
  ]
}
const detailTime = (query, allField) => {
  let list = []
  if (_.isArray(allField)) {
    list = allField
  } else {
    const { builtinFields, extendedFields } = allField || {
      builtinFields: [],
      extendedFields: []
    }
    list = [...builtinFields, ...extendedFields]
  }
  const timeList = [
    'create_time',
    'update_time',
    ..._.chain(list)
      .filter((item) => item.type === 'dateTime')
      .map((item) => item.code)
      .value()
  ]
  const timeObj = _.reduce(
    timeList,
    (sum, item) => {
      if (_.has(query, item)) {
        const time = momentArrayToStringArray(query[item])
        return { ...sum, [item]: time }
      }
      return sum
    },
    {}
  )
  return _.assign({}, query, timeObj)
}
const FormItem = Form.Item
const Option = Select.Option
const RadioGroup = Radio.Group
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 }
}

const conversion = (item) => {
  if (item === 'ticketName') return 'title'
  if (item === 'priority') return 'urgentLevel'
  return item
}

// 对filterType进行特殊处理，将个人待办和组内待办转化为todo
function getQueryFilterType(filterType) {
  if (_.includes(['myToDo', 'groupTodo'], filterType)) {
    return 'todo'
  } else if (_.includes(['mycheck'], filterType)) {
    return 'approve'
  } else if (_.includes(['todoGroup'], filterType)) {
    return 'todo_group'
  }
}
// 对value进行判断，过滤掉空数组，空对象，假值等
function isTrue(value, key) {
  if (_.isObject(value)) {
    return !_.isEmpty(value)
  }
  return Boolean(value) || value === 0
}

@observer
class TicketListExport extends Component {
  @inject(TicketlistStore) store
  state = {
    percent: 0
  }

  componentDidMount() {
    console.log(this.props, '---onSelectedRow---')
  }

  // 提交任务
  handleOk = async () => {
    const { selectedRowKeys } = this.props
    let { ticketList, query, filterType, attributeList, allField, columnSelectedList } = this.store

    // 添加筛选项的数据按需加载，如果直接导出，不知道对应code的type类型，无法特殊处理时间字段，
    // allField.builtinFields 为空时，通过请求获取query对应的类型
    if (_.isEmpty(allField?.builtinFields)) {
      const res = await this.store.queryFieldInfosByCodes({
        codes: _.keys(query).toString()
      })
      query = detailTime(query, res)
    } else {
      query = detailTime(query, allField)
    }

    const filter = _.pickBy(_.pick(query, defaultFilter), isTrue)
    // const extraFilter = _.pick(_.omit(query, removeFilter), _.identity)
    const extraFilter = _.omit(query, removeFilter)
    // 对filter的filterType进行转化
    filter.filterType = getQueryFilterType(filterType)

    const { exportContent, exportInfo, compression, onlyColumnFields } =
      this.props.form.getFieldsValue()
    const timeZone = jstz.determine().name()
    const exportValues = {
      exportContent,
      exportInfo,
      compression,
      timeZone,
      onlyColumnFields: Boolean(onlyColumnFields), // 是否仅导出定制列字段
      archived: filterType === 'archived' ? '1' : '0', // 是否归档
      columns: _.chain(Boolean(onlyColumnFields) ? this.store.checkedColumnCodes : attributeList)
        .map((item) => conversion(item))
        .uniq()
        .value(),
      query: JSON.stringify(_.assign({}, filter, { extParams: extraFilter }))
    }
    if (exportContent === '1') {
      exportValues.tickets = _.map(selectedRowKeys, (item) => item.substr(0, 32))
    }
    if (exportContent === '2') {
      exportValues.tickets = _.map(ticketList, (ticket) => ticket.ticketId.substr(0, 32))
    }
    const exportId = await this.store.exportTicketList(exportValues)

    if (exportId) {
      this.timer = setTimeout(() => {
        this.getExportProgress(exportId, compression)
      }, 0.01 * 1000)
      this.props.handleExportCancle('process')
    }
  }

  // 获取进度
  getExportProgress = async (exportId, compression) => {
    const res = await this.store.getExportProgress(exportId)
    if (res && Number(res) <= 100) {
      if (res === '100') {
        this.setState({ percent: res })
        clearInterval(this.timer)
        this.timer = null
        this.props.handleExportCancle(undefined)
        this.downloadExcel(exportId, compression)
      } else {
        this.setState({ percent: res })
        this.timer = setTimeout(() => {
          this.getExportProgress(exportId, compression)
        }, 0.5 * 1000)
      }
    } else {
      clearInterval(this.timer)
      this.timer = null
      this.props.handleExportCancle(undefined)
    }
  }

  // 下载
  downloadExcel = (exportId, compression) => {
    const exportUrl = `/itsm/api/v2/ticket/getExportExcel?${qs.stringify(
      { exportId, compression },
      { indices: false }
    )}`
    Modal.success({
      title: '导出成功，正在下载文件...',
      content: (
        <div>
          <p className="export-ticket-list-tip1">{'如未自动下载，请手动点击文件名下载'}</p>
          <a
            onClick={() => {
              this.iframeDownLoad(exportUrl)
            }}
          >
            {compression === '1' ? `${'工单'}.zip` : `${'工单'}.xlsx`}
          </a>
        </div>
      )
    })

    this.iframeDownLoad(exportUrl)
    //将已勾选的数据清空
    setTimeout(() => {
      this.props.reload('clear')
      //   this.props.listStore.resetSelected()
    }, 300)
  }

  iframeDownLoad = (exportUrl) => {
    this.setState({ percent: 0 })
    // 使用iframe导出
    let iframe = document.getElementById('ticketListDownLoadIframe')
    if (!iframe) {
      iframe = document.createElement('iframe')
      iframe.setAttribute('id', 'ticketListDownLoadIframe')
      iframe.setAttribute('width', '0')
      iframe.setAttribute('height', '0')
      document.body.appendChild(iframe)
    }
    iframe.setAttribute('src', exportUrl)
  }

  render() {
    const { visible, selectedRowKeys } = this.props
    const { getFieldDecorator } = this.props.form
    // const { selectedRowKeys } = this.props.listStore
    const { percent } = this.state
    return (
      <Modal
        visible={Boolean(visible)}
        title={'导出工单'}
        onOk={this.handleOk}
        confirmLoading={visible === 'process'}
        onCancel={() => {
          if (visible === 'process') {
            message.error('正在导出中，请耐心等待')
            return false
          }
          this.props.handleExportCancle(undefined)
        }}
      >
        {visible === 'form' && (
          <Form>
            <FormItem {...formItemLayout} label={'导出内容'}>
              {getFieldDecorator('exportContent', {
                initialValue: _.isEmpty(selectedRowKeys) ? '2' : '1',
                rules: [
                  {
                    required: true
                  }
                ]
              })(
                <Select>
                  <Option disabled={_.isEmpty(selectedRowKeys)} value="1">
                    {'已勾选工单'}
                  </Option>
                  <Option value="2">{'当前页工单'}</Option>
                  <Option value="3">{'所有工单'}</Option>
                </Select>
              )}
            </FormItem>
            <FormItem {...formItemLayout} label={'导出信息'}>
              {getFieldDecorator('exportInfo', {
                initialValue: ['1']
              })(
                <Select mode="multiple">
                  <Option value="1" disabled>
                    {'工单详情'}
                  </Option>
                  <Option value="2">{'处理记录'}</Option>
                  <Option value="3">{'评论数据'}</Option>
                </Select>
              )}
            </FormItem>
            <FormItem {...formItemLayout} label={'自动压缩'}>
              {getFieldDecorator('compression', {
                initialValue: '0'
              })(
                <RadioGroup>
                  <Radio value="1">{'是'}</Radio>
                  <Radio value="0">{'否'}</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem {...formItemLayout} label={'仅展示字段'}>
              {getFieldDecorator('onlyColumnFields', {
                initialValue: 1
              })(
                <RadioGroup disabled>
                  <Radio value={1}>{'是'}</Radio>
                  <Radio value={0}>{'否'}</Radio>
                </RadioGroup>
              )}
            </FormItem>
          </Form>
        )}
        {visible === 'process' && <Progress percent={Number(percent)} />}
      </Modal>
    )
  }
}
export default Form.create()(TicketListExport)
