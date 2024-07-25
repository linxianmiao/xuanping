import React, { Fragment } from 'react'
import { PlusOutlined } from '@uyun/icons';
import { Select, Button, Col } from '@uyun/components'
import GroupWrap from './GroupWrap'
import Item from './Item'

const Option = Select.Option

const Group = props => {
  const handleWhenChange = value => {
    const nextData = { ...props.data }

    nextData.when = value
    props.onChange(nextData)
  }

  const handleConditionExpressionChange = (value, index) => {
    const nextData = { ...props.data }

    nextData.conditionExpressions[index] = value
    props.onChange(nextData)
  }

  const handleConditionExpressionAdd = () => {
    const nextData = { ...props.data }

    nextData.conditionExpressions.push({
      key: undefined,
      comparison: undefined,
      value: undefined
    })
    props.onChange(nextData)
  }

  const handleConditionExpressionDelete = index => {
    const nextData = { ...props.data }

    nextData.conditionExpressions.splice(index, 1)
    props.onChange(nextData)
  }

  const renderHeader = (when) => {
    return (
      <Fragment>
        <Select
          style={{ width: 150 }}
          value={when || 'all'} // 老数据的when为null，当成all处理
          onChange={handleWhenChange}
        >
          <Option value="all">{i18n('sla_all', '全部满足')}</Option>
          <Option value="any">{i18n('sla_any', '任意满足')}</Option>
          {/* <Option value="not">{i18n('sla_not', '全不满足')}</Option> */}
        </Select>
        <span style={{ marginLeft: 8 }} className='hits'>{i18n('condition', '条件')}</span>
      </Fragment>
    )
  }

  const renderExtra = (level) => {
    return (
      <Fragment>
        {/* {
          level < 2 && (
            <Button
              style={{ marginRight: 8 }}
              type="primary"
              icon="plus"
              onClick={() => {}}
            >
              {i18n('nesting', '嵌套')}
            </Button>
          )
        } */}
        <Button type="primary" icon={<PlusOutlined />} onClick={handleConditionExpressionAdd}>
          {i18n('condition', '条件')}
        </Button>
        {/* {
          level !== 0 && (
            <Col span={1} className="tigger-remove-icon" onClick={() => {}}>
              <i className="iconfont icon-guanbi1" />
            </Col>
          )
        } */}
      </Fragment>
    );
  }

  const { level, data, fields } = props
  const { when, conditionExpressions, nestingConditions } = data

  return (
    <GroupWrap
      level={level}
      header={renderHeader(when)}
      extra={renderExtra(level)}
    >
      {
        _.map(conditionExpressions, (condition, index) => {
          return (
            <Item
              key={'' + condition.key + index}
              data={condition}
              fields={fields}
              onChange={value => handleConditionExpressionChange(value, index)}
              onDelete={() => handleConditionExpressionDelete(index)}
            />
          )
        })
      }
      {
        _.map(nestingConditions, (group, index) => {
          return (
            <Group
              key={index}
              level={level + 1}
              data={group}
              fields={fields}
            />
          )
        })
      }
    </GroupWrap>
  )
}

Group.defaultProps = {
  fields: [], // 可选字段
  level: 0, // 层级
  data: {}, // 这个条件组的数据
  onChange: () => {}
}

export default Group
