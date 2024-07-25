import React, { forwardRef } from 'react'
import SimpEditor from '~/components/SimpEditor'
import TextPreview from '~/components/TextPreview'

export default forwardRef(function RichText(props) {
  const { value, id, disabled, ticketId, onChange, field, ...rest } = props

  if (disabled) {
    return (
      <TextPreview field={field} uuId={field.code} className="pre-wrap disabled-ticket-form">
        <div dangerouslySetInnerHTML={{ __html: value || '--' }} />
      </TextPreview>
    )
  }

  return (
    <SimpEditor
      {...rest}
      code={id}
      value={value}
      ticketId={ticketId}
      maxRowHeight={field.maxRowHeight}
      onChange={onChange}
    />
  )
})
