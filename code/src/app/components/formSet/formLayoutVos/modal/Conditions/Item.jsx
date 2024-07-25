import React from 'react'
import { toJS } from 'mobx'
import { Row, Col, Select, Tooltip } from '@uyun/components'
import TriggerValueList from '~/components/triggerValueList'
import { COMPARISON_LIST } from '../../configuration'
import _ from 'lodash'

const Option = Select.Option

const Item = (props) => {
  const handleChange = (value, field) => {
    const nextData = { ...props.data }
    if (field === 'comparison' && nextData[field] !== value) {
      nextData.value = undefined
    }
    if (field === 'key' && nextData[field] !== value) {
      nextData.comparison = undefined
      nextData.value = undefined
    }
    nextData[field] = value
    props.onChange(nextData)
  }

  const handleDelete = () => {
    props.onDelete()
  }

  const getConditionList = (current) => {
    const { type, params, cascade, treeVos, tabStatus } = current
    if (type === 'treeSel') {
      return toJS(treeVos)
    } else if (type === 'cascader') {
      return toJS(cascade)
    } else if (type === 'listSel' && tabStatus === '1') {
      let {
        formData,
        headers,
        outsideUrl,
        raw,
        requestType,
        keySel,
        valueSel,
        keyword,
        filterMode,
        tabStatus
      } = current
      keyword = keyword || 'kw'
      const outsideParams = {
        formData,
        headers,
        outsideUrl,
        raw,
        requestType,
        keySel,
        valueSel,
        keyword,
        filterMode,
        params,
        tabStatus
      }
      return outsideParams
    } else if (type === 'listSel' && tabStatus === '2') {
      const { tabStatus, dictionarySource, isSingle } = current
      return { tabStatus, dictionarySource, isSingle }
    } else {
      return toJS(params)
    }
  }

  const { data, fields } = props
  const { key, comparison, value } = data
  const selectedField = fields.find((field) => field.code === key) || {}
  let selectedFieldType = selectedField.type
  // 对下拉字段进行特殊处理
  if (selectedField.type === 'listSel' && selectedField.isSingle === '1') {
    selectedFieldType = 'multiSel'
  }

  const INITLIST = _.cloneDeep(COMPARISON_LIST)

  if (selectedFieldType === 'dateTime' && !_.includes([2, 3, 4], selectedField.timeGranularity)) {
    _.forEach(INITLIST, (item) => {
      if (_.includes(['EARLIERTHANNOW', 'LATERTHANNOW'], item.value)) {
        item.types = []
      }
    })
  }
  return (
    <Row className="condition-item-content  trigger-level">
      <Col span={8} style={{ paddingRight: 4 }}>
        <Select
          value={key}
          showSearch
          optionLabelProp="name"
          optionFilterProp="name"
          dropdownStyle={{ minWidth: 240 }}
          notFoundContent={i18n('globe.not_find', '无法找到')}
          onChange={(value) => handleChange(value, 'key')}
        >
          {fields.map((field) => (
            <Option name={field.name} key={field.code}>
              <Tooltip
                mouseEnterDelay={0.5}
                mouseLeaveDelay={0}
                placement="right"
                title={`${field.name} | ${field.code}`}
              >
                <div className="trigger-condition-item-content-select-option-div">
                  <span className="shenglue">{field.name}</span>
                  <span className="shenglue">{field.code}</span>
                </div>
              </Tooltip>
            </Option>
          ))}
        </Select>
      </Col>
      <Col span={5} style={{ padding: '0 10px' }}>
        <Select
          showSearch
          optionFilterProp="children"
          notFoundContent={i18n('globe.not_find', '无法找到')}
          value={comparison}
          onChange={(value) => handleChange(value, 'comparison')}
        >
          {INITLIST.map((item) => {
            if (item.types && !_.includes(item.types, selectedFieldType)) {
              return null
            }
            return <Option key={item.value}>{item.name}</Option>
          })}
        </Select>
      </Col>
      <Col span={10}>
        {!_.includes(['NOTEMPTY', 'EMPTY'], comparison) && (
          <TriggerValueList
            value={value}
            comparsionType={selectedFieldType}
            comparison={comparison}
            selectedField={selectedField}
            conditionList={getConditionList(selectedField)}
            handleChange={(value) => handleChange(value, 'value')}
          />
        )}
      </Col>
      <Col span={1} className="tigger-remove-icon" onClick={handleDelete}>
        <i className="iconfont icon-guanbi1" />
      </Col>
    </Row>
  )
}

Item.defaultProps = {
  fields: [], // 可选的字段
  data: {}, // 这个条件的数据
  onChange: () => {},
  onDelete: () => {}
}

export default Item
