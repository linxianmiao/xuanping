import React, { Component } from 'react'
import { toJS } from 'mobx'
import { observer, inject } from 'mobx-react'
import { withRouter } from 'react-router-dom'
import { qs } from '@uyun/utils'
import { Button, Col, Row, message } from '@uyun/components'
import { linkTo } from '~/components/LowcodeLink'
import { orLowcode } from '~/utils/common'

import DataType from '../config/dataType'
import CustomizeTable from '../component/customizeTable'
import CustomizeField from '../component/customizeField'

import {
  SingleRowText,
  MultiRowText,
  ListSelect,
  SingleSelect,
  MultiSelect,
  Int,
  Double,
  DateTime,
  User,
  Department,
  Cascader,
  RichText,
  Table,
  Password,
  Resource,
  Topology,
  File,
  TimeInterval,
  ExcelImport,
  Tags,
  Links,
  NodeExecution,
  Permission,
  JSONText,
  UserGroup,
  Job,
  Btn,
  NestedTable
} from '../component'
// import Script from '../component/script/create'
// import TicketList from '../component/ticketList/create'
// import RelateTicketNum from '../component/relateTicketNum/create'

import './style/layout.less'

@inject('globalStore', 'loadFieldWidgetStore')
@withRouter
@observer
class Layout extends Component {
  state = {
    loading: false
  }

  get locationQuery() {
    const { modelId, canModelOperate } = this.props
    return modelId ? { modelId, canModelOperate } : qs.parse(this.props.location.search.slice(1))
  }

  componentDidMount() {
    const { queryType, store, useScene = '', dataSetId = '' } = this.props
    const { modelId } = this.locationQuery
    if (queryType) {
      store.getFieldData(queryType, modelId, useScene, dataSetId).then((res) => {
        if (res) {
          // 各种字段类型组件中有用到getFieldValue方法来获取实时的表单值
          // 但是初始时获取到的往往是undefined
          // 所以在获取到字段数据后，调用字段组件的forceUpdate方法更新一下
          store.type && this[store.type].forceUpdate()
          // this[store.type].props.form.setFields()
        }
      })
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.queryType !== this.props.queryType) {
      const { queryType, store, useScene = '', dataSetId = '' } = this.props
      const { modelId } = this.locationQuery
      if (queryType) {
        store.getFieldData(queryType, modelId, useScene, dataSetId).then((res) => {
          if (res) {
            // 各种字段类型组件中有用到getFieldValue方法来获取实时的表单值
            // 但是初始时获取到的往往是undefined
            // 所以在获取到字段数据后，调用字段组件的forceUpdate方法更新一下
            store.type && this[store.type].forceUpdate()
            // this[store.type].props.form.setFields()
          }
        })
      }
    }
  }

  goHome = () => {
    const { modelId } = this.locationQuery
    if (modelId) {
      if (window.LOWCODE_APP_KEY) {
        linkTo({
          history: this.props.history,
          url: `/conf/model/advanced/${modelId}`,
          pageKey: 'model_edit',
          source: 'field',
          modelId
        })
      } else {
        this.props.history.replace({
          pathname: '/conf/model/advanced/' + modelId,
          state: { visibleKey: '5' }
        })
      }
    } else {
      if (window.LOWCODE_APP_KEY) {
        this.props.history.replace({
          pathname: `/modellist/${window.LOWCODE_APP_KEY}/?activeTab=fieldlist`
        })
        // linkTo({
        //   history: this.props.history,
        //   pageKey: 'home',
        //   homeKey: 'app_data',
        //   appDataKey: 'field_list'
        // })
      } else {
        this.props.history.push('/conf/field')
      }
    }
  }

  // 校验params选项参数内是否有空值
  onParamsRequired = (params) =>
    _.some(
      params,
      (item) => item.value === null || _.isEmpty(String(item.value)) || _.isEmpty(item.label)
    )

  // 级联，树 数据判空
  hasEmptyOption = (values) =>
    _.some(
      values,
      (item) =>
        _.isEmpty(item.label) || (!_.isEmpty(item.children) && this.hasEmptyOption(item.children))
    )

  // 是否可以编辑权限判断
  allowEdit = () => {
    const {
      queryType // 编辑字段的code
    } = this.props

    const {
      fieldInsert, // 新增字段权限
      fieldModify // 编辑字段权限
    } = this.props.globalStore.configAuthor

    const {
      fieldData,
      type // 字段的type
    } = this.props.store

    const {
      editable // 是否可以编辑，后端控制
    } = fieldData

    // 如果是模型中的字段，则必须canModelOperate
    const { modelId, canModelOperate } = this.locationQuery

    if (queryType) {
      // 编辑时
      return (
        editable === 1 &&
        orLowcode(
          fieldModify && (!modelId || canModelOperate === 'true' || canModelOperate === true)
        )
      )
    } else {
      return type && orLowcode(fieldInsert)
    }
  }

  TreeOrcascader = (type) => {
    this.props.store.TreeOrcascader(type)
  }

  // 下拉菜单的数据
  checkoutSel = (params, tabStatus, keySel, valueSel, dictionarySource) => {
    let flag = false
    if (tabStatus === '0') {
      flag = this.onParamsRequired(params)
    } else if (tabStatus === '2') {
      flag = !dictionarySource
    } else {
      if (!keySel || !valueSel) {
        flag = true
      }
    }
    return flag
  }

  saveField = (dataSetId = '') => {
    return new Promise((resolve) => {
      const queryType = this.props.queryType
      const { store } = this.props
      const { type, fieldData } = store
      const data = this[type].props.form.getFieldsValue()
      console.log('saveField-data', data, fieldData, type)
      console.log('saveField-fieldData', data, fieldData, type)
      console.log('saveField-type', data, fieldData, type)

      if (data.type === 'treeSel') {
        data.treeVos = data.cascaderData
      } else if (data.type === 'cascader') {
        data.cascade = data.cascaderData
      }
      if (data.cascaderData) {
        delete data.cascaderData
      }
      const resType = _.cloneDeep(data.resType)
      if (type === 'resource') {
        data.checkEditPermission = data.checkEditPermission ? data.checkEditPermission : false
        data.resType = _.map(resType, (d) => ({ key: d.value, label: d.label, value: d.value }))
      }
      let name = type === 'treeSel' ? DataType.cascader.name : DataType[type]?.name
      if (type === 'job') {
        name = i18n('job', '作业')
      }

      data.layoutId = _.get(data, 'layoutInfoVo.key')
      const totalData = {
        type,
        typeDesc: name,
        ..._.omit(data, 'layoutInfoVo')
      }
      if (queryType) {
        totalData.id = fieldData.id
      }

      //数据库表保存字段
      if (dataSetId) {
        totalData.dataSetId = dataSetId
        totalData.isKeyAttribute = fieldData.isKeyAttribute
      }

      this[type].props.form.validateFields(async (err, values) => {
        if (!err) {
          totalData.attributeColumns = _.map(totalData.attributeColumns, (attributeColumn) => ({
            name: attributeColumn.label,
            code: attributeColumn.key
          }))
          totalData.customColumns = _.map(totalData.customColumns, (col) => ({
            name: col.label,
            code: col.key
          }))
          // 类型为int时，默认值不得大于最小值的判断
          if (type === 'int') {
            const { intMin, intMax, defaultValue } = values
            if (
              (intMin || intMin === 0) &&
              (defaultValue || defaultValue === 0) &&
              defaultValue < intMin
            ) {
              message.error(i18n('default_value_error_tip', '默认值长度不能小于最小值'))
              return
            }
            if (
              (intMax || intMax === 0) &&
              (defaultValue || defaultValue === 0) &&
              defaultValue > intMax
            ) {
              message.error(i18n('default_value_error_tip1', '默认值长度不能大于最大值'))
              return
            }
            if ((intMin || intMin === 0) && (intMax || intMax === 0) && intMax < intMin) {
              message.error(i18n('default_value_error_tip2', '最大值不能小于最小值'))
              return
            }
          }
          // 类型为double时，默认值不得大于最小值的判断
          if (type === 'double') {
            const { doubleMin, doubleMax, defaultValue } = values
            if (
              (doubleMin || doubleMin === 0) &&
              (defaultValue || defaultValue === 0) &&
              defaultValue < doubleMin
            ) {
              message.error(i18n('default_value_error_tip', '默认值长度不能小于最小值'))
              return
            }
            if (
              (doubleMax || doubleMax === 0) &&
              (defaultValue || defaultValue === 0) &&
              defaultValue > doubleMax
            ) {
              message.error(i18n('default_value_error_tip1', '默认值长度不能大于最大值'))
              return
            }
            if (
              (doubleMin || doubleMin === 0) &&
              (doubleMin || doubleMin === 0) &&
              doubleMax < doubleMin
            ) {
              message.error(i18n('default_value_error_tip2', '最大值不能小于最小值'))
              return
            }
          }
          // 级联字段，仅选择子节点的值转换 boolean -> 0/1
          if (totalData.type === 'treeSel' || totalData.type === 'cascader') {
            totalData.onlyLeafNode = totalData.onlyLeafNode ? 1 : 0
          }
          if (`${fieldData.tabStatus}` === '0') {
            if (totalData.type === 'cascader' && this.hasEmptyOption(totalData.cascade)) {
              message.error(i18n('options_isnot_empty', '选项不能为空'))
              return false
            }
            if (totalData.type === 'treeSel' && this.hasEmptyOption(totalData.treeVos)) {
              message.error(i18n('options_isnot_empty', '选项不能为空'))
              return false
            }
          }
          if (
            totalData.type === 'cascader' &&
            `${fieldData.tabStatus}` === '2' &&
            !fieldData.dictionarySource
          ) {
            message.error(i18n('dictionary.data.empty.msg', '字典数据不能为空'))
            return false
          }
          if (
            (totalData.type === 'cascader' || totalData.type === 'treeSel') &&
            `${fieldData.tabStatus}` === '1' &&
            _.isEmpty(toJS(fieldData.thirdPartData))
          ) {
            message.error(i18n('please.get.outside.data', '请获取外部数据'))
            return false
          }
          // 下拉菜单数据复杂，用来store来控住
          if (_.includes(['listSel', 'cascader', 'treeSel'], type)) {
            const {
              params,
              tabStatus,
              formData,
              headers,
              outsideUrl,
              raw,
              requestType,
              keySel,
              valueSel,
              dictionarySource,
              expandSel,
              filterMode = 1,
              keyword
            } = fieldData
            if (tabStatus === '0') {
              _.assign(totalData, {
                params,
                tabStatus
              })
            } else if (tabStatus === '2') {
              _.assign(totalData, {
                params,
                tabStatus,
                dictionarySource
              })
              delete totalData.cascade
            } else if (tabStatus === '1') {
              const filterModeField = {}
              if (type === 'listSel') {
                filterModeField.filterMode = filterMode
                filterModeField.keyword = keyword
              }
              _.assign(
                totalData,
                {
                  params,
                  tabStatus,
                  formData,
                  headers,
                  outsideUrl,
                  raw,
                  requestType,
                  keySel,
                  valueSel,
                  expandSel
                },
                filterModeField
              )
            }
            if (type === 'listSel') {
              const flag = this.checkoutSel(params, tabStatus, keySel, valueSel, dictionarySource)
              if (flag) {
                message.error(i18n('options_isnot_empty', '选项不能为空'))
                return false
              }
            }
          }
          if (_.includes(['singleSel', 'multiSel'], type) && this.onParamsRequired(values.params)) {
            message.error(i18n('options_isnot_empty', '选项不能为空'))
            return false
          }
          // 类型为 user或 department 时，需要对currDefault解构
          if (type === 'user' || type === 'department' || type === 'userGroup') {
            const {
              isSingle,
              currDefault: { currUser, defaultValue, curr_depart, curUserGroup }
            } = values
            delete totalData.currDefault
            if (type === 'user') totalData.currUser = currUser
            if (type === 'department') totalData.curr_depart = curr_depart
            if (type === 'userGroup') totalData.curUserGroup = curUserGroup
            if (isSingle === '0') {
              totalData.defaultValue = defaultValue
            } else {
              totalData.defaultValue = _.isEmpty(defaultValue) ? null : defaultValue
            }
          }
          if (type === 'table') {
            // 去掉表格字段校验(场景：只想添加行，不想校验的非空的判断)
            // const error = totalData.validate(totalData.defaultValue)
            // if (error) {
            //   message.error('表格字段校验失败')
            //   return false
            // }
            totalData.params = totalData.params.map((item) => _.omit(item, 'rowKey'))
            totalData.validate = undefined
          }

          // 动态表格字段需要校验脚本
          if (type === 'customizeTable') {
            try {
              eval(`(${totalData.defaultValue})`)
            } catch (error) {
              message.error(i18n('ticket-field-curtomizeScript-err-tip1', '请检查您的代码'))
              return false
            }
          }

          this.setState({ loading: true })
          if (totalData.executeWay) {
            totalData.executeWay = +totalData.executeWay
          }

          // 如果是模型中字段设置，保存时加上modelId
          const { modelId } = this.locationQuery
          if (modelId) {
            totalData.modelId = modelId
          }
          // 隐私字段设置，虽然是一个字段但是要根据值判断需要传给后台的key
          /* fieldPrivacy:0 无隐私设置；
          fieldPrivacy:1 处理人可见
          privacy:true 仅经办人可见
          */

          if (totalData.privacy === 0) {
            delete totalData.privacy
            totalData.fieldPrivacy = 0
          }
          if (totalData.privacy === 1) {
            delete totalData.privacy
            totalData.fieldPrivacy = 1
          }
          if (totalData.privacy === 2) {
            totalData.privacy = true
          }
          const res = (await this.props.store.saveFieldData(totalData)) || {}
          this.setState({ loading: false })
          this.props.userType === 'model' && resolve(res)
          if (!_.isEmpty(res)) {
            this.props.onValuesChange && this.props.onValuesChange(false)
            this.props.userType !== 'model' && this.goHome()
          }
        }

        resolve()
      })
    })
  }

  _renderField = (diliver, isEdit) => {
    if (!diliver.type) {
      return null
    }
    switch (diliver.type) {
      case 'singleRowText':
        return <SingleRowText {...diliver} />
      case 'multiRowText':
        return <MultiRowText {...diliver} />
      case 'listSel':
        return <ListSelect {...diliver} />
      case 'singleSel':
        return <SingleSelect {...diliver} />
      case 'multiSel':
        return <MultiSelect {...diliver} />
      case 'int':
        return <Int {...diliver} />
      case 'double':
        return <Double {...diliver} />
      case 'dateTime':
        return <DateTime {...diliver} />
      case 'user':
        return <User {...diliver} />
      case 'department':
        return <Department {...diliver} />
      case 'cascader':
      case 'treeSel':
        return <Cascader {...diliver} />
      case 'richText':
        return <RichText {...diliver} />
      case 'table':
        return <Table {...diliver} />
      case 'securityCode':
        return <Password {...diliver} />
      case 'resource':
        return <Resource {...diliver} />
      case 'topology':
        return <Topology {...diliver} />
      case 'attachfile':
        return <File {...diliver} />
      case 'timeInterval':
        return <TimeInterval {...diliver} />
      case 'customizeTable':
        return <CustomizeTable {...diliver} />
      case 'excelImport':
        return <ExcelImport {...diliver} />
      case 'tags':
        return <Tags {...diliver} />
      case 'links':
        return <Links {...diliver} />
      case 'nodeExecution':
        return <NodeExecution {...diliver} />
      case 'permission':
        return <Permission {...diliver} />
      case 'jsontext':
        return <JSONText {...diliver} />
      case 'userGroup':
        return <UserGroup {...diliver} />
      case 'job':
        return <Job {...diliver} />
      case 'btn':
        return <Btn {...diliver} />
      case 'nestedTable':
        return <NestedTable {...diliver} />
      default:
        return (
          <CustomizeField
            {...diliver}
            goHome={() => {
              this.props.onValuesChange && this.props.onValuesChange(false)
              this.goHome()
            }}
            isEdit={isEdit}
            widgetType="create"
          />
        )
    }
  }

  render() {
    const {
      formItemLayout,
      userType, // 当前的使用者   model  模型里创建字段
      queryType,
      onValuesChange,
      store,
      btnCancel,
      source = ''
    } = this.props

    const { fieldData, layouts, type } = this.props.store
    const { customFieldList } = this.props.loadFieldWidgetStore
    const { loading } = this.state

    const { modelId } = this.locationQuery

    const diliver = {
      modelId,
      fieldData,
      layouts,
      formItemLayout,
      type,
      store,
      userType,
      queryType,
      onValuesChange,
      TreeOrcascader: this.TreeOrcascader,
      wrappedComponentRef: (inst) => {
        this[type] = inst
      },
      source
    }
    const isEdit = this.allowEdit()
    const isCustomField = customFieldList.some((item) => item.type === type)
    // 这里是itsm这边控制显示保存按钮，自定义字段自己也可能会有保存按钮，不在这边控制
    const showSaveBtn = userType !== 'model' && isEdit && !isCustomField
    // 自定义字段自己也有保存按钮，所以这里要控制一下返回按钮的位置，保证在保存按钮右侧
    const backBtnLeft = isEdit ? (showSaveBtn ? '90' : '80') : '0'
    const backBtnStyle = {
      position: 'absolute',
      bottom: 0,
      left: `calc(8% + ${backBtnLeft}px)`
    }

    return (
      <div className="field-layout">
        {this._renderField(diliver, isEdit)}

        {showSaveBtn ? (
          <Row style={{ marginBottom: '20px' }}>
            <Col offset={2} span={15}>
              <Button
                style={{ width: 80 }}
                loading={loading}
                type="primary"
                onClick={() => this.saveField()}
              >
                {i18n('save', '保存')}
              </Button>
            </Col>
          </Row>
        ) : null}

        {!!window.LOWCODE_APP_KEY && !btnCancel && (
          <Button
            style={backBtnStyle}
            onClick={() => {
              this.goHome()
            }}
          >
            取消
          </Button>
        )}
      </div>
    )
  }
}

export default Layout
