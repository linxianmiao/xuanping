import React, { Component } from 'react'
import { toJS } from 'mobx'
import { inject, observer } from 'mobx-react'
import classnames from 'classnames'
import Topology from './topology'
import FormItem from '../components/formItem'
import Secrecy from '../components/Secrecy'
import '../styles/topology.less'
@inject('resourceStore')
@observer
class TopologyIndex extends Component {
  queryChartSandbox = async (chartStatus) => {
    const { sandboxId } = this.props.resourceStore
    const { code: fieldType, chartType, bindField } = this.props.field
    const res = await this.props.resourceStore.queryChartSandbox(
      {
        sandboxId,
        fieldType,
        chartType
      },
      { chartStatus, bindField }
    )
    return res
  }

  handleCheckTopology = (rule, value, callback) => {
    const { name } = this.props.field
    if (rule.required && (_.isEmpty(value) || !value[0].thumbnail)) {
      callback(`${i18n('globe.select', '请选择')}${name}`)
    }
    callback()
    this.forceUpdate()
  }

  render() {
    const {
      field,
      initialValue,
      getFieldDecorator,
      getFieldValue,
      disabled,
      fieldMinCol,
      secrecy,
      formLayoutType
    } = this.props
    const { topologyBase, sandboxId } = this.props.resourceStore
    const item = _.find(toJS(topologyBase), (item) => item.topologyCode === field.code) || {}

    return (
      <FormItem
        field={field}
        fieldMinCol={fieldMinCol}
        className={classnames({
          'table-style-item': formLayoutType
        })}
      >
        {getFieldDecorator(field.code, {
          initialValue: initialValue || undefined,
          rules: [
            {
              required: +field.isRequired === 1,
              validator: (rule, value, callback) => {
                this.handleCheckTopology(rule, value, callback)
              }
            }
          ]
        })(
          secrecy ? (
            <Secrecy />
          ) : (
            <Topology
              field={field}
              disabled={disabled}
              sandboxId={sandboxId}
              resourceStore={this.props.resourceStore}
              getFieldValue={getFieldValue}
              topologyItem={item.resChartRelationVos || {}}
              delTopology={this.delTopology}
              queryChartSandbox={this.queryChartSandbox}
            />
          )
        )}
      </FormItem>
    )
  }
}
export default TopologyIndex
