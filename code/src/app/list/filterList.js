import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'
import { Form, Col } from '@uyun/components'
// import list from './config/defaultList'
import ItsmSelect from './form/select'
import ListSel from './form/listSel'
import ItsmUser from './form/users'
import DateTime from './form/dateTime'
import ItsmInput from './form/input'
import Resource from './form/resource'
import Cascader from './form/cascader'
import TreeSel from './form/treeSel'
import AutoMation from './form/automation'
import Department from './form/department'
import Group from './form/group'
import ModelSelect from './form/modelSelect'
import ModelTache from './form/modelTache'
import Tags from './form/tags'
import { withRouter } from 'react-router-dom'
import defaultList from '~/list/config/defaultList'
import './styles/head.less'
import _ from 'lodash'

// 只显示待处理和处理中的工单
const statusList = defaultList
  .find((item) => item.code === 'status')
  .params.filter((item) => ['1', '2', '10'].includes(item.value))
@inject('listStore', 'globalStore', 'modelListStore')
@withRouter
@observer
class FilterList extends Component {
  // get list() {
  //   const { filterType, modelList, typeList } = this.props.listStore
  //   const { priorityList } = this.props.globalStore
  //   if (!_.includes(typeList, filterType)) {
  //     return [
  //       {
  //         name: i18n('ticket.list.ticketName', '标题'),
  //         code: 'ticketName',
  //         type: 'singleRowText'
  //       },
  //       {
  //         name: i18n('ticket.list.ticketNum', '单号'),
  //         code: 'ticketNum',
  //         type: 'singleRowText'
  //       },
  //       {
  //         name: i18n('ticket.list.filter.model', '模型'),
  //         code: 'modelId',
  //         type: 'modelSelect',
  //         params: _.map(modelList.slice(1), item => ({
  //           label: item.processName,
  //           value: item.processId
  //         }))
  //       },
  //       {
  //         name: i18n('ticket.list.tacheName', '当前阶段'),
  //         code: 'modelAndTacheId',
  //         type: 'modelTache'
  //       },
  //       {
  //         name: i18n('ticket-list-table-th-executionGroup', '处理组'),
  //         code: 'executionGroup',
  //         type: 'group'
  //       },
  //       {
  //         name: i18n('ticket.list.filter.filterOrg', '创建人所在部门'),
  //         code: 'filterOrg',
  //         type: 'department'
  //       },
  //       {
  //         name: i18n('participant.deparment', '参与人所在部门'),
  //         code: 'filterMyDepart',
  //         type: 'department'
  //       },
  //       ...list.slice(0, 2),
  //       {
  //         name: i18n('ticket-list-table-th-priority', '优先级'),
  //         code: 'priority',
  //         type: 'select',
  //         params: _.map(priorityList, item => ({ value: item.value, label: item.name }))
  //       },
  //       ...list.slice(2)
  //     ]
  //   }
  //   return list
  // }

  switchType = (item, dilver) => {
    switch (item.type) {
      case 'multiRowText':
      case 'singleRowText':
      case 'int':
      case 'double':
      case 'flowNo':
        return <ItsmInput {...dilver} />
      case 'modelSelect':
        return <ModelSelect {...dilver} />
      case 'select':
      case 'business':
      case 'singleSel':
      case 'multiSel':
        return <ItsmSelect {...dilver} />
      case 'listSel':
        return <ListSel {...dilver} />
      case 'resource':
        return <Resource {...dilver} />
      case 'user':
        return <ItsmUser {...dilver} />
      case 'userGroup':
      case 'group':
        return <Group {...dilver} />
      case 'dateTime':
        return <DateTime {...dilver} />
      case 'cascader':
        return <Cascader {...dilver} />
      case 'treeSel':
        return <TreeSel {...dilver} />
      case 'layer':
        return <AutoMation {...dilver} size="small" />
      case 'department':
        return <Department {...dilver} />
      case 'modelTache':
        return <ModelTache {...dilver} />
      case 'tags':
        return <Tags {...dilver} />
    }
  }

  render() {
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 }
    }
    const {
      viewData,
      query,
      filterType,
      typeList,
      queryAttrList,
      querySelectedList,
      attributeList
    } = this.props.listStore
    // 获取查询器的默认搜索条件
    const checkFilterList =
      this.props.listStore.checkFilterList || window.TICKET_CHECK_FILTER_LIST[filterType]
    const {
      menuList: { ticketMenuList = [] }
    } = this.props.globalStore
    const currentMenuData =
      _.find(ticketMenuList, (menu) =>
        menu.code === 'mytodo' ? filterType === 'myToDo' : menu.code === filterType
      ) || {}
    const queryMenuView = currentMenuData.queryMenuView || {}
    const currentMenuData_extParams = queryMenuView.extParams || {} // 解构解的好辛苦
    const { getFieldDecorator, setFieldsValue, getFieldValue } = this.props.form
    const { extraParams = [] } = viewData
    let expansionList = _.uniqBy(
      [...toJS(queryAttrList), ...toJS(querySelectedList)],
      'code'
    ).filter((item) => _.includes(checkFilterList, item.code))
    const formDom = []
    // 有排序，走排序
    if (queryMenuView.checkFilterList) {
      expansionList = _.sortBy(expansionList, (filter, index) => {
        const filterIndex = queryMenuView.checkFilterList.indexOf(filter.code)
        return filterIndex === -1 ? index : filterIndex
      })
    }
    // _.forEach([...expansionList], (item, index) => {
    //   let defaultValue = viewData[item.code] || query[item.code] || queryMenuView[item.code] || currentMenuData_extParams[item.code] || undefined
    //   if (!_.isEmpty(extraParams)) {
    //     const extraParam = _.find(extraParams, extra => extra.code === item.code)
    //     if (extraParam) {
    //       defaultValue = extraParam.defaultValue || undefined
    //     }
    //   }
    //   const disabled = (queryMenuView.lockCondition || []).indexOf(item.code) > -1
    //   const dilver = {
    //     size: 'small',
    //     item,
    //     filterType,
    //     typeList,
    //     defaultValue,
    //     formItemLayout,
    //     getFieldValue,
    //     setFieldsValue,
    //     getFieldDecorator,
    //     disabled,
    //     getPopupContainer: () => document.getElementById('ticket-list-filter-warp')
    //   }
    //   if (index && index % 4 === 0) {
    //     formDom.push(<Col key={index} span={24} style={{ height: '1px' }} />)
    //   }
    //   formDom.push(<Col className="filter-item" key={item.code} span={6}>{this.switchType(item, dilver)}</Col>)
    // })
    const QuerySelectedList = _.cloneDeep(toJS(querySelectedList))
    if (_.includes(['myToDo', 'groupTodo', 'todoGroup'], filterType)) {
      const periodList = _.map(this.props.periodList, (v) => {
        return {
          label: v.name,
          value: v.id
        }
      })
      // 个待以及组待增加工单状态，所处阶段的下拉框
      const list = [
        {
          name: '工单状态',
          code: 'status',
          type: 'select',
          value: ['1', '2', '10'],
          params: statusList,
          hide: false
        },
        {
          name: '所处阶段',
          code: 'modelAndTacheId',
          type: 'select',
          value: [],
          params: periodList,
          hide: false
        }
      ]
      QuerySelectedList.push(...list)
    }
    _.forEach(
      _.cloneDeep(QuerySelectedList).filter((item) => !item.hide),
      (item, index) => {
        item.code = item.modelId ? `${item.modelId}_${item.code}` : item.code
        const disabled = (queryMenuView.lockCondition || []).indexOf(item.code) > -1
        const defaultValue = query[item.code] || undefined
        const dilver = {
          size: 'small',
          item,
          filterType,
          typeList,
          defaultValue,
          formItemLayout,
          getFieldValue,
          setFieldsValue,
          getFieldDecorator,
          disabled,
          getPopupContainer: () => document.getElementById('ticket-list-filter-warp')
        }
        if (index && index % 4 === 0) {
          formDom.push(<Col key={index} span={24} style={{ height: '1px' }} />)
        }
        formDom.push(
          <Col className="filter-item" key={item.code} span={6}>
            {this.switchType(item, dilver)}
          </Col>
        )
      }
    )
    return <Form>{formDom}</Form>
  }
}

export default Form.create()(FilterList)
