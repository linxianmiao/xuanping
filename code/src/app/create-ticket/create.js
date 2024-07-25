import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { message } from '@uyun/components'
import { toJS } from 'mobx'
import { qs } from '@uyun/utils'
import { observer, inject } from 'mobx-react'
import Forms from '../ticket/forms'
import Head from './head'
import CreateBtn from './createBtn'
import AdvancedCreateBtn from './advancedCreateBtn'
import postMessages from '../ticket/common/postMessages'
import { realSubmit, widgetsEventError } from '~/ticket/forms/utils/scriptfunc'
import ErrorBoundary from '~/components/ErrorBoundary'
import './styles/index.less'
import _ from 'lodash'
import { hasRelateJob, getIsHideRelateJob } from '~/ticket/forms/utils/logic'

@inject(
  'createStore',
  'ticketStore',
  'resourceStore',
  'globalStore',
  'ticketFieldJobStore',
  'permissionListStore',
  'loadFieldWidgetStore',
  'tableListStore'
)
@withRouter
@observer
class CreateTicket extends Component {
  static defaultProps = {
    onValuesChange: () => {},
    sendMessage: () => {}
  }

  state = {
    forms: toJS(this.props.forms)
  }

  createStore = this.props.createStore

  componentWillReceiveProps(nextProps) {
    if (nextProps.forms.ticketId !== this.props.forms.ticketId) {
      this.setState({ forms: toJS(nextProps.forms) })
      if (this.createForms) {
        this.createForms.ticketforms.current.props.form.resetFields()
      }
      if (nextProps.createType === 'createSubTask') {
        this.createStore = nextProps.createSubStore
      }
    }
  }

  // -----合并执行人及处理意见数据-----//
  manageData = (data) => {
    function parseDom(arg) {
      const objE = document.createElement('div')
      objE.innerHTML = arg
      return objE.childNodes
    }
    const toUserList = []
    if (!data.message) {
      data.message = ''
    }
    const matchADom = data.message.match(/<a user_id="([a-fA-F0-9]{32})" >(.*?)<\/a>/gi)
    _.map(matchADom, (dom) => {
      const aDom = parseDom(dom)
      const name = aDom[0].innerHTML
      data.message = data.message.replace(dom, name)
      toUserList.push(aDom[0].getAttribute('user_id'))
    })
    data.message = data.message.replace(/\n/g, '<br/>')
    const commentData = data
    data.message = {
      toUserList,
      content: data.message || ''
    }
    data.modelId = this.state.forms.modelId
    return commentData
  }

  handleOk = async (data, type) => {
    const { modelId, ticketId, modelCode, formLayoutVos } = this.state.forms || {}
    // 如果是子流程或服务目录的草稿，提交或保存草稿时，取要获取之前子流程或服务目录的草稿数据
    const { draftsData, parentTicketData } = this.props
    // 其他项目调用 (Alert ， ASSET ， automation)
    const {
      ticketSource,
      fromType,
      keyInfo,
      alertId,
      thirdRelationId,
      hideHeader,
      hideHead,
      hideMenu
    } = this.props.locationQuery || {}
    const formData = this.createForms.ticketforms.current.props.form.getFieldsValue() // 获取提交的表单数据
    if (this.props.resourceStore.sandboxId) {
      formData.sandboxId = this.props.resourceStore.sandboxId
    }

    // 关联自动化任务
    const itemRelateJob = hasRelateJob(formLayoutVos || [])
    const isHideRelateJob = getIsHideRelateJob()

    let autoPlanRes = null
    if (itemRelateJob && !isHideRelateJob) {
      autoPlanRes = await this.createForms?.onSubmitAutoPlan()
      if (autoPlanRes) {
        formData.execute_plan_data = autoPlanRes
        formData.job_execute_step = 1
      }
    }
    if (itemRelateJob && autoPlanRes === false) {
      return false
    }

    const fieldCodes = _.keys(formData) // 提交字段的code数组
    const flowCode = _.get(data, 'flowCode') // 提交线编码
    data = _.omit(data, ['flowCode'])

    // 字段有默认值，然后删除完以后为undefined，不会传给后端，这个时候在下一个环节的时候，还会有默认值
    _.forEach(formData, (value, key) => {
      formData[key] = value === undefined ? null : value
    })
    const resourceCodes = []
    _.forEach(formLayoutVos, (item) => {
      if (item.type === 'group') {
        _.forEach(item.fieldList, (field) => {
          if (field.type === 'resource') {
            resourceCodes.push(field.code)
          }
        })
      } else {
        _.forEach(item.tabs, (tab) => {
          _.forEach(tab.fieldList, (field) => {
            if (field.type === 'resource') {
              resourceCodes.push(field.code)
            }
          })
        })
      }
    })
    _.forEach(resourceCodes, (d) => {
      if (Array.isArray(formData[d])) {
        formData[d] = _.filter(formData[d], (d2) => !d2.taskId)
      }
    })
    await this.props.resourceStore.postResList(ticketId, modelId) // 提交配置项数据
    await this.props.ticketFieldJobStore.job_relate(ticketId) // 提交作业数据
    await this.props.permissionListStore.postPermissionList(ticketId) // 保存权限自服务数据
    await this.props.tableListStore.saveTableData(formData, { isDraft: type === 'save' }) // 保存表格字段数据
    // 清空原表格字段的默认数据
    this.props.tableListStore.list.forEach((store) => {
      formData[store.params.fieldCode] = []
    })

    // 处理意见处理
    let messageData = {}
    if (type !== 'save') {
      messageData = this.manageData(data)
    }

    const commentData = _.assign({}, messageData, { form: formData, ticketId: ticketId })
    // 脚本处理
    try {
      await realSubmit(this.state.forms, commentData, type)
    } catch (e) {
      // message.error('onrealsubmit脚本返回了' + e.message)
      console.log('onrealsubmit脚本返回了' + e.message)
      return false
    }
    // 自定义字段的使用的钩子函数
    try {
      await this.props.loadFieldWidgetStore.submitWidgetsEvent(
        { flowCode, submitType: type, isCreateTicket: true, modelCode },
        fieldCodes
      )
    } catch (e) {
      widgetsEventError(_.get(this, 'createForms.ticketforms.current.props.form.setFields'), e)
      return false
    }
    _.forIn(commentData?.form || [], (value, key) => {
      if (value === '*********') {
        delete commentData.form[key]
      }
    })
    // 低代码创建工单回调
    if (this.props.source === 'lowcode') {
      const lowcodeData = {
        ticket_source: 'lowCode',
        model_id: commentData.modelId,
        form: commentData.form,
        handle_rules: {
          route_id: commentData.flowId, // 提交线id
          message: commentData.message.content,
          executors_groups: commentData.executorAndGroup
        }
      }

      if (this.props.onLowcodeCreateTicket) {
        await this.props.onLowcodeCreateTicket(lowcodeData)
      }
      return
    }
    // 其他产品调用ITSM创建的时候的特殊处理
    if (this.props.matchParams && this.props.matchParams.url) {
      commentData.ticketSource = ticketSource
      // auto返回callbackuri  不需要返回至后端
      const ParamsUrl = decodeURIComponent(this.props.matchParams.url)
      if (ParamsUrl !== 'callbackuri') {
        commentData.callback = ParamsUrl
      }
      if (ticketSource === 'automation') {
        commentData.form.fromType = fromType
        commentData.form.keyInfo = keyInfo
      } else if (ticketSource === 'alert') {
        commentData.form.alertId = alertId
      } else if (ticketSource === 'delivery') {
        commentData.thirdRelationId = thirdRelationId
      }
    }
    let result = null
    // 新建关联工单
    if (this.props.operateType === 'createRelateTicket') {
      commentData.srcTicketId = this.props.id
      commentData.relationType = this.props.relationType
      commentData.relateSource = this.props?.relateSource
      if (type === 'submit') {
        result = await this.createStore.onCreateTicket(modelId, commentData)
      } else {
        result = await this.createStore.createAndJumpTicket(commentData)
      }
      result && this.props.handleRelateTicket(result)
    } else {
      if (type === 'submit') {
        result = await this.createStore.onCreateTicket(modelId, commentData)
      } else if (type === 'save') {
        // 子流程或服务目录保存为草稿
        if (this.props.sourceType === 'subOrService') {
          const { formsData, parentFormList, submodelItem } = this.props
          let getSubOrServiceSaveData = {}
          // 子流程保存草稿
          if (draftsData && draftsData.cacheType === '1') {
            getSubOrServiceSaveData = {
              form: parentTicketData.data,
              ticketId: parentTicketData.id,
              modelId: parentTicketData.modelId,
              cacheType: '1', // '1' 代表子流程保存草稿
              tacheId: parentTicketData.activityId,
              caseId: parentTicketData.caseId,
              subTicketVo: {
                subForm: formData,
                subTicketId: ticketId,
                subTicketFlowId: parentTicketData.subTicket.subTicketFlowId,
                childMode: parentTicketData.subTicket.childMode,
                subModelId: parentTicketData.subTicket.subModelId,
                filterRule: parentTicketData.subTicket.filterRule,
                flowId: parentTicketData.subTicket.flowId,
                needSuspend: parentTicketData.subTicket.needSuspend
              }
            }
          } else if (draftsData && draftsData.cacheType === '2') {
            // 服务目录保存草稿
            getSubOrServiceSaveData = {
              form: formData,
              ticketId,
              cacheType: '2', // '2' 代表服务目录保存草稿
              serviceRecordVO: parentTicketData.serviceRecordVO,
              executorAndGroup: parentTicketData.executorAndGroup
            }
          } else {
            getSubOrServiceSaveData = {
              form: formsData,
              ticketId: parentFormList.ticketId,
              modelId: parentFormList.modelId,
              cacheType: '1', // '1' 代表子流程保存草稿
              tacheId: parentFormList.tacheId,
              caseId: parentFormList.caseId,
              subTicketVo: {
                subForm: formData,
                subTicketId: ticketId,
                subTicketFlowId: submodelItem.startFlow,
                childMode: submodelItem.childMode,
                subModelId: modelId,
                filterRule: submodelItem.childModel ? submodelItem.childModel.filterRule : null,
                flowId: submodelItem.activityFlowId,
                needSuspend: submodelItem.childModel ? submodelItem.childModel.needSuspend : null
              }
            }
          }
          result = await this.props.ticketStore.ticketSave(modelId, getSubOrServiceSaveData)
        } else {
          const params = _.pick(commentData, ['form', 'ticketId'])
          if (this.props.createType === 'createSubTask') {
            const { parentData, parentTicketId, allData } = this.props
            let chilgrenlength = Array.isArray(parentData?.children)
              ? parentData?.children.length + 1
              : 1
            let taskNum = parentData?.groupType === 'parallel' ? 1 : chilgrenlength
            params.parentTicketId = parentTicketId
            params.taskGroupId = parentData?.groupId || ''
            params.taskNum = taskNum
            params.createType = 'createSubTask'
          }
          result = await this.props.ticketStore.ticketSave(modelId, params)
        }
      } else {
        if (this.props.sourceType === 'subOrService') {
          // 子流程提交
          if (draftsData && draftsData.cacheType === '1') {
            const subData = {
              ...commentData.messageData,
              ticketId: parentTicketData.id,
              needSuspend: parentTicketData.subTicket.needSuspend,
              subModelId: parentTicketData.subTicket.subModelId,
              filterRule: parentTicketData.subTicket.filterRule,
              tacheId: parentTicketData.activityId,
              caseId: parentTicketData.caseId,
              tacheType: parentTicketData.tacheType,
              tacheNo: parentTicketData.tacheNo,
              modelId: parentTicketData.modelId,
              autoCreateTicket: 1, // 手动创建
              flowId: parentTicketData.subTicket.flowId,
              flowCode: parentTicketData.subTicket.flowCode,
              childMode: parentTicketData.subTicket.childMode,
              subTicketFlowId: data.flowId,
              subTicketId: ticketId,
              subForm: commentData.form,
              form: parentTicketData.data
            }
            result = await this.createStore.createSubProcess(subData, { chartId: '' })
          } else if (draftsData && draftsData.cacheType === '2') {
            // 服务目录提交
            const ticketData = {
              ...data,
              ...commentData.messageData,
              form: formData,
              ticketId
            }
            result = await this.createStore.serviceTicketCreate({
              service: parentTicketData.serviceRecordVO,
              ticket: ticketData
            })
          }
        } else {
          if (this.props.createType === 'createSubTask') {
            const { parentData, parentTicketId, allData } = this.props
            let chilgrenlength = Array.isArray(parentData?.children)
              ? parentData?.children.length + 1
              : 1
            let taskNum = parentData?.groupType === 'parallel' ? 1 : chilgrenlength
            commentData.parentTicketId = parentTicketId
            commentData.taskGroupId = parentData?.groupId || ''
            commentData.taskNum = taskNum
            commentData.createType = 'createSubTask'
          }
          result = await this.createStore.createAndJumpTicket(commentData)
        }
      }

      // 成功
      if (result && this.props.createType === 'createSubTask') {
        this.props.refresh()
      }
      if (result) {
        if (type === 'save') {
          message.success(i18n('save_success', '保存成功'))
        } else {
          message.success(i18n('create.ticket_success', '创建成功'))
        }
        if (this.props.memoryHistory) {
          this.props.memoryHistory.push('/model/list')
          return
        }

        // 创建成功以后给iframe控件发送信息
        postMessages(formLayoutVos, type, 0)
        this.props.onValuesChange(false)

        // 第三方调用发送postmessage后不用往下执行了
        if (ticketSource && type !== 'save') {
          this.props.sendMessage(result)
          return false
        }

        this.props.globalStore.getDraftsTotal() // 刷新草稿数据
        this.props.globalStore.getFilterType() // 刷新左侧菜单的数字

        // 子流程或服务目录提交成功后，直接跳转到草稿
        if (type !== 'save' && draftsData) {
          if (draftsData.cacheType === '1' || draftsData.cacheType === '2') {
            this.props.history.replace({ pathname: '/ticket/draftsList' })
            return false
          }
        }

        if (type !== 'save' && this.props.createType !== 'createSubTask') {
          const {
            id: ticketId,
            activityId: tacheId,
            modelId,
            caseId,
            activityType: tacheType,
            activityNo: tacheNo,
            externalURL
          } = result
          if (externalURL) {
            window.open(externalURL)
          } else {
            this.props.history.replace({
              pathname: ticketSource ? `/ticketDetail/${ticketId}` : `/ticket/detail/${ticketId}`,
              search: `?${qs.stringify({
                tacheNo: tacheNo || 0,
                tacheType: tacheType,
                tacheId: '', // 暂时给空值，activityId服务端传回的值有问题
                modelId: modelId,
                caseId: caseId,
                ticketSource,
                hideHeader,
                hideHead,
                hideMenu
              })}`
            })
          }
        }
      } else {
        // 失败
        try {
          await this.props.loadFieldWidgetStore.cancelWidgetsEvent(fieldCodes)
        } catch (e) {
          widgetsEventError(_.get(this, 'createForms.ticketforms.current.props.form.setFields'), e)
        }
      }
    }

    return result
  }

  validate = async (fn, item) => {
    try {
      const res = await this.createForms.validateFieldsValue(item)
      console.log('res', res)
      fn(res)
    } catch (e) {
      console.log(e)
      throw e
    }
  }

  getFormsValue = (code) => this.createForms.ticketforms.current.props.form.getFieldsValue(code)

  // 获取该字段映射到子表单的值
  getMappingFieldValue = (subField, parentField, parentFieldValue) => {
    if (!parentField) return
    // 单选->文本 或 多选->文本，需要赋label的值
    if (parentField.type === 'singleSel' && subField.type === 'singleRowText') {
      const option = parentField.params.find((p) => p.value + '' === parentFieldValue)
      if (option) {
        return option.label
      }
    } else if (parentField.type === 'multiSel' && subField.type === 'multiRowText') {
      return parentFieldValue
        .map((v) => {
          const option = parentField.params.find((p) => p.value === v)
          if (option) {
            return option.label
          }
        })
        .filter((f) => f + '')
        .join(',')
    }
    return parentFieldValue
  }

  setMappingFields = (forms) => {
    const { formsData, fields: parentFormFields, mappingFields, createType } = this.props
    if (!formsData) {
      return
    }

    const mapping = new Map()
    // 如果存在映射关系，就只需覆盖映射关系中的字段
    if (mappingFields) {
      mappingFields.forEach((item) => {
        if (createType === 'createSubTask') {
          mapping.set(item.childFieldCode, item.parentFieldCode)
        } else {
          mapping.set(item.subFieldCode, item.parFieldCode)
        }
      })
    } else {
      Object.keys(formsData).forEach((fieldCode) => mapping.set(fieldCode, fieldCode))
    }

    _.forEach(forms.formLayoutVos, (item) => {
      if (item.type === 'group' || item.type === 'panel') {
        _.forEach(item.fieldList, (field) => {
          if (mapping.has(field.code)) {
            const parentField = parentFormFields.find((f) => f.code === mapping.get(field.code))
            const value = formsData[mapping.get(field.code)]
            field.defaultValue = this.getMappingFieldValue(field, parentField, value)
          }
        })
      } else {
        _.forEach(item.tabs, (tab) => {
          _.forEach(tab.fieldList, (field) => {
            if (mapping.has(field.code)) {
              const parentField = parentFormFields.find((f) => f.code === mapping.get(field.code))
              const value = formsData[mapping.get(field.code)]
              field.defaultValue = this.getMappingFieldValue(field, parentField, value)
            }
          })
        })
      }
    })
  }

  render() {
    const { forms } = this.state
    const processList = toJS(this.props.createStore.processList)

    // 三个场景：手动创建子流程、创建关联工单、创建协办单
    // 需要将原表单数据带到新表单
    this.setMappingFields(forms)

    const dilver = {
      forms,
      submodelItem: this.props.submodelItem,
      ticketSubModelShow: this.props.ticketSubModelShow,
      id: forms.modelId,
      ticketId: forms.ticketId,
      flowChart: this.props.flowChart,
      handleClick: this.props.handleClick,
      validate: this.validate,
      processList: processList,
      handOk: this.handleOk,
      operateType: this.props.operateType,
      type: 'create',
      preview: false,
      disabled: false,
      ticketType: 'edit',
      location: this.props.location,
      getFormsValue: this.getFormsValue,
      onValuesChange: this.props.onValuesChange,
      handleRelateCancel: this.props.handleRelateCancel,
      ticketTemplateId: this.props.ticketTemplateId,
      sourceType: this.props.sourceType,
      draftsData: this.props.draftsData,
      kb: this.props.kb,
      startNode: true,
      // 哪里用到了这个创建工单模块，比如低代码用了source="lowcode"
      source: this.props.source,
      relateTicketList: this.props.ticketStore.relateTicket,
      mappingFields: this.props.mappingFields,
      createType: this.props.createType,
      relateSubProcessTickets: toJS(this.props.ticketStore.relateSubProcessTickets)
    }
    const modelStageVoList = toJS(forms.modelStageVoList)
    let className = ''
    if (Array.isArray(modelStageVoList) && modelStageVoList.length > 0) {
      className = 'create-step-wrap'
    }
    const { headerInfo, setFieldsValue, getTicketValues, inContainer } = this.props
    return (
      <>
        <div>
          <ErrorBoundary desc={i18n('loadFail', '加载失败')}>
            <Head
              {...dilver}
              source={this.props.source}
              headerInfo={headerInfo ? headerInfo.split(',') : []}
              setFieldsValue={setFieldsValue}
              getTicketValues={getTicketValues}
              inContainer={inContainer}
            />
          </ErrorBoundary>
        </div>

        <div className={'create-submodel-forms-wrap ' + className}>
          <div id="create-submodel-forms">
            <Forms
              ref={(node) => {
                this.createForms = node
              }}
              {...dilver}
              popupContainerId="create-submodel-forms"
            />
          </div>
          {/* <div className="ticket-create-forms-head">
          {forms.mode === 1 ? <AdvancedCreateBtn {...dilver} /> : <CreateBtn {...dilver} />}
        </div> */}
        </div>
      </>
    )
  }
}

export default CreateTicket
