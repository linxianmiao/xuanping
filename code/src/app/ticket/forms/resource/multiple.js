import React, { Component } from 'react'
import { Button, message } from '@uyun/components'
import { inject } from 'mobx-react'
import { toJS } from 'mobx'
import ResourceBtn from './btn'
import ResourceTable from './Table'
import CIPicker, { ClassPicker } from '@uyun/ec-ci-picker'
import '../styles/resource.less'
import _ from 'lodash'
@inject('resourceStore')
class MultipleResource extends Component {
  state = {
    classList: [],
    queryItems: {
      name: {
        value: [],
        queryOperator: 'CONTAIN_CI',
        dataType: 'singleRowText'
      }
    },
    loading: false,
    selectedColumnKeys: []
  }

  handleCancel = () => {
    this.props.ciModalVisibleHide()
  }

  queryAllResType = (e) => {
    const { permission } = this.props
    if (!permission) {
      message.error(i18n('ticket.create.disable_tip1', '您暂无CMDB权限，无法操作'))
      e.stopPropagation()
      return
    }
    const { resType, type, attributeValues, checkEditPermission } = this.props.field
    const classCodes = _.map(resType, (item) => item.key)
    this.setState({ loading: true })
    this.props.resourceStore
      .queryAllResType({
        classCodes: _.isEmpty(classCodes) ? undefined : classCodes.join(),
        formType: type === 'resource' ? 'CMDB' : 'ASSET',
        checkEditPermission
      })
      .then((classList) => {
        const queryItems = _.cloneDeep(this.state.queryItems)
        _.forEach(attributeValues, (item) => {
          queryItems[item.code] = {
            value: [].concat(item.value),
            queryOperator: [].concat(item.value).length === 1 ? 'EQ' : 'IN',
            disabled: true
          }
        })
        this.setState({
          classList,
          queryItems,
          loading: false
        })
      })
  }

  onChange = ([selectedRow, relationSelectedRow, appSelectedRow]) => {
    const newSelectedRow = _.map(selectedRow, (data) => {
      //有的cmdb会出现另一个status状态 运行中等，会导致关联状态失效
      return _.assign({}, data, {
        status: '0',
        taskId: ''
      })
    })
    // 无id的数据加上关联的数据
    const merged = (this.props.value || []).filter((item) => !item.id).concat(newSelectedRow)
    const data = _.map(merged, (row) => {
      const delKeys = _.chain(row)
        .keys()
        .filter((item) => item.indexOf('.') !== -1)
        .value()
      return _.omit(row, delKeys)
    })
    this.props.handleOk(data)
  }

  exportResource = () => {
    console.log('导出', toJS(this.props.resourceStore.resourceDatas))
  }

  render() {
    const { disabled, value, field, permission, resourceStore } = this.props
    const { classList, queryItems, loading, selectedColumnKeys } = this.state
    const { useScene, formType, customColumns, checkEditPermission, code } = field
    const { relation } = useScene
    const content = [
      <ClassPicker
        key="CLASS"
        fetchRepoClass={false}
        classList={classList}
        formType={formType}
        queryItems={queryItems}
        // selectedRow={value || []}
        // 不能传入无id的数据，否则勾选时无id的数据会被过滤掉
        selectedRow={(value || []).filter((item) => !!item.id)}
        extraQueryParams={{ returnTextValue: true }}
      />
    ]
    return (
      <div>
        {!disabled && field.isRequired !== 2 && (
          <ResourceBtn
            {...this.props}
            resourceStore={resourceStore}
            exportResource={this.exportResource}
            customColumns={customColumns || []}
            selectedColumnKeys={selectedColumnKeys}
            onColumnsChange={(value) => this.setState({ selectedColumnKeys: value })}
          >
            {relation && relation.type && (
              <CIPicker
                onChange={this.onChange}
                content={!_.isEmpty(classList) ? content : null}
                fetchRepoClass={!!_.isEmpty(classList)}
                checkEditPermission={checkEditPermission}
              >
                <Button
                  style={{ marginBottom: 4 }}
                  onClick={(e) => {
                    if (loading) {
                      message.info('CMDB 数据加载中，请稍后')
                      e.stopPropagation()
                    }
                    if (!permission) {
                      message.error(i18n('ticket.create.disable_tip1', '您暂无CMDB权限，无法操作'))
                      e.stopPropagation()
                    }
                    const conditions = _.cloneDeep(
                      JSON.parse(
                        window.sessionStorage.getItem(
                          `resourceCondition-${this.props.forms?.ticketId || undefined}`
                        )
                      )
                    )
                    const list = this.props.form.getFieldsValue()
                    let condition = {}
                    _.forEach(conditions, (item) => {
                      if (item.code === code) {
                        condition = item.param
                      }
                    })
                    const QueryItems = _.cloneDeep(queryItems)
                    if (!_.isEmpty(condition)) {
                      _.forIn(condition, (value, key) => {
                        let data = list[key]
                        if (!Array.isArray(data)) {
                          data = !_.isEmpty(list[key]) ? list[key].split(',') : []
                        }
                        QueryItems[value.code] = {
                          value: data,
                          ...condition[key],
                          queryOperator: condition[key]?.queryOperator || 'EQ'
                        }
                      })
                    }
                    this.setState({ queryItems: QueryItems })
                    this.queryAllResType(e)
                  }}
                >
                  {relation.value || i18n('ticket.create.relate_res', '关联配置项')}
                </Button>
              </CIPicker>
            )}
          </ResourceBtn>
        )}

        <ResourceTable {...this.props} selectedColumnKeys={selectedColumnKeys} />
      </div>
    )
  }
}
export default MultipleResource
