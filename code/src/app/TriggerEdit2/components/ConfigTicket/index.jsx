import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { DeleteOutlined, PlusOutlined } from '@uyun/icons'
import { Button, Row, Col, Form } from '@uyun/components'
import LazySelect from '~/components/lazyLoad/lazySelect'
import Value from './Value'
import styles from './index.module.less'

const FormItem = Form.Item
const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 18 }
}

@inject('triggerStore')
@observer
class ConfigTicket extends Component {
  static defaultProps = {
    actionUsable: false,
    value: [],
    onChange: () => {}
  }

  state = {
    fieldList: [],
    selectedFieldList: []
  }

  componentDidMount() {
    this.initValue()
  }

  initValue = () => {
    const { value, onChange } = this.props

    if (!value || value.length === 0) {
      onChange([{}])
    } else {
      this.getSelectedFieldsInfo(value)
    }
  }

  getSelectedFieldsInfo = async (value = []) => {
    const codes = value.map((item) => item.paramName)
    const params = {
      codes: codes.join(',')
    }
    const res = await axios.get(API.queryFieldDetailsByCodes, { params })

    this.setState({
      selectedFieldList: res || []
    })
  }

  getList = (query, callback) => {
    const { pageNo, pageSize, kw } = query
    axios.get(API.listTicketParamFields, { params: { pageNo, pageSize, wd: kw } }).then((res) => {
      const list = _.forEach(res.list, (item) => {
        item.id = item.code
      })
      const fieldList = pageNo === 1 ? list : [...this.state.fieldList, ...list]

      this.setState({ fieldList })
      callback(list)
    })
  }

  getSelectedField = (code) => {
    const { fieldList, selectedFieldList } = this.state
    const fields = [...fieldList, ...selectedFieldList]
    const field = fields.find((item) => item.code === code)

    return field
  }

  handleAdd = () => {
    const { value, onChange } = this.props
    const nextValue = [...value]
    nextValue.push({})
    onChange(nextValue)
  }

  handleDelete = (index) => {
    const { value, onChange } = this.props
    const nextValue = [...value]
    nextValue.splice(index, 1)
    onChange(nextValue)
  }

  handleChange = (value, key, index) => {
    const { value: propValue, onChange } = this.props
    const nextValue = [...propValue]

    nextValue[index] = {
      ...nextValue[index],
      [key]: value
    }

    if (key === 'paramName') {
      nextValue[index].paramValue = undefined
    }

    onChange(nextValue)
  }

  getFormItemValidateInfo = (item) => {
    const { actionUsable, triggerStore } = this.props
    const { isSubmitting } = triggerStore

    const hasError = isSubmitting && actionUsable && (!item.paramName || !item.paramValue)

    return {
      validateStatus: hasError ? 'error' : 'success',
      help: hasError ? '请填写完整' : ''
    }
  }

  renderItem = (item, index) => {
    const { value } = this.props
    const { paramName, paramValue } = item
    const selectedField = this.getSelectedField(paramName)
    const lazySelectValue = selectedField
      ? { key: selectedField.code, label: selectedField.name }
      : undefined

    return (
      <FormItem
        key={index + ''}
        {...formItemLayout}
        label="设置"
        required
        {...this.getFormItemValidateInfo(item)}
      >
        <Row key={index + ''} gutter={8} className={styles.keyValueItem}>
          <Col span={8}>
            <LazySelect
              showTip
              placeholder="请选择"
              // labelInValue={false}
              labelInValue
              getList={this.getList}
              value={lazySelectValue}
              onChange={(value) => {
                if (value) {
                  this.setState((prevState) => {
                    return {
                      selectedFieldList: [
                        ...prevState.selectedFieldList,
                        { code: value.key, name: value.label }
                      ]
                    }
                  })
                }
                this.handleChange(value ? value.key : undefined, 'paramName', index)
              }}
            />
          </Col>
          <Col span={12}>
            <Value
              field={selectedField || {}}
              value={paramValue}
              onChange={(value) => this.handleChange(value, 'paramValue', index)}
            />
          </Col>
          {!!value && value.length > 1 && (
            <DeleteOutlined onClick={() => this.handleDelete(index)} />
          )}
        </Row>
      </FormItem>
    )
  }

  render() {
    const { value } = this.props

    return (
      <div>
        {value.map(this.renderItem)}
        <Row>
          <Col offset={4}>
            <Button type="primary" icon={<PlusOutlined />} onClick={this.handleAdd}>
              添加选项
            </Button>
          </Col>
        </Row>
      </div>
    )
  }
}

export default ConfigTicket
