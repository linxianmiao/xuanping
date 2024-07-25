import React from 'react'
import { inject, observer } from 'mobx-react'
import { Form, Input, TreeSelect } from '@uyun/components'
const FormItem = Form.Item
const { TreeNode } = TreeSelect

@inject('directoryStore')
@observer
class CreateType extends React.Component {
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
      const { parentGroupList = [], departList, currentOrg } = this.props.directoryStore
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
          <FormItem {...formItemLayout} label={i18n('type_name', '分类名称')}>
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
                <Input type="text" placeholder={`${i18n('ticket.forms.pinput', '请输入')}${i18n('type_name', '分类名称')}`} />
              )
            }
          </FormItem>
          <FormItem {...formItemLayout} label={i18n('type_code', '分类编码')}>
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
                <Input disabled={Boolean(editData.id)} type="text" placeholder={`${i18n('ticket.forms.pinput', '请输入')}${i18n('type_code', '分类编码')}`} />
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
const CreateTypeWrap = Form.create()(CreateType)
export default CreateTypeWrap
