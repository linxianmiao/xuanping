import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Form, Row, Col, Input, Select } from '@uyun/components'
import './styles/header.less'
import IconList from './config/iconList'
const FormItem = Form.Item
const Option = Select.Option

@inject('listStore')
@observer
class Basic extends Component {
  constructor(props) {
    super(props)
    this.state = {
      iconName: props.editData.iconName
    }
  }

  handleClick = (data) => {
    this.setState(
      {
        iconName: data.key
      },
      () => {
        this.props.form.setFieldsValue({
          iconName: data.key
        })
      }
    )
  }

  handleCheckSingleRowText = (item, rule, value, callback) => {
    if (this.props.menuType === 'BUILT') {
      callback()
      return
    }
    const codeReg = /^[a-zA-Z]+$/
    const myReg = /^([\u4e00-\u9fa5a-zA-Z0-9 ]+)$/
    if (rule.required && !value) {
      callback(`${i18n('ticket.forms.pinput', '请输入')}`)
    } else {
      if (item === 'zhName' && !myReg.test(value)) {
        callback(i18n('field_create_name_error', '不能包含特殊字符'))
      }
      if (item === 'enName' && !codeReg.test(value.split(' ').join(''))) {
        callback(i18n('field_create_enName_error', '输入只能为英文'))
      }
      if (item === 'code' && !codeReg.test(value)) {
        callback(i18n('field_create_enName_error', '输入只能为英文'))
      }
      if (rule.max && value.length > rule.max) {
        callback(
          `${i18n('ticket.forms.beyond', '不能超出')}${rule.max}${i18n(
            'ticket.forms.character',
            '字符'
          )}`
        )
      } else if (rule.min && value.length < rule.min) {
        callback(
          `${i18n('ticket.forms.below', '不能低于')}${rule.min}${i18n(
            'ticket.forms.character',
            '字符'
          )}`
        )
      } else {
        callback()
      }
    }
  }

  render() {
    const formItemLayout = {
      labelCol: { span: 24 },
      wrapperCol: { span: 24 }
    }
    const { menuType, editData } = this.props
    const { groupList } = this.props.listStore
    const { iconName } = this.state
    const { getFieldDecorator } = this.props.form
    const zhName =
      menuType !== 'GROUP'
        ? i18n('ticket.list.zhName', '中文名')
        : i18n('ticket.list.groupZhName', '分类中文名')
    const enName =
      menuType !== 'GROUP'
        ? i18n('ticket.list.enName', '英文名')
        : i18n('ticket.list.groupEnName', '分类英文名')
    const iconNameLabel =
      menuType !== 'GROUP'
        ? i18n('ticket.list.menuIcon', '查询器图标')
        : i18n('ticket.list.groupIcon', '分类图标')
    const disabled = Boolean(menuType === 'BUILT' || editData.id)
    const span = menuType === 'GROUP' ? 8 : 6
    return (
      <Form>
        <Row gutter={16}>
          <Col className="filter-item" span={span}>
            <FormItem label={zhName} {...formItemLayout}>
              {getFieldDecorator('zhName', {
                initialValue: editData.zhName,
                rules: [
                  {
                    type: 'string',
                    required: true,
                    max: 20,
                    min: 2,
                    validator: (rule, value, callback) => {
                      this.handleCheckSingleRowText('zhName', rule, value, callback)
                    }
                  }
                ]
              })(
                <Input
                  maxLength={20}
                  placeholder={`${i18n('ticket.forms.pinput', '请输入')}...`}
                  disabled={editData.code === 'todoGroup' ? false : menuType === 'BUILT'}
                />
              )}
            </FormItem>
          </Col>

          <Col className="filter-item" span={span}>
            <FormItem label={enName} {...formItemLayout}>
              {getFieldDecorator('enName', {
                initialValue: editData.enName,
                rules: [
                  {
                    type: 'string',
                    required: true,
                    max: 20,
                    min: 4,
                    validator: (rule, value, callback) => {
                      this.handleCheckSingleRowText('enName', rule, value, callback)
                    }
                  }
                ]
              })(
                <Input
                  maxLength={20}
                  placeholder={`${i18n('ticket.forms.pinput', '请输入')}...`}
                  disabled={editData.code === 'todoGroup' ? false : menuType === 'BUILT'}
                />
              )}
            </FormItem>
          </Col>

          <Col className="filter-item" span={span}>
            <FormItem label={i18n('field_value_code', '属性编码')} {...formItemLayout}>
              {getFieldDecorator('code', {
                initialValue: editData.code,
                validateFirst: true,
                rules: [
                  {
                    type: 'string',
                    whitespace: true,
                    required: true,
                    min: 2,
                    max: 20,
                    validator: (rule, value, callback) => {
                      this.handleCheckSingleRowText('code', rule, value, callback)
                    }
                  }
                ]
              })(
                <Input
                  maxLength={20}
                  disabled={disabled}
                  placeholder={`${i18n('ticket.forms.pinput', '请输入')}...`}
                />
              )}
            </FormItem>
          </Col>

          {menuType !== 'GROUP' && !this.props.appIsolation ? (
            <Col className="filter-item" span={6}>
              <FormItem label={i18n('ticket.list.sort', '所在分类')} {...formItemLayout}>
                {getFieldDecorator('superiorMenuId', {
                  initialValue: editData.superiorMenuId
                })(
                  <Select
                    allowClear
                    notFoundContent={i18n('globe.not_find', '无法找到')}
                    placeholder={`${i18n('globe.select', '请选择')}${i18n(
                      'ticket.list.sort',
                      '所在分类'
                    )}`}
                    getPopupContainer={(triggerNode) => triggerNode}
                  >
                    {_.map(groupList, (group) => {
                      const label = window.language === 'en_US' ? group.enName : group.zhName
                      return (
                        <Option key={group.id} value={`${group.id}`}>
                          {label}
                        </Option>
                      )
                    })}
                  </Select>
                )}
              </FormItem>
            </Col>
          ) : null}
        </Row>

        <Row>
          {menuType !== 'BUILT' && (
            <FormItem label={iconNameLabel} {...formItemLayout}>
              {getFieldDecorator('iconName', {
                initialValue: editData.iconName,
                rules: [
                  {
                    required: menuType === 'GROUP',
                    message: i18n('ticket.list.select.icon', '请选择类图标')
                  }
                ]
              })(
                <div className="queryer-icon">
                  {IconList.map((data) => {
                    return (
                      <div
                        className={`${iconName === data.key ? 'active' : ''}`}
                        onClick={() => {
                          this.handleClick(data)
                        }}
                        key={data.key}
                      >
                        <i className={'iconfont ' + data.name} />
                      </div>
                    )
                  })}
                </div>
              )}
            </FormItem>
          )}
          <FormItem style={{ display: 'none' }}>
            {getFieldDecorator('id', {
              initialValue: editData.id
            })(<div />)}
            {getFieldDecorator('defaultHome', {
              initialValue: editData.defaultHome
            })(<div />)}
            {getFieldDecorator('status', {
              initialValue: editData.status
            })(<div />)}
            {getFieldDecorator('order', {
              initialValue: editData.order
            })(<div />)}
          </FormItem>
        </Row>
      </Form>
    )
  }
}
export default Form.create()(Basic)
