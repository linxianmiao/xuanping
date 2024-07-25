import React, { Component } from 'react'
import { Form, Radio } from '@uyun/components'
import { toJS } from 'mobx'
import { ColumnConfig, ContentForField } from '~/components/tableCreator'
import CommonConfig from '../../config/commonConfig'
import { Common } from '../index'
import Strategy from './Strategy'
import styles from './strategy.module.less'
const FormItem = Form.Item

class Table extends Component {
  render () {
    const { getFieldDecorator, setFieldsValue, getFieldValue } = this.props.form
    const { formItemLayout, fieldData, modelId } = this.props
    const diliver = _.merge({},
      this.props,
      {
        getFieldDecorator,
        setFieldsValue,
        config: CommonConfig,
        type: 'table'
      }
    )
    const { params, isSingle, defaultValue, tableRules, tableImportAndExport, tablePageFlag } = toJS(fieldData)
    let value = defaultValue
    try {
      value = typeof defaultValue === 'string' ? JSON.parse(defaultValue) : defaultValue
      value = _.isArray(value) ? value : undefined
    } catch (e) {
      value = undefined
    }
    const columns = getFieldValue('params')

    // 为兼容老数据，普通类型算成单行文本类型
    if (params) {
      params.forEach(item => {
        if (item.type === 'normal') {
          item.type = 'singleRowText'
        }
      })
    }

    return (
      <Common {...diliver}>
        <FormItem {...formItemLayout} label={'导入/导出'}>
          {
            getFieldDecorator('tableImportAndExport', {
              initialValue: tableImportAndExport || 0
            })(
              <Radio.Group>
                <Radio value={1}>{'开启'}</Radio>
                <Radio value={0}>{'关闭'}</Radio>
              </Radio.Group>
            )
          }
        </FormItem>
        <FormItem {...formItemLayout} label={'是否分页'}>
          {
            getFieldDecorator('tablePageFlag', {
              initialValue: tablePageFlag || 0
            })(
              <Radio.Group>
                <Radio value={1}>{'开启'}</Radio>
                <Radio value={0}>{'关闭'}</Radio>
              </Radio.Group>
            )
          }
          <span className={styles.tipSpan}>开启分页会影响表单脚本对表格字段的操作</span>
        </FormItem>
        <FormItem {...formItemLayout} label={i18n('table', '表格')} required style={{ marginBottom: 0 }}>
          <div className={styles.tableParamsRules}>

            <FormItem>
              {getFieldDecorator('params', {
                initialValue: params || undefined,
                rules: [{ required: true, message: i18n('globe.select', '请选择') }]
              })(
                <ColumnConfig modelId={modelId} />
              )}
            </FormItem>

            <FormItem>
              {getFieldDecorator('tableRules', {
                initialValue: tableRules || undefined,
                rules: [{ required: false }]
              })(
                <Strategy
                  columns={columns}
                  modelId={modelId}
                />
              )}
            </FormItem>
          </div>
        </FormItem>

        {
          !_.isEmpty(columns) &&
          <FormItem {...formItemLayout} label=" " colon={false}>
            {getFieldDecorator('isSingle', {
              initialValue: isSingle || '0'
            })(

              <Radio.Group>
                <Radio.Button value="0">{i18n('table-isSingle-0', '表格模式')}</Radio.Button>
                <Radio.Button value="1">{i18n('table-isSingle-1', '表单模式')}</Radio.Button>
              </Radio.Group>
            )}
            {getFieldValue('isSingle') === '0' && (
              <span className={styles.dragColTip}>
                {i18n('col.width.drag.tip', '拖动表格线，实现单元格列宽调整')}
              </span>
            )}
          </FormItem>
        }
        {
          !_.isEmpty(columns) &&
          <FormItem {...formItemLayout} label=" " colon={false}>
            {
              getFieldDecorator('defaultValue', {
                initialValue: value || undefined
              })(
                <ContentForField
                  mode={getFieldValue('isSingle')}
                  columns={columns}
                  tableRules={getFieldValue('tableRules')}
                  setFieldsValue={setFieldsValue} // 表格拖拽列宽会改变列的colWidth属性值
                  modelId={modelId}
                />
              )
            }
          </FormItem>
        }
        {/* 用于表格字段校验，传入后端之前需要把这个字段删除 */}
        <FormItem {...formItemLayout} label=" " colon={false}>
          {
            getFieldDecorator('validate', {
              initialValue: () => {}
            })(<div />)
          }
        </FormItem>

      </Common>
    )
  }
}

export default Form.create({
  onValuesChange: props => {
    props.onValuesChange && props.onValuesChange()
  }
})(Table)
