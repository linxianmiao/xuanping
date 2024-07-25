import React from 'react'
import * as mobx from 'mobx'
import moment from 'moment'
import { inject, observer } from 'mobx-react'
import { PaperClipOutlined } from '@uyun/icons'
import { Button, Checkbox, Tooltip, Icon } from '@uyun/components'
import getURLParam from '~/utils/getUrl'

@inject('ticketStore')
@observer
class PrintForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      allList: [],
      checked: false,
      checkedOpinion: false,
      userGroupList: [],
      recordList: mobx.toJS(this.props.ticketStore.recordList),
      newPageRecord: []
    }
  }

  componentDidMount() {
    this.getSomeFieldsInfo()
  }

  componentDidUpdate(prevProps) {
    const { formInfo } = this.props

    if (formInfo && formInfo !== prevProps.formInfo) {
      this.getSomeFieldsInfo()
    }
  }

  getProcessRecordList = async () => {
    const recordList = mobx.toJS(this.props.ticketStore.recordList)
    this.setState({ recordList, newPageRecord: recordList }, async () => {
      const url = window.location.hash
      const startIndex = url.lastIndexOf('/')
      const endIndex = url.indexOf('?')
      const ticketId = url.substring(startIndex + 1, endIndex)
      const caseId = getURLParam('caseId')
      let page = 1
      while (Array.isArray(this.state.newPageRecord) && this.state.newPageRecord.length >= 15) {
        page++
        const res =
          (await this.getProcessRecord(ticketId, { pageNum: page, pageSize: 15 }, caseId)) || {}
        const { processRecord } = res
        if (!processRecord) break
        const { recordList } = this.state
        const allRecord = recordList.concat(processRecord)
        this.setState({
          recordList: allRecord.sort((a, b) => moment(a.exectorTime) - moment(b.exectorTime)),
          newPageRecord: processRecord
        })
      }
    })
  }

  getProcessRecord = (id, params = { pageNum: 1, pageSize: 15 }, caseId) => {
    this.processRecordLoading = true
    return axios.get(API.GET_OPERATE_RECORD(id), { params: { ...params, caseId } })
  }

  getSomeFieldsInfo = () => {
    const { formInfo = {}, getFieldValue } = this.props
    const fieldList = []
    let departList = []
    let userGroupList = []

    _.map(formInfo.formLayoutVos, (formLayoutVo) => {
      _.map(formLayoutVo.fieldList, async (field) => {
        if (field.type === 'table') {
          _.map(field.params, (param) => {
            if (param.type !== 'normal') {
              fieldList.push(param.source)
            }
          })
        }
        if (field.type === 'department') {
          const initialValue = getFieldValue(field.code) || field.defaultValue
          departList = _.compact(_.concat(departList, initialValue))
        }
        if (field.type === 'userGroup') {
          const initialValue = getFieldValue(field.code) || field.defaultValue
          userGroupList = _.compact(_.concat(userGroupList, initialValue))
        }
      })
      _.map(formLayoutVo.tabs, (tab) => {
        _.map(tab.fieldList, async (field) => {
          if (field.type === 'table') {
            _.map(field.params, (param) => {
              if (param.type !== 'normal') {
                fieldList.push(param.source)
              }
            })
          }
          if (field.type === 'department') {
            const initialValue = getFieldValue(field.code) || field.defaultValue
            departList = _.compact(_.concat(departList, initialValue))
          }
          if (field.type === 'userGroup') {
            const initialValue = getFieldValue(field.code) || field.defaultValue
            userGroupList = _.compact(_.concat(userGroupList, initialValue))
          }
        })
      })
    })
    if (!_.isEmpty(fieldList)) {
      // 获取所有字段
      const allList = []
      axios
        .post(
          API.findFieldByCodeList,
          { fieldCodes: fieldList },
          { params: { modelId: this.props.modelId } }
        )
        .then((res) => {
          res.map((data) => {
            allList[data.code] = data
          })
          this.setState({
            allList
          })
        })
    }
    if (!_.isEmpty(departList)) {
      // 获取所有字段
      axios.get(API.queryDepartsByIds, { params: { departIds: departList.join() } }).then((res) => {
        this.setState({
          departList: res,
          canUpdate: true
        })
      })
    }

    if (!_.isEmpty(userGroupList)) {
      axios.post(API.getGroupListByIds, { groupIds: userGroupList }).then((res) => {
        this.setState({
          userGroupList: res || []
        })
      })
    }
  }

  timestampToTime(timestamp) {
    var date = new Date(timestamp) // 时间戳为10位需*1000，时间戳为13位的话不需乘1000
    var Y = date.getFullYear() + '-'
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
    var D = date.getDate() + ' '
    var h = date.getHours() + ':'
    var m = date.getMinutes()
    return Y + M + D + h + m
  }

  renderStatus = (status) => {
    switch (status) {
      case '1':
        return i18n('ticket.create.updating', '更新中')
      case '2':
        return i18n('ticket.create.effect', '已生效')
      case '3':
        return i18n('ticket.create.conflict_status', '已取消')
      case '5':
        return i18n('ticket.create.creating', '计划新增')
      case '6':
        return i18n('ticket.create.plan_delete', '计划删除')
      case '7':
        return i18n('ticket.create.cmdb_delete', 'CMDB中已删除')
      case '0':
        return i18n('ticket.create.related', '已关联')
      case '4':
        return i18n('ticket.create.related', '已关联')
      default:
        return ''
    }
  }

  renderAssetCol = (code, val) => {
    if (code === 'lifecycleState') {
      return (
        <span>
          {val === 'inventory' && i18n('inventory', '库存')}
          {val === 'installing' && i18n('installing', '上架中')}
          {val === 'using' && i18n('using', '使用')}
          {val === 'modifying' && i18n('modifying', '变更中')}
          {val === 'transfering' && i18n('transfering', '调拨中')}
          {val === 'repair' && i18n('repair', '维修')}
          {val === 'dismantle' && i18n('dismantle', '下架中')}
          {val === 'scraping' && i18n('scraping', '报废中')}
          {val === 'scrap' && i18n('scrap', '报废')}
          {val === 'uninventory' && i18n('uninventory', '未入库')}
        </span>
      )
    } else {
      const data = Array.isArray(val)
        ? _.chain(val)
            .map((item) => item.name || item.realname || item)
            .toString()
            .value()
        : typeof val === 'object' && val
        ? val.name
        : val
      return <span>{data}</span>
    }
  }

  _renderResourceTable = (field, initialValue) => {
    const column1 = [
      {
        title: i18n('ticket.create.type', '类型'),
        dataIndex: 'className'
      },
      {
        title: i18n('ticket.create.name', '名称'),
        dataIndex: 'name'
      }
    ]
    const column3 = [
      {
        title: i18n('ticket.create.resState', '状态'),
        dataIndex: 'status'
      }
    ]
    const column2 = []
    _.map(field.attributeColumns, (attrColumn) => {
      if (attrColumn.code !== 'name') {
        const col = {
          title: attrColumn.name,
          dataIndex: attrColumn.code
        }
        column2.push(col)
      }
    })
    const columns =
      field.formType === 'ASSET' && !_.isEmpty(column2)
        ? [].concat(column1, column2)
        : [].concat(column1, column2, column3)
    return (
      <table border="0" cellPadding="0" cellSpacing="0" style={{ width: '100%' }}>
        <thead>
          <tr
            style={{
              width: '100%',
              backgroundColor: '#E3E6EC',
              height: '42px',
              lineHeight: '42px',
              textAlign: 'left',
              color: '#5F6771',
              fontSize: '12px'
            }}
          >
            {_.map(columns, (column, index) => {
              return (
                <th
                  key={index}
                  style={{
                    borderBottom: '1px solid #D1D6DD',
                    paddingLeft: index === 0 ? '8px' : ''
                  }}
                >
                  {column.title}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {_.map(initialValue, (value, index) => {
            return (
              <tr
                key={index}
                style={{
                  width: '100%',
                  height: '42px',
                  textAlign: 'left',
                  color: '#31353B',
                  fontSize: '12px'
                }}
              >
                {_.map(columns, (column, ind) => {
                  let data = value[column.dataIndex]
                  if (column.dataIndex === 'status') {
                    data = this.renderStatus(data)
                  }
                  return (
                    <th
                      style={{
                        borderBottom: '1px solid #D1D6DD',
                        paddingLeft: ind === 0 ? '8px' : '0'
                      }}
                    >
                      {this.renderAssetCol(column.dataIndex, data)}
                    </th>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    )
  }

  _renderTable = (field, initialValue) => {
    const { allList } = this.state

    return (
      <table style={{ width: '100%' }} border="0" cellPadding="0" cellSpacing="0">
        <thead>
          <tr
            style={{
              width: '100%',
              backgroundColor: '#E3E6EC',
              height: '42px',
              lineHeight: '42px',
              textAlign: 'left',
              color: '#5F6771',
              fontSize: '12px'
            }}
          >
            {_.map(field.params, (param, index) => {
              return (
                <th key={index} style={{ borderBottom: '1px solid #D1D6DD', padding: '0 8px' }}>
                  {param.label}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {_.map(initialValue, (value, index) => {
            return (
              <tr
                key={index}
                style={{
                  width: '100%',
                  height: '42px',
                  textAlign: 'left',
                  color: '#31353B',
                  fontSize: '12px'
                }}
              >
                {_.map(field.params, (param, i) => {
                  const val = value[param.value]
                  let content = val
                  if (param.type === 'singleSel') {
                    const list = (allList[param.source] || {}).params // 当前字段list
                    _.map(list, (item) => {
                      if (val && `${val}` === `${item.value}`) {
                        content = item.label
                      }
                    })
                  } else if (param.type === 'multiSel') {
                    const list = (allList[param.source] || {}).params // 当前字段list
                    content = []
                    if (val && val.length > 0) {
                      val.forEach((v) => {
                        const targetParam = _.find(list, (it) => `${it.value}` === `${v}`)
                        if (targetParam) {
                          content.push(targetParam.label)
                        }
                      })
                    }
                    content = content.join(',')
                  } else if (param.type === 'listSel') {
                    const selected = Array.isArray(content) ? content : [content]
                    const list = (allList[param.source] || {}).params // 当前字段list
                    content = []
                    if (selected && selected.length > 0) {
                      selected.forEach((v) => {
                        // 下拉外部数据源或字典直接取label
                        if (_.isPlainObject(v)) {
                          content.push(v.label)
                        } else {
                          const targetParam = _.find(list, (it) => `${it.value}` === `${v}`)
                          if (targetParam) {
                            content.push(targetParam.label)
                          }
                        }
                      })
                    }
                    content = content.join(',')
                  } else if (param.type === 'links') {
                    content = val ? val.linkName : ''
                  } else if (param.type === 'attachfile') {
                    content = val && val.length > 0 ? val.map((file) => file.name).join(',') : ''
                  } else if (param.type === 'dateTime') {
                    let dateFormat = ''
                    const { timeGranularity } = allList[param.source] || {}
                    if (timeGranularity === 2) {
                      dateFormat = 'YYYY-MM-DD'
                    } else if (timeGranularity === 3) {
                      dateFormat = 'YYYY-MM-DD HH:mm'
                    } else if (timeGranularity === 4) {
                      dateFormat = 'YYYY-MM-DD HH:mm:ss'
                    } else {
                      dateFormat = 'YYYY-MM'
                    }
                    if (content === '1') {
                      content = moment().format(dateFormat)
                    } else {
                      content = moment(content).format(dateFormat)
                    }
                  }
                  return (
                    <th key={i} style={{ borderBottom: '1px solid #D1D6DD', paddingLeft: '8px' }}>
                      {content}
                    </th>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    )
  }

  createForm = (printData) => (
    <table style={{ width: '100%' }} border="0" cellPadding="0" cellSpacing="0">
      <tbody style={{ width: '100%' }}>
        <tr
          style={{
            width: '100%',
            backgroundColor: '#E3E6EC',
            height: '42px',
            lineHeight: '42px',
            textAlign: 'left',
            color: '#5F6771',
            fontSize: '12px'
          }}
        >
          <th
            style={{
              backgroundColor: '#E3E6EC',
              borderBottom: '1px solid #D1D6DD',
              width: !this.state.checkedOpinion ? '15%' : '13%',
              paddingLeft: '8px'
            }}
          >
            {i18n('processing_link', '处理环节')}
          </th>
          <th
            style={{
              borderBottom: '1px solid #D1D6DD',
              width: !this.state.checkedOpinion ? '15%' : '12%'
            }}
          >
            {i18n('operator', '操作人')}
          </th>
          <th
            style={{
              borderBottom: '1px solid #D1D6DD',
              width: !this.state.checkedOpinion ? '15%' : '10%'
            }}
          >
            {i18n('config.trigger.resolve_action', '处理动作')}
          </th>
          <th
            style={{
              borderBottom: '1px solid #D1D6DD',
              width: !this.state.checkedOpinion ? '35%' : '30%'
            }}
          >
            {i18n('config.trigger.resolve_content', '处理内容')}
          </th>
          {this.state.checkedOpinion && (
            <th
              style={{
                borderBottom: '1px solid #D1D6DD',
                width: !this.state.checkedOpinion ? '0' : '17%'
              }}
            >
              {i18n('processing_approval_opinion', '审批/处理意见')}
            </th>
          )}
          <th
            style={{
              borderBottom: '1px solid #D1D6DD',
              width: !this.state.checkedOpinion ? '20%' : '18%'
            }}
          >
            {i18n('config.trigger.resolve_time', '处理时间')}
          </th>
        </tr>
        {printData.map((item, index) => {
          if (!item) return false
          let users = []
          const userInfos = mobx.toJS(this.props.ticketStore.userInfos)
          _.map(item.toUserList, (user) => {
            const data = _.filter(userInfos, (userInfo) => userInfo.userId === user)
            users = _.concat(users, data)
          })
          const exectorName = _.find(
            userInfos,
            (user) => user.userName === item.exectorName || user.userName === item.approver
          ) || { userName: item.exectorName || item.approver || i18n('ticket.log.system', '系统') }
          const approveVo = _.map(
            item.approveVoList,
            (approve) =>
              `${approve.reviewer}(${
                approve.state === 1 ? i18n('reviewed1', '已审') : i18n('review1', '待审')
              })`
          )
          const operator = [exectorName.userName, ...(approveVo || [])]
          return (
            <tr
              key={index}
              style={{
                width: '100%',
                height: '42px',
                textAlign: 'left',
                color: '#31353B',
                fontSize: '12px'
              }}
            >
              <th
                style={{
                  borderBottom: '1px solid #D1D6DD',
                  width: !this.state.checkedOpinion ? '15%' : '13%',
                  paddingLeft: '8px'
                }}
              >
                {item.activityName || item.tacheName}
              </th>
              <th
                style={{
                  borderBottom: '1px solid #D1D6DD',
                  width: !this.state.checkedOpinion ? '15%' : '12%'
                }}
              >
                {operator.join(',')}
              </th>
              <th
                style={{
                  borderBottom: '1px solid #D1D6DD',
                  width: !this.state.checkedOpinion ? '15%' : '10%',
                  paddingRight: '5px'
                }}
              >
                {item.flowName || item.actionType || i18n('conf.model.proces.approval', '审批')}
              </th>
              <th
                style={{
                  borderBottom: '1px solid #D1D6DD',
                  width: !this.state.checkedOpinion ? '35%' : '30%',
                  paddingRight: '5px'
                }}
              >
                <div style={{ wordBreak: 'break-all' }}>
                  {item.actionType === '定时器' || item.actionType === 'actiontype.timing' ? (
                    <div>{item.ticketAdvice}</div>
                  ) : item.actionType === '上传附件' ||
                    item.actionType === 'file upload' ||
                    item.actionType === '删除附件' ||
                    item.actionType === 'file delete' ? (
                    <span>
                      <span>{exectorName.userName}</span>
                      {item.fileName ? (
                        <>
                          {item.actionType} ：<PaperClipOutlined /> {item.fileName}
                        </>
                      ) : null}
                    </span>
                  ) : (
                    <div>
                      {item.showToUser === 1 && (
                        <span>
                          <span>{exectorName.userName}</span>
                          {' ' + item.actionType + i18n('ticket.record.toOther', '了工单给 ')}
                          {_.isEmpty(users)
                            ? item.toGroup
                            : _.map(users, (user, index) => {
                                return (
                                  <span>
                                    {index > 0 ? ', ' : ''}
                                    {user.userName}
                                  </span>
                                )
                              })}
                        </span>
                      )}
                      {item.showToUser === 2 && (
                        <span>
                          <span>{exectorName.userName}</span>
                          {' ' + item.actionType}
                        </span>
                      )}
                      {item.showToUser === 0 && (
                        <span>
                          <span>{exectorName.userName}</span>
                          {' ' + item.actionType + i18n('ticket.record.over', '了工单')}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </th>
              {this.state.checkedOpinion && (
                <th
                  style={{
                    borderBottom: '1px solid #D1D6DD',
                    width: this.state.checkedOpinion ? '0' : '17%',
                    paddingRight: '5px'
                  }}
                >
                  {item.ticketAdvice || ''}
                </th>
              )}
              <th
                style={{
                  borderBottom: '1px solid #D1D6DD',
                  width: !this.state.checkedOpinion ? '20%' : '18%'
                }}
              >
                {this.timestampToTime(item.exectorTime)}
              </th>
            </tr>
          )
        })}
      </tbody>
    </table>
  )

  _renderTicketList = (field, initialValue) => {
    const columns = [
      {
        title: '关联单号',
        dataIndex: 'ticketNum'
      },
      {
        title: '工单标题',
        dataIndex: 'ticketName'
      },
      {
        title: '关联描述',
        dataIndex: 'ticketDesc'
      }
    ]
    return (
      <table border="0" cellPadding="0" cellSpacing="0" style={{ width: '100%' }}>
        <thead>
          <tr
            style={{
              width: '100%',
              backgroundColor: '#E3E6EC',
              height: '42px',
              lineHeight: '42px',
              textAlign: 'left',
              color: '#5F6771',
              fontSize: '12px'
            }}
          >
            {_.map(columns, (column, index) => {
              return (
                <th
                  key={index}
                  style={{
                    borderBottom: '1px solid #D1D6DD',
                    paddingLeft: index === 0 ? '8px' : ''
                  }}
                >
                  {column.title}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {_.map(initialValue, (value, index) => {
            return (
              <tr
                key={index}
                style={{
                  width: '100%',
                  height: '42px',
                  textAlign: 'left',
                  color: '#31353B',
                  fontSize: '12px'
                }}
              >
                {_.map(columns, (column, ind) => {
                  const data = value[column.dataIndex]
                  return (
                    <th
                      style={{
                        borderBottom: '1px solid #D1D6DD',
                        paddingLeft: ind === 0 ? '8px' : '0'
                      }}
                    >
                      {data}
                    </th>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    )
  }

  _render = (field) => {
    const { formInfo, fieldData } = this.props
    const printFormData = JSON.parse(sessionStorage.getItem('printForm')) || {}
    let initialValue = printFormData[field.code]
    switch (field.type) {
      case 'singleRowText':
        return initialValue
      case 'multiRowText':
        return (
          <pre style={{ wordBreak: 'break-all', whiteSpace: 'normal', wordWrap: 'break-word' }}>
            {initialValue}
          </pre>
        )
      case 'singleSel':
        if (typeof initialValue === 'number') {
          initialValue = `${initialValue}`
        }
        if (field.code === 'urgentLevel') {
          if (typeof initialValue === 'number') {
            initialValue = `${initialValue}`
          } else if (formInfo && typeof formInfo.priority === 'number') {
            initialValue = `${formInfo.priority}`
          }
        }
        const param = _.find(field.params, (param) => `${param.value}` === `${initialValue}`)
        if (param) {
          return param.label
        } else {
          return ''
        }
      case 'listSel':
        const fieldVal = Array.isArray(initialValue) ? initialValue : [initialValue]
        const content = []
        fieldVal.forEach((v) => {
          // 兼容外部数据源下拉
          if (_.isObject(v)) {
            content.push(v.label)
          } else {
            const option = _.find(field.params, (param) => `${param.value}` === `${v}`)
            if (option) {
              content.push(option.label)
            }
          }
        })
        return content.join(',')
      case 'business':
        const param1 = _.find(field.params, (param) => `${param.value}` === `${initialValue}`)
        if (param1) {
          return param1.label
        } else {
          return ''
        }
      case 'multiSel':
        return (
          <div>
            {_.map(
              _.filter(field.params, (param) => _.includes(initialValue || [], param.value)),
              (field) => field.label
            ).toString()}
          </div>
        )
      case 'cascader':
        if (field.tabStatus === '2') {
          return field.defaultValue ? field.defaultValue.label : field.defaultValue
        } else {
          var val = []
          const getTreeData = (defaultValue, treeVos, labels) => {
            treeVos.forEach((treeEntityVo) => {
              if (defaultValue && defaultValue.indexOf(treeEntityVo.value) !== -1) {
                labels.push(treeEntityVo.label)
              }
              if (treeEntityVo.children) {
                getTreeData(defaultValue, treeEntityVo.children, labels)
              }
            })
          }
          getTreeData(initialValue, field.cascade || [], val)
          return val.join('/')
        }
      case 'layer':
        let defaultLabel = ''
        if (initialValue && field.resParams) {
          _.forEach(field.resParams, (val) => {
            const obj = _.find(val, (item) => item.value === initialValue)
            if (obj) {
              defaultLabel = obj.label
              return false
            }
          })
        }
        return defaultLabel
      case 'int':
      case 'double':
        return initialValue
      case 'dateTime':
        const format = field.formatDate ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm'
        if (initialValue) {
          const timezoneOffset = moment(initialValue).zone() // 获取时区
          return moment(initialValue).utc(timezoneOffset).format(format)
        } else {
          return ''
        }
      case 'richText':
        return <div dangerouslySetInnerHTML={{ __html: initialValue }} />
      case 'table':
        const table = this._renderTable(field, initialValue)
        return table
      case 'asset':
      case 'resource':
        const value = JSON.parse(sessionStorage.getItem(`${formInfo.ticketId}-${field.code}`))
        const resourceTable = this._renderResourceTable(field, value || initialValue)
        return resourceTable
      case 'user':
        const userList = _.filter(fieldData, (item) => _.includes(initialValue, item.id))
        return (
          <div>
            {_.map(userList, (ite, index) => {
              return (
                <span key={index} style={{ margin: '0 3px' }}>
                  {ite.name}
                </span>
              )
            })}
          </div>
        )
      case 'department':
        const { departList = [] } = this.state
        let list = []
        if (initialValue) {
          list = departList.filter((item) => _.includes(field.defaultValue, item.departId)) // 当前选中的用户
        }
        return (
          <div>
            {_.map(list, (ite, index) => {
              return (
                <span key={index} style={{ margin: '0 3px' }}>
                  {ite.name}
                </span>
              )
            })}
          </div>
        )
      case 'userGroup':
        const { userGroupList = [] } = this.state
        let uGlist = []
        if (initialValue) {
          uGlist = userGroupList.filter((item) => _.includes(field.defaultValue, item.groupId)) // 当前选中的用户
        }
        return (
          <div>
            {_.map(uGlist, (ite, index) => {
              return (
                <span key={index} style={{ margin: '0 3px' }}>
                  {ite.groupName}
                </span>
              )
            })}
          </div>
        )
      case 'treeSel':
        const getTreeData1 = (defaultValue, treeVos) => {
          const labels = (treeVos, value, parent = []) => {
            return _.map(treeVos, (item) => {
              if (item.value === value) {
                return [...parent, item.label]
              }
              if (!_.isEmpty(item.children)) {
                return labels(item.children, value, [...parent, item.label])
              }
            })
          }

          return _.map(defaultValue, (value) => {
            const res = labels(treeVos, value)
            return _.chain(res).flattenDeep().compact().join('/').value()
          })
        }
        return getTreeData1(initialValue, field.treeVos).join(',')
      case 'securityCode':
        return initialValue
      case 'timeInterval':
        const { timeRule } = field
        const values = initialValue || {}
        const { date, hour, minute } = values
        if (timeRule === '0') {
          return `${hour || 0}${i18n('hours', '小时')}${minute || 0}${i18n('minute', '分钟')}`
        }
        return `${date || 0}${i18n('day', '天')}${hour || 0}${i18n('hours', '小时')}${
          minute || 0
        }${i18n('minute', '分钟')}`
      case 'links':
        return initialValue ? initialValue.linkName : ''
      case 'flowNo':
        return initialValue
      case 'ticketList':
        const ticketListTable = this._renderTicketList(field, initialValue)
        return ticketListTable
      default:
        return ''
    }
  }

  onChange = async (e) => {
    this.setState(
      {
        checked: e.target.checked
      },
      () => {
        if (!this.state.checked) {
          this.setState({ checkedOpinion: false })
        }
      }
    )
    if (e.target.checked) {
      await this.getProcessRecordList()
    }
  }

  onChangeOpinion = (e) => {
    this.setState({
      checkedOpinion: e.target.checked
    })
  }

  printData = () => {
    const data = this.state.checked
      ? window.document.getElementById('printArea1').innerHTML +
        window.document.getElementById('printArea2').innerHTML
      : window.document.getElementById('printArea1').innerHTML
    const win = window.open('', 'printwindow')
    win.document.write(data)
    win.print()
    win.close()
  }

  closeCurrentPage = () => {
    window.opener = null
    window.open('', '_self')
    window.close()
  }

  render() {
    const { recordList } = this.state
    const dataSource = recordList.reverse()
    const { formInfo = {} } = this.props
    return (
      <div style={{ height: '100%', background: '#000000', position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            height: '50px',
            background: '#FFF',
            textAlign: 'center',
            lineHeight: '50px',
            zIndex: '1000'
          }}
        >
          <Button type="primary" onClick={this.printData}>
            {i18n('print', '打印')}
          </Button>
          <Button style={{ margin: '0 10px' }} onClick={this.closeCurrentPage}>
            {i18n('globe.close', '关闭')}
          </Button>
          <Checkbox onChange={this.onChange} style={{ color: '#464C55', marginLeft: '10px' }}>
            {i18n('print_record_list', '打印处理记录')}
          </Checkbox>
          <Checkbox
            disabled={!this.state.checked}
            onChange={this.onChangeOpinion}
            checked={this.state.checkedOpinion}
            style={{ color: '#464C55' }}
          >
            {i18n('print_approval_opinion', '打印审批意见')}
          </Checkbox>
        </div>
        <div
          style={{
            position: 'absolute',
            top: '0px',
            bottom: '0px',
            left: '0',
            right: '0',
            padding: '80px 0 20px 0'
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              textAlign: 'center',
              height: '100%',
              overflow: 'auto',
              width: '800px',
              margin: '0 auto',
              position: 'relative',
              padding: '20px'
            }}
          >
            <div id="printArea1">
              <div
                style={{
                  textAlign: 'center',
                  fontSize: '20px',
                  color: '#31353B',
                  borderBottom: '1px solid #C6CAD0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  minHeight: '54px',
                  paddingBottom: '10px'
                }}
              >
                <div style={{ width: '80%', margin: '20px auto 0' }}>{formInfo.title}</div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#31353B',
                    position: 'absolute',
                    left: '20px',
                    top: '20px'
                  }}
                >
                  {formInfo.ticketNum}
                </div>
              </div>
              <div style={{ padding: '16px 0', fontSize: '12px' }}>
                <div
                  style={{
                    display: 'inline-block',
                    width: '33.33%',
                    height: '30px',
                    lineHeight: '30px',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ color: '#666E79', display: 'inline-block' }}>
                    {i18n('ticket.list.creatPerson', '创建人')} ：
                  </div>
                  <div style={{ color: '#31353B', display: 'inline-block', fontWeight: 'bold' }}>
                    {formInfo.creatorName}
                  </div>
                </div>
                <div
                  style={{
                    display: 'inline-block',
                    width: '33.33%',
                    height: '30px',
                    lineHeight: '30px',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ color: '#666E79', display: 'inline-block' }}>
                    {i18n('ticket.list.createTime', '工单时间')} ：
                  </div>
                  <div style={{ color: '#31353B', display: 'inline-block', fontWeight: 'bold' }}>
                    {moment(formInfo.createTime).format('YYYY-MM-DD HH:mm')}
                  </div>
                </div>
                <div
                  style={{
                    display: 'inline-block',
                    width: '33.33%',
                    height: '30px',
                    lineHeight: '30px',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ color: '#666E79', display: 'inline-block' }}>
                    {i18n('sla_ticket_type', '工单类型')} ：
                  </div>
                  <div style={{ color: '#31353B', display: 'inline-block', fontWeight: 'bold' }}>
                    {formInfo.modelName}
                  </div>
                </div>
                <div
                  style={{
                    display: 'inline-block',
                    width: '33.33%',
                    height: '30px',
                    lineHeight: '30px',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ color: '#666E79', display: 'inline-block' }}>
                    {i18n('ticket.list.printPerson', '打印人')} ：
                  </div>
                  <div style={{ color: '#31353B', display: 'inline-block', fontWeight: 'bold' }}>
                    {this.props.realname}
                  </div>
                </div>
                <div
                  style={{
                    display: 'inline-block',
                    width: '33.33%',
                    height: '30px',
                    lineHeight: '30px',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ color: '#666E79', display: 'inline-block' }}>
                    {i18n('ticket.list.printTime', '打印时间')} ：
                  </div>
                  <div style={{ color: '#31353B', display: 'inline-block', fontWeight: 'bold' }}>
                    {moment(new Date()).format('YYYY-MM-DD HH:mm')}
                  </div>
                </div>
                <div
                  style={{
                    display: 'inline-block',
                    width: '33.33%',
                    height: '30px',
                    lineHeight: '30px',
                    textAlign: 'left'
                  }}
                />
              </div>
              <div
                style={{
                  color: '#31353B',
                  margin: '16px 0',
                  fontSize: '14px',
                  borderLeft: '3px solid #8CC0FF',
                  paddingLeft: '10px',
                  textAlign: 'left'
                }}
              >
                {i18n('conf.model.basicInfo', '基本信息')}
              </div>
              <div
                style={{
                  width: '100%',
                  height: 'auto',
                  border: '1px solid #C6CAD0',
                  padding: '12px 8px',
                  textAlign: 'left',
                  fontSize: '12px',
                  marginBottom: '10px'
                }}
              >
                {_.map(formInfo.formLayoutVos, (formLayoutVo) => {
                  return (
                    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                      {formLayoutVo.type !== 'tab'
                        ? _.map(formLayoutVo.fieldList, (field, index) => {
                            const hidden = _.includes(
                              [
                                'attachfile',
                                'customizeTable',
                                'topology',
                                'securityCode',
                                'iframe',
                                'alert'
                              ],
                              field.type
                            )
                              ? true
                              : field.hidden
                            let { fieldLayout, fieldLabelLayout } = field
                            fieldLayout = fieldLayout || { col: field.fieldLine === 2 ? 12 : 24 }
                            const width =
                              fieldLayout.col === 24
                                ? '100%'
                                : fieldLayout.col === 12
                                ? '50%'
                                : fieldLayout.col === 8
                                ? '33.33%'
                                : fieldLayout.col === 6
                                ? '25%'
                                : '100%'
                            const flex =
                              fieldLayout.col === 24
                                ? '0 0 100%'
                                : fieldLayout.col === 12
                                ? '0 0 50%'
                                : fieldLayout.col === 8
                                ? '0 0 33.33%'
                                : fieldLayout.col === 6
                                ? '0 0 25%'
                                : '0 0 100%'
                            const labelFlex =
                              fieldLabelLayout === 'vertical'
                                ? '0 0 100%'
                                : fieldLayout.col === 24
                                ? '0 0 10%'
                                : fieldLayout.col === 12
                                ? '0 0 20%'
                                : fieldLayout.col === 8
                                ? '0 0 30%'
                                : fieldLayout.col === 6
                                ? '0 0 40%'
                                : '0 0 100%'
                            const contentFlex =
                              fieldLabelLayout === 'vertical'
                                ? '0 0 100%'
                                : fieldLayout.col === 24
                                ? '0 0 90%'
                                : fieldLayout.col === 12
                                ? '0 0 80%'
                                : fieldLayout.col === 8
                                ? '0 0 70%'
                                : fieldLayout.col === 6
                                ? '0 0 60%'
                                : '0 0 100%'
                            return hidden ? null : (
                              <div
                                key={field.id + index}
                                style={{
                                  width,
                                  lineHeight: '32px',
                                  minHeight: '32px',
                                  flex,
                                  flexWrap: 'wrap',
                                  display: fieldLabelLayout === 'vertical' ? 'block' : 'flex'
                                }}
                              >
                                <div
                                  style={{
                                    flex: labelFlex,
                                    textAlign: 'left',
                                    color: '#666E79'
                                  }}
                                >
                                  {field.code ? `${field.name}：` : ''}
                                </div>
                                <div
                                  style={{
                                    flex: contentFlex,
                                    textAlign: 'left',
                                    color: '#31353B',
                                    fontWeight: 'bold'
                                  }}
                                >
                                  {field.code ? this._render(field) : ''}
                                </div>
                              </div>
                            )
                          })
                        : _.map(formLayoutVo.tabs, (tab) => {
                            return _.map(tab.fieldList, (field, index) => {
                              const hidden = _.includes(
                                [
                                  'attachfile',
                                  'customizeTable',
                                  'topology',
                                  'securityCode',
                                  'iframe',
                                  'alert'
                                ],
                                field.type
                              )
                                ? true
                                : field.hidden
                              let { fieldLayout, fieldLabelLayout } = field
                              fieldLayout = fieldLayout || { col: field.fieldLine === 2 ? 12 : 24 }
                              const width =
                                fieldLayout.col === 24
                                  ? '100%'
                                  : fieldLayout.col === 12
                                  ? '50%'
                                  : fieldLayout.col === 8
                                  ? '33.33%'
                                  : fieldLayout.col === 6
                                  ? '25%'
                                  : '100%'
                              const flex =
                                fieldLayout.col === 24
                                  ? '0 0 100%'
                                  : fieldLayout.col === 12
                                  ? '0 0 50%'
                                  : fieldLayout.col === 8
                                  ? '0 0 33.33%'
                                  : fieldLayout.col === 6
                                  ? '0 0 25%'
                                  : '0 0 100%'
                              const labelFlex =
                                fieldLabelLayout === 'vertical'
                                  ? '0 0 100%'
                                  : fieldLayout.col === 24
                                  ? '0 0 10%'
                                  : fieldLayout.col === 12
                                  ? '0 0 20%'
                                  : fieldLayout.col === 8
                                  ? '0 0 30%'
                                  : fieldLayout.col === 6
                                  ? '0 0 40%'
                                  : '0 0 100%'
                              const contentFlex =
                                fieldLabelLayout === 'vertical'
                                  ? '0 0 100%'
                                  : fieldLayout.col === 24
                                  ? '0 0 90%'
                                  : fieldLayout.col === 12
                                  ? '0 0 80%'
                                  : fieldLayout.col === 8
                                  ? '0 0 70%'
                                  : fieldLayout.col === 6
                                  ? '0 0 60%'
                                  : '0 0 100%'
                              return hidden ? null : (
                                <div
                                  key={field.id + index}
                                  style={{
                                    width,
                                    lineHeight: '32px',
                                    minHeight: '32px',
                                    flex,
                                    flexWrap: 'wrap',
                                    display: fieldLabelLayout === 'vertical' ? 'block' : 'flex'
                                  }}
                                >
                                  <div
                                    style={{
                                      flex: labelFlex,
                                      textAlign: 'left',
                                      color: '#666E79'
                                    }}
                                  >
                                    {field.code ? `${field.name}：` : ''}
                                  </div>
                                  <div
                                    style={{
                                      flex: contentFlex,
                                      textAlign: 'left',
                                      color: '#31353B',
                                      fontWeight: 'bold'
                                    }}
                                  >
                                    {field.code ? this._render(field) : ''}
                                  </div>
                                </div>
                              )
                            })
                          })}
                    </div>
                  )
                })}
              </div>
            </div>
            {this.state.checked ? (
              <div id="printArea2">
                <div
                  style={{
                    margin: '16px 0',
                    fontWeight: 'bold',
                    color: '#31353B',
                    fontSize: '14px',
                    borderLeft: '3px solid #8CC0FF',
                    paddingLeft: '10px',
                    textAlign: 'left'
                  }}
                >
                  处理记录
                </div>
                <div>{this.createForm(dataSource)}</div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    )
  }
}
export default PrintForm
