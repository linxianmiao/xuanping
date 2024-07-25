import React, { Component } from 'react'
import { PlusOutlined } from '@uyun/icons';
import { Button, Input, Select, Col, Form } from '@uyun/components'
import ConditionView from '~/components/triggerRules/conditionView'
import classnames from 'classnames'
import styles from './strategy.module.less'
const Option = Select.Option
const FormItem = Form.Item
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
   */
  handleChangeCondition = (value, type, index, item, conditionIndex) => {
    this.props.onChange(_.assign({}, item, {
      conditions: _.map(item.conditions, (data, idx) => idx === conditionIndex ? _.assign({}, data, { [type]: value }) : data)
    }), index)
  }

  onDelCondition = (item, index, conditionIndex) => {
    this.props.onChange(_.assign({}, item, {
      conditions: _.filter(item.conditions, (_, idx) => idx !== conditionIndex)
    }), index)
  }

  onAddCondition = (item, index) => {
    this.props.onChange(_.assign({}, item, {
      conditions: [...item.conditions, { paramName: '', observableCellExpandCode: '' }]
    }), index)
  }

  _renderPanelHeader = (item, index) => {
    const { observableCell, columns, fields, isError, strategyList } = this.props
    // 关联列只能是 下拉类型且是外部数据源的列 且不能是监听列 且不能是只读

    // 找出下拉类型且是外部数据源的列
    const expandListSelCode = _.chain(fields, field => field.tabStatus === '1').map(field => field.code).value()
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
            _.chain(columns)
              .filter(item => _.includes(expandListSelCode, item.source))
              .map(item => <Option disabled={item.readOnly === 1 || _.includes(observableCells, item.value)} key={item.value}>{item.label}</Option>)
              .value()
          }
        </Select>
      </FormItem>
    )
  }

  _renderPanelExtra = (item, index) => {
    const { list } = this.props
    return (
      <React.Fragment>
        <Button icon={<PlusOutlined />} onClick={() => { this.onAddCondition(item, index) }}>{i18n('condition', '条件')}</Button>
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
            <ConditionView header={this._renderPanelHeader(item, index)} extra={this._renderPanelExtra(item, index)}>
              <React.Fragment>
                {
                  _.map(item.conditions, (condition, conditionIndex) => {
                    return (
                      <div className={classnames('u4-row condition-item-content  trigger-level', {
                        [styles.strategyApiCondition]: true
                      })} key={conditionIndex}>
                        <FormItem style={{ marginBottom: 0 }} validateStatus={isError && !condition.paramName ? 'error' : ''}>
                          <Input
                            style={{ width: 200 }}
                            value={condition.paramName || undefined}
                            placeholder={i18n('ticket.forms.pinput', '请输入')}
                            onChange={e => this.handleChangeCondition(e.target.value, 'paramName', index, item, conditionIndex)} />
                        </FormItem>
                        <FormItem style={{ marginBottom: 0 }} validateStatus={isError && !condition.observableCellExpandCode ? 'error' : ''}>
                          <Select
                            showSearch
                            style={{ width: 200 }}
                            optionFilterProp="children"
                            value={condition.observableCellExpandCode || undefined}
                            onChange={value => { this.handleChangeCondition(value, 'observableCellExpandCode', index, item, conditionIndex) }}
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
        <Button onClick={this.props.onAdd} icon={<PlusOutlined />}>{i18n('user_group_add', '添加')}</Button>
      </div>
    );
  }
}
