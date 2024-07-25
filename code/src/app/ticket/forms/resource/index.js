import React, { Component } from 'react'
import { qs } from '@uyun/utils'
import { store as runtimeStore } from '@uyun/runtime-react'
import { message, Modal, Drawer } from '@uyun/components'
import { withRouter } from 'react-router-dom'
import { reaction, toJS } from 'mobx'
import { inject, observer } from 'mobx-react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import Compare from '../compare'
import Splitter from './splitter'
import ResourceIframe from './iframe'
import FormItem from '../components/formItem'
import Secrecy from '../components/Secrecy'
import getURLParam from '../../../utils/getUrl'
import '../styles/resource.less'
const getRowAttributes = (code, row) => {
  const params = row.split('&')
  const result = _.find(params, (param) => param.indexOf(code) !== -1).split('=')[1]
  if (_.includes(['undefined', ' null'], result)) {
    return undefined
  }
  return result
}
@inject('resourceStore')
@withRouter
@observer
class Resource extends Component {
  state = {
    url: '',
    tableDatas: [], // 当前展示的表格数据
    iframeVisible: '', // 是否展示iframe
    ciModalVisible: false, // 控制关联配置项用的，cmdb组件有问题，要用他将其重新加载一次
    conflictData: {}, // 冲突数据
    visible: false, // 是否全屏展示
    selectedRowKeys: [],
    sandboxData: [],
    pagination: {
      pageNo: 1,
      pageSize: 20,
      total: 1
    } // 表格分页数据
  }

  // 编辑配置项由CMDB处理，编辑完成后会进入沙箱
  // 这里要对正在编辑的关联数据做个缓存
  // 以便编辑完成后改变数据的status为'8'
  editingCiIds = []

  get requiredCodes() {
    const { ciFormAuthority } = this.props.field
    const requiredCodes = {}
    _.forEach(ciFormAuthority, (val, key) => {
      requiredCodes[key] = [].concat.apply(
        [],
        _.map(val, (item) => {
          return _.filter(item.ciAttributeVos, (data) => data.isRequired).map((vo) => vo.code)
        })
      )
    })
    return JSON.stringify(requiredCodes)
  }

  static contextTypes = {
    ticketId: PropTypes.string
  }

  getQueryParamsFromLocation = (props = this.props) => {
    const ticketId = props.match.params.id
    const search = props.location.search.slice(1)
    const locationQuery = qs.parse(search)
    return { ticketId, ...locationQuery }
  }

  async componentDidMount() {
    // 新增配置项
    const sandboxId = getURLParam('sandboxId')
    const fieldCode = getURLParam('fieldCode')
    if (sandboxId && fieldCode === this.props.field.code) {
      this.props.resourceStore.setSandboxID(sandboxId)
      await this.hideIframe()
    }
    /**
     * 存在两种情况，
     * 1 itsm自己创建的配置项，值放在field.defaultValue里
     * 2 其他项目调用itsm的创建页面，可以通过头部内置一些配置项，需要通过接口调用获取他们调用的配置项数据
     * 故讲所有的配置项全部放在store中
     */
    reaction(
      () => {
        const { resourceDatas } = toJS(this.props.resourceStore)
        const code = this.props.field.code
        const data = resourceDatas.find((item) => item.code === code) || {}
        return data.data || []
      },
      (resList, reaction) => {
        const { renderPager } = this.getQueryParamsFromLocation()
        if (renderPager === 'false') return
        if (!_.isEmpty(resList)) {
          const codeValue = _.map(resList, (res) =>
            res.status ? res : _.assign({}, res, { status: '0' })
          )

          if (
            this.props.setFieldsValue &&
            (window.location.href.indexOf('createTicket') === -1 ||
              window.location.href.indexOf('createService') !== -1)
          ) {
            const { field } = this.props
            window.FORM_LEAVE_NOTIRY = false
            this.props.setFieldsValue({ [field.code]: codeValue })
          }
          this.forceUpdate()
          reaction.dispose()
        }
      }
    )
    // 获取沙箱id
    // if (!this.props.resourceStore.sandboxId) {
    //   this.querySandboxId()
    // }

    if (this.props.sandboxId) {
      this.querySandboxData()
    }
  }

  async componentDidUpdate(prevProps) {
    if (this.props.sandboxId !== prevProps.sandboxId) {
      if (!_.isEmpty(this.props.sandboxId)) {
        if (
          !this.props.resourceStore.sandboxId ||
          (this.props.resourceStore.sandboxId &&
            this.props.resourceStore.sandboxId !== this.props.sandboxId)
        ) {
          this.props.resourceStore.setSandboxID(this.props.sandboxId)
        }
        const sandboxData = await this.querySandboxData()
        let initialValue = this.props.getFieldValue(this.props.field.code).concat(sandboxData)
        this.props.resourceStore.setDefaultValue(initialValue)
      } else {
        //没有沙箱id时，初始化数据
        this.props.resourceStore.setSandboxID('')
        this.setState({
          sandboxData: [],
          pagination: {
            pageNo: 1,
            pageSize: 20,
            total: 1
          }
        })
      }
    }
  }

  //   // 查沙箱id
  //   querySandboxId = async () => {
  //     const ticketId = this.props.ticketId

  //     if (!ticketId) {
  //       return
  //     }

  //     const res = await axios.get(API.getSandboxId, { params: { ticketId } })
  //     const sandboxId = !res || res === '200' ? '' : res
  //     this.props.resourceStore.setSandboxID(sandboxId)
  //     if (this.props.resourceStore.sandboxId) {
  //       this.querySandboxData()
  //     }
  //   }

  // 新增与关联   relation：关联     new：新增
  handleBtnClick = (type) => {
    const { type: ticketType, disabled } = this.props
    const checkUserPermission = this.props.resourceStore.permission
    if (ticketType === 'preview' || disabled || !checkUserPermission) {
      !checkUserPermission &&
        message.error(i18n('ticket.create.disable_tip1', '您暂无CMDB权限，无法操作'))
      return false
    }
    if (type === 'relation') {
      this.setState({ ciModalVisible: true })
    } else if (type === 'new') {
      this.createRes()
    } else if (type === 'batchEdit') {
      this.editsRes()
    } else if (type === 'batchExport') {
      this.handleBatchExport()
    }
  }

  // 关联配置项 ok以后参数处理
  handleOk = (datas) => {
    // const newTableDatas = _.map(datas, (data) => {
    //   //有的cmdb会出现另一个status状态 运行中等，会导致关联状态失效
    //   // if (!data.status) {
    //   // return _.assign({}, data, {
    //   //   status: '0',
    //   //   taskId: ''
    //   // })
    //   // }
    //   return data
    // })
    // 合并数据
    const unionDatas = _.unionWith(datas, (a, b) => {
      if (a.taskId && b.taskId && a.taskId === b.taskId) {
        return true
      }
      if (a.id && b.id && a.id === b.id) {
        return true
      }
      return false
    })

    this.ciModalVisibleHide()
    this.upDateTableDatas(unionDatas)
  }

  // 关闭关联配置项弹框
  ciModalVisibleHide = () => {
    this.setState({ ciModalVisible: false })
  }

  // 更新tabledatas的数据
  upDateTableDatas = async (tableDatas) => {
    const { field } = this.props
    this.props.setFieldsValue({ [field.code]: tableDatas })
    await this.props.resourceStore.updateResourceDatas(
      {
        code: field.code,
        resList: tableDatas,
        data: tableDatas,
        columns: []
      },
      field.code
    )
    return true
  }

  // 计划删除
  planToDelete = async (index, record) => {
    const { field, disabled, getFieldValue, ticketId } = this.props
    const checkUserPermission = this.props.resourceStore.permission
    if (disabled || !checkUserPermission) {
      !checkUserPermission &&
        message.error(i18n('ticket.create.disable_tip1', '您暂无CMDB权限，无法操作'))
      return false
    }
    let sandboxId = this.props.sandboxId || this.props.resourceStore.sandboxId
    if (sandboxId === '') {
      const result = await this.props.resourceStore.createCMDBSanbox(ticketId)
      sandboxId = result.sandboxId
      this.props.resourceStore.setSandboxID(sandboxId)
    }
    Modal.confirm({
      title: `你是否要删除${record.name}`,
      onOk: async () => {
        const data = await this.props.resourceStore.planToDelete(
          ticketId,
          sandboxId,
          record.id,
          field.code
        )
        if (data && data.sandboxId) {
          const tableDatas = getFieldValue(field.code) || []
          for (const resource of tableDatas) {
            if (resource.id === record.id) {
              resource.taskId = data.sandboxTaskId
              resource.status = data.status
              resource.sandboxId = data.sandboxId
              break
            }
          }
          this.upDateTableDatas(tableDatas)
          this.querySandboxData(this.state.pagination)
          this.setState({ sandboxId: data.sandboxId })
        } else if (data && data.ownerId) {
          this.errorMes(data.ownerId)
        }
      }
    })
  }

  // 提示错误
  errorMes = (ownerId) => {
    const url = window.location.origin + window.location.pathname + '/#/detail/' + ownerId
    message.error(
      <span>
        {i18n('ticket.create.disable_tip2', '此配置项正被其他人更新中')}
        <a href={url} target="_blank" rel="noreferrer">
          {i18n('ticket.create.ticket_link', '工单链接')}
        </a>
      </span>
    )
  }

  // 新建配置项
  createRes = async () => {
    const sandboxId = this.props.sandboxId || this.props.resourceStore.sandboxId
    if (sandboxId === '') {
      const result = await this.props.resourceStore.createCMDBSanbox(this.props.ticketId)
      this.props.resourceStore.setSandboxID(result.sandboxId)
      this.showIframe({}, result.sandboxId, 'new')
    } else {
      this.showIframe({}, sandboxId, 'new')
    }
  }

  // 复制
  copyRow = async (index, record) => {
    const { disabled, ticketId } = this.props
    const checkUserPermission = this.props.resourceStore.permission
    if (disabled || !checkUserPermission) {
      !checkUserPermission &&
        message.error(i18n('ticket.create.disable_tip1', '您暂无CMDB权限，无法操作'))
      return false
    }
    const sandboxId = this.props.sandboxId || this.props.resourceStore.sandboxId
    if (sandboxId === '') {
      const result = await this.props.resourceStore.createCMDBSanbox(ticketId)
      this.props.resourceStore.setSandboxID(result.sandboxId)
      this.showIframe(record, result.sandboxId, 'copy')
    } else {
      this.showIframe(record, sandboxId, 'copy')
    }
  }

  // 编辑
  editRow = async (index, record) => {
    const { disabled, ticketId, field } = this.props
    const checkUserPermission = this.props.resourceStore.permission
    if (disabled || !checkUserPermission) {
      !checkUserPermission &&
        message.error(i18n('ticket.create.disable_tip1', '您暂无CMDB权限，无法操作'))
      return false
    }
    const result = await this.props.resourceStore.isEditResource(ticketId, record.id, field.code)
    if (result && result.ownerId) {
      this.errorMes(result.ownerId)
    } else {
      if (record.id) {
        // 缓存正在编辑的关联数据
        this.editingCiIds = [record.id]
      }
      const sandboxId = this.props.sandboxId || this.props.resourceStore.sandboxId
      if (sandboxId) {
        this.showIframe(record, sandboxId, 'edit')
      } else {
        const result = await this.props.resourceStore.createCMDBSanbox(ticketId)
        this.props.resourceStore.setSandboxID(result.sandboxId)
        this.showIframe(record, result.sandboxId, 'edit')
      }
    }
  }

  // 批量编辑
  editsRes = async () => {
    const { disabled, ticketId, field } = this.props
    const checkUserPermission = this.props.resourceStore.permission
    if (disabled || !checkUserPermission) {
      !checkUserPermission &&
        message.error(i18n('ticket.create.disable_tip1', '您暂无CMDB权限，无法操作'))
      return false
    }
    // 批量编辑调用CMDB页面，参数通过localStorage传递
    const { selectedRowKeys } = this.state
    const selectData = _.map(selectedRowKeys, (item) => {
      return {
        ciId: getRowAttributes('ciId', item),
        classCode: getRowAttributes('classCode', item),
        taskId: getRowAttributes('taskId', item)
      }
    })
    localStorage.setItem('BatchEditCIs', JSON.stringify(selectData))

    const resourceIds = []
    selectedRowKeys.forEach((item) => {
      const ciId = getRowAttributes('ciId', item)
      if (ciId) {
        resourceIds.push(ciId)
      }
    })

    const result = await this.props.resourceStore.isEditResource(
      ticketId,
      _.map(selectedRowKeys, (item) => getRowAttributes('ciId', item))
        .filter(Boolean)
        .join(),
      field.code
    )

    // 缓存正在编辑的关联数据
    selectData.forEach((selected) => {
      if (selected.ciId) {
        this.editingCiIds.push(selected.ciId)
      }
    })

    if (result && result.ownerId) {
      this.errorMes(result.ownerId)
    } else {
      const sandboxId = this.props.sandboxId || this.props.resourceStore.sandboxId
      if (sandboxId === '') {
        const result = await this.props.resourceStore.createCMDBSanbox(ticketId)
        this.props.resourceStore.setSandboxID(result.sandboxId)
        this.showIframe({}, result.sandboxId, 'batchEdit')
      } else {
        this.showIframe({}, sandboxId, 'batchEdit')
      }
    }
  }

  // 展示iframe
  showIframe = (resource, sandboxId, type) => {
    const { modelId, tacheId, ticketId, caseId = '' } = this.props.forms
    let taskId = ''
    let url = ''
    const { code: fieldType, formType, checkEditPermission } = this.props.field
    const { theme } = runtimeStore.getState()
    const flag = checkEditPermission || false
    if (resource.taskId) taskId = resource.taskId
    if (type === 'edit') {
      url = `/cmdb/config.html#/edit?&hideRelation=true&sandboxId=${sandboxId}&sandboxTaskId=${taskId}&theme=${theme}&fieldType=${fieldType}&formType=${formType}&dealType=edit&checkEditPermission=${flag}`
      // 计划新增没有ciId
      if (resource.id && resource.status !== '5') {
        url += `&ciId=${resource.id}`
      }
    } else if (type === 'copy') {
      url = `/cmdb/config.html#/edit?&hideRelation=true&sandboxId=${sandboxId}&sandboxTaskId=${taskId}&theme=${theme}&fieldType=${fieldType}&formType=${formType}&copy=true&dealType=edit&checkEditPermission=${flag}`
      if (resource.id && resource.status !== '5') {
        url += '&ciId=' + resource.id
      }
    } else if (type === 'new') {
      url = `/cmdb/config.html#/new?sandboxId=${sandboxId}&hideRelation=true&theme=${theme}&fieldType=${fieldType}&formType=${formType}&dealType=edit&checkEditPermission=${flag}`
      if (!_.isEmpty(this.props.field.resType)) {
        url += `&classCodes=${_.map(this.props.field.resType, (item) => item.key).join()}`
      }
    } else if (type === 'batchEdit') {
      url = `/cmdb/config.html#/ci/batchEdit?sandboxId=${sandboxId}&theme=${theme}&formType=${formType}&fieldType=${fieldType}&checkEditPermission=${flag}`
    }
    if (this.props.field.isCiFormAuthority === 1 && type !== 'batchEdit') {
      url += `&modelId=${modelId}&tacheId=${tacheId}&ticketId=${ticketId}`
      if (caseId) url += `&caseId=${caseId}`
    }
    url += '&ticketSource=itsm'
    window.sessionStorage.setItem('requiredCodes', this.requiredCodes)
    window.addEventListener('message', this.cmdbPostMessage)
    this.setState({
      url: url,
      iframeVisible: type
    })
  }

  componentWillUnmount() {
    const ticketId = this.props.ticketId
    window.sessionStorage.removeItem('requiredCodes')
    window.removeEventListener('message', this.cmdbPostMessage)
    sessionStorage.removeItem(`${ticketId}-${this.props.field.code}`)
    if (window.location.href.indexOf('detail') === -1) {
      window.sessionStorage.removeItem(
        `resourceCondition-${this.props.forms?.ticketId || undefined}`
      )
    }
  }

  cmdbPostMessage = (res) => {
    // if (!_.isEmpty(res.data) && (res.data.isCreate || res.data.status === 'success')) {
    //   window.sessionStorage.removeItem('requiredCodes')
    //   this.hideIframe()
    // }

    if (!_.isEmpty(res.data)) {
      const { status, isCreateResult, btn } = res.data
      // 新增、复制、批量编辑 完成后关闭弹框
      const eidtSuccess =
        status === 'success' || (this.state.iframeVisible !== 'batchEdit' && isCreateResult)
      if (eidtSuccess) {
        window.sessionStorage.removeItem('requiredCodes')
        this.hideIframe(eidtSuccess)
      }

      // 除了批量编辑取消以外，新增、复制、编辑、批量编辑完成后更新数据
      if (!btn || btn !== 'cancel') {
        this.setState({
          selectedRowKeys: [],
          selectedRows: []
        })
      }
    }
  }

  // 导出
  handleBatchExport = () => {
    const { selectedRowKeys } = this.state
    const taskIds = []
    const ciIds = []

    selectedRowKeys.forEach((item) => {
      const [taskIdKeyValue, ciIdKeyValue] = item.split('&')
      const taskId = taskIdKeyValue.split('=')[1]
      const ciId = ciIdKeyValue.split('=')[1]

      if (taskId && taskId !== 'undefined') {
        taskIds.push(taskId)
      } else if (ciId) {
        ciIds.push(ciId)
      }
    })

    window.open(
      `/asset/api/v1/export/sandbox/data?taskIds=${taskIds.join(',')}&ciIds=${ciIds.join(',')}`
    )
  }

  querySandboxData = async (params = { pageNo: 1 }) => {
    const { field, forms, ticketId } = this.props
    const { sandboxId } = this.props.resourceStore
    const SandboxId = this.props.sandboxId || sandboxId
    let res = {}
    let data = []
    let total = 1

    if (!params.pageSize) {
      params.pageSize = this.state.pagination.pageSize
    }
    if (forms.commitSandbox) {
      res =
        (await axios.get(API.getCIResourceList, {
          params: { ticketId: ticketId, fieldCode: field.code, ...params }
        })) || {}
      data = res.dataList || []
      total = res.totalRecords || 1
    } else {
      if (SandboxId) {
        res = (await this.props.resourceStore.querySandbox(SandboxId, field.code, params)) || {}
      } else {
        // 如果没有沙箱id再查一遍，不知道为什么总有一些情况导致沙箱id丢失
        if (!ticketId) {
          return
        }
        const sandboxResId = await axios.get(API.getSandboxId, { params: { ticketId } })
        const sandboxID = !sandboxResId || sandboxResId === '200' ? '' : sandboxResId
        this.props.resourceStore.setSandboxID(sandboxID)
        res = (await this.props.resourceStore.querySandbox(sandboxID, field.code, params)) || {}
      }

      data = res.data_list || []
      total = res.total
    }
    const sandboxData = data.map((resource) => {
      if (forms.commitSandbox) {
        resource.commitSandbox = forms.commitSandbox
        resource.status = resource.status || '2'
        return resource
      }

      let status = '0'
      switch (resource.operation) {
        case 'CREATE':
          status = '5'
          break
        case 'DELETE':
          status = '6'
          break
        case 'UPDATE':
          status = '1'
          break
        case 'NO_OPERATE':
          status = '9'
          break // 还没定无操作
        case 'ERROR_DATA':
          status = '10'
          break
        default:
          break
      }
      return {
        ...(resource.target || resource.original),
        status,
        taskId: resource.id,
        resUniqueCheck: resource.resUniqueCheck,
        sandboxImportInfo: resource.sandboxImportInfo,
        id: resource.target ? _.get(resource, 'target.id') : _.get(resource, 'original.id'),
        sandboxId: resource.sandboxId,
        name: resource.target ? _.get(resource, 'target.name') : _.get(resource, 'original.name'),
        className: resource.target
          ? _.get(resource, 'target.className')
          : _.get(resource, 'original.className')
      }
    })

    this.setState({
      sandboxData,
      pagination: {
        pageNo: params.pageNo,
        pageSize: params.pageSize,
        total
      }
    })
    return sandboxData
  }

  // 导入完成后
  handleUploadComplete = async (uniques) => {
    const res = await this.querySandboxData(this.state.pagination)
    const { getFieldValue, field } = this.props
    const tableDatas = getFieldValue(field.code) || []
    const { resourceDatas } = this.props.resourceStore
    const fieldInResData = resourceDatas.find((r) => r.code === field.code)
    const resList = fieldInResData ? fieldInResData.data : []
    uniques.forEach((item) => {
      Object.keys(item).forEach((key) => {
        const targetInResList = resList.find((r) => r[key] === item[key])
        if (targetInResList) {
          const targetInTableDatas = tableDatas.find((t) => t.id === targetInResList.id)
          if (targetInTableDatas) {
            targetInTableDatas.status = '8' // 当关联的数据进入沙箱后状态设为'8'，防止关联和沙箱的数据重复显示
          }
        }
      })
    })

    // 导入完成后清空选中项
    this.setState({
      selectedRowKeys: [],
      selectedRows: []
    })
    const newTableDatas = [...res, ...tableDatas]
    this.upDateTableDatas(newTableDatas)
  }
  // 隐藏iframe
  hideIframe = async (eidtSuccess) => {
    const { field, getFieldValue, ticketId } = this.props
    const { pagination, iframeVisible } = this.state
    const params = { pageNo: pagination.pageNo, pageSize: pagination.pageSize }
    let tableDatas = getFieldValue(field.code) || []
    const result = await this.props.resourceStore.querySandbox(
      this.props.sandboxId || this.props.resourceStore.sandboxId,
      field.code,
      params
    )
    const taskVos = _.map(result.data_list, (d) => ({
      resId: d.targetId,
      taskId: d.id
    }))

    const param = {
      ticketId: ticketId,
      fieldCode: field.code,
      taskVos: taskVos
    }
    await this.props.resourceStore.saveTasks(param)
    this.setState({
      pagination: {
        pageNo: params.pageNo,
        pageSize: params.pageSize,
        total: result.total
      }
    })
    const newTableDatas =
      _.map(result.data_list, (resource) => {
        let status = '1'
        switch (resource.operation) {
          case 'CREATE':
            status = '5'
            break
          case 'DELETE':
            status = '6'
            break
          case 'UPDATE':
            status = '1'
            break
          case 'NO_OPERATE':
            status = '9'
            break // 还没定无操作
          case 'ERROR_DATA':
            status = '10'
            break
          default:
            break
        }
        return _.assign({}, resource, {
          ...(resource.target || resource.original),
          status,
          taskId: resource.id,
          id: resource.targetId ?? undefined,
          sandboxId: resource.sandboxId,
          name: resource.target ? _.get(resource, 'target.name') : _.get(resource, 'original.name'),
          className: resource.target
            ? _.get(resource, 'target.className')
            : _.get(resource, 'original.className')
        })
      }) || []
    // 合并数据

    // 批量编辑过的数据都是存在沙箱里的，全部过滤掉就好
    if (eidtSuccess === true) {
      tableDatas = tableDatas.filter((d) => !this.editingCiIds.includes(d.id))
    }
    const unionDatas = _.unionWith([].concat(newTableDatas, tableDatas), (a, b) => {
      if (a.taskId && b.taskId && a.taskId === b.taskId) {
        return true
      }
      if (a.id && b.id && a.id === b.id) {
        return true
      }
      return false
    })
    window.removeEventListener('message', this.cmdbPostMessage)
    await this.upDateTableDatas(unionDatas)
    this.editingCiIds = []
    this.setState({ url: '', iframeVisible: '', sandboxData: newTableDatas })
  }

  // 撤销
  revoke = async (index, record) => {
    const { disabled, field, getFieldValue, ticketId } = this.props
    const checkUserPermission = this.props.resourceStore.permission
    if (disabled || !checkUserPermission) {
      !checkUserPermission &&
        message.error(i18n('ticket.create.disable_tip1', '您暂无CMDB权限，无法操作'))
      return false
    }
    await this.props.resourceStore.removeRelateResource([record.taskId], ticketId)
    const tableDatas = getFieldValue(field.code)
    for (const resource of tableDatas) {
      if (resource.id === record.id) {
        resource.taskId = null
        resource.status = '0'
        resource.sandboxId = null
        break
      }
    }
    // 撤销后沙箱里应该就没有这条数据了
    const { sandboxData } = this.state
    const newSandboxdata = sandboxData.filter((d) => d.id !== record.id)
    this.setState({ sandboxData: newSandboxdata })

    await this.upDateTableDatas(tableDatas)
    this.forceUpdate()
  }

  // 查看冲突
  conflict = (index, record) => {
    const resourceDatas = toJS(this.props.resourceStore.resourceDatas)
    const data = resourceDatas.find((item) => item.code === this.props.field.code).resList
    if (data[index] && data[index].ciSourceVO) {
      this.setState({ conflictData: data[index] })
    }
  }

  // 关闭查看冲突弹框
  conflictClose = () => {
    this.setState({ conflictData: {} })
  }

  // 移除
  delRow = async (index, record) => {
    const { disabled, getFieldValue, field, ticketId } = this.props
    const checkUserPermission = this.props.resourceStore.permission
    const tableDatas = getFieldValue(field.code) || []
    if (disabled || !checkUserPermission) {
      !checkUserPermission &&
        message.error(i18n('ticket.create.disable_tip1', '您暂无CMDB权限，无法操作'))
      return false
    }
    tableDatas.splice(index, 1)
    await this.upDateTableDatas(tableDatas)
    this.setState({ tableDatas })
    // 在创建页移除配置项，根据该配置项是否有沙箱任务决定是否需要去沙箱中删除任务
    if (record.taskId) {
      await this.props.resourceStore.removeRelateResource([record.taskId], ticketId)
      this.querySandboxData(this.state.pagination)
    }
  }

  // 比较
  compareRow = async (record) => {
    if (record.taskId === '') {
      message.info(i18n('ticket.create.nochange', '该配置项尚无修改记录'))
      return false
    }
    const result = await this.props.resourceStore.compareContent(record.taskId)
    if (!result) {
      message.info(i18n('ticket.create.nochange', '该配置项尚无修改记录'))
      return false
    } else {
      const sources = []
      sources.push({ sysCode: 'baseLine', userName: i18n('ticket.create.base') })
      result.sources[0].userName = i18n('ticket.create.change', '变更值')
      sources.push(result.sources[0])
      _.map(result.data, (dd) => {
        // 加一个状态
        dd.user = dd.sandbox
      })

      Drawer.open({
        title: i18n('globe.compare', '比较'),
        content: <Compare sideSources={sources} sideData={result.data} />
      })
    }
  }

  handleCheck = (rule, value, callback) => {
    const { field } = this.props
    if (rule.required && _.isEmpty(value) && _.isEmpty(this.state.sandboxData)) {
      callback(`${i18n('globe.select', '请选择')}${field.name}`)
    } else {
      callback()
    }
    this.forceUpdate() // 不知道为啥，校验以后不会render，手动触发下
  }

  getCis = async (data) => {
    const res = await this.props.resourceStore.queryCis(data)
    return res
  }

  handleTablePaginationChange = (pageNo, pageSize) => {
    this.querySandboxData({ pageNo, pageSize })
  }

  handleChangeSelectedRowKeys = (selectedRowKeys) => {
    this.setState({ selectedRowKeys })
  }

  // 获取真实数据总数（关联+沙箱）
  getRealDataTotal = () => {
    const { field, getFieldValue, forms } = this.props
    const { pagination, sandboxData } = this.state
    const relatedValue = getFieldValue(field.code) || []
    let number = 0
    // commitSandbox 为1  沙箱数据已提交，沙箱数据为空
    if (forms && forms.commitSandbox) {
      number = _.filter(relatedValue, (d) => d.status !== '8').length
    } else {
      // 关联的未进沙箱的数据(taskId都为空)
      const newRelatedValue = Array.isArray(relatedValue)
        ? relatedValue.filter((d) => !d.taskId)
        : []
      number = newRelatedValue.filter((item) => item.status !== '8').length
    }
    if (sandboxData.length > 0) {
      number += pagination.total
    }
    return number
  }

  render() {
    const {
      field,
      type,
      getFieldDecorator,
      initialValue,
      setFieldsValue,
      getFieldValue,
      fieldMinCol,
      disabled,
      forms,
      popupContainerId,
      secrecy,
      ticketId,
      formLayoutType
    } = this.props
    const {
      iframeVisible,
      url,
      conflictData,
      ciModalVisible,
      selectedRowKeys,
      sandboxData,
      pagination
    } = this.state
    const { permission, sandboxId, resourceDatas } = toJS(this.props.resourceStore)
    const realDataTotal = this.getRealDataTotal()
    const dilver = {
      url, // 创建编辑的配置项url
      forms,
      type,
      field,
      disabled,
      sandboxId: this.props.sandboxId || sandboxId,
      permission, // 是否有配置项权限
      iframeVisible,
      conflictData,
      setFieldsValue,
      getFieldValue,
      ciModalVisible, // 关联配置项弹框
      selectedRowKeys,
      popupContainerId,
      handleChangeSelectedRowKeys: this.handleChangeSelectedRowKeys,
      getCis: this.getCis,
      handleBtnClick: this.handleBtnClick,
      planToDelete: this.planToDelete,
      delRow: this.delRow,
      copyRow: this.copyRow,
      editRow: this.editRow,
      revoke: this.revoke,
      conflict: this.conflict,
      conflictClose: this.conflictClose,
      hideIframe: this.hideIframe,
      compareRow: this.compareRow,
      changeModal: this.changeModal,
      handleOk: this.handleOk,
      ciModalVisibleHide: this.ciModalVisibleHide,
      ticketId,
      realDataTotal,
      sandboxData,
      pagination,
      onTablePaginationChange: this.handleTablePaginationChange,
      onUploadComplete: this.handleUploadComplete,
      querySandboxData: this.querySandboxData,
      upDateTableDatas: this.upDateTableDatas,
      form: this.props.form
    }
    let filtedInitialValue = _.filter(toJS(initialValue), (d) => d.id)
    const data =
      (resourceDatas && resourceDatas.find((item) => item.code === field.code)?.data) || []
    if (filtedInitialValue && _.isEmpty(filtedInitialValue[0]?.name) && !_.isEmpty(data)) {
      const initData = []
      _.map(filtedInitialValue, (item) => {
        _.map(data, (n) => {
          if (n.id === item.id) {
            initData.push(n)
          } else {
            initData.push(item)
          }
        })
      })
      filtedInitialValue = initData
    }
    return (
      <FormItem
        field={field}
        fieldMinCol={fieldMinCol}
        className={classnames({
          'table-style-item': formLayoutType
        })}
      >
        {getFieldDecorator(field.code, {
          initialValue: filtedInitialValue || undefined,
          rules: [
            {
              required: +field.isRequired === 1,
              validator: (rule, value, callback) => {
                this.handleCheck(rule, value, callback)
              }
            }
          ]
        })(secrecy ? <Secrecy /> : <Splitter {...dilver} />)}
        {!!iframeVisible && <ResourceIframe {...dilver} />}
      </FormItem>
    )
  }
}
export default Resource
