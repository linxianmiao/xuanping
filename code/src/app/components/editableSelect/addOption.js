import React from 'react'
import { PlusOutlined } from '@uyun/icons';
import { Icon } from '@uyun/components'
import Add from './add'

const AddOption = props => {
  const { editing, loading, labelName, codeName, onClick, onCancel, onOk } = props

  if (editing) {
    return (
      <Add
        value={undefined}
        loading={loading}
        onOk={(label, code) => onOk({ [labelName]: label, [codeName]: code })}
        onCancel={onCancel}
      />
    )
  }

  return (
    <div
      className="cs-option-add"
      onClick={e => {
        e.stopPropagation()
        onClick()
      }}
    >
      <PlusOutlined />
      {i18n('add')}
    </div>
  );
}

export default AddOption
