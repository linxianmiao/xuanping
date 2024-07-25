import React, { Component } from 'react'
import { Form, Col } from '@uyun/components'
import { observer } from 'mobx-react'
import { toJS } from 'mobx'
import { inject } from '@uyun/core'
import ItsmSelect from './form/select'
import ItsmUser from './form/users'
import DateTime from './form/dateTime'
import ItsmInput from './form/input'
import Resource from './form/resource'
import Cascader from './form/cascader'
import TreeSel from './form/treeSel'
import AutoMation from './form/automation'
import Department from './form/department'
import Group from './form/group'
import ModelSelect from './ModelSelect'
import ModelTache from './form/modelTache'
import Tags from './form/tags'
import { defaultFilterList } from '../../listConfig'
import styles from './TicketFilter.module.less'

const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 }
}

@observer
class FilterList extends Component {
  @inject('listStore') listStore
  @inject('widget') widget

  constructor(props, context) {
    super(props, context)
    if (this.widget) {
      this.windowWin = this.widget.getContextWindow()
    } else {
      this.windowWin = window
    }

    this.list = defaultFilterList.map(item => {
      if (item.code !== 'priority') return item
      return { ...item, params: _.map(this.listStore.ticketUrgentLevelList, ({ value, name }) => ({ value, label: name })) }
    })
  }

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
      case 'listSel':
      case 'business':
      case 'singleSel':
      case 'multiSel':
        return <ItsmSelect {...dilver} />
      case 'resource':
        return <Resource {...dilver} />
      case 'user':
        return <ItsmUser {...dilver} />
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
    const { getFieldDecorator, setFieldsValue, getFieldValue } = this.props.form
    const { allField, viewData, query, checkFilterList, filterType, typeList, querySelectedList } = this.listStore
    const { builtinFields, extendedFields } = allField
    const { extraParams = [] } = viewData
    const expansionList = _.unionBy(this.list, toJS(querySelectedList), 'code').filter(item => checkFilterList.includes(item.code))
    const formDom = []
    expansionList.forEach((item, index) => {
      let defaultValue = viewData[item.code] || query[item.code] || undefined
      if (!_.isEmpty(extraParams)) {
        const extraParam = _.find(extraParams, extra => extra.code === item.code)
        if (extraParam) {
          defaultValue = extraParam.defaultValue || undefined
        }
      }
      if (item.code === 'status') defaultValue = ['1', '2', '10']
      if (item.code === 'executor') defaultValue = ['currentUser']

      const dilver = {
        size: 'small',
        item,
        defaultValue,
        formItemLayout,
        getFieldValue,
        setFieldsValue,
        getFieldDecorator,
        filterType,
        typeList,
        getPopupContainer: () => this.windowWin.document.querySelector(`.${styles.ticketFilterWrap}`)
      }
      if (index && index % 4 === 0) {
        formDom.push(<Col key={index} span={24} style={{ height: '1px' }} />)
      }
      formDom.push(<Col className="filter-item" key={item.code} span={6}>{this.switchType(item, dilver)}</Col>)
    })

    return <Form>{formDom}</Form>
  }
}

export default Form.create()(FilterList)
