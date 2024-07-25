import React, { Component } from 'react'
import { message, Modal } from '@uyun/components'
import { qs } from '@uyun/utils'
import moment from 'moment'
import permissionListStore from '~/stores/permissionListStore'
import tableListStore from '~/stores/tableListStore'
import globalStore from '~/stores/globalStore'
import VerificationStore from '~/system/verification/verificationStore'
import BuiltInProps from './utils/BuiltInProps'
import * as DataTable from './utils/DataTable'
import { request } from './utils/request'
import communication from './utils/communication'
import { getAllFields } from '~/utils/common'
import uuid from '~/utils/uuid'
import Forms from './forms'
import {
  Judge,
  setVal,
  getState,
  setformLayoutVosField,
  getFormLayoutVosCode,
  checkFieldsError
} from './utils/scriptfunc'
import { getNoDisabledCodes } from '~/components/TicketTemp/logic'
import '~/details/style/forms.less'
import _ from 'lodash'
import { toJS } from 'mobx'
import { hasRelateJob, getIsHideRelateJob } from '~/ticket/forms/utils/logic'

import TableStore from '~/components/tableCreator/content/ContentForForm/TableStore'
import { formGroupStore } from './formGroupStore'

const verificationStore = new VerificationStore()
export default class TicketForm extends Component {
  static defaultProps = {
    onValuesChange: () => {},
    onDetailTabChange: () => {} // 用于切换工单详情的tab
  }

  constructor(props) {
    super(props)
    // 记录本次change是否需要页面跳转提示
    // 初始时，由脚本/字段联动/某些字段加载时引起的change不需要跳转提示
    // 以上情况都要在change之前设置window.FORM_LEAVE_NOTIRY=false
    window.FORM_LEAVE_NOTIRY = true

    this.ticketforms = React.createRef()

    this.timer = null // setFields的定时器
    this.scriptTimer = null // onchange脚本定时器
    this.fieldsTimer = null

    // 存放字段的错误信息，用于表单提交时判断是否存在错误
    this.loadAndChangeErrors = {}

    // 存放立即执行的非脚本的字段联动变更内容
    this.unScriptLinkageStrategyCache = []

    this.state = {
      fieldMinCol: 12, // 字段分组的最小值  24  12 8 6  ，默认12
      formLayoutVos: [], // 表单信息
      changeTriggerData: [], // 字段联动策略汇总
      combineCustomScript: {}, // 脚本信息
      subformScript: [], // 子表单脚本
      relateTicketError: false,
      allFields: [],
      globalRegular: [],
      allData: {},
      relateSubProcessErr: false,
      showOkTables: []
    }
  }

  async componentDidMount() {
    this.initRender()
    await verificationStore.queryGlobalRegularization()
  }

  queryFileAccept = () => {
    const { fileAccept } = globalStore
    if (!fileAccept) {
      globalStore.getFileAccept()
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.allData !== nextState.allData) {
      return true
    }
    if (nextProps.mappingFields !== this.props.mappingFields) {
      this.ticketforms.current && this.ticketforms.current.props.form.resetFields()
      this.initRender()
      return true
    }
    if (this.props.ticketTemplateId !== nextProps.ticketTemplateId) {
      return true
    }
    //olaAndSlaInfo
    if (this.props.olaAndSlaInfo !== nextProps.olaAndSlaInfo) {
      return true
    }
    if (this.state.formLayoutVos !== nextState.formLayoutVos) {
      return true
    }
    if (this.state.relateTicketError !== nextState.relateTicketError) {
      return true
    }
    if (this.state.relateSubProcessErr !== nextState.relateSubProcessErr) {
      return true
    }
    if (nextProps.disabled !== this.props.disabled) {
      return true
    }

    if (nextProps.executeStep !== this.props.executeStep) {
      return true
    }

    const { forms: thisForms } = this.props
    const { forms: nextForms } = nextProps

    if (
      thisForms.ticketId !== nextForms.ticketId ||
      thisForms.caseId !== nextForms.caseId ||
      thisForms.status !== nextForms.status
    ) {
      return true
    }
    return false
  }

  componentDidUpdate(prevProps, prevState) {
    // 工单详情 当工单id 任务id 工单状态 改变的时候 刷新表单this.props
    const condition = ['ticketId', 'caseId', 'status']
    if (
      !_.isEmpty(this.props.forms) &&
      !_.isEqual(_.pick(prevProps.forms, condition), _.pick(this.props.forms, condition))
    ) {
      // 切换工单时，字段组件数据未更新，比如切到关联工单
      this.ticketforms.current && this.ticketforms.current.props.form.resetFields()
      this.initRender()
    }
  }

  componentWillUnmount() {
    const { forms } = this.props
    const { ticketId } = forms
    // 清空权限自服务数据有问题，比如新建关联工单后点击关联工单，数据仍是主单的
    // permissionListStore.distory()
    tableListStore.destory(ticketId)
    const dom = document.getElementById(`ticketTemplate${_.get(this, 'props.forms.ticketId')}`)
    if (dom) dom.removeEventListener('ticketTemplateSwitch', this.reload, false)

    this.timer && clearTimeout(this.timer)

    if (this.fieldsTimer) clearTimeout(this.fieldsTimer)
  }

  // 提供给BuiltInProps取值的函数
  getProps = (type, key) => {
    switch (type) {
      case 'forms':
        return _.pick(this.props.forms, key)
      case 'action':
        return _.cloneDeep(this.submitAction)
      case 'iframe':
        return this.state.formLayoutVos
      default:
        message.warning('无效的type')
        return null
    }
  }

  // 获取模板数据，覆盖表单
  changeTicketFormByTemplate = (templateId) => {
    if (!templateId) {
      return Promise.resolve()
    }
    return axios.get(API.getModelFormTemplate, { params: { id: templateId } }).then((res) => {
      const { formData } = res || {}
      const fieldList = this.state.allFields
      const notDisabledCode = getNoDisabledCodes(fieldList)
      formData.ticketTemplateId = res.templateId
      notDisabledCode.push('ticketTemplateId')

      window.FORM_LEAVE_NOTIRY = false
      this.ticketforms.current.props.form.setFieldsValue(_.pick(formData, notDisabledCode))
    })
  }

  // 表单初次加载的时候触发,用来处理字段联动策略的勾选了立即触发的策略和表单脚本的onload脚本
  initRender = () => {
    const { forms } = this.props
    const { combineCustomScript, subformScript, formLayoutVos, ticketId } = forms
    let fields = getAllFields(formLayoutVos)
    this.setState({ allFields: fields })
    this.builtInProps = new BuiltInProps(fields, this.getProps, this.globalInitScript)
    const states = getState(combineCustomScript, subformScript, formLayoutVos, fields)

    // 监听模板是否切换然后确定要不要重新触发onload脚本（仅主表单配置了 addEventTemplateSwitch 才有效果，子表单无效）
    const dom = document.getElementById(`ticketTemplate${ticketId}`)
    if (dom && _.get(states, 'combineCustomScript.formExtra.addEventTemplateSwitch')) {
      dom.removeEventListener('ticketTemplateSwitch', this.reload, false)
      dom.addEventListener('ticketTemplateSwitch', this.reload, false)
    }

    this.setState({ ...states }, () => {
      // 如果url中存在templateId，则先用模板数据覆盖表单
      const { templateId } = qs.parse(this.props.location.search.slice(1))
      this.changeTicketFormByTemplate(templateId).then(() => {
        // 脚本分为三种，字段上的脚本，公共表单的脚本，私有表单的脚本
        // 执行顺序为 字段上的脚本  表单上的脚本
        if (this.state.scriptLen.init === 0) {
          this.globalInitScript()
        } else {
          this.fieldInitScript()
        }
      })
    })
    // 最外层请求表格数据
    this.getTableData(forms)
    //如果有附件字段获取白名单，一次性获取，之前是每个附件字段获取一遍
    let hasFile = fields.some((d) => d.type === 'attachfile' || d.type === 'ticketComment')
    if (hasFile) {
      this.queryFileAccept()
    }
  }

  // 进入获取表格数据
  getTableData = async (formList) => {
    const { tacheId, modelId, caseId, ticketId } = formList
    const { copyTicketId } = formList
    let fields = getAllFields(formList.formLayoutVos)
    const fieldList = fields
    const types = _.map(fields, (item) => item.type)

    if (types.includes('table') && ticketId) {
      const { getFieldValue } = this.ticketforms.current.props.form
      const tableCodes = [] // 获取表单所有字段code，判断是否有表格或者配置项
      const fieldsCodes = []
      const tablePageFlagNo = [] // 无分页 有默认数据
      const tablePageFlagYes = [] // 有分页  有默认数据
      const tablePageFlagNoCode = []
      const tablePageFlagYesCode = []

      // 无默认数据的code集合
      const pageFlagNoCode = []
      const pageFlagYesCode = []

      let allData = {}

      _.map(fieldList, (field) => {
        if (field.type === 'table') {
          tableCodes.push(field.code)
          const codes = this.getCodes(field.params)
          fieldsCodes.push(...codes)
          let initialTableValue
          try {
            initialTableValue = field.defaultValue
              ? typeof field.defaultValue === 'string'
                ? JSON.parse(field.defaultValue)
                : field.defaultValue
              : []
          } catch (e) {
            initialTableValue = undefined
          }

          const value = getFieldValue(field.code) || initialTableValue

          // 有默认值会先走保存接口然后走查询接口
          // 还有是否分页这个问题
          if (!field.tablePageFlag) {
            // 不分页数据
            if (value && value.length > 0 && ticketId) {
              // 有默认值
              const data = value.map((item) => ({
                rowData: _.omit(item, 'rowId'),
                rowId: uuid(),
                rowStatus: 0,
                fieldCode: field.code
              }))
              tablePageFlagNo.push(...data)
              tablePageFlagNoCode.push(field.code)
              // code 需要做个集合这里需要掉保存接口
            } else {
              // 无默认值
              pageFlagNoCode.push(field.code)
              // 需要做个集合 直接调查询数据接口
            }
          } else {
            // 分页数据
            if (value && value.length > 0 && ticketId) {
              // 有默认值

              const data = value.map((item) => ({
                rowData: _.omit(item, 'rowId'),
                rowId: uuid(),
                rowStatus: 0,
                fieldCode: field.code
              }))
              tablePageFlagYes.push(...data)
              tablePageFlagYesCode.push(field.code)
              // code 需要做个集合这里需要掉保存接口
            } else {
              // 无默认值
              pageFlagYesCode.push(field.code)
              // 需要做个集合 直接调查询数据接口
            }
          }
        }
      })

      await this.queryFields(fieldsCodes)
      if (!_.isEmpty(tablePageFlagNo)) {
        const codes = [...tablePageFlagNoCode, ...pageFlagNoCode]
        this.store = new TableStore(
          {
            ticketId: ticketId,
            caseId: caseId,
            modelId: modelId,
            fieldCode: codes.join(',')
          },
          { pageFlag: 0, copyTicketId: copyTicketId }
        )
        const data = await this.store.saveAndQueryData(tablePageFlagNo)
        allData = Object.assign(allData, data)
      } else if (!_.isEmpty(pageFlagNoCode)) {
        this.store = new TableStore(
          {
            ticketId: ticketId,
            caseId: caseId,
            modelId: modelId,
            fieldCode: pageFlagNoCode.join(',')
          },
          { pageFlag: 0, copyTicketId: copyTicketId }
        )
        const data = await this.store.queryData()
        allData = Object.assign(allData, data)
      }

      if (!_.isEmpty(tablePageFlagYes)) {
        const codes = [...tablePageFlagYesCode, ...pageFlagYesCode]
        this.store = new TableStore(
          {
            ticketId: ticketId,
            caseId: caseId,
            modelId: modelId,
            fieldCode: codes.join(',')
          },
          { pageFlag: 1, copyTicketId: copyTicketId }
        )
        const data = await this.store.saveAndQueryData(tablePageFlagYes)
        allData = Object.assign(allData, data)
      } else if (!_.isEmpty(pageFlagYesCode)) {
        this.store = new TableStore(
          {
            ticketId: ticketId,
            caseId: caseId,
            modelId: modelId,
            fieldCode: pageFlagYesCode.join(',')
          },
          { pageFlag: 1, copyTicketId: copyTicketId }
        )
        const data = await this.store.queryData()
        allData = Object.assign(allData, data)
      }
      this.setState({ allData })
    }
  }

  queryFields = async (codes) => {
    const { modelId } = this.props.forms
    if (_.isEmpty(codes)) return

    const res = await axios.post(
      API.findFieldByCodeList,
      { fieldCodes: codes },
      { params: { modelId: modelId } }
    )
    // compact 过滤空的
    const fields = _.compact(res)
    tableListStore.saveTableQueryFields(fields)
  }

  getCodes = (columns) =>
    _.chain(columns)
      .filter((item) => item.type !== 'normal')
      .map((item) => item.source)
      .compact()
      .value()

  // 重新触发 onload 脚本
  reload = (event) => {
    if (_.get(event, 'detail.ticketId') === _.get(this, 'props.forms.ticketId')) {
      this.globalInitScript()
    }
  }

  /**
   * 表单中任意值的改变就会触发该事件,用来执行字段的联动策略和表单中onchange脚本
   * @param {Object} changedValues // 当前改变的字段的值
   * @param {Object} allValues //表单中所有的字段值
   */
  handleFieldChange = (changedValues, allValues) => {
    this.fieldsTimer = setTimeout(() => {
      this.fieldOnChange(changedValues, allValues) // 字段联动策略
    }, 300)
    if (this.scriptTimer) clearTimeout(this.scriptTimer)
    this.scriptTimer = setTimeout(() => {
      // this.fieldOnChange(changedValues, allValues) // 字段联动策略
      this.globalOnChangeScript(changedValues, allValues) // 全局的onchange脚本
    }, 300)
    if (window.FORM_LEAVE_NOTIRY) {
      this.props.onValuesChange(true) // 标识表单内容已经发生了改变
    }
  }

  // 执行字段联动策略中勾选了立即触发策略 该函数仅会走一次
  fieldInitScript = () => {
    const fields = this.state.allFields
    const { changeTriggerData } = this.state
    const { getFieldsValue } = this.ticketforms.current.props.form
    const values = getFieldsValue()

    _.forEach(changeTriggerData, (changeTrigger) => {
      let field = _.find(fields, (field) => field.code === changeTrigger.triggerName)

      //纵向分组上设置的联动策略
      if (!field) {
        field = _.find(
          this.state.formLayoutVos,
          (formLayout) => formLayout.id === changeTrigger.triggerName
        )
      }
      const { initialValue, conditionExpressions, changeContent, when } = changeTrigger
      if (initialValue) {
        // 如果勾选了立即触发，默认执行
        this.executionFieldScript(true, when, conditionExpressions, changeContent, field, values)
      }
    })
  }

  /**
   * 表单变动时执行所有的字段联动策略（包括勾选了立即触发的）
   * @param {Object} changedValues // 当前改变的字段的值
   * @param {Object} allValues //表单中所有的字段值
   */
  fieldOnChange = (changedValues, allValues) => {
    const fields = this.state.allFields
    const { changeTriggerData, scriptLen } = this.state
    const { init, inited } = scriptLen
    // const code = _.keys(changedValues)[0]

    // 批量赋值的场景(如选中模板)，需要对所有改变的值进行联动
    const codes = _.keys(changedValues)

    _.forEach(changeTriggerData, (changeTrigger) => {
      const { conditionExpressions, changeContent, triggerName, when } = changeTrigger
      let field = _.find(fields, (field) => field.code === triggerName)
      //纵向分组上设置的联动策略
      if (!field) {
        field = _.find(
          this.state.formLayoutVos,
          (formLayout) => formLayout.id === changeTrigger.triggerName
        )
      }
      const expressionKeys = _.map(conditionExpressions, (expression) => expression.key) // 当前字段条件的key的list

      // 初始化脚本执行完成以后 且改变的字段在条件内
      // if (_.includes(expressionKeys, code) && init === inited) {
      //   this.executionFieldScript(false, when, conditionExpressions, changeContent, field, allValues)
      // }
      if (init === inited) {
        codes.forEach((code) => {
          if (_.includes(expressionKeys, code)) {
            this.executionFieldScript(
              false,
              when,
              conditionExpressions,
              changeContent,
              field,
              allValues
            )
          }
        })
      }
    })
  }

  // 按钮字段的点击事件
  btnClick = (code) => {
    const { combineCustomScript, subformScript } = this.state
    // 是否是子表单的字段
    const itemScript = subformScript && subformScript.find((itm) => itm[`${code}_onclick`])

    if (combineCustomScript[`${code}_onclick`]) {
      this.executionScript(combineCustomScript[`${code}_onclick`], '', 'onclick')
    } else if (itemScript) {
      this.executionScript(itemScript[`${code}_onclick`], '', 'onclick')
    }
  }

  onblur = async (field) => {
    const { code } = field
    const { combineCustomScript, subformScript } = this.state
    // 是否是子表单的字段
    const itemScript = subformScript && subformScript.find((itm) => itm[`${code}_onblur`])
    if (combineCustomScript[`${code}_onblur`]) {
      await this.executionScript(combineCustomScript[`${code}_onblur`], '', 'onblur')
    } else if (itemScript) {
      await this.executionScript(itemScript[`${code}_onblur`], '', 'onblur')
    }
  }

  /**
   * 对字段的联动策略进行记录，并判断符合条件的执行
   * @param {Boolean} falt // 是否默认执行该策略
   * @param {String} when // any表示任意满足、all及其他表示全部满足
   * @param {Array} conditionExpressions //联动策略的条件
   * @param {Array} changeContent //联动策略的动作
   * @param {Object} field //要修改的字段
   * @param {Object} values //表单所有的值
   */
  executionFieldScript = (falt, when, conditionExpressions, changeContent, field, values) => {
    const form = this.ticketforms.current.props.form
    const props = { values, forms: this.props.forms } // 给动态脚本使用得数据
    let isExecution = falt
    const callback = (list) => {
      if (list) {
        this.callback(list, null, 'field', null, null)
      }
      // this._render(falt ? 'init' : undefined)
    }

    const whenFunc = when === 'any' ? _.some : _.every

    isExecution = whenFunc(conditionExpressions, (condition) => {
      const { key, value, comparison } = condition
      // 下拉列表的值进行比较时，为对象，且key不一样 需要将对象改成一样的key值
      let formatVal = value
      if (_.has(value, 'key') && _.has(value, 'label')) {
        formatVal = { label: value.label, value: value.key }
      }
      const fields = this.state.allFields
      let timeGranularity = 3
      if (moment.isMoment(values[key])) {
        timeGranularity = fields.find((d) => d.code === key).timeGranularity
      }
      let currentVal = values[key]
      if (_.has(currentVal, 'key') && _.has(currentVal, 'label')) {
        currentVal = { label: currentVal.label, value: currentVal.key }
      }
      return Judge(currentVal, formatVal, comparison, timeGranularity)
    })
    // 符合条件的执行，不符合条件的进行一次记录
    if (isExecution) {
      _.forEach(changeContent, (change) => {
        const { type, value } = change
        // 立即执行的非脚本的联动变更，缓存起来，批量处理
        if (falt && type !== 'asyncValue') {
          const content = { code: field.code }
          if (type === 'visible') {
            content.hidden = value === '0'
          } else if (type === 'checkIn') {
            content.isRequired = +value
          } else if (type === 'changeValue') {
            content.value = change?.empty === 1 ? undefined : value
          } else if (type === 'timeValidate') {
            content.timeValidate = value
          }
          this.unScriptLinkageStrategyCache.push(content)
        } else {
          setVal(change, field, form, callback, props)
        }

        this._render(falt ? 'init' : undefined)
      })
    } else {
      _.forEach(changeContent, (content) => {
        if (content.type === 'checkIn') {
          // callback([
          //   {
          //     code: field.code,
          //     isRequired: content.value === '1' ? 0 : (content.value === '2' ? Number(field.isRequired) :  1)
          //   }
          // ])
        } else {
          callback()
        }

        this._render(falt ? 'init' : undefined)
      })
    }
  }

  // 解析 onload  脚本，并且执行
  globalInitScript = async () => {
    const { combineCustomScript, subformScript } = this.state
    const { onload } = combineCustomScript // 表单的全局脚本

    const list = _.map(subformScript, (item) =>
      item.onload ? this.executionScript(item.onload, null, 'onload') : undefined
    )
    await Promise.all(list)
    if (onload) {
      this.executionScript(onload, null, 'onload')
    }
  }

  /**
   * 解析onchagne 脚本，并且执行对应的脚本
   * @param {Object} changedValues // 当前改变的字段的值
   * @param {Object} allValues //表单中所有的字段值
   */
  globalOnChangeScript = (changedValues, allValues) => {
    const { combineCustomScript, subformScript } = this.state
    // isListenAllChange 控制onchange的时候是否要触发当前改变的字段的所有onchange事件，之前仅触发第一个（国信功能迁移）
    const isListenAllChange = _.get(combineCustomScript, 'formExtra.extra.isListenAllChange')
    const keys = isListenAllChange ? _.keys(changedValues) : _.keys(changedValues).slice(0, 1)

    const subFormScriptList = []

    for (const key of keys) {
      _.forEach(subformScript, (item) => {
        if (item[`${key}_onchange`]) {
          subFormScriptList.push(
            this.executionScript(item[`${key}_onchange`], allValues, 'onchange')
          )
        }
      })
    }

    Promise.all(subFormScriptList).then(() => {
      for (const key of keys) {
        if (combineCustomScript[`${key}_onchange`]) {
          this.executionScript(combineCustomScript[`${key}_onchange`], allValues, 'onchange')
        }
      }
    })
  }

  /**
   * 执行全局脚本
   * @param {string | Function} scriptfunc 脚本函数
   * @param {Object} allValues 表单的值
   * @param {String} carriedOutType  用来判断 onload 和 onchange 脚本
   */
  executionScript = (scriptfunc, allValues, carriedOutType, submitLine) => {
    const startTime = new Date().getTime()
    console.log('脚本开始执行时间', startTime)
    return new Promise((resolve, reject) => {
      const builtInProps = this.builtInProps
      const { getFieldsValue } = this.ticketforms.current.props.form
      const values = _.isEmpty(allValues) ? getFieldsValue() : allValues
      const _dataTable = DataTable
      const _request = request
      try {
        const fn = eval(`(${scriptfunc})`)
        if (carriedOutType === 'onload') {
          builtInProps.onLoadId = uuid()
        } else if (carriedOutType === 'onclick') {
          builtInProps.onClickId = uuid()
        } else if (carriedOutType === 'onblur') {
          builtInProps.onBlurId = uuid()
        } else if (carriedOutType === 'onrowok') {
          builtInProps.onrowokId = uuid()
        } else if (carriedOutType === 'importvalidate') {
          builtInProps.importvalidateId = uuid()
        } else {
          builtInProps.onChangeId = uuid()
        }
        builtInProps.values = values
        builtInProps.submitLine = submitLine
        builtInProps.Modal = Modal
        builtInProps._dataTable = _dataTable
        builtInProps._request = _request
        fn(
          (list, id) => {
            this.callback(list, id, null, resolve, reject, carriedOutType)
          },
          carriedOutType === 'onload'
            ? builtInProps.onLoadId
            : carriedOutType === 'onclick'
            ? builtInProps.onClickId
            : carriedOutType === 'onblur'
            ? builtInProps.onBlurId
            : carriedOutType === 'onrowok'
            ? builtInProps.onrowokId
            : carriedOutType === 'importvalidate'
            ? builtInProps.importvalidateId
            : builtInProps.onChangeId,
          builtInProps
        )
      } catch (e) {
        console.log(e)
        reject(new Error('脚本函数执行错误'))
      }
      console.log(
        '脚本执行结束',
        new Date().getTime(),
        '耗时：',
        (new Date().getTime() / 1000 - startTime / 1000).toFixed(2) + ' s'
      )
    })
  }

  /**
   * 解析脚本执行回传的参数，并且使用该参数修改对应的表单属性
   * @param {Array} list 脚本执行完成以后要修改表单的数据
   * @param {String} id 当前脚本对应的id
   * @param {String} type 用来判断是 字段联动策略 还是全局脚本 （全局脚本有id作为匹配，字段联动策略没有）
   * @param {Function} resolve Promise 成功函数
   * @param {Function} reject Promise 失败函数
   */
  callback = (list, id, type, resolve, reject, carriedOutType) => {
    console.log('list', list)
    const { onLoadId, onChangeId, onClickId, onBlurId, onrowokId, importvalidateId } =
      this.builtInProps
    if (
      _.includes([onLoadId, onChangeId, onClickId, onBlurId, onrowokId, importvalidateId], id) ||
      type === 'field'
    ) {
      const { setFieldsValue, setFields, getFieldValue } = this.ticketforms.current.props.form
      let values = {}
      let errors = {}
      const codes = []
      _.forEach(list, (item) => {
        const { code, value, errorMes, timeValidate } = item || {}
        // code集合，用来重新渲染该些字段(quecp)
        codes.push(code)
        // 设置值的处理
        if (_.has(item, 'value')) {
          values = { ...values, [code]: value }
        }
        // 设置错误信息的处理
        if (_.has(item, 'errorMes')) {
          errors = {
            ...errors,
            [code]: {
              errors: errorMes ? [new Error(errorMes)] : undefined,
              value: _.has(item.value) ? value : this.builtInProps.values[code]
            }
          }
          if (
            ['onload', 'onchange', 'onclick', 'onblur', 'onrowok', 'importvalidate'].includes(
              carriedOutType
            )
          ) {
            this.loadAndChangeErrors = {
              ...this.loadAndChangeErrors,
              [code]: errorMes
            }
          }
        }
        // 时间字段校验
        if (_.has(item, 'timeValidate')) {
          const { type, fieldCode, fieldName } = timeValidate
          const currentValue = getFieldValue(code) ? getFieldValue(code).valueOf() : undefined
          const targetTime =
            type === 1 || type === 2 ? new Date().getTime() : getFieldValue(fieldCode)
          let timeErrorMes = ''

          if (targetTime) {
            if (type === 1 && currentValue <= targetTime) {
              timeErrorMes = '必须大于当前时间'
            } else if (type === 2 && currentValue >= targetTime) {
              timeErrorMes = '必须小于当前时间'
            } else if (type === 3 && currentValue <= targetTime) {
              timeErrorMes = `必须大于${fieldName}`
            } else if (type === 4 && currentValue >= targetTime) {
              timeErrorMes = `必须小于${fieldName}`
            } else {
              timeErrorMes = undefined
            }
          }

          // 工单不能编辑时，不需要校验时间字段
          if (!currentValue || !targetTime || this.props.disabled) {
            timeErrorMes = undefined
          }

          errors[code] = {
            errors: timeErrorMes ? [new Error(timeErrorMes)] : undefined,
            value: currentValue
          }

          this.loadAndChangeErrors[code] = timeErrorMes
        }
        // 权限自服务字段如果设置联动策略isRequired值更新
        permissionListStore.list.forEach((d) => {
          if (d.fieldCode === item.code && _.has(item, 'isRequired')) {
            d.isRequired = item.isRequired
          }
        })
      })
      // 保存有变动的字段，以便子组件重新渲染(quecp)
      window.FORM_CHANGE_FIELD_CODES = new Set(codes)

      // 设置表单的值
      if (!_.isEmpty(values)) {
        window.FORM_LEAVE_NOTIRY = false
        setFieldsValue(values)
      }

      // 设置错误信息
      if (!_.isEmpty(errors)) {
        reject && reject(errors)
        // 字段联动会有同时设置两个字段error的情况
        // clearTimeout会导致上一个error不生效
        // 不知道这个clearTimeout注释掉会不会有问题
        // this.timer && clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          setFields(errors)
        }, 300)
      }

      // 子组件重新渲染完毕则置空该数据(quecp)
      window.FORM_CHANGE_FIELD_CODES = new Set()

      // 用于处理字段的其他属性 ，列如 下拉 必填 隐藏(onchange 触发太快，直接在源数据上改，然后forceUpdate 更新)
      // 这里坑了，渲染太多次，影响页面加载速度
      // 将立即执行的非脚本的联动策略缓存起来批量处理，减少render次数
      setformLayoutVosField(this.state.formLayoutVos, list)
      this.forceUpdate()
      resolve && resolve()
    }
  }

  // 关联工单的必填校验
  validateRelateTicketField = () => {
    let relateTicketError = false
    const { formLayoutVos } = this.state
    // 获取关联工单相关信息
    const relateTicketFieldList = []
    _.forEach(formLayoutVos, (d) => {
      if (d.type === 'relateTicket') {
        relateTicketFieldList.push(d)
      } else if (d.type === 'group') {
        _.forEach(d.fieldList, (d2) => {
          if (d2.type === 'relateTicket') {
            relateTicketFieldList.push(d2)
          }
        })
      } else {
        _.forEach(d.tabs, (d3) => {
          _.forEach(d3.fieldList, (d4) => {
            if (d4.type === 'relateTicket') {
              relateTicketFieldList.push(d4)
            }
          })
        })
      }
    })
    const { relateTicketList } = this.props
    if (relateTicketFieldList.length > 0 && relateTicketFieldList[0].isRequired === 1) {
      if (!relateTicketList || relateTicketList.length === 0) {
        relateTicketError = true
      } else {
        relateTicketError = false
      }
    }
    this.setState({ relateTicketError })
    return relateTicketError
  }

  // 关联子流程控件的必填校验
  validateRelateSubProcessField = () => {
    let relateSubProcessErr = false
    const { formLayoutVos } = this.state
    // 获取关联工单相关信息
    const relateSubTicketFields = []
    _.forEach(formLayoutVos, (d) => {
      if (d.type === 'relateSubProcess') {
        relateSubTicketFields.push(d)
      } else if (d.type === 'group') {
        _.forEach(d.fieldList, (d2) => {
          if (d2.type === 'relateSubProcess') {
            relateSubTicketFields.push(d2)
          }
        })
      } else {
        _.forEach(d.tabs, (d3) => {
          _.forEach(d3.fieldList, (d4) => {
            if (d4.type === 'relateSubProcess') {
              relateSubTicketFields.push(d4)
            }
          })
        })
      }
    })
    const { relateSubProcessTickets } = this.props
    if (relateSubTicketFields.length > 0 && relateSubTicketFields[0].isRequired === 1) {
      if (!relateSubProcessTickets || relateSubProcessTickets.length === 0) {
        relateSubProcessErr = true
      } else {
        if (relateSubProcessTickets.every((d) => !d.taskTicketId && _.isEmpty(d.children))) {
          relateSubProcessErr = true
        } else {
          relateSubProcessErr = false
        }
      }
    }
    this.setState({ relateSubProcessErr })
    return relateSubProcessErr
  }
  /**
   * 提交前的校验
   * @param {Object} submitLine 点击按钮对应的 type 线id等信息
   */
  validateFieldsValue = (submitLine = {}) => {
    return new Promise(async (resolve, reject) => {
      const { getFieldsError, getFieldsValue, validateFields } = this.ticketforms.current.props.form

      // 创建协办单时不走脚本
      if (submitLine.type === 'createRelate') {
        resolve(getFieldsValue())
        return false
      }
      const { modelCode } = this.props.forms // 模型的编码
      const { formLayoutVos, combineCustomScript, subformScript } = this.state

      // 对onload和change脚本校验；出现错误就禁止提交并抛出错误信息
      // 脚本有 onload ， onchange ， onsubmit三种
      // onsubmit 设置的错误信息，第二次点击提交时 isAntdfieldsError 可以捕获到 ； isFieldsError 不能捕获到

      const codes = getFormLayoutVosCode(formLayoutVos, null, 'hidden') // 获取当前表单中显示的字段列表code
      const fieldsError = getFieldsError(codes)
      const isAntdfieldsError = _.chain(fieldsError).omitBy(_.isEmpty).value() // antd原生错误
      const isFieldsError = checkFieldsError(this.loadAndChangeErrors, 'scroll')

      // 这里是判断字段联动或全局脚本中设置的字段error
      // form表单中有设置error的字段 且 this.loadAndChangeErrors非空
      if (!_.isEmpty(isAntdfieldsError) && isFieldsError) {
        reject(new Error('表单中存在通过脚本触发的错误提示 ，请修改后重新提交'))
        return false
      }

      // 执行校验脚本和向iframe控件发送信息处理函数
      const validateScript = async () => {
        try {
          this.submitAction = _.assign({}, submitLine, { modelCode })
          const { onsubmit } = combineCustomScript || {}

          const subFormList = _.map(subformScript, (item) => {
            if (item.onsubmit) return this.executionScript(item.onsubmit, null, 'onsubmit')
            return undefined
          })
          await Promise.all(subFormList)
          if (onsubmit) {
            await this.executionScript(onsubmit, null, 'onsubmit', submitLine)
          }
          await communication(formLayoutVos, this.submitAction, 1)
          resolve(getFieldsValue())
        } catch (e) {
          // 脚本设置error时，工单详情切换到表单tab
          this.props.onDetailTabChange('1')
          // 滚动到第一个出错的字段的位置
          if (!_.isError(e)) {
            const node = document.getElementById(_.head(_.keys(e)))
            node && node.scrollIntoView({ block: 'center' })
          }
          reject(e)
        }
      }

      let verifyForm = ['submit', 'jump', 'submodel', 'remote_submit']
      const res = await globalStore.getTicketIsVerify()
      if (!res) {
        verifyForm = ['submit', 'jump', 'remote_submit']
      }
      // 部分按钮操作需要校验表单
      if (_.includes(verifyForm, submitLine.action)) {
        const passed = permissionListStore.validate(codes)
        if (passed === false || typeof passed === 'string') {
          reject(new Error(passed))
        }

        // 表单中表格字段的校验
        const tableListPassed = tableListStore.validate(codes)
        if (tableListPassed === false) {
          reject(new Error('表格字段校验失败'))
        }
        // 关联工单必填校验
        const errorRelate = this.validateRelateTicketField()
        if (errorRelate) {
          reject(new Error('关联工单字段校验失败'))
          const node = document.getElementById('relateTicketField')
          node && node.scrollIntoView({ block: 'center' })
        }
        // 关联子流程必填校验
        const errorSubProcessRelate = this.validateRelateSubProcessField()
        if (errorSubProcessRelate) {
          reject(new Error('关联子流程字段校验失败'))
        }

        // 关联自动化任务
        const itemRelateJob = hasRelateJob(formLayoutVos || [])
        const isHideRelateJob = getIsHideRelateJob()
        if (
          !isHideRelateJob &&
          itemRelateJob &&
          this.ticketforms?.current &&
          this.ticketforms?.current?.onValidateAutoPlan
        ) {
          const res = this.ticketforms?.current?.onValidateAutoPlan()
          if (res === false) {
            reject(false)
          }
        }
        validateFields(codes, (errors) => {
          if (errors) {
            // 表单校验失败时，工单详情切换到表单tab
            this.props.onDetailTabChange('1')
            if (!_.isError(errors)) {
              const errFieldCode = _.head(_.keys(errors))
              //校验错误，触发 Collapse 展开
              formGroupStore.setState({ code: errFieldCode })
              const node = document.getElementById(errFieldCode)
              console.log('node', node)
              node && node.scrollIntoView({ block: 'center' })
            }
            reject(errors)
            return false
          }
          validateScript()
        })
        // ie优化，将validateFieldsAndScroll执行两遍，让其字段全部render一遍
        // const validateFields = fn => {
        //   validateFieldsAndScroll(codes, errors => {
        //     if (errors) {
        //       // 表单校验失败时，工单详情切换到表单tab
        //       this.props.onDetailTabChange('1')
        //       reject(errors)
        //       return false
        //     }
        //     fn()
        //   })
        // }
      } else {
        validateScript()
      }
    })
  }

  /**
   * 判断勾选了立即触发的联动策略是否执行完了，如果完成以后在执行全局脚本
   * @param {String} type 联动策略分类
   */
  _render = (type) => {
    if (type === 'init') {
      this.state.scriptLen.inited = this.state.scriptLen.inited + 1
      const { init, inited } = this.state.scriptLen
      // 当前字段走了几个异步脚本，当走过的脚本等于脚本总数的时候再执行表单的脚本
      if (init - inited === 0) {
        // 将缓存的立即执行的非脚本的字段联动，放到这来统一执行，避免过多的单个执行导致的渲染
        if (this.unScriptLinkageStrategyCache.length > 0) {
          this.callback(this.unScriptLinkageStrategyCache, null, 'field', null, null)
          this.unScriptLinkageStrategyCache = []
        }
        // 再处理全局脚本
        this.globalInitScript()
      }
    }
  }

  onSubmitAutoPlan = () => {
    return this.ticketforms?.current?.onSubmitAutoPlan()
  }

  onRowOk = async (code, row) => {
    const { combineCustomScript, subformScript } = this.state
    this.builtInProps.currentRow = row
    // 是否是子表单的字段
    const itemScript = subformScript && subformScript.find((itm) => itm[`${code}_onrowok`])
    if (combineCustomScript[`${code}_onrowok`]) {
      await this.executionScript(combineCustomScript[`${code}_onrowok`], '', 'onrowok')
    } else if (itemScript) {
      await this.executionScript(itemScript[`${code}_onrowok`], '', 'onrowok')
    }
  }

  tableImportValidate = async (code) => {
    const { combineCustomScript, subformScript } = this.state
    console.log('导入校验', code)
    // 是否是子表单的字段
    const itemScript = subformScript && subformScript.find((itm) => itm[`${code}_importvalidate`])
    if (combineCustomScript[`${code}_importvalidate`]) {
      await this.executionScript(
        combineCustomScript[`${code}_importvalidate`],
        '',
        'importvalidate'
      )
    } else if (itemScript) {
      await this.executionScript(itemScript[`${code}_importvalidate`], '', 'importvalidate')
    }
  }

  render() {
    const {
      formLayoutVos,
      fieldMinCol,
      relateTicketError,
      allData,
      relateSubProcessErr,
      showOkTables
    } = this.state

    let globalRegular = _.cloneDeep(toJS(verificationStore.queryList))
    if (this.props.type === 'detail' && !_.isEmpty(this.props.forms) && !_.isEmpty(globalRegular)) {
      const { createTime } = this.props.forms
      globalRegular = _.reduce(
        globalRegular,
        (curr, pre) => {
          if (
            moment(pre.create_time).format('YYYY-MM-DD HH:mm:ss') <=
            moment(createTime).format('YYYY-MM-DD HH:mm:ss')
          ) {
            curr.push(pre)
          }
          return curr
        },
        []
      )
    }
    return (
      <Forms
        {...this.props}
        fieldMinCol={fieldMinCol}
        relateTicketError={relateTicketError}
        relateSubProcessErr={relateSubProcessErr}
        formLayoutVos={formLayoutVos}
        builtInProps={this.builtInProps}
        removeErrMesOfRelateTicket={() => this.setState({ relateTicketError: false })}
        handleFieldChange={this.handleFieldChange}
        wrappedComponentRef={this.ticketforms}
        globalRegular={globalRegular}
        // globalRegular={toJS(verificationStore.queryList)}
        allData={allData}
        btnClick={(code) => this.btnClick(code)}
        onblur={this.onblur}
        onRowOk={this.onRowOk}
        tableImportValidate={this.tableImportValidate}
        showOkTables={showOkTables}
      />
    )
  }
}
