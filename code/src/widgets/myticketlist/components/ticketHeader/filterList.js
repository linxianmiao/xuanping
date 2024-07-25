import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { inject } from '@uyun/core'
import { Form, Col, Row, Button, message } from '@uyun/components'
import { DEFAULT_FILTER_LIST, ALL_FILTER_LIST } from '../../config'
import { TicketlistStore } from '../../ticketlist.store'
import { PlusOutlined } from '@uyun/icons'
import User from '../forms/User'
import DateTime from '../forms/DateTime'
import Select from '../forms/Select'
import Input from '../forms/Input'
import ModelSelect from '../forms/ModelSelect'
import Resource from '../forms/Resource'
import Group from '../forms/Group'
import Department from '../forms/DepartMent'
import AutoMation from '../forms/AutoSelect'
import Cascader from '../forms/Cascader'
import TreeSel from '../forms/TreeSel'
import ModelTache from '../forms/ModelTache'
import Tags from '../forms/Tags'
import styles from '../../ticketlist.module.less'
import AttrFieldPanelModal from '~/components/AttrFieldPanel'
import { toJS } from 'mobx'
import _ from 'lodash'

const formItemLayout = {
  labelCol: { span: 0 },
  wrapperCol: { span: 24 }
}

@observer
class FilterList extends Component {
  @inject('i18n') i18n
  @inject(TicketlistStore) store

  componentDidMount() {
    const { query, querySelectedList, currentDept } = this.store
    const { filterType } = query || {}

    if (_.includes(['all'], filterType)) {
      let selectedList = _.cloneDeep(toJS(querySelectedList))
      let participantsDepartIdsIdx = -1
      let planningDepartmentIdx = -1
      _.forEach(selectedList, (item, index) => {
        if (item.code === 'planningDepartment') {
          planningDepartmentIdx = index
        } else if (item.code === 'participantsDepartIds') {
          participantsDepartIdsIdx = index
        }
      })

      if (planningDepartmentIdx !== -1) {
        selectedList[planningDepartmentIdx].value = toJS(currentDept) || []
      } else if (participantsDepartIdsIdx !== -1) {
        selectedList[participantsDepartIdsIdx].value = toJS(currentDept) || []
      }

      this.store.setProps({ querySelectedList: selectedList })
    }
  }

  renderFilter = (item, defaultValue) => {
    const { getFieldValue, setFieldsValue, getFieldDecorator } = this.props.form
    const { filterType } = this.store.query
    const disabled = this.store.lockCondition.includes(item.code) || false
    const dilver = {
      item,
      disabled,
      filterType,
      defaultValue,
      formItemLayout,
      getFieldValue,
      setFieldsValue,
      getFieldDecorator
    }
    switch (item.type) {
      case 'multiRowText':
      case 'singleRowText':
      case 'int':
      case 'double':
      case 'flowNo':
        return <Input {...dilver} />
      case 'modelSelect':
        return <ModelSelect {...dilver} />
      case 'select':
      case 'listSel':
      case 'business':
      case 'singleSel':
      case 'multiSel':
        return <Select {...dilver} />
      case 'resource':
        return <Resource {...dilver} />
      case 'user':
        return <User {...dilver} />
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
        return <AutoMation {...dilver} />
      case 'department':
        return <Department {...dilver} />
      case 'modelTache':
        return <ModelTache {...dilver} />
      case 'tags':
        return <Tags {...dilver} />
      default:
        return null
    }
  }

  handleChangeAttrField = (value) => {
    const valueCode = value.map((item) => item.code)
    if (valueCode.length === 0) {
      message.info('筛选项至少保留一项')
      return
    }
    const { query } = this.store
    const newQuery = _.cloneDeep(toJS(query))
    _.forIn(newQuery, (value, key) => {
      //排序规则不变，还是按之前的排序规则排序
      if (
        valueCode.indexOf(key) === -1 &&
        key !== 'filterType' &&
        key !== 'orderBy' &&
        key !== 'sortRule' &&
        key !== 'pageNum' &&
        key !== 'pageSize'
      ) {
        newQuery[key] = undefined
      }
    })

    this.store.setProps({ newQuery: _.assign({}, query, newQuery) })
    this.store.setSelectedList(value, 'QUERY')
  }

  render() {
    const { query, ticketUrgentLevelList, querySelectedList, currentDept } = this.store

    const { filterType } = query || {}
    let list = DEFAULT_FILTER_LIST
    if (_.includes(['mypartin', 'myfollow', 'myapprove'], filterType)) {
      list = _.forEach(list, (item) => {
        if (item.code === 'modelId') {
          item.code = 'processId'
        }
      })
    }

    if (_.includes(['myfollow', 'myapprove', 'mypartin'], filterType)) {
      list = _.filter(list, (item) => item.code !== 'modelAndTacheId')
    }

    if (_.includes(['all'], filterType)) {
      let selectedList = _.cloneDeep(toJS(querySelectedList))
      list = selectedList
    }

    return (
      <Form>
        <Row gutter={16} className={styles.filterRow}>
          {_.map(list, (item, index) => {
            const defaultValue = item.value || undefined
            if (item?.code === 'priority') {
              item.params = ticketUrgentLevelList?.map((item) => {
                return {
                  value: item?.value,
                  label: item?.name
                }
              })
            }
            if (index && index % 4 === 0) {
              return (
                <React.Fragment key={index}>
                  <Col span={24} />
                  <Col span={6}>{this.renderFilter(item, defaultValue)}</Col>
                </React.Fragment>
              )
            }
            return (
              <Col key={index} span={6}>
                {this.renderFilter(item, defaultValue)}
              </Col>
            )
          })}
        </Row>
        <Row>
          <Col className={styles.filterBtn}>
            <Button size="small" type="primary" onClick={this.props.handleFilter}>
              {this.i18n('globe.search', '查询')}
            </Button>
            <Button size="small" onClick={this.props.handleReset}>
              {this.i18n('globe.reset', '重置')}
            </Button>
          </Col>
        </Row>
      </Form>
    )
  }
}

export default Form.create()(FilterList)
