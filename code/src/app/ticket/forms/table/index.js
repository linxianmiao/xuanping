import React, { Component } from 'react'
import { Form } from '@uyun/components'
import classnames from 'classnames'
import FormItem from '../components/formItem'
import Secrecy from '../components/Secrecy'
import { ContentForForm as Table } from '~/components/tableCreator'

class TableData extends Component {
  shouldComponentUpdate(nextProps) {
    const { disabled, ticketTemplateId, isRequired, ticketId, allData, field } = this.props

    if (allData !== nextProps.allData) {
      return true
    }
    if (disabled !== nextProps.disabled) {
      return true
    } else if (ticketTemplateId !== nextProps.ticketTemplateId) {
      return true
    } else if (isRequired !== nextProps.isRequired) {
      return true
    } else if (ticketId !== nextProps.ticketId) {
      return true
    } else if (field !== nextProps.field) {
      return true
    }

    return false
  }

  render() {
    const {
      field,
      forms = {},
      getFieldDecorator,
      initialValue,
      fieldMinCol,
      disabled,
      getFieldValue,
      getFieldError,
      ticketTemplateId,
      secrecy,
      formLayoutType,
      onRowOk = () => {},
      tableImportValidate = () => {},
      showOkTables
    } = this.props
    let initialTableValue
    try {
      initialTableValue = initialValue
        ? typeof initialValue === 'string'
          ? JSON.parse(initialValue)
          : initialValue
        : []
    } catch (e) {
      initialTableValue = undefined
    }
    const ticketId = forms.ticketId || this.props.ticketId

    const error = getFieldError ? !!getFieldError(field.code) : false
    // 把表格组件和表单数据组件分开
    // 这是为了便于控制表格必填列校验后的交互
    // 把必填却未填的控件单独标红
    console.log('field', field, forms)
    console.log({
      allData: this.props.allData,
      isRequired: field.isRequired,
      disabled: disabled,
      mode: field.isSingle || '0',
      modelId: forms.modelId,
      columns: field.params,
      tableRules: field.tableRules,
      fieldCode: field.code,
      copyTicketId: forms.copyTicketId,
      ticketTemplateId: ticketTemplateId,
      ticketId: ticketId,
      tacheId: forms.tacheId,
      caseId: forms.caseId,
      importAndExport: field.tableImportAndExport,
      pageFlag: field.tablePageFlag,
      canCopy: true,
      error: error,
      value: getFieldValue(field.code) || initialTableValue,
      onChange: () => {
        const { field, setFieldsValue } = this.props
        setFieldsValue && setFieldsValue({ [field.code]: [] })
      },
      onRowOk: onRowOk,
      tableImportValidate: tableImportValidate,
      showOkTables: showOkTables
    })
    return (
      <>
        <FormItem
          style={{ marginBottom: 0, paddingBottom: 0 }}
          field={field}
          fieldMinCol={fieldMinCol}
          required={+field.isRequired === 1}
          className={classnames({
            'table-style-item': formLayoutType
          })}
        >
          {secrecy ? (
            <Secrecy />
          ) : (
            <Table
              scene="ticket"
              allData={this.props.allData}
              isRequired={field.isRequired}
              disabled={disabled}
              mode={field.isSingle || '0'}
              from={'inner'}
              modelId={forms.modelId}
              columns={field.params}
              tableRules={field.tableRules}
              fieldCode={field.code}
              copyTicketId={forms.copyTicketId} // 复制工单时，传被复制的ticketId
              ticketTemplateId={ticketTemplateId}
              ticketId={ticketId}
              tacheId={forms.tacheId}
              caseId={forms.caseId}
              importAndExport={field.tableImportAndExport}
              pageFlag={field.tablePageFlag} // 是否需要分页
              canCopy
              error={error}
              value={getFieldValue(field.code) || initialTableValue}
              onChange={() => {
                const { field, setFieldsValue } = this.props
                setFieldsValue && setFieldsValue({ [field.code]: [] })
              }}
              onRowOk={onRowOk}
              tableImportValidate={tableImportValidate}
              showOkTables={showOkTables}
            />
          )}
        </FormItem>
        <Form.Item>
          {getFieldDecorator(field.code, {
            initialValue: initialTableValue || []
          })(<div />)}
        </Form.Item>
      </>
    )
  }
}

export default TableData
