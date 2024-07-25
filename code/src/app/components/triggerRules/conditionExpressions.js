import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { Select, Row, Col, Form, Tooltip } from '@uyun/components'
import TriggerValueList from '../triggerValueList'

const FormItem = Form.Item
const Option = Select.Option

@observer
class ConditionExpressions extends Component {
  constructor(props) {
    super(props)
    this.state = {
      conditions: {},
      selectedField: {}
    }
  }

  componentDidMount() {
    const { condition, modelId } = this.props
    const { key, type } = condition
    if (key) {
      this.getValueParams(key, { type, modelId })
    }
  }

  onSelect = (code) => {
    const { triggerRulesStore } = this.props
    const { sectionConditionList } = triggerRulesStore
    const filter = _.find(sectionConditionList, (condition) => condition.code === code) || {}
    const data = {
      type: filter.type,
      key: code,
      value: undefined,
      comparison: undefined
    }
    const selectedField = sectionConditionList.find((d) => d.code === code)
    this.setState({ selectedField }, () => {
      this.handleChange(data)
    })
  }

  // 修改判断条件同时清空value
  onExpressions = (comparison) => {
    const { condition } = this.props
    const { conditions } = this.state
    this.setState({ conditions })
    this.handleChange(
      _.assign({}, condition, {
        comparison,
        value: undefined
      })
    )
  }

  // 改变第三个框
  onValue = (value) => {
    const { condition } = this.props
    this.handleChange(_.assign({}, condition, { value }))
  }

  // 获取value的下拉数据(当有modelid的时候就不用选择模型，直接选择环节)
  // 模型列表也进行特殊处理(滚动加载)
  getValueParams = async (code, data) => {
    const { modelId } = this.props
    let conditions
    if (code === 'modelId') {
      conditions = { comparsionList: [], comparsionType: 'modelList' }
    } else if (code === 'activity') {
      conditions = modelId
        ? await this.props.triggerRulesStore.getNodesByModel(modelId)
        : { comparsionList: [], comparsionType: 'modelAndTache' }
    } else {
      conditions = await this.props.triggerRulesStore.getComparsion(code, data)
    }
    this.setState({ conditions })
  }

  // 改变条件
  handleChange = (data) => {
    const { index, item, conditionIndex } = this.props
    const conditionExpressions = _.map(item.conditionExpressions, (condition, idx) => {
      if (idx === conditionIndex) {
        return data
      } else {
        return condition
      }
    })
    const newItem = _.assign({}, item, { conditionExpressions })
    this.props.onChange(newItem, index)
  }

  render() {
    const { condition, conditionIndex, triggerRulesStore, isError, isRequired, conditionlength } =
      this.props
    const { conditions, selectedField } = this.state
    const { sectionConditionList } = triggerRulesStore
    const { key, comparison, value } = condition
    const { comparsionList, comparsionType } = conditions
    const filter = _.find(sectionConditionList, (child) => child.code === condition.key) || {}
    const { logics } = filter
    return (
      <Row className="condition-item-content  trigger-level">
        <Col span={7} style={{ paddingRight: 16 }}>
          <FormItem
            style={{ marginBottom: 0 }}
            validateStatus={_.isEmpty(key) && isError ? 'error' : 'success'}
          >
            <Select
              showSearch
              value={key}
              optionLabelProp="name"
              optionFilterProp="name"
              dropdownStyle={{ minWidth: 240 }}
              placeholder={i18n('globe.select', '请选择')}
              notFoundContent={i18n('globe.notFound', '无法找到')}
              onChange={this.onSelect}
            >
              {_.map(sectionConditionList, (item) => (
                <Option name={item.name} value={item.code} key={item.code}>
                  <Tooltip
                    mouseEnterDelay={0.5}
                    mouseLeaveDelay={0}
                    placement="right"
                    title={`${item.name} | ${item.code}`}
                  >
                    <div className="trigger-condition-item-content-select-option-div">
                      <span className="shenglue">{item.name}</span>
                      <span className="shenglue">{item.code}</span>
                    </div>
                  </Tooltip>
                </Option>
              ))}
            </Select>
          </FormItem>
        </Col>
        <Col span={5} style={{ paddingRight: 16 }}>
          <FormItem
            style={{ marginBottom: 0 }}
            validateStatus={_.isEmpty(comparison) && isError ? 'error' : 'success'}
          >
            <Select
              showSearch
              value={comparison}
              optionFilterProp="children"
              placeholder={i18n('globe.select', '请选择')}
              notFoundContent={i18n('globe.notFound', '无法找到')}
              onChange={this.onExpressions}
            >
              {_.map(logics, (item) => (
                <Option value={item.value} key={item.value}>
                  {item.name}
                </Option>
              ))}
            </Select>
          </FormItem>
        </Col>
        {!_.includes(['IS_NOT_NULL', 'IS_NULL'], comparison) && (
          <Col span={11} style={{ paddingRight: 16 }}>
            <FormItem
              style={{ marginBottom: 0 }}
              validateStatus={_.isEmpty(value) && isError ? 'error' : 'success'}
            >
              <TriggerValueList
                value={value}
                comparison={comparison}
                comparsionType={comparsionType}
                conditionList={comparsionList}
                handleChange={this.onValue}
                selectedField={selectedField}
                logics={filter?.params || {}}
              />
            </FormItem>
          </Col>
        )}

        {isRequired && conditionlength === 1 ? null : (
          <Col
            className="tigger-remove-icon"
            span={1}
            onClick={() => {
              this.props.handleRemoveCondition(conditionIndex)
            }}
          >
            <i className="iconfont icon-guanbi1" />
          </Col>
        )}
      </Row>
    )
  }
}

export default ConditionExpressions
