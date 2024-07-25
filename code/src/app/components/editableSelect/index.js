/**
 * 可编辑的Select
 * 目前仅供 模型分组 和 模型类型 使用
 * 支持选项的增删改
 */
import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { CloseCircleFilled } from '@uyun/icons';
import { Dropdown, Spin, Divider, Empty, Icon } from '@uyun/components'
import Option from './option'
import AddOption from './addOption'
import './index.less'

let timer = null

const CustomSelect = React.forwardRef((props, ref) => {
  const {
    style,
    placeholder,
    data,
    value,
    editKey,
    keyName,
    labelName,
    codeName,
    loading,
    moreLoading,
    hasMore,
    loadMore,
    canDelete,
    cannotDeleteTitle,
    onVisibleChange,
    onEditKeyChange,
    onSelect,
    onAdd,
    onEdit,
    onDelete
  } = props
  const [visible, setVisible] = useState(false)

  const handleVisibleChange = visible => {
    setVisible(visible)
    onVisibleChange(visible)
  }

  const handleScroll = e => {
    const { scrollTop, scrollHeight, offsetHeight } = e.target
    // 是否到达底部
    const isBottom = scrollTop + offsetHeight >= scrollHeight

    if (isBottom && hasMore && loadMore && !loading && !moreLoading) {
      if (timer) {
        return
      }
      timer = setTimeout(() => {
        clearTimeout(timer)
        timer = null
        loadMore()
      }, 300)
    }
  }

  const handleSelect = item => {
    setVisible(false)
    onSelect(item)
  }

  const handleClear = e => {
    e.stopPropagation()

    onSelect(undefined)
  }

  const renderOverlay = () => {
    return (
      <div className="cs-dropdown">
        <Spin spinning={loading} className="cs-dropdown-loading">
          <div className="cs-dropdown-option-list" onScroll={handleScroll}>
            {
              data.map(item => {
                return (
                  <Option
                    key={item[keyName]}
                    labelName={labelName}
                    codeName={codeName}
                    canEdit
                    canDelete={canDelete}
                    cannotDeleteTitle={cannotDeleteTitle}
                    editing={editKey === item[keyName]}
                    loading={false}
                    selected={value && value[keyName] === item[keyName]}
                    value={item}
                    onEdit={value => onEditKeyChange(value[keyName])}
                    onCancel={() => onEditKeyChange(undefined)}
                    onOk={onEdit}
                    onDelete={onDelete}
                    onClick={handleSelect}
                  />
                )
              })
            }
            {
              moreLoading && (
                <div className="cs-dropdown-loading-more">
                  <Spin size="small" />
                </div>
              )
            }
            {
              !moreLoading && (!data || data.length === 0) && (
                <Empty type="search" />
              )
            }
          </div>
          <Divider style={{ margin: 0 }} />
          <AddOption
            editing={editKey === 'add'}
            loading={false}
            labelName={labelName}
            codeName={codeName}
            onClick={() => onEditKeyChange('add')}
            onOk={onAdd}
            onCancel={() => onEditKeyChange(undefined)}
          />
        </Spin>
      </div>
    )
  }

  return (
    <Dropdown
      overlayClassName="cs-overlay"
      overlay={renderOverlay()}
      visible={visible}
      onVisibleChange={handleVisibleChange}
    >
      <div ref={ref} className="cs-box" style={style}>
        {value && value[labelName] ? (
          <div className="cs-box-value">{value[labelName]}</div>
        ) : (
          <div className="cs-box-placeholder">{placeholder}</div>
        )}
        {value && value[labelName] ? (
          <CloseCircleFilled className="cs-box-clear" onClick={handleClear} />
        ) : null}
      </div>
    </Dropdown>
  );
})

CustomSelect.propTypes = {
  style: PropTypes.object,
  placeholder: PropTypes.string,
  keyName: PropTypes.string, // 作为选项key
  labelName: PropTypes.string, // 作为选项名称
  codeName: PropTypes.string, // 作为编码名称
  data: PropTypes.array,
  value: PropTypes.object,
  editKey: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]), // 当前正在编辑的选项key, editKey为'add'表示正在编辑添加项
  loading: PropTypes.bool,
  moreLoading: PropTypes.bool,
  hasMore: PropTypes.bool,
  loadMore: PropTypes.func,
  canDelete: PropTypes.func,
  cannotDeleteTitle: PropTypes.string,
  onVisibleChange: PropTypes.func,
  onEditKeyChange: PropTypes.func,
  onSelect: PropTypes.func,
  onAdd: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func
}

CustomSelect.defaultProps = {
  keyName: 'id',
  labelName: 'name',
  codeName: 'code',
  loading: false,
  moreLoading: false,
  hasMore: false,
  canDelete: true,
  onVisibleChange: () => {},
  onSelect: () => {},
  onAdd: () => {},
  onEdit: () => {},
  onDelete: () => {}
}

export default CustomSelect