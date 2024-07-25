import React, { useEffect, useState } from 'react'
import { Modal, Tabs, Checkbox, Row, Col } from '@uyun/components'
import { toJS } from 'mobx'
import { relateSubprocessFields, enabledType } from '~/components/AttrFieldPanel/constants.js'

function FieldModal({
  visible,
  onCancel = () => {},
  taskModelId = '',
  onChange = () => {},
  commonColumnList = []
}) {
  const [customfields, setCustomfields] = useState([])
  const [modelFields, setModalFields] = useState([])

  const getModelFields = async () => {
    if (taskModelId) {
      const res = await axios.get(API.queryModelFields, { params: { modelId: taskModelId } })
      setModalFields(res)
    }
  }
  useEffect(() => {
    const data = !_.isEmpty(toJS(commonColumnList))
      ? _.map(toJS(commonColumnList), (d) => d.fieldCode)
      : ['taskOrder', 'taskTicketNum']
    setCustomfields(data)
  }, [])

  useEffect(() => {
    getModelFields()
  }, [taskModelId])
  const changeFields = (val) => {
    setCustomfields(val)
  }
  const formatModelFields = _.map(modelFields, (d) => ({
    name: d.name,
    code: d.code,
    type: 'ticket',
    fieldType: d.type
  }))
  const allColumnsFields = relateSubprocessFields.concat(formatModelFields)
  return (
    <Modal
      visible={visible}
      title="自定义列"
      onCancel={onCancel}
      className="field-modal"
      onOk={() => {
        const formatFields = []
        customfields.forEach((d) => {
          let obj = {}
          let Index = allColumnsFields.findIndex((field) => field.code === d)
          obj = {
            fieldCode: allColumnsFields[Index].code,
            fieldName: allColumnsFields[Index].name,
            fieldType: allColumnsFields[Index].type
          }
          formatFields.push(obj)
        })
        onChange({
          commonColumnList: formatFields
        })
        onCancel()
      }}
    >
      <Checkbox.Group style={{ width: '100%' }} onChange={changeFields} value={customfields}>
        <Row>
          {_.map(allColumnsFields, (d) => (
            <Col span={8}>
              <Checkbox
                value={d.code}
                disabled={
                  (d.fieldType && !enabledType.includes(d.fieldType)) ||
                  ['taskOrder', 'taskTicketNum'].includes(d.code)
                }
              >
                {d.name}
              </Checkbox>
            </Col>
          ))}
        </Row>
      </Checkbox.Group>
    </Modal>
  )
}

export default FieldModal
