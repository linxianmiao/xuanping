import React, { Component } from 'react'
import { Link, withRouter } from 'react-router-dom'
import classnames from 'classnames'
import { observer, inject } from 'mobx-react'
import { MinusCircleOutlined, PlusOutlined } from '@uyun/icons'
import { Form, Input, Button, Row, Col, Select, Popconfirm, message, Spin } from '@uyun/components'
import styles from './index.module.less'
import uuid from '~/utils/uuid'
import _ from 'lodash'
import VerificationStore from './verificationStore'
import { Base64 } from 'js-base64'

const FormItem = Form.Item
const Option = Select.Option

const verificationStore = new VerificationStore()

class Index extends Component {
  state = {
    items: [],
    savaLoading: false,
    queryLoading: false
  }

  componentDidMount() {
    this.getList()
  }

  getList = async () => {
    this.setState({ queryLoading: true })
    const res = await verificationStore.queryGlobalRegularization()
    if (res) this.setState({ queryLoading: false })
    let data = res?.fieldGlobalRegularizations || []
    data = _.map(data, (item) => {
      item.field_regularization = Base64.decode(item.field_regularization)
      return item
    })
    this.setState({ items: data })
  }

  remove = (id) => {
    this.setState({ items: _.filter(this.state.items, (v) => v.ID !== id) })
  }

  delete = async (id) => {
    const res = await verificationStore.deleteGlobalRegularization({ regular_id: id })

    if (res === '200') {
      this.getList()
      message.success('删除成功')
    } else {
      message.error('删除失败')
    }
  }

  add = () => {
    const itemInfo = {
      ID: uuid(),
      name: undefined,
      field_regularization: undefined,
      type: 0,
      isUsing: 1
    }
    this.setState({ items: [...this.state.items, { ...itemInfo }] })
  }

  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        let data = _.cloneDeep(this.state.items)
        data = _.map(data, (item) => {
          delete item.ID
          item.field_regularization = Base64.encode(item.field_regularization)
          return item
        })
        this.setState({ savaLoading: true })
        const res = await verificationStore.saveGlobalRegularization({
          fieldGlobalRegularizations: data
        })
        if (res === '200') {
          message.success('保存成功')
          this.getList()
        } else {
          message.error('保存失败')
        }
        this.setState({ savaLoading: false })
      }
    })
  }

  changeInfo = (e, index, name) => {
    const { items } = this.state
    const tempItems = _.cloneDeep(items)
    _.map(tempItems, (item, i) => {
      if (index === i) {
        item[name] = name === 'type' ? e : e.target.value
      }
      return item
    })
    this.setState({ items: tempItems })
  }

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form
    const { savaLoading, queryLoading } = this.state

    const formItemLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 17 }
    }
    const formItemLayout1 = {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 }
    }
    const { items } = this.state
    const regular = _.map(items, (v) => v.field_regularization) || []
    const formItems = _.map(items, (k, index) => {
      return (
        <Row gutter={8}>
          <Col span={6}>
            <FormItem {...formItemLayout} label={'验证名称'} required key={k}>
              {getFieldDecorator(`name[${k.regular_id || k.ID}]`, {
                validateTrigger: ['onChange', 'onBlur'],
                initialValue: k.name || undefined,
                rules: [
                  {
                    required: true,
                    whitespace: true,
                    message: '请输入验证名称'
                  }
                ]
              })(
                <Input
                  placeholder="请输入"
                  onChange={(e) => this.changeInfo(e, index, 'name')}
                  allowClear
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout1} label={'验证正则'} required key={k}>
              {getFieldDecorator(`regular[${k.regular_id || k.ID}]`, {
                validateTrigger: ['onChange', 'onBlur'],
                initialValue: k.field_regularization || undefined,
                rules: [
                  {
                    required: true,
                    whitespace: true,
                    message: '请输入验证正则'
                  },
                  {
                    validator: (rule, value, callback) => {
                      if (!value) {
                        callback()
                      } else {
                        let isReg
                        try {
                          isReg = eval(value) instanceof RegExp
                        } catch (e) {
                          isReg = false
                        }
                        if (!isReg) {
                          callback(new Error('请输入正则表达式'))
                        } else {
                          let count = 0
                          _.map(regular, (item) => {
                            if (item === value) {
                              count++
                            }
                          })
                          if (count > 1) {
                            callback(new Error('该正则表达式重复'))
                          } else {
                            callback()
                          }
                        }
                      }
                    }
                  }
                ]
              })(
                <Input
                  placeholder="请输入"
                  allowClear
                  onChange={(e) => this.changeInfo(e, index, 'field_regularization')}
                />
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem {...formItemLayout} label={'验证类型'} key={k}>
              {getFieldDecorator(`type[${k.regular_id || k.ID}]`, {
                initialValue: k.type
              })(
                <Select
                  style={{ width: '100%' }}
                  onChange={(e) => this.changeInfo(e, index, 'type')}
                >
                  <Option value={1}>匹配</Option>
                  <Option value={0}>不匹配</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={1} style={{ height: '12px' }}>
            {k.regular_id ? (
              <Popconfirm
                title="确认删除该条数据吗？"
                onConfirm={() => this.delete(k.regular_id)}
                okText="确定"
                cancelText="取消"
              >
                <MinusCircleOutlined className="dynamic-delete-button" />
              </Popconfirm>
            ) : (
              <MinusCircleOutlined
                className="dynamic-delete-button"
                onClick={() => this.remove(k.ID)}
              />
            )}
          </Col>
        </Row>
      )
    })

    return (
      <div>
        <Spin spinning={queryLoading}>
          <div className={styles.header}>
            <div className={styles.right}>
              <Button type="primary" icon={<PlusOutlined />} onClick={this.add}>
                添加验证
              </Button>
            </div>
          </div>

          <Form onSubmit={this.handleSubmit}>
            {formItems}

            {items && items.length > 0 && (
              <Button type="primary" htmlType="submit" loading={savaLoading}>
                提交
              </Button>
            )}
          </Form>
        </Spin>
      </div>
    )
  }
}

const WrappedDynamicFieldSet = Form.create()(Index)

export default WrappedDynamicFieldSet
