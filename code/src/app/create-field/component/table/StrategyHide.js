import React, { Component } from 'react'
import { PlusOutlined } from '@uyun/icons';
import { Button, Input, Select, Form, Col } from '@uyun/components'
import ConditionView from '~/components/triggerRules/conditionView'
import classnames from 'classnames'
import styles from './strategy.module.less'
const Option = Select.Option
const FormItem = Form.Item

const COMPARISON_LIST = [{
  value: 'EQUALS',
  name: i18n('globe.EQUALS', '等于')
}, {
  value: 'NOTEQUALS',
  name: i18n('globe.NOTEQUALS', '不等于')
}, {
  value: 'EMPTY',
  name: i18n('globe.EMPTY', '空')
}, {
  value: 'NOTEMPTY',
  name: i18n('globe.NOTEMPTY', '非空')
}, {
  value: 'CONTAINS',
  name: i18n('globe.CONTAINS', '包含')
}, {
  value: 'NOTCONTAINS',
  name: i18n('globe.NOTCONTAINS', '不包含')
}]
export default class StrategyApi extends Component {
  handleChange = (value, type, index, item) => {
    this.props.onChange(_.assign({}, item, { [type]: value }), index)
  }

  /**
   * 修改条件的值
   * @param {*} value   当前修改的value值
   * @param {*} type    修改的value对应的key
   * @param {*} index   父级的位置
   * @param {*} item    父的数据
   * @param {*} conditionIndex   自己当前的位置
   * @param {*} condition   自己的对象
   */
  handleChangeCondition = (value, type, index, item, conditionIndex, condition) => {
    let newCondition
    if (type === 'condition' && _.includes(['EMPTY', 'NOTEMPTY'], value)) {
      newCondition = _.assign({}, condition, { [type]: value, value: '' })
    } else {
      newCondition = _.assign({}, condition, { [type]: value })
    }
    this.props.onChange(_.assign({}, item, {
      conditions: _.map(item.conditions, (data, idx) => idx === conditionIndex ? newCondition : data)
    }), index)
  }

  onDelCondition = (item, index, conditionIndex) => {
    this.props.onChange(_.assign({}, item, {
      conditions: _.filter(item.conditions, (_, idx) => idx !== conditionIndex)
    }), index)
  }

  onAddCondition = (item, index) => {
    this.props.onChange(_.assign({}, item, {
      conditions: [...item.conditions, { observableCellExpandCode: '', condition: '', value: '' }]
    }), index)
  }

  _renderPanelHeader = (item, index) => {
    const { columns, strategyList, isError, observableCell } = this.props
    // 关联列不能是监听列

    // 找出所有的监听列
    const observableCells = [
      ..._.map(strategyList, item => item.observableCell),
      observableCell
    ]
    return (
      <FormItem style={{ marginBottom: 0 }} validateStatus={isError && !item.observerCell ? 'error' : ''}>
        <Select
          showSearch
          style={{ width: 200 }}
          optionFilterProp="children"
          value={item.observerCell || undefined}
          onChange={value => { this.handleChange(value, 'observerCell', index, item) }}
          placeholder={i18n('globe.select', '请选择')}
          notFoundContent={i18n('globe.notFound', '无法找到')}
        >
          {
            _.map(columns, data => <Option disabled={_.includes(observableCells, data.value)} key={data.value}>{data.label}</Option>)
          }
        </Select>
      </FormItem>
    )
  }

  _renderPanelExtra = (item, index) => {
    const { list } = this.props
    return (
      <React.Fragment>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { this.onAddCondition(item, index) }}>{i18n('condition', '条件')}</Button>
        {
          list.length > 1 &&
          <Col span={1} className="tigger-remove-icon" onClick={() => { this.props.onDel(index) }}><i className="iconfont icon-guanbi1" /></Col>
        }
      </React.Fragment>
    );
  }

  render() {
    const { list, observableCell, columns, fields, isError } = this.props

    const column = _.find(columns, item => item.value === observableCell) || {}
    const field = _.find(fields, field => field.code === column.source) || {}
    return (
      <div className={classnames({
        'trigger-rules-wrap': true,
        [styles.strategyApi]: true
      })}>
        {_.map(list, (item, index) => {
          return (
            <ConditionView key={index} header={this._renderPanelHeader(item, index)} extra={this._renderPanelExtra(item, index)}>
              <React.Fragment>
                {
                  _.map(item.conditions, (condition, conditionIndex) => {
                    return (
                      <div className={classnames('u4-row condition-item-content  trigger-level', {
                        [styles.strategyApiCondition]: true
                      })} key={conditionIndex}>

                        <FormItem style={{ marginBottom: 0 }} validateStatus={isError && !condition.observableCellExpandCode ? 'error' : ''}>
                          <Select
                            showSearch
                            style={{ width: 150 }}
                            optionFilterProp="children"
                            value={condition.observableCellExpandCode || undefined}
                            onChange={value => { this.handleChangeCondition(value, 'observableCellExpandCode', index, item, conditionIndex, condition) }}
                            placeholder={i18n('globe.select', '请选择')}
                            notFoundContent={i18n('globe.notFound', '无法找到')}
                          >
                            {!_.isEmpty(field) && <Option key="_value">{i18n('option_value', '选项值')}</Option>}
                            {
                              _.chain(field)
                                .get('expandSel')
                                .map(data => <Option key={data}>{`${field.code}.${data}`}</Option>)
                                .value()
                            }
                          </Select>
                        </FormItem>

                        <FormItem style={{ marginBottom: 0 }} validateStatus={isError && !condition.condition ? 'error' : ''}>
                          <Select
                            showSearch
                            style={{ width: 120 }}
                            optionFilterProp="children"
                            value={condition.condition || undefined}
                            onChange={value => { this.handleChangeCondition(value, 'condition', index, item, conditionIndex, condition) }}
                            placeholder={i18n('globe.select', '请选择')}
                            notFoundContent={i18n('globe.notFound', '无法找到')}>
                            {_.map(COMPARISON_LIST, data => <Option key={data.value}>{data.name}</Option>)}
                          </Select>
                        </FormItem>

                        <FormItem style={{ marginBottom: 0 }} validateStatus={isError && !condition.value ? 'error' : ''}>
                          <Input
                            disabled={_.includes(['EMPTY', 'NOTEMPTY'], condition.condition)}
                            value={condition.value || undefined}
                            style={{ width: 150 }}
                            onChange={e => this.handleChangeCondition(e.target.value, 'value', index, item, conditionIndex, condition)} />
                        </FormItem>
                        {
                          item.conditions.length > 1 &&
                          <Col className="tigger-remove-icon" span={1} onClick={() => { this.onDelCondition(item, index, conditionIndex) }}>
                            <i className="iconfont icon-guanbi1" />
                          </Col>
                        }
                      </div>
                    )
                  })
                }
              </React.Fragment>
            </ConditionView>
          )
        })}
        <Button onClick={this.props.onAdd} type="primary" icon={<PlusOutlined />}>{i18n('user_group_add', '添加')}</Button>
      </div>
    );
  }
}
