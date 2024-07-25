import React, { Component } from 'react'
import { CloseCircleFilled, PlusOutlined } from '@uyun/icons'
import { Button, Input, Checkbox, Form, InputNumber } from '@uyun/components'
import { Palette } from '~/components/SelectWithColor'
import { allColor } from '~/components/ColorPicker/logic'
import './style/params.less'
import _ from 'lodash'

const FormItem = Form.Item

class params extends Component {
  state = {
    params: this.props.defaultValue
  }

  // 添加参数
  onAdd = () => {
    const { params } = this.state
    params.push({ label: '', value: '', select: 0, color: allColor[5] })
    this.onParams(params)
  }

  // 设置默认值
  onChange = (e, index) => {
    const { params } = this.state
    if (this.props.type === 'multiSel') {
      params[index].select = e.target.checked ? 1 : 0
    } else {
      _.map(params, (item, i) => {
        item.select = index === i && e.target.checked ? 1 : 0
      })
    }
    this.onParams(params)
  }

  // 参数值变更
  onValue = (e, index, type) => {
    const value = e.target.value
    const { params } = this.state
    params[index][type] = value
    this.onParams(params)
  }

  onValueInputNumber = (value, index, type) => {
    if (_.isNumber(value)) {
      const { params } = this.state
      params[index][type] = value
      this.onParams(params)
    }
  }

  handleShowColorChecked = (checked) => {
    const isChooseColor = checked ? 1 : 0
    this.props.setFieldsValue({ isChooseColor })
  }

  // 设置颜色
  handleColorChange = (value, index) => {
    const { params } = this.state

    params[index].color = value
    this.onParams(params)
  }

  // 删除参数
  onDelete = (index) => {
    const { params } = this.state
    params.splice(index, 1)
    this.onParams(params)
  }

  onParams = (params) => {
    this.setState({ params }, () => {
      this.props.setFieldsValue({ params })
    })
  }

  getIsChooseColor = () => {
    const { getFieldValue, fieldData } = this.props

    let isChooseColor = getFieldValue && getFieldValue('isChooseColor')

    if (isChooseColor === undefined) {
      isChooseColor = fieldData.isChooseColor
    }

    return isChooseColor
  }

  render() {
    const { formItemLayout, item, getFieldDecorator, defaultValue, type: fieldType } = this.props
    const { params } = this.state
    const { code } = this.props.fieldData
    const isChooseColor = this.getIsChooseColor()

    return (
      <div className="list-select-custom-options">
        <FormItem style={{ margin: 0 }}>
          {getFieldDecorator('isChooseColor', {
            initialValue: isChooseColor
          })(<div />)}
        </FormItem>
        <FormItem {...formItemLayout} label={item.name}>
          {getFieldDecorator(item.code, {
            initialValue: defaultValue,
            rules: [
              { required: item.required, message: i18n('options_isnot_empty', '选项不能为空') }
            ],
            trigger: '' // 防止下面Checkbox的onChange影响params数据
          })(
            <div>
              <Button onClick={this.onAdd}>
                <PlusOutlined />
                {i18n('options', '选项')}
              </Button>
              {fieldType === 'singleSel' && (
                <Checkbox
                  style={{ marginLeft: 10 }}
                  checked={!!isChooseColor}
                  onChange={(e) => this.handleShowColorChecked(e.target.checked)}
                >
                  {i18n('set.option.color', '设置选项颜色')}
                </Checkbox>
              )}
              <div className="public-params-wrap">
                {_.map(params, (item, i) => {
                  return (
                    <div key={i} className="public-params-item">
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
                          placeholder={i18n('option.text', '选项文本')}
                          value={item.label}
                          onChange={(e) => {
                            this.onValue(e, i, 'label')
                          }}
                        />
                      </span>
                      <span className="item-value">
                        {
                          // 特殊处理 优先级 只能是数字
                          code === 'urgentLevel' ? (
                            <InputNumber
                              max={127}
                              min={0}
                              size="small"
                              placeholder={i18n('option_value', '选项值')}
                              value={item.value}
                              onChange={(value) => this.onValueInputNumber(value, i, 'value')}
                            />
                          ) : (
                            <Input
                              size="small"
                              placeholder={i18n('option_value', '选项值')}
                              value={item.value}
                              onChange={(e) => {
                                this.onValue(e, i, 'value')
                              }}
                            />
                          )
                        }
                      </span>
                      {fieldType === 'singleSel' && (
                        <Palette
                          style={{ marginRight: 10 }}
                          disabled={!isChooseColor}
                          value={item.value}
                          color={item.color}
                          fieldData={this.props.fieldData}
                          onChange={(value) => this.handleColorChange(value, i)}
                        />
                      )}
                      {params.length > 1 && (
                        <a className="field-options-btn" onClick={() => this.onDelete(i)}>
                          <CloseCircleFilled />
                        </a>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </FormItem>
      </div>
    )
  }
}

export default params
