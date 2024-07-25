import React, { Component } from 'react'
import { withRouter, Link } from 'react-router-dom'
import { store as runtimeStore } from '@uyun/runtime-react'
import {
  Button,
  Tooltip,
  message,
  Table,
  Modal,
  Input,
  Pagination,
  Select,
  Tag,
  Drawer
} from '@uyun/components'
import LazySelect from '~/components/lazyLoad/lazySelect'
import { attributeRelate } from '~/list/config/attribute'
import { inject, observer } from 'mobx-react'
import * as mobx from 'mobx'
import moment from 'moment'
import CreateTicket from '../../create-ticket/create'
import TicketTemp from '~/components/TicketTemp'
import DetailDrawer from '~/details/DetailDrawer'
import './styles/index.less'
import CustomColumn from './customColumn'
import TicketDate from '~/components/TicketDate'
import { parseTagsDataToArray } from '~/utils/common'
import { qs } from '@uyun/utils'
const Search = Input.Search
const TD_WIDTH = 150
@inject('ticketStore', 'processListStore', 'createStore', 'globalStore', 'tableListStore')
@withRouter
@observer
class RelateTicket extends Component {
  static defaultProps = {
    source: '', // form:来自表单中的关联工单控件
    formList: {},
    onClose: () => {}
  }

  state = {
    width: 1000,
    subDetailRoute: null, // 侧滑详情的路由数据
    title: '',
    currentProcess: undefined,
    wd: '', // 关键字
    allTickets: [], // 所有的工单列表
    ticketSelect: '', // 当前选中的工单
    visible: false,
    show: false,
    pageNum: 10,
    pageSize: 1,
    total: 0,
    selectedRowKeys: [],
    modelvisible: false,
    processId: '',
    modelColumns: [
      {
        title: i18n('tip17', '工单标题'),
        dataIndex: 'ticketName',
        key: 'ticketName'
      },
      {
        title: i18n('conf.model.ruleLength', '流水号'),
        dataIndex: 'ticketNum',
        key: 'ticketNum'
      },
      {
        title: i18n('layout_model', '模型'),
        dataIndex: 'processName',
        key: 'processName'
      },
      {
        title: i18n('ticket.list.tacheName', '当前节点'),
        dataIndex: 'tacheName',
        key: 'tacheName'
      },
      {
        title: i18n('tip23', '工单状态'),
        dataIndex: 'status',
        key: 'status',
        render: (text) => {
          const { name, color } = this._renderStatus(text)
          return (
            <span className="ticket-list-table-th-status">
              <i style={{ background: color }} />
              {name}
            </span>
          )
        }
      },
      {
        title: i18n('ticket.relateTicket.handle', '处理组/人'),
        dataIndex: 'user',
        key: 'user',
        render: (text, record) => {
          const data = _.concat(record.excutors || [], record.executionGroup || [])
          return data.join(',')
        }
      },
      {
        title: i18n('ticket.list.creatorTime', '创建时间'),
        dataIndex: 'creatorTime',
        key: 'creatorTime',
        render: (text) => {
          return moment(text).utc(moment(text).zone()).format('YYYY-MM-DD HH:mm')
        }
      }
    ]
  }

  currentTicketId = '' // 判断工单id是否变化，确定是否要请求数据

  createTicket = React.createRef()

  componentDidMount() {
    this.getRelateTicket()
    const ticketId = window.location.href.includes('createTicket')
      ? this.props.createStore.ticketId
      : this.props.id
    this.currentTicketId = ticketId
    this.disposer = mobx.reaction(
      () => {
        return this.props.ticketStore.ticketcolumns
      },
      (data) => {
        const { caseIds, codes } = data
        if (!_.isEmpty(codes)) {
          this.props.ticketStore.getTicketFormData(caseIds, codes)
        }
      }
    )

    this.setState({ width: document.getElementById('ticket-froms-relevance')?.offsetWidth })
    window.addEventListener('resize', this.handleWindowResize)

    const { source, models } = this.props
    if (
      source === 'relateTicketNum' &&
      !_.isEmpty(models) &&
      Array.isArray(models) &&
      models.length === 1
    ) {
      this.handleMenuClick(models[0]?.id)
    }
  }

  componentWillUnmount() {
    this.disposer()
    window.removeEventListener('resize', this.handleWindowResize)
  }

  handleWindowResize = () => {
    this.setState({ width: document.getElementById('ticket-froms-relevance')?.offsetWidth })
  }

  componentDidUpdate(prevProps) {
    // 因为关联工单tab是直接渲染的，所以请求要经过这些判断
    const ticketId = window.location.href.includes('createTicket')
      ? this.props.createStore.ticketId
      : this.props.id
    const isTicketIdDiff = ticketId !== this.currentTicketId
    const isActiveKeyDiff =
      this.props.activeKey === '3' && prevProps.activeKey !== this.props.activeKey
    // 工单id改变时，表单中的关联工单控件要重新请求数据
    if (
      isTicketIdDiff &&
      (isActiveKeyDiff || this.props.source === 'form' || this.props.source === 'relateTicketNum')
    ) {
      this.getRelateTicket()
      this.currentTicketId = ticketId
      // 工单id改变，关联工单定制列初始化
      this.props.ticketStore.setSelectedList(attributeRelate, 'RELATE')
    }
  }

  _renderStatus = (text) => {
    let name = ''
    let color = ''
    switch (text) {
      case 2:
        name = i18n('ticket.list.status_2', '处理中')
        color = '#30d85c'
        break // 处理中
      case 3:
        name = i18n('ticket.list.status_3', '已完成')
        color = '#0549c5'
        break // 已完成
      case 7:
        name = i18n('ticket.list.status_7', '已关闭')
        color = '#24cbac'
        break // 已关闭
      case 10:
        name = i18n('ticket.list.status_10', '挂起')
        color = '#ec4e53'
        break // 挂起
      case 11:
        name = i18n('ticket.list.status_11', '已废除')
        color = '#ec4e53'
        break // 已废除
      case 12:
        name = i18n('ticket.list.status_12', '已处理')
        color = '#0549c5'
        break // 已处理
      case 13:
        name = i18n('ticket.list.status_13', '已归档')
        color = '#0549c5'
        break // 已归档
      default:
        name = i18n('ticket.list.status_1', '待处理')
        color = '#4abafd'
        break // 待处理
    }
    return { name, color }
  }

  onSelectChange = (selectedRowKeys) => {
    if (selectedRowKeys.length > 100) {
      message.error(i18n('ticket.relate.restrict'))
      return
    }
    this.setState({ selectedRowKeys })
  }

  handleSearch = (value) => {
    this.setState(
      {
        pageSize: 10,
        pageNum: 1,
        wd: value
      },
      () => {
        this.getallTicket()
      }
    )
  }

  // 获取所有可以关联的工单列表
  getallTicket = () => {
    const { field = {} } = this.props
    let modelId = Array.isArray(field?.relateModelsScope)
      ? _.map(field?.relateModelsScope, (d) => d.id)
      : []
    const ticketId = window.location.href.includes('createTicket')
      ? this.props.createStore.ticketId
      : this.props.id
    const data = {
      ticketId,
      pageSize: this.state.pageSize,
      pageNum: this.state.pageNum,
      modelId: this.state.currentProcess || modelId.join(','),
      wd: this.state.wd
    }
    axios.get(API.TICKET_LIST_REL, { params: data }).then((data) => {
      this.setState({
        allTickets: data.list,
        total: data.count
      })
    })
  }

  handleChangeTicket = (id) => {
    this.setState({
      ticketSelect: id
    })
  }

  //  获取已经关联的工单列表
  getRelateTicket = () => {
    const ticketId = window.location.href.includes('createTicket')
      ? this.props.createStore.ticketId
      : this.props.id
    if (ticketId) {
      this.props.ticketStore.getRelateTicket(ticketId)
    }
  }

  // 关联工单
  handleSubmit = () => {
    const { selectedRowKeys } = this.state
    if (_.isEmpty(selectedRowKeys)) {
      message.warning(i18n('ticket.create.no_set', '请选择关联工单'))
      return false
    }
    if (selectedRowKeys.length > 100) {
      message.error(i18n('ticket.relate.restrict'))
      return
    }
    const ticketId = window.location.href.includes('createTicket')
      ? this.props.createStore.ticketId
      : this.props.id
    const data = {
      srcId: ticketId,
      destId: selectedRowKeys.join(','),
      relationType: '3'
    }
    axios.get(API.RELATE_TICKET, { params: data }).then(() => {
      this.getRelateTicket()
      this.setState({
        selectedRowKeys: [],
        wd: '',
        visible: false
        // currentProcess: undefined
      })
      // 关联工单必填校验，报错后，添加关联后移除报错
      const { source, removeErrMesOfRelateTicket } = this.props
      if (source === 'form' || source === 'relateTicketNum') {
        removeErrMesOfRelateTicket && removeErrMesOfRelateTicket()
      }
    })
  }

  // 删除当前关联的工单
  delRelation = (id, relationship) => {
    Modal.confirm({
      title: i18n('delete.the.relationship.ticket', '您确认删除该关联工单？'),
      onOk: () => {
        const ticketId = window.location.href.includes('createTicket')
          ? this.props.createStore.ticketId
          : this.props.id
        const postData = {
          srcId: ticketId,
          destId: id
        }
        axios.get(API.DEL_RELATIONSHIP, { params: postData }).then(() => {
          this.getRelateTicket()
          if (relationship === 4) {
            this.props.getAgainDetailForms && this.props.getAgainDetailForms()
          }
        })
      }
    })
  }

  handleVisibleChange = () => {
    const relateModels = mobx.toJS(this.props.ticketStore.activity.relateModels)
    this.props.ticketStore.setData({
      relationType: '3'
    })
    this.setState(
      {
        visible: true,
        pageSize: 10,
        pageNum: 1,
        currentProcess: !_.isEmpty(relateModels) ? relateModels[0].id : undefined
      },
      () => {
        this.getallTicket()
      }
    )
  }

  handleRefreshData = () => {
    this.getRelateTicket()
  }

  processFilter = (value) => {
    this.setState(
      {
        currentProcess: value,
        pageSize: 10,
        pageNum: 1
      },
      () => {
        this.getallTicket()
      }
    )
  }

  handleCancel = () => {
    this.setState({
      selectedRowKeys: [],
      wd: '',
      // currentProcess: undefined,
      visible: false
    })
  }

  handleRelateCancel = () => {
    this.props.createStore.distory()
    this.setState({
      modelvisible: false
    })
  }

  handleCreateCancel = () => {
    this.props.ticketStore.setData({
      createVisible: false
    })

    this.props && this.props?.onClose() //关联工单号组件关闭
  }

  handleMenuClick = (value) => {
    this.setState({
      modelvisible: true
    })
    const { relationType, formsData } = mobx.toJS(this.props.ticketStore.createRelateTicekt)
    this.props.ticketStore.setData({
      formsData,
      relationType,
      createVisible: false
    })
    this.props.createStore.intoCreateTicket(value)
  }

  selectModal = () => {
    this.props.ticketStore.setData({
      relationType: '3',
      createVisible: true
    })
  }

  pageChange = (page, pageSize) => {
    this.setState(
      {
        pageNum: page,
        pageSize: pageSize
      },
      () => {
        this.getallTicket()
      }
    )
  }

  getCodes = (tickets, types, type) => {
    const codes = []
    _.forEach(tickets.formLayoutVos, (item) => {
      if (item.type === 'group') {
        _.forEach(item.fieldList, (field) => {
          if (type === 'code' && _.includes(types, field.type)) {
            codes.push(field.code)
          }
          if (type === 'hidden' && !field.hidden) {
            codes.push(field.code)
          }
        })
      } else {
        _.forEach(item.tabs, (tab) => {
          _.forEach(tab.fieldList, (field) => {
            if (type === 'code' && _.includes(types, field.type)) {
              codes.push(field.code)
            }
            if (type === 'hidden' && !field.hidden) {
              codes.push(field.code)
            }
          })
        })
      }
    })
    return codes
  }

  //关联工单号新建将数据关联到输入框
  handleRelateTicketNum = (ticketId, result) => {
    const { selectedValue = [], isSingle = '' } = this.props
    let list = {
      value: result.id,
      key: result.id,
      label: result.title,
      flowNo: result.flowNo
    }
    let data = _.isEmpty(selectedValue)
      ? []
      : Array.isArray(selectedValue)
      ? selectedValue
      : [selectedValue]

    if (!_.isEmpty(data) && Array.isArray(data)) {
      data = [...data, list]
    } else if (_.isEmpty(data)) {
      data = [list]
    }
    if (isSingle === '0') {
      data = data[data.length - 1]
    }
    if (Array.isArray(data)) {
      const map = new Map()
      for (const item of _.compact(data)) {
        if (!map.has(item.key)) {
          map.set(item.key, item)
        }
      }

      data = [...map.values()]
    }
    this.props && this.props?.onChange(data)

    this.handleCreateCancel() // 关联工单号新建工单关闭弹框
  }

  handleRelateTicket = (result) => {
    message.success(i18n('create.ticket_success', '创建成功'))
    const ticketId = window.location.href.includes('createTicket')
      ? this.props.createStore.ticketId
      : this.props.id
    this.props.ticketStore.getRelateTicket(ticketId)
    if (this.props?.source === 'relateTicketNum') {
      this.handleRelateTicketNum(ticketId, result)
    }

    this.setState({
      modelvisible: false
    })
    const { relationType } = mobx.toJS(this.props.ticketStore.createRelateTicekt)
    relationType === '4' && this.props.getDetailForms()
    this.props.ticketStore.setData({
      createVisible: false
    })
    this.props.createStore.distory()
    this.props && this.props?.onClose()
  }

  showTotal = (total) => {
    return i18n('total', '共') + total + i18n('item', '条')
  }

  getList = async (query, callback) => {
    const { pageSize, pageNo, kw } = query
    const res =
      (await this.props.processListStore.getModelList({ pageNum: pageNo, wd: kw, pageSize })) || []
    callback(res)
  }

  getModelListForCreate = async (query, callback) => {
    const { pageSize, pageNo, kw } = query
    const { relateModels } = mobx.toJS(this.props.ticketStore.activity)
    const relateModelIds = relateModels ? relateModels.map((item) => item.id).join(',') : ''
    const params = { pageNum: pageNo, wd: kw, pageSize, relateModelIds }
    const res = (await axios.get(API.getAuthRelatedModels, { params })) || {}
    callback(res.list || [])
  }

  // 新建关联工单时映射字段值
  setFieldsValueForRelatedTicket = (forms) => {
    const currentTicketValue =
      this.props.getCurrentTicketValue && this.props.getCurrentTicketValue()

    if (!currentTicketValue || !forms) {
      return
    }

    // 不需要映射的字段类型
    const notSetFieldTypes = ['resource', 'nodeExecution', 'permission', 'table']

    _.forEach(forms.formLayoutVos, (item) => {
      if (item.type === 'group') {
        _.forEach(item.fieldList, (field) => {
          if (currentTicketValue[field.code] && !notSetFieldTypes.includes(field.type)) {
            field.defaultValue = currentTicketValue[field.code]
          }
        })
      } else {
        _.forEach(item.tabs, (tab) => {
          _.forEach(tab.fieldList, (field) => {
            if (currentTicketValue[field.code] && !notSetFieldTypes.includes(field.type)) {
              field.defaultValue = currentTicketValue[field.code]
            }
          })
        })
      }
    })
  }

  ticketFormsDetail = (data, type) => {
    if (type === 'get') {
      return this.createTicket.current.createForms.ticketforms.current.props.form.getFieldsValue()
    }
    try {
      this.createTicket.current.createForms.ticketforms.current.props.form.setFieldsValue(data)
    } catch (e) {
      message.error(e.message)
    }
  }

  getTicketDetail = async (record) => {
    // 先保存下当前工单的表格数据
    await this.props.tableListStore.saveTableData(true) // 保存表格字段数据
    let search = `?tacheType=0&tacheNo=0&tacheId=${record.tacheId}&modelId=${record.modelId}&renderPager=false`
    window.LOWCODE_APP_KEY = record?.appInfoVo?.appkey || ''
    if (!_.isEmpty(record?.appInfoVo)) {
      const appkey = record?.appInfoVo?.appkey
      search += `&appkey=${appkey}`
    }
    const subDetailRoute = {
      location: {
        pathname: `/ticket/detail/${record.id}`,
        search: search
      },
      match: {
        params: { id: record.id }
      }
    }
    this.setState({
      title: record.title,
      subDetailRoute
    })
  }

  onClose = async () => {
    await this.props.tableListStore.setProps({ isTicketSubmitting: false })
    this.setState({ subDetailRoute: '', title: '' }, () => {
      this.getRelateTicket()
    })
  }

  _renderPriority = (text) => {
    const { priorityList } = this.props.globalStore
    const { name, color } = _.find(priorityList, (item) => item.value == text) || {}
    if (name) {
      return (
        <span className={'table-th-priority'} style={{ background: color }}>
          {name}
        </span>
      )
    }
    return '--'
  }

  _renderColumns = (isShowRowSelection) => {
    const { relateTicketAttributeList, relateTicket, columnSelectedListRelate } =
      this.props.ticketStore
    const { isRequired, forms = {}, disabled } = this.props
    // 测试-接单之前删除按钮置灰
    const isReceiveTicket = forms?.isReceiveTicket || 0
    const columns = [
      {
        title: i18n('ticket.relateTicket.title', '标题'),
        dataIndex: 'title',
        key: 'title',
        width: 240,
        render: (text, record) => {
          const isAgile = this.props.location.pathname.includes('ticket/agile')
          const { tacheNo, tacheType, modelId, tacheId, caseId, draft } = record

          const search = {
            tacheNo: tacheNo || 0,
            tacheType: tacheType,
            tacheId: tacheId,
            modelId: modelId,
            caseId: caseId,
            isDrafts: draft,
            isAgile
          }
          if (!_.isEmpty(record?.appInfoVo)) {
            search.appkey = record?.appInfoVo?.appkey
          }
          return (
            <>
              <a
                onClick={() => {
                  this.getTicketDetail(record)
                }}
              >
                {text}
              </a>
              {!isAgile && (
                <Tooltip placement="top" title="新窗口打开工单">
                  <a
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(
                        `./ticket.html#/ticket/detail/${record.id}?${qs.stringify(search)}`
                      )
                    }}
                    style={{ marginLeft: 3 }}
                  >
                    <i className="icon iconfont icon-tiaozhuan-zhuanqu" />
                  </a>
                </Tooltip>
              )}
            </>
          )
        }
      },
      {
        title: i18n('ticket.relateTicket.ticketNum', '流水号'),
        dataIndex: 'ticketNum',
        key: 'ticketNum',
        width: 240,
        render: (text, record) => {
          const isAgile = this.props.location.pathname.includes('ticket/agile')
          const { tacheNo, tacheType, modelId, tacheId, caseId, draft } = record

          const search = {
            tacheNo: tacheNo || 0,
            tacheType: tacheType,
            tacheId: tacheId,
            modelId: modelId,
            caseId: caseId,
            isDrafts: draft,
            isAgile
          }
          if (!_.isEmpty(record?.appInfoVo)) {
            search.appkey = record?.appInfoVo?.appkey
          }
          return (
            <>
              <a
                onClick={() => {
                  this.getTicketDetail(record)
                }}
              >
                {text}
              </a>
              {!isAgile && (
                <Tooltip placement="top" title="新窗口打开工单">
                  <a
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(
                        `./ticket.html#/ticket/detail/${record.id}?${qs.stringify(search)}`
                      )
                    }}
                    style={{ marginLeft: 3 }}
                  >
                    <i className="icon iconfont icon-tiaozhuan-zhuanqu" />
                  </a>
                </Tooltip>
              )}
            </>
          )
        }
      },
      {
        title: i18n('ticket.relateTicket.type', '关系类型'),
        dataIndex: 'ticketRelationType',
        key: 'ticketRelationType',
        width: 200,
        render: (text) => {
          return text === 1
            ? i18n('Parent_ticke', '父单')
            : text === 2
            ? i18n('Child_ticket', '子单')
            : text === 3
            ? i18n('General_association', '关联')
            : text === 4
            ? i18n('Organizer_ship', '主办')
            : text === 5
            ? i18n('Co-organizer', '协办')
            : ''
        }
      },
      {
        title: i18n('ticket.relateTicket.modelName', '流程类型'),
        dataIndex: 'modelName',
        key: 'modelName',
        width: 200
      },
      {
        title: i18n('ticket.relateTicket.activity', '流程环节'),
        dataIndex: 'activityName',
        key: 'activityName',
        width: 200
      },
      {
        title: i18n('ticket.relateTicket.status', '流程状态'),
        dataIndex: 'status',
        key: 'status',
        render: (text) => {
          const { name, color } = this._renderStatus(text)
          return (
            <span className="ticket-list-table-th-status">
              <i style={{ background: color }} />
              {name}
            </span>
          )
        },
        width: 200
      },
      {
        title: i18n('ticket.relateTicket.handle', '处理组/人'),
        dataIndex: 'executorAndGroup',
        key: 'executorAndGroup',
        render: (text, record) => {
          if (record.currentGroupName) {
            const data = record.currentGroupName
            return data.join(',')
          } else {
            return _.map(record.userInfos, (user, index) => {
              return (
                <Tooltip
                  key={index}
                  title={
                    <div>
                      <div>
                        <i className="iconfont icon-idcard iClass" />
                        {user.department}
                      </div>
                      <div>
                        <i className="iconfont icon-phone iClass" />
                        {user.mobilePhone}
                      </div>
                      <div>
                        <i className="iconfont icon-mail iClass" />
                        {user.email}
                      </div>
                    </div>
                  }
                >
                  <span>
                    {index > 0 ? ', ' : ''}
                    {user.userName}
                  </span>
                </Tooltip>
              )
            })
          }
        },
        width: 180
      }
    ]
    if (!_.isEmpty(relateTicket)) {
      const caseId = _.get(relateTicket, '[0].caseId')
      const extendedColumn = relateTicketAttributeList[caseId]
      _.forEach(extendedColumn, (item) => {
        const code = item.modelId ? `${item.modelId}_${item.code}` : item.code
        if (code === 'title') return // 工单标题已有不显示
        columns.push({
          key: code,
          dataIndex: code,
          title: item.name,
          width: TD_WIDTH,
          render: (text, record) => {
            const current = relateTicketAttributeList[record.caseId]
            const data =
              _.find(
                current,
                (data) => (data.modelId ? `${data.modelId}_${data.code}` : data.code) === code
              ) || {}
            const { value, type, timeGranularity } = data
            if (value == null) return ''
            // 流水号
            if (data.code === 'flowNoBuiltIn') {
              // return <TicketDetailLink {...{ text: value, record }}>{value}</TicketDetailLink>
              return (
                <a
                  onClick={() => {
                    this.getTicketDetail(record)
                  }}
                >
                  {text}
                </a>
              )
            }
            switch (type) {
              case 'dateTime':
                return (
                  <TicketDate
                    disabled
                    value={value}
                    field={{ timeGranularity }}
                    className="customized-columns-time"
                  />
                )
              case 'tags':
                return _.map(parseTagsDataToArray(value), (item, index) => (
                  <Tag key={index}>{item}</Tag>
                ))
              case 'links':
                return (
                  <a
                    target="_blank"
                    href={`${value.linkProtocol}${value.linkUrl}`}
                    rel="noreferrer"
                  >
                    {value.linkName}
                  </a>
                )
              case 'jsontext':
                return (
                  <Tooltip title={value}>
                    <div className="table-jsontext">{value}</div>
                  </Tooltip>
                )
              default:
                return value
            }
          }
        })
      })
    }
    const columnSelectedCode = _.map(mobx.toJS(columnSelectedListRelate), (item) =>
      item.modelId ? `${item.modelId}_${item.code}` : item.code
    )
    // // 按照查询器那边进行列的排序
    const newColumns = _.chain(columns)
      .filter((item) => _.includes(columnSelectedCode, item.key))
      .sortBy((item) => _.indexOf(columnSelectedCode, item.key))
      .value()
    if (newColumns.length) {
      newColumns[0].width = 240
    }

    // // 如果表格宽度大于可是区域就固定标题
    // const width = $('#rebuild-ticket-list-wrap').width() || 1000 // 内容区域的宽度不包含padding
    // const width = document.getElementById('ticket-froms-relevance')?.offsetWidth ||1000
    const { width } = this.state
    let scrollXWidth = newColumns.map((item) => item.width).reduce((sum, item) => sum + item, 0)
    if (scrollXWidth > width) {
      newColumns[0].fixed = true
      // newColumns.push({ title: '', fixed: 'right' })
      newColumns.push({
        title: i18n('operation', '操作'),
        dataIndex: 'operation',
        key: 'operation',
        fixed: 'right',
        width: 140,
        render: (text, record) => {
          const title = !record.hasDeleteRole
            ? i18n('ticket.relateTicket.tooltip1', '暂无删除权限')
            : ''
          return record.hasDeleteRole && isRequired !== 2 && !disabled ? (
            <div
              onClick={() => {
                if (isReceiveTicket) return
                this.delRelation(record.id, record.relationship)
              }}
              className="relate_operate_ok"
            >
              {i18n('delete', '删除')}
            </div>
          ) : (
            <div className="relate_operate">
              <Tooltip title={title}>{i18n('delete', '删除')}</Tooltip>
            </div>
          )
        }
      })
      scrollXWidth = scrollXWidth // 右边的right占据44px
    } else {
      if (isShowRowSelection) {
        scrollXWidth = scrollXWidth + 62
      }
      for (const item of newColumns) {
        item.width = Math.floor((item.width / (scrollXWidth + 140)) * width) // padding 12px
      }
      newColumns.push({
        title: i18n('operation', '操作'),
        dataIndex: 'operation',
        key: 'operation',
        // fixed: scrollXWidth > width  ? 'right' :'',
        width: 140,
        render: (text, record) => {
          const title = !record.hasDeleteRole
            ? i18n('ticket.relateTicket.tooltip1', '暂无删除权限')
            : ''
          return record.hasDeleteRole && isRequired !== 2 && !disabled ? (
            <div
              onClick={() => {
                this.delRelation(record.id)
              }}
              className="relate_operate_ok"
            >
              {i18n('delete', '删除')}
            </div>
          ) : (
            <div className="relate_operate">
              <Tooltip title={title}>{i18n('delete', '删除')}</Tooltip>
            </div>
          )
        }
      })
    }
    return {
      columns: newColumns,
      scroll: scrollXWidth > width ? { x: scrollXWidth + 100 } : false
    }
  }

  render() {
    const {
      formList,
      isRequired,
      startNode,
      field,
      source = '',
      relateTicketVisible = false,
      coOrganizerVisible = false,
      relateSource = 'tab'
    } = this.props
    const forms = mobx.toJS(this.props.createStore.createTicket)
    const {
      currentProcess,
      allTickets,
      total,
      modelvisible,
      selectedRowKeys,
      subDetailRoute,
      title
    } = this.state
    const { relationType, createVisible } = mobx.toJS(this.props.ticketStore.createRelateTicekt)
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange
    }
    // 新建关联工单也需要把主单中相同字段值带入
    this.setFieldsValueForRelatedTicket(forms)

    const relateTicket = mobx.toJS(this.props.ticketStore.relateTicket)
    const { coOrganizerModels } = mobx.toJS(this.props.ticketStore.activity)
    let relateModels = field
      ? field.relateModels
      : mobx.toJS(this.props.ticketStore.activity).relateModels
    // const model = relationType === '4' ? coOrganizerModels : relateModels
    const model =
      source === 'relateTicketNum'
        ? this.props?.models
        : relationType === '4'
        ? coOrganizerModels
        : relateModels

    const createRelatedTicket = field
      ? field.createRelatedTicket
      : mobx.toJS(this.props.ticketStore.activity.createRelatedTicket)
    const { userId } = runtimeStore.getState().user || {}

    let isRenderRelatedButton = true
    if (formList.status === 3) {
      // 已完成工单能添加关联
      isRenderRelatedButton =
        formList.mergeTicketFlag === 0 &&
        (!_.isEmpty(relateModels) || formList.isManager || formList.isModelManager)
    } else {
      isRenderRelatedButton =
        formList.currexcutor &&
        formList.currexcutor.indexOf(userId) > -1 &&
        !formList.isReceiveTicket &&
        formList.mergeTicketFlag === 0 &&
        isRequired !== 2 &&
        (!_.isEmpty(relateModels) || formList.isManager || formList.isModelManager)
    }
    const isRenderCreateRelatedButton =
      createRelatedTicket &&
      formList.currexcutor &&
      formList.currexcutor.indexOf(userId) > -1 &&
      !formList.isReceiveTicket &&
      (!_.isEmpty(relateModels) || formList.isManager || formList.isModelManager)
    const isStartNode =
      window.location.href.includes('createTicket') ||
      window.location.href.includes('createService') ||
      startNode

    const { columns, scroll } = this._renderColumns(false)

    //关联工单号的新建
    let RelateTicketVisible = source === 'relateTicketNum' && relateTicketVisible
    return source === 'relateTicketNum' ? (
      <Drawer
        title={
          RelateTicketVisible && !modelvisible
            ? i18n('select_modal', '选择模型')
            : i18n('ticket.create.asso', '新建关联')
        }
        placement="right"
        onClose={() => {
          this.handleCreateCancel()
        }}
        outerClose={false}
        open={source === 'relateTicketNum' && RelateTicketVisible}
        destroyOnClose
      >
        <>
          {RelateTicketVisible && !modelvisible ? (
            <div id="relateModel_model_wrap">
              {_.isEmpty(model) ? (
                <LazySelect
                  labelInValue={false}
                  onChange={this.handleMenuClick}
                  placeholder={i18n('pl_select_modal', '请选择模型')}
                  getPopupContainer={(triggerNode) => triggerNode.parantNode || document.body}
                  getList={this.getModelListForCreate}
                />
              ) : (
                <Select
                  placeholder={i18n('pl_select_modal', '请选择模型')}
                  onSelect={this.handleMenuClick}
                >
                  {_.map(model, (model) => {
                    return <Select.Option key={model.id}>{model.name}</Select.Option>
                  })}
                </Select>
              )}
            </div>
          ) : (
            <div>
              <div style={{ overflow: 'hidden', paddingBottom: '4px' }}>
                <TicketTemp
                  type="list"
                  fieldList={_.get(forms, 'fields')}
                  modelId={_.get(forms, 'modelId')}
                  ticketId={_.get(forms, 'ticketId')}
                  caseId={_.get(forms, 'caseId')}
                  tacheId={_.get(forms, 'tacheId')}
                  setTicketValues={(data) => {
                    this.ticketFormsDetail(data, 'set')
                  }}
                  getTicketValues={() => this.ticketFormsDetail(null, 'get')}
                />
              </div>
              <CreateTicket
                {...this.props}
                forms={forms}
                type="createTicket"
                operateType="createRelateTicket"
                relationType={relationType}
                handleRelateCancel={this.handleRelateCancel}
                getCodes={this.getCodes}
                wrappedComponentRef={this.createTicket}
                handleRelateTicket={this.handleRelateTicket}
                relateSource={relateSource}
                inContainer={true}
              />
            </div>
          )}
        </>
      </Drawer>
    ) : (
      <div
        className={
          source === 'CoOrganizer'
            ? 'ticket-froms-relevance ticket-froms-relevance-inline'
            : 'ticket-froms-relevance'
        }
        id="ticket-froms-relevance"
      >
        {source !== 'CoOrganizer' && (
          <>
            <div className="ticket-froms-relevance-btn">
              <div>
                {isRequired === 1 ? (
                  <span className="required-item-icon relate-ticket" style={{ marginRight: 4 }}>
                    *
                  </span>
                ) : null}
                {(!!isRenderRelatedButton || isStartNode) && isRequired !== 2 && (
                  <Button
                    className="ticket-forms-relate-button"
                    onClick={() => {
                      this.handleVisibleChange()
                    }}
                  >
                    {i18n('ticket.add.asso', '添加关联')}
                  </Button>
                )}
                {
                  <Button
                    className="ticket-forms-relate-button"
                    onClick={() => this.handleRefreshData()}
                  >
                    {i18n('Refresh', '刷新数据')}
                  </Button>
                }
                {!!isRenderCreateRelatedButton && (
                  <Button
                    style={{ margin: '5px 0 12px 8px' }}
                    onClick={() => {
                      this.selectModal()
                    }}
                  >
                    {i18n('ticket.create.asso', '新建关联')}
                  </Button>
                )}
              </div>
              {/* 关联工单定制列 */}
              <CustomColumn />
            </div>
            <div>
              <Table
                loading={this.props.ticketStore.relateTicketLoading}
                dataSource={relateTicket}
                columns={columns}
                pagination={false}
                className="SLA_table"
                rowKey="id"
                scroll={{ x: scroll.x }}
                showScrollArrows
                scrollArrowsStep={500}
                size="small"
              />
            </div>
          </>
        )}

        {modelvisible && (
          <Modal
            title={i18n('ticket.create.asso', '新建关联')}
            visible={modelvisible}
            className="ticket-froms-create-relevance-model"
            width="1000px"
            maskClosable={false}
            onCancel={this.handleRelateCancel}
            footer={null}
          >
            <div>
              <div style={{ overflow: 'hidden', paddingBottom: '4px' }}>
                <TicketTemp
                  type="list"
                  fieldList={_.get(forms, 'fields')}
                  modelId={_.get(forms, 'modelId')}
                  ticketId={_.get(forms, 'ticketId')}
                  caseId={_.get(forms, 'caseId')}
                  tacheId={_.get(forms, 'tacheId')}
                  setTicketValues={(data) => {
                    this.ticketFormsDetail(data, 'set')
                  }}
                  getTicketValues={() => this.ticketFormsDetail(null, 'get')}
                />
              </div>
              <CreateTicket
                {...this.props}
                forms={forms}
                type="createTicket"
                operateType="createRelateTicket"
                relationType={relationType}
                handleRelateCancel={this.handleRelateCancel}
                getCodes={this.getCodes}
                wrappedComponentRef={this.createTicket}
                handleRelateTicket={this.handleRelateTicket}
                relateSource={relateSource}
                inContainer={true}
              />
            </div>
          </Modal>
        )}
        <Modal
          title={`${i18n('ticket.createSelect.relation', '关联')}${i18n(
            'ticket.add.ordinary.relationship',
            '关联工单'
          )}`}
          visible={this.state.visible}
          className="ticket-froms-relevance-model"
          width="1000px"
          maskClosable={false}
          onOk={this.handleSubmit}
          onCancel={this.handleCancel}
          destroyOnClose
        >
          <Search
            placeholder={i18n('input_keyword', '请输入关键字')}
            enterButton
            style={{ width: 200 }}
            onSearch={this.handleSearch}
          />
          {/* model判断是为了有没有设置模型范围 */}
          {_.isEmpty(model) ? (
            <LazySelect
              value={currentProcess}
              style={{ width: 256, marginLeft: 15 }}
              labelInValue={false}
              onChange={this.processFilter}
              placeholder={i18n('pl_select_modal', '请选择模型')}
              getPopupContainer={(triggerNode) => triggerNode.parantNode || document.body}
              getList={this.getList}
            />
          ) : (
            <Select
              placeholder={i18n('pl_select_modal', '请选择模型')}
              onSelect={this.processFilter}
              style={{ width: 256, marginLeft: 15 }}
              value={currentProcess}
            >
              {_.map(model, (model) => {
                return <Select.Option key={model.id}>{model.name}</Select.Option>
              })}
            </Select>
          )}
          <Table
            rowSelection={rowSelection}
            rowKey={(record) => record.ticketId}
            dataSource={allTickets}
            columns={this.state.modelColumns}
            pagination={false}
            className="SLA_table"
            style={{ marginTop: '21px' }}
          />
          <Pagination
            onChange={this.pageChange}
            total={total}
            size="small"
            showTotal={this.showTotal}
          />
        </Modal>
        <Modal
          visible={createVisible || (source === 'CoOrganizer' && coOrganizerVisible)}
          maskClosable={false}
          title={i18n('select_modal', '选择模型')}
          width={400}
          className="create-group-modal"
          footer={null}
          destroyOnClose
          onCancel={this.handleCreateCancel}
        >
          <div id="relateModel_model_wrap">
            {source === 'CoOrganizer' || _.isEmpty(model) ? (
              <LazySelect
                labelInValue={false}
                onChange={this.handleMenuClick}
                placeholder={i18n('pl_select_modal', '请选择模型')}
                getPopupContainer={(triggerNode) => triggerNode.parantNode || document.body}
                getList={this.getModelListForCreate}
              />
            ) : (
              <Select
                placeholder={i18n('pl_select_modal', '请选择模型')}
                onSelect={this.handleMenuClick}
              >
                {_.map(model, (model) => {
                  return <Select.Option key={model.id}>{model.name}</Select.Option>
                })}
              </Select>
            )}
          </div>
        </Modal>
        <DetailDrawer
          visible={!!subDetailRoute}
          title={title}
          detailRoute={subDetailRoute}
          onClose={this.onClose}
        />
      </div>
    )
  }
}
export default RelateTicket
