import React, { Component } from 'react'
import { Row, Col, Button, Input, Checkbox } from '@uyun/components'
import { ArrowUpOutlined, ArrowDownOutlined, PlusOutlined } from '@uyun/icons'

class CustomOptions extends Component {
  // 添加参数
  onAdd = (i) => {
    const { fieldData } = this.props
    const item = { label: '', value: '', select: 0 }
    if (i !== -1) {
      fieldData.params = fieldData.params
        .slice(0, i + 1)
        .concat(item)
        .concat(fieldData.params.slice(i + 1))
    } else {
      fieldData.params.push(item)
    }
    this.props.onChange(fieldData)
  }

  onMoveUp = (i) => {
    const { fieldData } = this.props
    const data = _.cloneDeep(fieldData?.params)
    const item = _.cloneDeep(data[i - 1])
    const item2 = _.cloneDeep(data[i])
    data[i - 1] = item2
    data[i] = item
    fieldData.params = data
    this.props.onChange(fieldData)
  }

  onMoveDown = (index) => {
    const { fieldData } = this.props
    const data = _.cloneDeep(fieldData?.params)
    const item = _.cloneDeep(data[index + 1])
    const item2 = _.cloneDeep(data[index])
    data[index] = item
    data[index + 1] = item2
    fieldData.params = data
    this.props.onChange(fieldData)
  }

  // 设置默认值
  onChange = (e, index) => {
    const { getFieldValue } = this.props
    const checked = e.target.checked
    const { fieldData } = this.props
    if (checked) {
      if (getFieldValue('isSingle') === '0') {
        _.map(fieldData.params, (item, i) => {
          item.select = index === i ? 1 : 0
        })
      } else {
        fieldData.params[index].select = 1
      }
    } else {
      fieldData.params[index].select = 0
    }
    this.props.onChange(fieldData)
  }

  // 参数值变更
  onValue = (e, index, type) => {
    const value = e.target.value
    const { fieldData } = this.props
    fieldData.params[index][type] = value
    this.props.onChange(fieldData)
  }

  // 删除参数
  onDelete = (index) => {
    const { fieldData } = this.props
    fieldData.params.splice(index, 1)
    this.props.onChange(fieldData)
  }

  render() {
    const { params } = this.props.fieldData
    return (
      <div className="list-select-custom-options">
        <Row>
          <Col span={2}>{i18n('value_range', '值范围')}</Col>
          <Col span={21}>
            <Button size="small" type="primary" onClick={() => this.onAdd(-1)}>
              {i18n('add_options', '添加选项')}
            </Button>
          </Col>
        </Row>
        {_.map(params, (item, i) => {
          return (
            <Row key={i} className="custom-options-item">
              <Col span={2}>{i18n('options', '选项')}</Col>
              <Col span={21}>
                <span className="item-select">
                  <Checkbox
                    checked={item.select}
                    onChange={(e) => {
                      this.onChange(e, i)
                    }}
                  />
                </span>
                <span className="item-label">
                  <Input
                    size="small"
                    value={item.label}
                    onChange={(e) => {
                      this.onValue(e, i, 'label')
                    }}
                    placeholder={`${i18n('default_select_text', '默认选项文本')}${i + 1}`}
                  />
                </span>
                <span className="item-value">
                  <Input
                    size="small"
                    value={item.value}
                    onChange={(e) => {
                      this.onValue(e, i, 'value')
                    }}
                    placeholder={`${i18n('option_value', '选项值')}${i + 1}`}
                  />
                </span>
                <span>
                  <Button
                    size="small"
                    onClick={() => {
                      this.onAdd(i)
                    }}
                  >
                    <PlusOutlined />
                  </Button>
                  {params.length > 1 && (
                    <button
                      className="field-options-btn iconfont icon-shanchu"
                      onClick={() => {
                        this.onDelete(i)
                      }}
                    />
                  )}
                  {i !== 0 && (
                    <ArrowUpOutlined
                      className="field-options-btn"
                      onClick={() => this.onMoveUp(i)}
                    />
                  )}
                  {i !== params.length - 1 && (
                    <ArrowDownOutlined onClick={() => this.onMoveDown(i)} />
                  )}
                </span>
              </Col>
            </Row>
          )
        })}
      </div>
    )
  }
}

export default CustomOptions
