import React from 'react'
import { Form, Select } from '@uyun/components'
const Option = Select.Option
const FormItem = Form.Item

class DictionaryData extends React.Component {
  state = {
    dictList: []
  }

  componentDidMount() {
    this.queryDictList()
  }

  queryDictList = async (kw = '') => {
    const params = { dataMode: 2 }
    const res = await axios.get(API.queryDictionaryType(kw), { params }) || []

    this.setState({ dictList: res })
  }

  onChange = (value, type) => {
    const { fieldData } = this.props
    fieldData[type] = value
    this.props.onChange(fieldData)
  }

  render() {
    const { fieldData } = this.props
    const { getFieldDecorator } = this.props.form
    const { dictList } = this.state
    const formItemLayout = { labelCol: { span: 3 }, wrapperCol: { span: 18 } }
    return (
      <Form>
        <FormItem {...formItemLayout} label={i18n('select.dictionary.data', '选择字典数据源：')}>
          {
            getFieldDecorator('dictionarySource', {
              initialValue: fieldData.dictionarySource || ''
            })(
              <Select
                style={{ width: '180px' }}
                onChange={value => { this.onChange(value, 'dictionarySource') }}
              >
                {!!window.change_switch && <Option key="CHANGE_DIRECTORY">{i18n('change.directory', '变更目录')}</Option>}
                {
                  dictList.map(item => (
                    <Option key={item.code}>{item.name}</Option>
                  ))
                }
              </Select>
            )
          }
        </FormItem>
      </Form>
    )
  }
}
export default Form.create()(DictionaryData)