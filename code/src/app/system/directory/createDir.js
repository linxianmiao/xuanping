import React from 'react'
import { inject, observer } from 'mobx-react'
import { Form, Input, Select, TreeSelect } from '@uyun/components'
const FormItem = Form.Item
const { TextArea } = Input
const Option = Select.Option
const { TreeNode } = TreeSelect

@inject('directoryStore')
@observer
class CreateDir extends React.Component {
    handleCheckSingleRowText = (item, rule, value, callback) => {
      const codeReg = /^[a-zA-Z0-9]+$/
      const myReg = new RegExp('[|;&$%><`\\!]')
      if (!_.trim(value) && rule.required) {
        callback(`${i18n('ticket.forms.pinput', '请输入')}`)
      } else {
        if (item === 'name' && (myReg.test(value))) {
          callback(i18n('field_create_name_error', '不能包含特殊字符'))
        }
        if (item === 'code' && (!codeReg.test(value))) {
          callback(i18n('field_create_code_error3', '编码只能为英文数字'))
        }
        if (rule.max && value.length > rule.max) {
          callback(`${i18n('ticket.forms.beyond', '不能超出')}${rule.max}${i18n('ticket.forms.character', '字符')}`)
        } else if (rule.min && value.length < rule.min) {
          callback(`${i18n('ticket.forms.below', '不能低于')}${rule.min}${i18n('ticket.forms.character', '字符')}`)
        } else {
          callback()
        }
      }
    }

    onLoadData = treeNode => new Promise((resolve) => {
      if (treeNode.props.dataRef.children) {
        resolve()
        return
      }
      setTimeout(async() => {
        const departId = this.props.form.getFieldValue('relatedDepartId')
        const data = {
          superiorCode: treeNode.props.eventKey,
          departId
        }
        this.props.directoryStore.getParentGroupList(data)
        resolve()
      }, 300)
    })

    onLoadDepartData = treeNode => new Promise((resolve) => {
      if (treeNode.props.dataRef.children) {
        resolve()
        return
      }
      setTimeout(async() => {
        const departId = treeNode.props.eventKey
        this.props.directoryStore.getDepartList(departId)
        resolve()
      }, 300)
    })

    onChange = (value, label, extra) => {
      const data = {
        departId: value
      }
      this.props.directoryStore.getParentGroupList(data)
      this.props.form.setFieldsValue({ superiorGroupCode: undefined })
    }

    render() {
      const { editData = {} } = this.props
      const { getFieldDecorator } = this.props.form
      const { parentGroupList = [], subModelList = [], departList, currentOrg } = this.props.directoryStore
      const formItemLayout = { labelCol: { span: 4 }, wrapperCol: { span: 20 } }
      const loop = (data) => data.map((item) => {
        if (item.type === 'GROUP') {
          return <TreeNode key={item.code} value={item.code} title={item.name} dataRef={item}>
            {item.children && item.children.length > 0 && loop(item.children)}
          </TreeNode>
        } else {
          return <TreeNode style={{ display: 'none' }} key={item.id} />
        }
      })
      const loopDepart = (data) => data.map((item) => {
        if (item.children && item.children.length) {
          return <TreeNode key={item.departId} value={item.departId} title={item.name} dataRef={item}>{loopDepart(item.children)}</TreeNode>
        }
        return <TreeNode key={item.departId} value={item.departId} title={item.name} dataRef={item} isLeaf={!item.isLeaf} />
      })
      return (
        <Form>
          <FormItem {...formItemLayout} label={i18n('directory_name', '目录名称')}>
            {
              getFieldDecorator('name', {
                initialValue: editData.name || '',
                rules: [{
                  type: 'string',
                  whitespace: true,
                  required: true,
                  max: 20,
                  min: 4,
                  validator: (rule, value, callback) => { this.handleCheckSingleRowText('name', rule, value, callback) }
                }]
              })(
                <Input type="text" placeholder={`${i18n('ticket.forms.pinput', '请输入')}${i18n('directory_name', '目录名称')}`} />
              )
            }
          </FormItem>
          <FormItem {...formItemLayout} label={i18n('directory_code', '目录编码')}>
            {
              getFieldDecorator('code', {
                initialValue: editData.code || '',
                rules: [{
                  type: 'string',
                  whitespace: true,
                  required: true,
                  min: 2,
                  max: 20,
                  validator: (rule, value, callback) => { this.handleCheckSingleRowText('code', rule, value, callback) }
                }]
              })(
                <Input disabled={Boolean(editData.id)} type="text" placeholder={`${i18n('ticket.forms.pinput', '请输入')}${i18n('directory_code', '目录编码')}`} />
              )
            }
          </FormItem>
          <FormItem {...formItemLayout} label={i18n('affiliated_organization', '所属组织')}>
            {
              getFieldDecorator('relatedDepartId', {
                initialValue: editData.relatedDepartId || currentOrg.departId
              })(
                <TreeSelect
                  onChange={this.onChange}
                  loadData={this.onLoadDepartData}
                  placeholder={`${i18n('ticket.forms.select', '请选择')}${i18n('affiliated_organization', '所属组织')}`}
                >
                  {loopDepart(departList)}
                </TreeSelect>
              )
            }
          </FormItem>
          <FormItem {...formItemLayout} label={i18n('Sub-headings', '上级分类')}>
            {getFieldDecorator('superiorGroupCode', {
              initialValue: editData.superiorGroupCode,
              required: true
            })(
              <TreeSelect
                allowClear
                loadData={this.onLoadData}
                placeholder={`${i18n('ticket.forms.select', '请选择')}${i18n('Sub-headings', '上级分类')}`}
              >
                {loop(parentGroupList)}
              </TreeSelect>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={i18n('association_process', '关联流程')}>
            {getFieldDecorator('relatedChildModelId', {
              initialValue: editData.relatedChildModelId,
              rules: [{
                required: true,
                message: `${i18n('globe.select', '请选择')}${i18n('association_process', '关联流程')}`
              }]
            })(
              <Select
                allowClear
                notFoundContent={i18n('globe.not_find', '无法找到')}
                placeholder={`${i18n('globe.select', '请选择')}${i18n('association_process', '关联流程')}`}>
                {
                  _.map(subModelList, list => {
                    return <Option key={list.id} value={`${list.id}`}>{list.name}</Option>
                  })
                }
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={i18n('listSel.input_tips3', '描述')}>
            {getFieldDecorator('description', {
              rules: [{ max: 50, message: i18n('system_craate_dir', '描述最大长度为50') }],
              initialValue: editData.description || ''
            })(
              <TextArea rows={3} maxLength={50} placeholder={i18n('ticket.forms.pinput', '请输入') + i18n('listSel.input_tips3', '描述')} />
            )}
          </FormItem>
          <FormItem style={{ display: 'none' }}>
            {getFieldDecorator('id', {
              initialValue: editData.id || undefined
            })(
              <div />
            )}
          </FormItem>
          <FormItem style={{ display: 'none' }}>
            {getFieldDecorator('status', {
              initialValue: editData.status || 0
            })(
              <div />
            )}
          </FormItem>
        </Form>
      )
    }
}
const CreateDirWrap = Form.create()(CreateDir)
export default CreateDirWrap
