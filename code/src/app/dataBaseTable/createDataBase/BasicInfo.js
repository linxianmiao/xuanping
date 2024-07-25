import React from 'react'
import { Form, Input } from '@uyun/components'
import { inject, observer } from 'mobx-react'

const FormItem = Form.Item
const { TextArea } = Input

@inject('dataBaseStore')
@observer
class App extends React.Component {
  async componentDidMount() {
    const { dataSetId } = this.props
    if (dataSetId) {
      await this.props.dataBaseStore.getDataSet({ dataSetId: dataSetId })
    }
  }

  render() {
    const { getFieldDecorator } = this.props.form
    const { basicinfo } = this.props.dataBaseStore
    const { dataSetName, dataSetCode, dataSetDesc } = basicinfo || {}
    return (
      <div style={{ marginTop: 80 }}>
        <Form>
          <FormItem label="表名称" labelCol={{ span: 5 }} wrapperCol={{ span: 12 }}>
            {getFieldDecorator('dataSetName', {
              initialValue: dataSetName,
              rules: [{ required: true, message: '请输入表名称' }]
            })(<Input placeholder="请输入数据表名称" />)}
          </FormItem>
          <FormItem label="表编码" labelCol={{ span: 5 }} wrapperCol={{ span: 12 }}>
            {getFieldDecorator('dataSetCode', {
              initialValue: dataSetCode,
              rules: [
                {
                  required: true,
                  message: '请输入表编码'
                },
                {
                  pattern: /^[a-zA-Z0-9]+$/,
                  message: '字段编码只能包含字母和数字'
                }
              ]
            })(<Input placeholder="请输入编码，只能包含字母和数字" />)}
          </FormItem>
          <FormItem label="说明信息" labelCol={{ span: 5 }} wrapperCol={{ span: 12 }}>
            {getFieldDecorator('dataSetDesc', {
              initialValue: dataSetDesc
            })(<TextArea rows={4} placeholder="请输入" />)}
          </FormItem>
        </Form>
      </div>
    )
  }
}

const WrappedApp = Form.create()(App)

export default WrappedApp
