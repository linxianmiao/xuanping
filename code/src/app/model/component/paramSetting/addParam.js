import React, { Component } from 'react'
import { message, Form, Input, Radio, Checkbox, Upload, Button, Modal } from '@uyun/components'
import variableList from '../../config/variable'
const FormItem = Form.Item
const { TextArea } = Input
const RadioGroup = Radio.Group
class AddParam extends Component {
  constructor (props) {
    super(props)
    this.state = {
      show: false,
      remark: '',
      remark1: '',
      plugin_map: null, // 上传的数据
      is_plugin: false
    }
  }

  componentDidMount () {
    const { data } = this.props
    this.setState({
      is_plugin: data.is_plugin === 1,
      plugin_map: data.plugin_map || null,
      remark: data.plugin_map ? data.plugin_map.remark : '',
      remark1: data.plugin_map ? data.plugin_map.remark : ''
    })
  }

    addRemark = () => {
      this.setState({
        show: true
      })
    }

    getRemark = e => {
      this.setState({
        remark1: e.target.value
      })
    }

    changeRemark = () => {
      this.setState({
        remark: this.state.remark1,
        show: false
      })
    }

    onCancel = () => {
      this.setState({
        show: false
      })
    }

    handleSubmit = () => {
    // e.preventDefault()
      const { plugin_map, remark, is_plugin } = this.state
      this.props.form.validateFields((err, values) => {
        if (err) {
          return
        }
        values.is_plugin = is_plugin ? 1 : 0
        values.is_builtin = 0
        values.id = this.props.data.id || null
        if (values.is_plugin) {
          values.plugin_map = plugin_map
          if (plugin_map && remark) {
            values.plugin_map.remark = remark
          }
        }
        this.props.handleSubmit(values)
      })
    }

    onChange = e => {
      this.setState({
        is_plugin: e.target.checked
      })
    }

    checkCode = (rule, value, callback) => {
      const regExp = /[^A-Za-z]/g
      if (regExp.test(value)) {
        callback(i18n('field_create_code_error', '编码只能为英文'))
      }
      callback()
    }

    deleteUpload = () => {
      this.setState({
        plugin_map: null,
        show: false
      })
    }

    render () {
      const { getFieldDecorator } = this.props.form
      const { data, visible } = this.props
      const { is_plugin, plugin_map, show } = this.state
      const formItemLayout = { labelCol: { span: 4 }, wrapperCol: { span: 18 } }
      const _this = this
      const href = plugin_map ? API.downloadParam + `?file_id=${plugin_map.fileId}&file_name=${plugin_map.fileName}` : ''
      const props = {
        action: API.uploadParam,
        accept: '.jar',
        data: file => { return { file_name: file.name } },
        showUploadList: false,
        headers: {
          authorization: 'authorization-text'
        },
        onChange (info) {
          if (info.file.status === 'done') {
            if (+info.file.response.errCode === 200) {
              _this.setState({
                plugin_map: info.file.response.data
              })
              message.success(`${info.file.name} file uploaded successfully`)
            } else {
              message.error(`${info.file.name} file upload failed.`)
            }
          } else if (info.file.status === 'error') {
            message.error(`${info.file.name} file upload failed.`)
          }
        }
      }
      return (
        <Modal
          title={data.id ? i18n('edit-params', '更新变量') : i18n('add-params', '新增变量')}
          visible={visible}
          maskClosable={false}
          onCancel={this.props.handleCancel}
          onOk={this.handleSubmit}
          className="param-modal">
          <Form>
            <FormItem {...formItemLayout} label={i18n('name', '名称')}>
              {getFieldDecorator('name', {
                rules: [{ required: true, message: i18n('ticket.forms.pinputName', '请输入名称') }, { max: 32, message: i18n('param_create_title', '名称最大长度为32') }],
                initialValue: data.name || ''
              })(
                <Input placeholder={i18n('ticket.forms.pinputName', '请输入名称')} />
              )}
            </FormItem>
            <FormItem {...formItemLayout} label={i18n('field_code', '编码')}>
              {getFieldDecorator('code', {
                rules: [
                  { required: true, message: i18n('ticket.forms.inputParamCode', '请输入编码') },
                  { max: 20, message: i18n('param_create_code', '变量编码长度在6~20字符') },
                  { min: 6, message: i18n('param_create_code', '变量编码长度在6~20字符') },
                  { validator: this.checkCode }
                ],
                initialValue: data.code || ''

              })(
                <Input placeholder={i18n('ticket.forms.inputParamCode', '请输入编码')} disabled={!!data.id} />
              )}
            </FormItem>
            <FormItem {...formItemLayout} label={i18n('listSel.input_tips3', '描述')}>
              {getFieldDecorator('description', {
                rules: [{ max: 500, message: i18n('param_create_descr_500', '描述最大长度为500') }],
                initialValue: data.description || ''
              })(
                <TextArea rows={3} placeholder={i18n('ticket.forms.pinput', '请输入') + i18n('listSel.input_tips3', '描述')} />
              )}
            </FormItem>
            <FormItem {...formItemLayout} label={i18n('ciModal.type', '类型')}>
              {getFieldDecorator('type', {
                rules: [{ required: true, message: `${i18n('ticket.create.select', '请选择')}${i18n('ciModal.type', '类型')}` }],
                initialValue: data.type
              })(
                <RadioGroup disabled={!!data.id}>
                  {_.map(variableList, variable => <Radio key={variable.value} value={variable.value}>{variable.label}</Radio>)}
                </RadioGroup>)}
            </FormItem>
            <FormItem {...formItemLayout} label={i18n('param_expand', '扩展插件')}>
              <Checkbox onChange={this.onChange} checked={is_plugin}>{i18n('param_use', '使用')}<span className="tip-color">{i18n('param_expandTips', '勾选使用，变量值将通过插件调用的方式获取')}</span></Checkbox>
            </FormItem>
            {is_plugin ? <FormItem {...formItemLayout} label=" " colon={false}>
              <div className="expand-plugin">
                <p>{i18n('param_expand_jar', '仅支持.jar的压缩包')}</p>
                <Upload {...props} style={{ float: 'left' }}>
                  <Button>
                    {i18n('globe.upload', '上传文件')}
                  </Button>
                </Upload>
                {plugin_map ? <div className="upload-tips">
                  <a href={href} target="_blank">{plugin_map.fileName}</a><i className="iconfont icon-shanchu" style={{ margin: '0px 5px', cursor: 'pointer' }} onClick={this.deleteUpload} />
                  <span onClick={this.addRemark}>{i18n('param_expand_remark', '添加备注')}</span>
                </div> : null}
                {
                  show
                    ? <div className="input-wrap">
                      <Input defaultValue={this.state.remark} onChange={this.getRemark} />
                      <div onClick={() => { this.changeRemark() }}><i className="iconfont icon-dui param-del-btn" /></div>
                      <div onClick={() => { this.onCancel() }}><i className="iconfont icon-cha param-del-btn" /></div>
                    </div>
                    : <p className="input-wrap">{this.state.remark || ''}</p>
                }
              </div>
            </FormItem> : <div style={{ height: 69 }} />}
          </Form>
        </Modal>
      )
    }
}
const AddParamWrap = Form.create()(AddParam)
export default AddParamWrap
