import React, { useEffect, useState } from 'react'
import { Modal, Select, message, Button, Spin } from '@uyun/components'
import { ArrowRightOutlined, PlusOutlined, MinusCircleFilled } from '@uyun/icons'
import moment from 'moment'
import {
  getAvailableFieldTypes,
  disabledMappingFields
} from '~/model/component/flow/component/FieldMappingModal/logic.js'
import uuid from '~/utils/uuid'
import './relateModal.less'
import _ from 'lodash'

const Option = Select.Option

function MappingSubModal(props) {
  const [mappingFields, setMappingFields] = useState([{ contrastId: uuid() }])
  const [initialMainFields, setInitialMainFields] = useState([])
  const [mainFields, setMainFields] = useState([])
  const [initialSubFields, setInitialSubFields] = useState([])
  const [subFields, setSubFields] = useState([])
  const [loading, setLoading] = useState(false)

  const { visible, onCancel, submodal, modelId } = props

  const getMainModalFields = async () => {
    const res = await axios.get(API.queryModelFields, { params: { modelId } })
    const arr = _.map(res, (d) => ({ name: d.name, code: d.code, type: d.type, id: d.id }))
    return arr
  }

  const getSubModalFields = async () => {
    if (!submodal.id) return false
    const res = await axios.get(API.queryModelFields, { params: { modelId: submodal.id } })
    const arr = _.map(res, (d) => ({ name: d.name, code: d.code, type: d.type, id: d.id }))
    return arr
  }

  const queryMappingFields = async () => {
    if (!submodal.relationId) return false
    setLoading(true)
    const res = await axios.get(API.queryRelationStrategy, {
      params: { relationId: submodal.relationId }
    })
    const mainFields = await getMainModalFields()
    const enabledMainFields = _.filter(mainFields, (d) => !disabledMappingFields.includes(d.type))
    const enabledMainFields2 = _.cloneDeep(enabledMainFields)
    setInitialMainFields(enabledMainFields2)
    setMainFields(enabledMainFields)
    const subFields = await getSubModalFields()
    const enabledSubFields = _.filter(subFields, (d) => !disabledMappingFields.includes(d.type))
    const enabledSubFields2 = _.cloneDeep(enabledSubFields)
    setInitialSubFields(enabledSubFields2)
    setSubFields(enabledSubFields)
    const newMappingFields = res.transferFieldContrasts || [{ contrastId: uuid() }]
    setMappingFields(newMappingFields)
    if (res.transferFieldContrasts) {
      const selectedMainFields = _.map(newMappingFields, (d) => d.parentFieldCode)
      const newMainFields = _.filter(enabledMainFields, (d) => !selectedMainFields.includes(d.code))
      setMainFields(newMainFields)
      const selectedSubFields = _.map(newMappingFields, (d) => d.childFieldCode)
      const newSubFields = _.filter(enabledSubFields, (d) => !selectedSubFields.includes(d.code))
      setSubFields(newSubFields)
    }
    setLoading(false)
  }

  useEffect(() => {
    queryMappingFields()
  }, [submodal.relationId])

  const changeMappingFields = (type, val, id) => {
    const newMappingFields = _.cloneDeep(mappingFields)

    if (type === 'par') {
      const Index = mainFields.findIndex((d) => d.code === val.value)
      const selectedMainField = mainFields.find((d) => d.code === val.value)
      const { type: selectedType, id: mainFieldId } = selectedMainField
      mainFields.splice(Index, 1) // 主流程字段去除已选中的字段
      const enabledSubFieldTypes = getAvailableFieldTypes(selectedType)

      const mappingIndex = mappingFields.findIndex((d) => d.contrastId === id)
      newMappingFields[mappingIndex].parentFieldCode = val.value
      newMappingFields[mappingIndex].parentFieldName = val.label
      newMappingFields[mappingIndex].parentFieldId = mainFieldId
      newMappingFields[mappingIndex].enabledSubFieldTypes = enabledSubFieldTypes
      setMappingFields(newMappingFields)
    }

    if (type === 'sub') {
      const selectedSubField = subFields.find((d) => d.code === val.value)
      const { type: selectedType, id: subFieldId } = selectedSubField
      const Index = subFields.findIndex((d) => d.code === val.value)
      subFields.splice(Index, 1) // 子流程字段去除已选中的字段
      const enabledMainFieldTypes = getAvailableFieldTypes(selectedType)
      const mappingIndex = mappingFields.findIndex((d) => d.contrastId === id)
      newMappingFields[mappingIndex].childFieldCode = val.value
      newMappingFields[mappingIndex].childFieldName = val.label
      newMappingFields[mappingIndex].childFieldId = subFieldId
      newMappingFields[mappingIndex].enabledMainFieldTypes = enabledMainFieldTypes
      setMappingFields(newMappingFields)
    }
  }

  const addMappingField = () => {
    const obj = { contrastId: uuid() }
    const newMappingFields = _.cloneDeep(mappingFields)
    newMappingFields.push(obj)
    setMappingFields(newMappingFields)
  }

  const delMappingField = (contrastId) => {
    const Index = mappingFields.findIndex((d) => d.contrastId === contrastId)
    if (mappingFields[Index].parentFieldCode) {
      // 将删除的主流程字段添加回来
      const delMainField = {
        code: mappingFields[Index].parentFieldCode,
        name: mappingFields[Index].parentFieldName,
        id: mappingFields[Index].parentFieldId,
        type: _.find(initialMainFields, (d) => d.code === mappingFields[Index].parentFieldCode).type
      }
      const newMainFields = _.cloneDeep(mainFields)
      newMainFields.push(delMainField)
      setMainFields(newMainFields)
    }

    if (mappingFields[Index].childFieldCode) {
      // 将删除的子流程的字段添加回来
      const delSubField = {
        code: mappingFields[Index].childFieldCode,
        name: mappingFields[Index].childFieldName,
        id: mappingFields[Index].childFieldId,
        type: _.find(initialSubFields, (d) => d.code === mappingFields[Index].childFieldCode).type
      }
      const newSubFields = _.cloneDeep(subFields)
      newSubFields.push(delSubField)
      setSubFields(newSubFields)
    }

    // 删除映射
    const newMappingFields = _.cloneDeep(mappingFields)
    newMappingFields.splice(Index, 1)
    setMappingFields(newMappingFields)
  }

  const submit = async () => {
    const flag = mappingFields.every((d) => d.parentFieldId && d.childFieldId)
    if (!flag) {
      message.error(i18n('mapping-field-required'))
      return false
    }
    const params = {
      relationId: submodal.relationId,
      parentModelId: modelId,
      childModelId: submodal.id,
      transferFieldContrasts: _.map(mappingFields, (d) => ({
        contrastId: d.contrastId,
        parentFieldId: d.parentFieldId,
        parentFieldName: d.parentFieldName,
        parentFieldCode: d.parentFieldCode,
        childFieldId: d.childFieldId,
        childFieldName: d.childFieldName,
        childFieldCode: d.childFieldCode
      }))
    }
    const res = await axios.post(API.saveRelatedMappingFields, params)
    if (res === '200') {
      message.success(i18n('save_success'))
      onCancel()
    }
  }

  return (
    <Modal
      title={`${i18n('config')}「${submodal.name}」${i18n('mapping.field')}`}
      visible={visible}
      className="mapping-submodal"
      destroyOnClose
      onCancel={onCancel}
      onOk={submit}
    >
      <Spin spinning={loading}>
        {_.map(mappingFields, (d, i) => {
          let enabledSubFields = subFields
          if (Array.isArray(d.enabledSubFieldTypes)) {
            enabledSubFields = _.filter(subFields, (subField) =>
              d.enabledSubFieldTypes.includes(subField.type)
            )
          }
          let enabledMainFields = mainFields
          if (Array.isArray(d.enabledMainFieldTypes)) {
            enabledMainFields = _.filter(mainFields, (mainField) =>
              d.enabledMainFieldTypes.includes(mainField.type)
            )
          }
          return (
            <div key={d.contrastId} className="mapping-row">
              <Select
                showSearch
                labelInValue
                value={{ value: d.parentFieldCode, label: d.parentFieldName }}
                style={{ width: 200 }}
                placeholder={i18n('select.mainchart.field')}
                onSelect={(val) => changeMappingFields('par', val, d.contrastId)}
                filterOption={(input, option) => {
                  return (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                }}
              >
                {_.map(enabledMainFields, (d) => (
                  <Option value={d.code}>{d.name}</Option>
                ))}
              </Select>
              <ArrowRightOutlined />
              <Select
                showSearch
                labelInValue
                value={{ value: d.childFieldCode, label: d.childFieldName }}
                style={{ width: 200 }}
                placeholder={i18n('select.subchart.field')}
                onSelect={(val) => changeMappingFields('sub', val, d.contrastId)}
                filterOption={(input, option) => {
                  return (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                }}
              >
                {_.map(enabledSubFields, (d) => (
                  <Option value={d.code}>{d.name}</Option>
                ))}
              </Select>
              <MinusCircleFilled onClick={() => delMappingField(d.contrastId)} />
            </div>
          )
        })}
      </Spin>
      <Button icon={<PlusOutlined />} onClick={addMappingField}>
        {i18n('add-mapping-field')}
      </Button>
    </Modal>
  )
}

export default MappingSubModal
