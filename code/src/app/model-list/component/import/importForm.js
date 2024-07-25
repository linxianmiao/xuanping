import React, { Component } from 'react'
import { UploadOutlined } from '@uyun/icons'
import { Form, Select, Upload, Button, Checkbox, Spin } from '@uyun/components'
import { inject, observer } from 'mobx-react'
import ModelGroupSelect from '~/components/modelGroupSelect'
const FormItem = Form.Item
const { Option, OptGroup } = Select
const CheckboxGroup = Checkbox.Group
@inject('modelListStore')
@observer
class ImportForm extends Component {
  state = {
    loading: false
  }

  beforeUpload = (file) => {
    this.props.form.setFieldsValue({ file: file })
    return false
  }

  onDropdownVisibleChange = async (visible) => {
    if (visible) {
      this.setState({ loading: true })
      const res = (await this.props.modelListStore.queryModelsWithLayout()) || []
      this.setState({ loading: false, list: res })
    }
  }

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form
    const { visible } = this.props
    const { list, loading } = this.state
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 }
    }
    // 如果是新增模型的话，则必须选择基本信息
    const options = [
      {
        label: i18n('conf.model.basicInfo', '基本信息'),
        value: 'base',
        disabled: visible === 'add'
      },
      { label: i18n('ticket.list.formDetail', '表单信息'), value: 'form' },
      { label: i18n('process', '流程图'), value: 'chart' },
      { label: i18n('conf.modal.list.import.variable', '变量信息'), value: 'variable' }
    ]
    const fileList = getFieldValue('file') ? [getFieldValue('file')] : []
    const uploadProps = {
      fileList,
      beforeUpload: this.beforeUpload,
      onRemove: () => {
        this.props.form.setFieldsValue({ file: undefined })
        return true
      }
    }
    return (
      <Form>
        {visible === 'add' && (
          <FormItem {...formItemLayout} label={i18n('conf.model.field.layoutId', '分组')}>
            {getFieldDecorator('modelLayoutId', {
              rules: [
                {
                  required: true,
                  message: `${i18n('globe.select', '请选择')}${i18n(
                    'conf.model.field.layoutId',
                    '分组'
                  )}`
                }
              ]
            })(<ModelGroupSelect />)}
          </FormItem>
        )}
        {visible === 'update' && (
          <FormItem {...formItemLayout} label={i18n('model-list-import-update-model', '更新模型')}>
            {getFieldDecorator('updateModelId', {
              rules: [
                {
                  required: true,
                  message: `${i18n('globe.select', '请选择')}${i18n(
                    'conf.model.advanced.model',
                    '高级模型'
                  ).toLowerCase()}`
                }
              ]
            })(
              <Select
                allowClear
                showSearch
                optionFilterProp="children"
                placeholder={`${i18n('globe.select', '请选择')}${i18n(
                  'conf.model.advanced.model',
                  '高级模型'
                ).toLowerCase()}`}
                notFoundContent={loading ? <Spin /> : i18n('globe.not_find', '无法找到')}
                onDropdownVisibleChange={this.onDropdownVisibleChange}
              >
                {_.map(list, (group) => {
                  return (
                    <OptGroup key={group.layoutId} label={group.layoutName}>
                      {_.map(group.modelList, (model) => (
                        <Option key={model.id} value={model.id}>
                          {model.name}
                        </Option>
                      ))}
                    </OptGroup>
                  )
                })}
              </Select>
            )}
          </FormItem>
        )}
        <FormItem {...formItemLayout} label={i18n('ticket.from.upload', '选择文件')}>
          {getFieldDecorator('file', {
            initialValue: undefined,
            getValueFromEvent: (e) => {
              return e.file
            },
            rules: [
              {
                required: true,
                message: `${i18n('globe.select', '请选择')}${i18n(
                  'ticket.from.upload',
                  '选择文件'
                ).toLowerCase()}`
              }
            ]
          })(
            <Upload {...uploadProps}>
              <Button>
                <UploadOutlined /> {i18n('ticket.from.upload', '选择文件')}
              </Button>
            </Upload>
          )}
        </FormItem>
        <FormItem {...formItemLayout} label={i18n('conf.model.list.updata.data', '更新内容')}>
          {getFieldDecorator('updateModules', {
            initialValue: visible === 'add' ? ['base'] : undefined,
            rules: [
              {
                required: true,
                message: `${i18n('globe.select', '请选择')}${i18n(
                  'conf.model.list.updata.data',
                  '更新内容'
                ).toLowerCase()}`
              }
            ]
          })(<CheckboxGroup options={options} />)}
        </FormItem>
      </Form>
    )
  }
}
export default Form.create()(ImportForm)
