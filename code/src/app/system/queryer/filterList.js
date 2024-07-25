import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Col, Form, Row, Tooltip } from '@uyun/components'
import { toJS } from 'mobx'
import list from './config/defaultList'

import ItsmSelect from '~/list/form/select'
import ItsmUser from '~/list/form/users'
import DateTime from '~/list/form/dateTime'
import ItsmInput from '~/list/form/input'
import Resource from '~/list/form/resource'
import Cascader from '~/list/form/cascader'
import TreeSel from '~/list/form/treeSel'
import AutoMation from '~/list/form/automation'
import Department from '~/list/form/department'
import Group from '~/list/form/group'
import ModelSelect from '~/list/form/modelSelect'
import ModelTache from '~/list/form/modelTache'
import DragSearch from './dragSearch'
import Tags from '~/list/form/tags'
import './styles/header.less'

import { LockOutlined, UnlockOutlined } from '@uyun/icons'

@inject('listStore', 'globalStore')
@observer
class FilterList extends Component {
  get list() {
    const { modelList, modelAndTacheIdList } = this.props.listStore
    const { priorityList } = this.props.globalStore
    return [
      {
        name: i18n('ticket.list.ticketName', '标题'),
        code: 'ticketName',
        type: 'singleRowText'
      },
      {
        name: i18n('ticket.list.ticketNum', '单号'),
        code: 'ticketNum',
        type: 'singleRowText'
      },
      {
        name: i18n('ticket.list.filter.model', '模型'),
        code: 'modelId',
        type: 'modelSelect',
        params: _.map(modelList.slice(1), (item) => ({
          label: item.processName,
          value: item.processId
        }))
      },
      {
        name: i18n('ticket.list.tacheName', '当前节点'),
        code: 'modelAndTacheId',
        type: 'modelTache',
        treeVos: modelAndTacheIdList
      },
      {
        name: i18n('ticket-list-table-th-priority', '优先级'),
        code: 'priority',
        type: 'select',
        params: _.map(priorityList, (item) => ({ value: item.value, label: item.name }))
      },
      ...list
    ]
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
        return <AutoMation {...dilver} defaultValue={dilver.defaultValue || []} />
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

  handleMoveFilter = (dragIndex, hoverIndex) => {
    const checkFilterList = this.props.listStore.checkFilterList
    if (dragIndex > hoverIndex) {
      checkFilterList.splice(hoverIndex, 0, checkFilterList[dragIndex])
      checkFilterList.splice(dragIndex + 1, 1)
    } else {
      checkFilterList.splice(hoverIndex + 1, 0, checkFilterList[dragIndex])
      checkFilterList.splice(dragIndex, 1)
    }
    this.props.listStore.setCheckFilterList(checkFilterList)
  }

  render() {
    const formItemLayout = {
      labelCol: { span: 24 },
      wrapperCol: { span: 24 }
    }
    const { editData, lockCondition, changeLockCondition, listStore } = this.props
    const { queryMenuView = {} } = editData
    const extParams = queryMenuView.extParams || {}
    const { allField, querySelectedList } = this.props.listStore
    const checkFilterList = toJS(this.props.listStore.checkFilterList)
    const { getFieldDecorator, setFieldsValue, getFieldValue } = this.props.form
    const builtinFields = allField.builtinFields || []
    const extendedFields = allField.extendedFields || []
    // const mapField = [...this.list, ...builtinFields, ...extendedFields]
    const mapField = _.uniqBy(
      [...toJS(listStore.queryAttrList), ...toJS(listStore.querySelectedList)],
      'code'
    )
    return (
      <Form>
        {/* {
          _.map(checkFilterList, (code, index) => {
            const field = _.find(mapField, field => field.code === code)
            // 有些字段类型不支持查询
            if (field) {
              const defaultValue = queryMenuView[field.code] || extParams[field.code]
              const isLock = (lockCondition || []).indexOf(field.code) > -1
              const label = <div>
                <span className="label_name">{field.name}</span>
                <Tooltip title={isLock ? undefined : '未锁定，输入内容锁定后将在查看时无非修改条件内容'}>
                  <Icon
                    className={`label_icon ${isLock ? 'label_icon_locked' : 'label_icon_unlock'}`}
                    type={isLock ? 'lock' : 'unlock'}
                    onClick={() => { changeLockCondition(field) }}
                  />
                </Tooltip>
              </div>
              const dilver = {
                item: field,
                defaultValue,
                formItemLayout,
                getFieldValue,
                setFieldsValue,
                getFieldDecorator,
                label: label
              }
              const type = this.switchType(field, dilver)
              return <DragSearch type={type} switchType={() => { this.switchType(field, dilver) }} item={field} index={index} handleMoveFilter={this.handleMoveFilter} key={index} />
            }
          })
        }  */}
        {_.map(toJS(querySelectedList), (item, index) => {
          const { modelId, code, value } = item
          if (item) {
            if (modelId) {
              item.code = `${modelId}_${code}`
            }
            const defaultValue = value
            const isLock = (lockCondition || []).indexOf(item.code) > -1
            const label = (
              <Row>
                <Col
                  span={21}
                  style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
                >
                  <Tooltip title={item.name}>
                    {' '}
                    <span className="label_name">{item.name}</span>
                  </Tooltip>
                </Col>
                <Col span={3}>
                  <Tooltip
                    title={isLock ? undefined : '未锁定，输入内容锁定后将在查看时无非修改条件内容'}
                  >
                    {isLock ? (
                      <LockOutlined
                        className={`label_icon ${
                          isLock ? 'label_icon_locked' : 'label_icon_unlock'
                        }`}
                        onClick={() => {
                          changeLockCondition(item)
                        }}
                      />
                    ) : (
                      <UnlockOutlined
                        className={`label_icon ${
                          isLock ? 'label_icon_locked' : 'label_icon_unlock'
                        }`}
                        onClick={() => {
                          changeLockCondition(item)
                        }}
                      />
                    )}
                  </Tooltip>
                </Col>
              </Row>
            )
            const dilver = {
              item: toJS(item),
              defaultValue,
              formItemLayout,
              getFieldValue,
              setFieldsValue,
              getFieldDecorator,
              label: label
            }
            const type = this.switchType(item, dilver)
            return (
              <DragSearch
                type={type}
                switchType={() => {
                  this.switchType(item, dilver)
                }}
                item={item}
                index={index}
                handleMoveFilter={this.handleMoveFilter}
                key={index}
              />
            )
          }
        })}
      </Form>
    )
  }
}

export default Form.create({
  onValuesChange: (props, changedValues, allValues) => {
    props.onValuesChange && props.onValuesChange(props, changedValues, allValues)
  }
})(FilterList)
