import React from 'react'
import { CloseOutlined, EditOutlined } from '@uyun/icons'
import { Tooltip } from '@uyun/components'
import Edit from './edit'
import CodeTip from './codeTip'

const Option = (props) => {
  const {
    labelName,
    codeName,
    value,
    canEdit,
    canDelete,
    cannotDeleteTitle,
    editing,
    loading,
    selected,
    onOk,
    onCancel,
    onEdit,
    onDelete,
    onClick
  } = props

  if (editing) {
    return (
      <Edit
        value={value[labelName]}
        loading={loading}
        onOk={(label) => onOk({ ...value, [labelName]: label })}
        onCancel={onCancel}
      />
    )
  }

  const disabled = !canDelete(value)
  const title = disabled ? cannotDeleteTitle : undefined

  return (
    <div
      className={`cs-option ${selected ? 'cs-option-selected' : ''}`}
      onClick={() => onClick(value)}
    >
      <Tooltip title={<CodeTip value={value[codeName]} />}>{value[labelName]}</Tooltip>
      <a
        className="cs-option-edit-entry"
        disabled={!canEdit}
        onClick={(e) => {
          e.stopPropagation()
          onEdit(value)
        }}
      >
        <EditOutlined />
      </a>
      <Tooltip title={title}>
        <span className="cs-option-delete-span">
          <a
            className="cs-option-delete-entry"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation()
              onDelete(value)
            }}
          >
            <CloseOutlined />
          </a>
        </span>
      </Tooltip>
    </div>
  )
}

export default Option
