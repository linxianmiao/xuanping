import React, { Component, useState } from 'react'
import classnames from 'classnames'
import FormItem from '../components/formItem'
import Secrecy from '../components/Secrecy'
import EditModal from './Edit'

export default class Links extends Component {
  handleCheckLink = (rule, value, callback) => {
    const { field } = this.props
    if (rule.required && (!value.linkProtocol || !value.linkUrl || !value.linkName)) {
      callback(`${i18n('ticket.forms.pinput', '请输入')}${field.name}`)
    } else {
      callback()
    }
  }

  render() {
    let {
      field,
      getFieldDecorator,
      disabled,
      type,
      initialValue,
      fieldMinCol,
      secrecy,
      formLayoutType
    } = this.props
    const { linkName, linkUrl, linkProtocol } = field

    if (_.isEmpty(initialValue) && (linkName || linkUrl || linkProtocol)) {
      initialValue = { linkName, linkUrl, linkProtocol }
    }
    return (
      <FormItem
        field={field}
        fieldMinCol={fieldMinCol}
        className={classnames({
          'table-style-item': formLayoutType
        })}
      >
        {getFieldDecorator(field.code, {
          initialValue: initialValue || undefined,
          rules: [
            {
              required: +field.isRequired === 1,
              validator: this.handleCheckLink
            }
          ]
        })(secrecy ? <Secrecy /> : <LinkEdit type={type} disabled={disabled} field={field} />)}
      </FormItem>
    )
  }
}

const LinkEdit = React.forwardRef(({ disabled, value, type, onChange, field }, ref) => {
  const [visible, setVisible] = useState(false)

  const handleOk = (val) => {
    onChange(val)
    setVisible(false)
  }
  const handleCancel = () => setVisible(false)

  const _render = (linkData) => {
    if (linkData.linkName) {
      return (
        <a target="_blank" href={`${linkData.linkProtocol}${linkData.linkUrl}`} rel="noreferrer">
          {linkData.linkName}
        </a>
      )
    }
    return '--'
  }

  return (
    <div ref={ref} id={field.code}>
      <div className={classnames({ 'disabled-item': disabled || field.isRequired === 2 })}>
        <a target="_blank" href={`${value.linkProtocol}${value.linkUrl}`} rel="noreferrer">
          {value.linkName}
        </a>
        <i
          className="iconfont icon-bianji"
          style={{ marginLeft: '4px', fontSize: '12px', cursor: 'pointer' }}
          onClick={() => setVisible(true)}
        >
          <span>{i18n('edit', '编辑')}</span>
        </i>
      </div>
      {type !== 'config' && (disabled || field.isRequired === 2) && (
        <span className="pre-wrap disabled-ticket-form">{_render(value)}</span>
      )}
      {visible && (
        <EditModal visible={visible} linkData={value} onCancel={handleCancel} handleOk={handleOk} />
      )}
    </div>
  )
})
