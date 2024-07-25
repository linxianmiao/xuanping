import React from 'react'
import { Row, Col, Select, Button, Form } from '@uyun/components'

const Option = Select.Option
const FormItem = Form.Item

const Options = props => {
  const { thirdPartData, keySel, valueSel, onChange, onView } = props

  return (
    <Row>
      <Col className="u4-form u4-form-inline" style={{ lineHeight: '40px' }} offset={4} span={20}>
        <FormItem label={i18n('selected_value', '选项的值')}>
          <Select style={{ width: 120 }} value={keySel} onChange={value => onChange(value, 'keySel')}>
            {_.map(thirdPartData, (item, i) => {
              return <Option key={i} value={`${item.value}`}>{item.label}</Option>
            })}
          </Select>
        </FormItem>
        <FormItem label={i18n('selected_text', '选项的文字')}>
          <Select style={{ width: 120 }} value={valueSel} onChange={value => onChange(value, 'valueSel')}>
            {_.map(thirdPartData, (item, i) => {
              return <Option key={i} value={`${item.value}`}>{item.label}</Option>
            })}
          </Select>
        </FormItem>
        <Button onClick={onView} type="primary">{i18n('conf.model.yulan', '预览')}</Button>
      </Col>
    </Row>
  )
}

export default Options
