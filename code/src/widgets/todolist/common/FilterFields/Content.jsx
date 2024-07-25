import React, { useState, useCallback, useMemo } from 'react'
import { Collapse, Input, Spin } from '@uyun/components'
import SortableFields from './SortableFields'
import styles from './index.module.less'
import { i18n } from '../../i18n'
import CheckGroup from './CheckGroup'

const Search = Input.Search

function filterListByText(list, text) {
  if (!text) return list
  return list.filter((item) => item.name.includes(text))
}

export default function Content(props) {
  const {
    fixedFields,
    builtinFields,
    extendedFields,
    sortable,
    checkedColumnCodes,
    onChange,
    loading,
    setCheckedCodes
  } = props
  const [inputText, setInputText] = useState('')
  const handleSearch = useCallback((value) => {
    setInputText(value)
  }, [])
  const handleClear = useCallback(() => {
    handleSearch('')
  }, [handleSearch])

  const handleDrop = useCallback(
    (oldIndex, newIndex) => {
      const newList = checkedColumnCodes.slice()
      const [item] = newList.splice(oldIndex, 1)
      newList.splice(newIndex, 0, item)
      setCheckedCodes(newList)
    },
    [checkedColumnCodes, setCheckedCodes]
  )
  const searchedFixedFields = useMemo(
    () => filterListByText(fixedFields, inputText),
    [fixedFields, inputText]
  )
  const searchedBuiltinFields = useMemo(
    () => filterListByText(builtinFields, inputText),
    [builtinFields, inputText]
  )
  const searchedExtendedFields = useMemo(
    () => filterListByText(extendedFields, inputText),
    [extendedFields, inputText]
  )
  const checkedFields = useMemo(() => {
    const allFields = [...fixedFields, ...builtinFields, ...extendedFields]
    return checkedColumnCodes.map((code) => {
      const field = allFields.find((item) => item.code === code) || {}
      return { ...field, closable: !field.disabled }
    })
  }, [builtinFields, checkedColumnCodes, extendedFields, fixedFields])

  return (
    <div className={styles.content}>
      <Spin spinning={loading}>
        {sortable && (
          <section>
            <header>
              {i18n('selected-attribute', '选中属性')}
              <span>{`（${i18n('drag-to-sort', '拖动可排序')}）`}</span>
            </header>
            <SortableFields
              checkedFields={checkedFields}
              onClose={(item) => onChange({ value: item.code, checked: false })}
              onDrop={handleDrop}
            />
          </section>
        )}
        <section>
          <header>
            {i18n('select-attribute', '选择属性')}
            <span>{`（${i18n('click-to-add-column', '点击添加列属性')}）`}</span>
          </header>
          <div>
            <Search onSearch={handleSearch} allowClear enterButton onClear={handleClear} />
          </div>
          <Collapse defaultActiveKey={['fixedFields']}>
            <Collapse.Card
              key="fixedFields"
              header={i18n('ticket.list.work.order.attribute', '工单属性')}
            >
              <CheckGroup
                list={searchedFixedFields}
                checkedColumnCodes={checkedColumnCodes}
                onChange={onChange}
              />
            </Collapse.Card>
            {builtinFields.length > 0 && (
              <Collapse.Card key="builtinFields" header={i18n('builtin-field', '内置字段')}>
                <CheckGroup
                  list={searchedBuiltinFields}
                  checkedColumnCodes={checkedColumnCodes}
                  onChange={onChange}
                />
              </Collapse.Card>
            )}
            {extendedFields.length > 0 && (
              <Collapse.Card key="extendedFields" header={i18n('expansion-field', '扩展字段')}>
                <CheckGroup
                  list={searchedExtendedFields}
                  checkedColumnCodes={checkedColumnCodes}
                  onChange={onChange}
                />
              </Collapse.Card>
            )}
          </Collapse>
        </section>
      </Spin>
    </div>
  )
}
