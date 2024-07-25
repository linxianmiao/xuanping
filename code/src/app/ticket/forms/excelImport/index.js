import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Form, Tooltip } from '@uyun/components'
import classnames from 'classnames'
import Secrecy from '../components/Secrecy'
import ExcelTable, { ipReg } from './Table'
import './styles/excel.less'
const FormItem = Form.Item

class ExcelImport extends Component {
  state = {
    fieldLists: {}
  }

  constructor(props) {
    super(props)
    this.columnTypes = props.field.excelColumn.reduce((types, column) => {
      types[column.name] = column
      return types
    }, {})
  }

  componentDidMount() {
    const fieldCodes = _.chain(this.props.field.excelColumn)
      .map((column) => column.source)
      .compact()
      .uniq()
      .value()
    if (!_.isEmpty(fieldCodes)) {
      // 获取所有字段
      axios.post(API.findFieldByCodeList, { fieldCodes }, this.props.modelId).then((res) => {
        const fieldLists = _.zipObject(
          res.map((item) => item.code),
          res.map((item) => item.params)
        )
        this.setState({ fieldLists })
      })
    }
  }

  render() {
    const { field, getFieldDecorator, disabled, initialValue, secrecy, formLayoutType } = this.props

    return (
      <FormItem
        className={classnames({
          'table-style-item': formLayoutType,
          'normal-width': true
        })}
        hasFeedback={false}
        label={
          <span>
            <span>{field.name}</span>
            {field.fieldDesc && (
              <Tooltip placement="topRight" title={field.fieldDesc}>
                <i className="iconfont icon-bangzhu" />
              </Tooltip>
            )}
          </span>
        }
      >
        {getFieldDecorator(field.code, {
          initialValue: initialValue || [],
          rules: [
            {
              validator: (rule, value, callback) => {
                let help = ''
                const invalid = value.some((record) => {
                  return Object.keys(record).some((title) => {
                    const value = record[title]
                    const { type, required } = this.columnTypes[title] || {}
                    if (required && !value && value != 0) {
                      if (!help) {
                        help = '请输入必选字段'
                      }
                      return true
                    }
                    switch (type) {
                      case 'ip':
                        if (!value) {
                          if (!help) {
                            help = 'IP 不能为空'
                          }
                          return true
                        } else if (value.split(',').some((ip) => !ipReg.test(ip))) {
                          if (!help) {
                            help = 'IP 类型错误'
                          }
                          return true
                        }
                        return false
                      default:
                        return false
                    }
                  })
                })
                if (invalid) {
                  callback(help)
                } else {
                  callback()
                }
              }
            }
          ]
        })(
          secrecy ? (
            <Secrecy />
          ) : (
            <ExcelTable
              id={field.code}
              disabled={disabled}
              columns={field.excelColumn}
              fieldLists={this.state.fieldLists}
              downloadAction={API.download_excel_column}
              uploadAction={API.upload_excel_data}
            />
          )
        )}
      </FormItem>
    )
  }
}
ExcelImport.PropTypes = {
  initialValue: PropTypes.array.isRequired
}
export default ExcelImport
