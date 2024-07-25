import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Drawer, Form, Radio, Button, Spin } from '@uyun/components'
import LazySelect from './lazySelect'
import '../style/index.less'

const FormItem = Form.Item
const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 8 }
}

const RadioGroup = Radio.Group

@Form.create()
@inject('dataBaseStore')
@observer
class QuoteFields extends Component {
  state = {
    loading: false,
    list: {},
    fieldsLoading: false
  }
  getList = async (query, callback) => {
    const { pageSize, pageNo, kw } = query
    const res = await this.props.dataBaseStore.querySpecifyTypeFields({
      pageNo,
      keyword: kw,
      pageSize,
      types: 'singleRowText,int,listSel,user,userGroup,department'
    })
    callback(res.list || [])
  }
  handleClick = () => {
    this.props.form.validateFieldsAndScroll(async (errors, values) => {
      if (errors) return false
      let params = {
        ...values,
        code: values.code.value
      }
      if (this.props.type === 'edit') {
        params.id = this.state.list?.id
      }
      this.setState({ fieldsLoading: true })
      await this.props.handledFieldsOk(params)
      this.setState({ fieldsLoading: false })
    })
  }

  getDetail = async () => {
    const { dataSetId, type, code } = this.props
    if (type === 'edit') {
      this.setState({ loading: true })
      let res = await this.props.dataBaseStore.findQuoteFieldByCode({
        code: code,
        useScene: 1,
        dataSetId: dataSetId
      })
      this.setState({ loading: false, list: res })
    }
  }
  componentDidMount() {
    this.getDetail()
  }
  componentDidUpdate(pervProps) {
    if (pervProps.code !== this.props.code) {
      this.setState({ list: {} }, () => {
        this.getDetail()
      })
    }
  }
  render() {
    const { getFieldDecorator } = this.props.form
    const { visible, handleFieldsChange, type } = this.props
    const { list, loading, fieldsLoading } = this.state
    return (
      <Drawer
        title={type === 'edit' ? '编辑字段' : '新建引用字段'}
        visible={visible}
        destroyOnClose
        zIndex={999}
        outerClose={false}
        onClose={() => {
          handleFieldsChange(false)
          this.setState({ list: {} })
        }}
        footer={
          <div className="drawer-btn">
            <Button type="primary" onClick={this.handleClick} loading={fieldsLoading}>
              确定
            </Button>
            <Button onClick={() => handleFieldsChange(false)}>取消</Button>
          </div>
        }
      >
        <Spin spinning={loading}>
          <Form>
            <FormItem label={'引用字段'} {...formItemLayout}>
              {getFieldDecorator('code', {
                initialValue: !_.isEmpty(list) ? { label: list.name, value: list.code } : undefined,
                rules: [
                  {
                    required: true,
                    message: '请选择引用字段'
                  }
                ]
              })(<LazySelect labelInValue getList={this.getList} placeholder={'请选择引用字段'} />)}
            </FormItem>
            <FormItem label={'基础校验'} {...formItemLayout}>
              {getFieldDecorator('isRequired', {
                initialValue: list.isRequired || 0,
                rules: [
                  {
                    required: true,
                    message: '请选择基础校验'
                  }
                ]
              })(
                <RadioGroup>
                  <Radio.Button value={0}>{i18n('conf.model.field.optional', '选填')}</Radio.Button>
                  <Radio.Button value={1}>{i18n('conf.model.field.required', '必填')}</Radio.Button>
                  <Radio.Button value={2}>
                    {i18n('conf.model.field.read-only', '只读')}
                  </Radio.Button>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem label={'是否是展示列'} {...formItemLayout}>
              {getFieldDecorator('isShowColumn', {
                initialValue: list.isShowColumn || 0,
                rules: [
                  {
                    required: true,
                    message: '请选择'
                  }
                ]
              })(
                <RadioGroup>
                  <Radio.Button value={1}>{i18n('yes', '是')}</Radio.Button>
                  <Radio.Button value={0}>{i18n('no', '否')}</Radio.Button>
                </RadioGroup>
              )}
            </FormItem>
          </Form>
        </Spin>
      </Drawer>
    )
  }
}

export default QuoteFields
