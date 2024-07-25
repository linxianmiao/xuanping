import React from 'react'
import { MinusCircleOutlined } from '@uyun/icons'
import { Modal, Form, Input, Button, message, InputNumber } from '@uyun/components'
import dictionaryStore from './store/dictionaryStore'
import styles from './index.module.less'

const FormItem = Form.Item
const { TextArea } = Input

let id = 0

@Form.create()
export default class AddModal extends React.Component {
  componentDidUpdate(prevProps) {
    const { visible } = this.props
    if (!visible && visible !== prevProps.visible) {
      this.props.form.resetFields()
    }
  }

  onAdd = () => {
    const { form } = this.props
    const keys = form.getFieldValue('keys')
    const nextKeys = keys.concat(++id)
    form.setFieldsValue({
      keys: nextKeys
    })
  }

  remove = (k) => {
    const { form } = this.props
    const keys = form.getFieldValue('keys')
    form.setFieldsValue({
      keys: keys.filter((key) => key !== k)
    })
  }

  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (err) {
        return
      }
      const { dicCode } = dictionaryStore
      const { isEdit, dicDetail } = this.props
      const params = _.cloneDeep(values)
      params.name = _.compact(params.name)
      params.value = _.compact(params.value)
      params.sort = _.compact(params.sort)
      params.description = _.compact(params.description)
      params.name.unshift(params.name0)
      params.value.unshift(params.value0)
      params.sort.unshift(params.sort0)
      params.description.unshift(params.description0)
      if (!isEdit) {
        const paramLists = _.map(params.value, (item, a) => {
          return {
            dicCode,
            name: params.name[a],
            value: item,
            description: params.description[a],
            sort: params.sort[a]
          }
        })
        dictionaryStore.batchSaveDictionaryData(paramLists).then((res) => {
          if (res) {
            message.success(i18n('add-success'))
            this.props.form.resetFields()
            this.props.onShowMadal(false)
          }
        })
      } else {
        const paramList = {
          id: dicDetail.id,
          dicCode,
          name: params.name0,
          value: params.value0,
          description: params.description0,
          version: dicDetail.version,
          sort: params.sort0
        }
        dictionaryStore.updateDictionaryData(paramList).then((res) => {
          if (res) {
            message.success(i18n('update_success'))
            this.props.form.resetFields()
            this.props.onShowMadal(false)
          }
        })
      }
    })
  }

  onCheckName = (rule, value, callback) => {
    if (value.lenght <= 0) {
      callback(i18n('ticket.forms.pinputName'))
    } else if (/\s/.test(value)) {
      callback(i18n('conf.model.notblank'))
    } else {
      callback()
    }
  }

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form
    const { visible, isEdit, dicDetail } = this.props
    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 21 }
    }
    getFieldDecorator('keys', { initialValue: [] })
    const keys = getFieldValue('keys')
    const formItems = _.map(keys, (k, index) => (
      <div key={k} className={styles.part}>
        <FormItem label={i18n('name')} {...formItemLayout}>
          {getFieldDecorator(`name[${k}]`, {
            rules: [
              {
                required: true,
                message: i18n('dictionary-please-enter-name')
              },
              {
                validator: this.onCheckName
              }
            ]
          })(<Input maxLength={32} placeholder={i18n('dictionary-please-enter-name')} />)}
        </FormItem>
        <FormItem label={i18n('dictionary-value')} {...formItemLayout}>
          {getFieldDecorator(`value[${k}]`, {
            rules: [
              {
                required: true,
                message: i18n('dictionary-please-enter-value', '请输入字典值')
              },
              {
                pattern: /^[a-zA-Z0-9][a-zA-Z0-9_]{0,32}$/,
                message: i18n('dict-name-limt')
              }
            ]
          })(<Input placeholder={i18n('dictionary-please-enter-value')} maxLength={32} />)}
        </FormItem>
        <FormItem label={i18n('dictionary-sort')} {...formItemLayout}>
          {getFieldDecorator(`sort[${k}]`)(
            <InputNumber
              style={{ width: '100%' }}
              min={-99999}
              max={99999}
              step={1}
              placeholder={i18n('dctionary-higher-more-forward')}
            />
          )}
        </FormItem>
        <FormItem label={i18n('dictionary-description')} {...formItemLayout}>
          {getFieldDecorator(`description[${k}]`)(
            <TextArea rows={3} maxLength={200} placeholder={i18n('dictionary-please-enter-desc')} />
          )}
        </FormItem>
        <MinusCircleOutlined className="dynamic-delete-button" onClick={() => this.remove(k)} />
      </div>
    ))
    return (
      <Modal
        className={styles.modal}
        title={!isEdit ? '添加属性' : '编辑属性'}
        visible={visible}
        onOk={this.handleSubmit}
        onCancel={() => this.props.onShowMadal(false)}
      >
        <Form>
          <div className={styles.part}>
            <FormItem label={i18n('name')} {...formItemLayout}>
              {getFieldDecorator('name0', {
                rules: [
                  {
                    required: true,
                    message: i18n('dictionary-please-enter-name', '请输入字典名称')
                  },
                  {
                    validator: this.onCheckName
                  }
                ],
                initialValue: isEdit ? dicDetail.name : ''
              })(<Input placeholder={i18n('dictionary-please-enter-name')} maxLength={32} />)}
            </FormItem>
            <FormItem label={i18n('dictionary-value')} {...formItemLayout}>
              {getFieldDecorator('value0', {
                rules: [
                  {
                    required: true,
                    message: i18n('dictionary-please-enter-value', '请输入字典值')
                  },
                  {
                    pattern: /^[a-zA-Z0-9][a-zA-Z0-9_]{0,32}$/,
                    message: i18n('dict-name-limt')
                  }
                ],
                initialValue: isEdit ? dicDetail.value : ''
              })(
                <Input
                  disabled={isEdit}
                  placeholder={i18n('dictionary-please-enter-value')}
                  maxLength={32}
                />
              )}
            </FormItem>
            <FormItem label={i18n('dictionary-sort')} {...formItemLayout}>
              {getFieldDecorator('sort0', {
                rules: [
                  // {
                  //   required: true,
                  //   message: i18n('dictionary-please-enter-sort', '请输入排序')
                  // }
                ],
                initialValue: isEdit ? dicDetail.sort : ''
              })(
                <InputNumber
                  style={{ width: '100%' }}
                  min={-99999}
                  max={99999}
                  step={1}
                  placeholder={i18n('dctionary-higher-more-forward', '数值越大越靠前')}
                />
              )}
            </FormItem>
            <FormItem label={i18n('dictionary-description')} {...formItemLayout}>
              {getFieldDecorator('description0', {
                initialValue: isEdit ? dicDetail.description : ''
              })(
                <TextArea
                  placeholder={i18n('dictionary-please-enter-desc', '请输入字典说明')}
                  rows={4}
                  maxLength={200}
                />
              )}
            </FormItem>
          </div>
          {formItems}
          {!isEdit && (
            <Button type="primary" onClick={this.onAdd} style={{ width: 80 }}>
              {'添加属性'}
            </Button>
          )}
        </Form>
      </Modal>
    )
  }
}